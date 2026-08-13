import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import mongoose from 'mongoose';
import { EJSON } from 'bson';

const gzipAsync = promisify(gzip);
const cliArgs = new Set(process.argv.slice(2));
const getArgValue = (prefix) => process.argv.slice(2).find(arg => arg.startsWith(`${prefix}=`))?.slice(prefix.length + 1);
const AUDIT_ONLY = cliArgs.has('--audit-only');
const APPLY = cliArgs.has('--apply');
const OVERWRITE = cliArgs.has('--overwrite');
const LIMIT = Number.parseInt(getArgValue('--limit') || '0', 10) || 0;
const ONLY_COLLECTION = getArgValue('--collection') || '';
const ONLY_CLUSTER = (getArgValue('--cluster') || '').toUpperCase();

const CLUSTERS = [
    {
        key: 'A',
        uri: process.env.MONGODB_PRIMARY_A_URI || process.env.DUAL_MONGODB_URI_A || '',
    },
    {
        key: 'B',
        uri: process.env.MONGODB_PRIMARY_B_URI || process.env.DUAL_MONGODB_URI_B || '',
    },
].filter(cluster => !ONLY_CLUSTER || cluster.key === ONLY_CLUSTER);

const COLLECTIONS = [
    'products',
    'blogs',
    'banners',
    'faqs',
    'pagecontents',
    'productcategories',
    'sitesettings',
    'subscriptionpackages',
].filter(name => !ONLY_COLLECTION || name === ONLY_COLLECTION);

const CACHE_DIR = join(process.cwd(), '.translation-cache');
const CACHE_FILE = join(CACHE_DIR, 'vi-en.json');
const BACKUP_ROOT = join(process.cwd(), 'backups');
const TRANSLATION_CACHE_VERSION = 'v8';
// Shorter chunks batch efficiently on Apple GPU and avoid quality loss on
// long ecommerce HTML blocks.
const MAX_TRANSLATION_CHARS = 900;
const cache = new Map();
let cacheDirty = false;
let translatorProcess = null;
let translatorSequence = 0;
const translatorRequests = new Map();

const TRANSLATION_FIELDS = {
    products: ['name', 'description', 'shortDescription', 'badgeText', 'linkedCategory', 'isPublished'],
    blogs: ['title', 'slug', 'excerpt', 'content', 'category', 'tags', 'isPublished'],
    banners: ['title', 'imageUrl', 'link', 'alt'],
    faqs: ['question', 'answer'],
    pagecontents: ['title', 'subtitle', 'content', 'heroImage', 'sideImage', 'stats', 'commitments', 'metadata'],
    productcategories: ['name'],
    sitesettings: [
        'address',
        'workingHours',
        'promoText',
        'homePromotionText',
        'homeFeatures',
        'productFeatures',
        'productsBannerUrl',
        'homePromoBannerUrl',
        'homePromoBannerTitle',
        'homePromoBannerButtonText',
        'homePromoBannerNote',
    ],
    subscriptionpackages: ['name', 'description', 'terms', 'badgeText'],
};

const EXACT_TRANSLATIONS = new Map([
    ['các loại hạt', 'Nuts'],
    ['hắc kỷ tử', 'Black goji berries'],
    ['kẹo', 'Candy'],
    ['trà', 'Tea'],
    ['táo đỏ', 'Red dates'],
    ['yến sào', "Bird's nest"],
    ['yến mạch', 'Oats'],
    ['đông trùng hạ thảo', 'Cordyceps'],
    ['hướng dẫn', 'Guides'],
    ['khuyến mãi', 'Promotions'],
    ['tin tức', 'News'],
    ['kẹo dẻo vị xoài (gói 300g)', 'Mango Gummy Candy (300g pack)'],
    ['kẹo dẻo vị xoài (gói 450g)', 'Mango Gummy Candy (450g pack)'],
    ['kẹo dẻo vị chuối (gói 300g)', 'Banana Gummy Candy (300g pack)'],
    ['kẹo dẻo vị chuối (gói 400g)', 'Banana Gummy Candy (400g pack)'],
    ['kẹo dẻo vị chuối (gói 1kg)', 'Banana Gummy Candy (1kg pack)'],
    ['kẹo dẻo vị sầu riêng (gói 450g)', 'Durian Gummy Candy (450g pack)'],
    ['trà craft kombucha vị sấu gừng (lon 330 ml)', 'Dracontomelon & Ginger Craft Kombucha (330ml can)'],
    ['trà craft kombucha vị sấu gừng (lốc 6 lon - 330 ml/lon)', 'Dracontomelon & Ginger Craft Kombucha (pack of 6 × 330ml cans)'],
    ['trà craft kombucha vị sấu gừng (thùng 24 lon - 330 ml/lon)', 'Dracontomelon & Ginger Craft Kombucha (case of 24 × 330ml cans)'],
    ['trà craft kombucha vị chanh leo (lon 330 ml)', 'Passion Fruit Craft Kombucha (330ml can)'],
    ['trà craft kombucha vị chanh leo (lốc 6 lon - 330 ml/lon)', 'Passion Fruit Craft Kombucha (pack of 6 × 330ml cans)'],
    ['trà craft kombucha vị chanh leo (thùng 24 lon - 330 ml/lon)', 'Passion Fruit Craft Kombucha (case of 24 × 330ml cans)'],
    ['trà craft kombucha vị mơ má đào (lon 330 ml)', 'Apricot & Peach Craft Kombucha (330ml can)'],
    ['trà craft kombucha vị mơ má đào (lốc 6 lon - 330 ml/lon)', 'Apricot & Peach Craft Kombucha (pack of 6 × 330ml cans)'],
    ['trà craft kombucha vị mơ má đào (thùng 24 lon - 330 ml/lon)', 'Apricot & Peach Craft Kombucha (case of 24 × 330ml cans)'],
    ['trà craft kombucha mix vị (lốc 4 lon - 330 ml/lon)', 'Assorted Craft Kombucha (pack of 4 × 330ml cans)'],
    ['trà craft kombucha mix vị (lốc 6 lon - 330 ml/lon)', 'Assorted Craft Kombucha (pack of 6 × 330ml cans)'],
    ['trà craft kombucha mix vị (thùng 24 lon - 330 ml/lon)', 'Assorted Craft Kombucha (case of 24 × 330ml cans)'],
    ['hắc kỷ tử (hộp 100g)', 'Black Goji Berries (100g box)'],
    ['trà gừng táo đổ', 'Ginger & Red Date Tea'],
    ['trà hà diệp hồng táo', 'Lotus Leaf & Red Date Tea'],
    ['trà hương nhài', 'Jasmine Tea'],
    ['trà hương sen', 'Lotus-scented Tea'],
    ['táo đỏ hào điền tân cương (túi 150g)', 'Hoa Dien Xinjiang Red Dates (150g bag)'],
    ['táo đỏ hoà điền tân cương (túi 300g)', 'Hoa Dien Xinjiang Red Dates (300g bag)'],
    ['táo đỏ hào điền tân cương (túi 1kg)', 'Hoa Dien Xinjiang Red Dates (1kg bag)'],
    ['túi đỏ hoà điền tân cương (hộp 1kg)', 'Hoa Dien Xinjiang Red Dates – Red Gift Bag (1kg box)'],
    ['táo đỏ hoà điền tân cương (hộp 450g)', 'Hoa Dien Xinjiang Red Dates (450g box)'],
    ['granola siêu hạt (hộp 500g)', 'Super Nut Granola (500g box)'],
    ['granola siêu hạt (hộp 300g)', 'Super Nut Granola (300g box)'],
    ['🌸 mua điều ngon – vi vu nhật bản cùng euphoria 🌸', '🌸 Buy Premium Cashews – Explore Japan with EUPHORIA 🌸'],
    ['mua hạt điều euphoria – du lịch hàn quốc tiết kiệm cực đã!', 'Buy EUPHORIA Cashews – Save Big on Your South Korea Trip!'],
    ['✨ ưu đãi kép – vừa ăn ngon, vừa vi vu thái lan ✨', '✨ Double the Benefits – Delicious Cashews and a Thailand Adventure ✨'],
    ['mua hạt điều – nhận ngay ưu đãi du lịch đài loan cùng euphoria', 'Buy Cashews – Get an Exclusive Taiwan Travel Offer with EUPHORIA'],
    ['khuyến mãi khủng – mua 1 tặng 1 cùng euphoria', 'Huge Promotion – Buy 1, Get 1 Free with EUPHORIA'],
    ['khuyến mại mua 1 tặng 1 – khám phá nước nga cùng euphoria', 'Buy 1, Get 1 Free – Explore Russia with EUPHORIA'],
    ['gợi ý cách chế biến các món ngon từ hạt điều – vừa bổ dưỡng vừa dễ làm', 'Delicious Cashew Recipe Ideas – Nutritious and Easy to Make'],
    ['🥜✨ hạt óc chó – siêu thực phẩm cho não bộ & sức khỏe cả gia đình!', '🥜✨ Walnuts – A Superfood for Brain Health and the Whole Family!'],
    ['🥜✨ hạt hạnh nhân – siêu thực phẩm vàng cho sức khỏe & sắc đẹp cả gia đình', '🥜✨ Almonds – A Golden Superfood for Family Health and Beauty'],
    ['🥗 cách làm salad rau củ hạt điều', '🥗 How to Make Cashew Vegetable Salad'],
    ['🌟🌟 gonuts – giòn ngon mỗi ngày, ưu đãi trao tay 🌟🌟', '🌟🌟 GONUTS – Crunchy Every Day, Rewards Right Away 🌟🌟'],
    ['cách làm sữa hạt điều thơm ngon – bổ dưỡng tại nhà', 'How to Make Delicious, Nutritious Cashew Milk at Home'],
]);

function assertConfiguration() {
    if (AUDIT_ONLY && APPLY) {
        throw new Error('Use either --audit-only or --apply, not both.');
    }
    if (CLUSTERS.length === 0 || CLUSTERS.some(cluster => !cluster.uri)) {
        throw new Error(
            'Define MONGODB_PRIMARY_A_URI and MONGODB_PRIMARY_B_URI. Use --cluster=A or --cluster=B to run one source only.',
        );
    }
    if (ONLY_CLUSTER && !['A', 'B'].includes(ONLY_CLUSTER)) {
        throw new Error('--cluster must be A or B.');
    }
    if (ONLY_COLLECTION && !COLLECTIONS.includes(ONLY_COLLECTION)) {
        throw new Error(`Unsupported collection: ${ONLY_COLLECTION}`);
    }
}

async function loadCache() {
    try {
        const parsed = JSON.parse(await readFile(CACHE_FILE, 'utf8'));
        for (const [key, value] of Object.entries(parsed)) cache.set(key, value);
    } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
    }
}

async function saveCache() {
    if (!cacheDirty) return;
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, `${JSON.stringify(Object.fromEntries(cache), null, 2)}\n`, 'utf8');
    cacheDirty = false;
}

function containsVietnamese(value) {
    return /[ăâđêôơưÀ-ỹ]/u.test(value) || /\b(hạt|trà|gói|hộp|túi|chính sách|điều khoản|khuyến mãi|sản phẩm|thành viên|giao hàng|đổi trả|khi|mua|cho|tặng|ngon|tiết kiệm|du lịch|ưu đãi|của|và)\b/i.test(value);
}

function shouldTranslate(value) {
    if (typeof value !== 'string' || !value.trim()) return false;
    if (/^(?:https?:\/\/|mailto:|tel:|\/assets\/|#[0-9a-f]{3,8}$)/i.test(value.trim())) return false;
    return containsVietnamese(value);
}

function protectText(value) {
    let protectedText = value
        .replace(/trà ướp sen hồ tây/gi, 'West Lake lotus-scented tea')
        .replace(/trà ướp sen/gi, 'lotus-scented tea')
        .replace(/vinh dự góp mặt/gi, 'proudly featured')
        .replace(/ướp trà/gi, 'tea scenting')
        .replace(/gạo sen/gi, 'lotus stamens')
        .replace(/hộp\s+(\d+)\s+viên/gi, 'box of $1 tea balls')
        .replace(/hạt điều rang muối vỏ lụa/gi, 'skin-on salt-roasted cashews')
        .replace(/hạt điều rang muối/gi, 'salt-roasted cashews')
        .replace(/hạt điều/gi, 'cashews')
        .replace(/hạt mắc ca|hạt macca|mắc ca|macca/gi, 'macadamia nuts')
        .replace(/hạt hạnh nhân|hạnh nhân/gi, 'almonds')
        .replace(/hạt óc chó|óc chó/gi, 'walnuts')
        .replace(/hạt dẻ cười/gi, 'pistachios')
        .replace(/hạt bí/gi, 'pumpkin seeds')
        .replace(/hạt hướng dương/gi, 'sunflower seeds')
        .replace(/hạt sen/gi, 'lotus seeds')
        .replace(/đậu phộng|lạc rang/gi, 'peanuts')
        .replace(/đông trùng hạ thảo/gi, 'Cordyceps')
        .replace(/nấm linh chi|linh chi/gi, 'reishi mushroom')
        .replace(/táo đỏ/gi, 'red dates')
        .replace(/nho khô/gi, 'raisins')
        .replace(/trái cây sấy/gi, 'dried fruit')
        .replace(/túi zip/gi, 'resealable pouch')
        .replace(/vỏ lụa/gi, 'skin-on');
    return {
        value: protectedText,
        restore: translated => translated,
    };
}

function chunkText(value) {
    if (value.length <= MAX_TRANSLATION_CHARS) return [value];
    const chunks = [];
    let remaining = value;
    while (remaining.length > MAX_TRANSLATION_CHARS) {
        const window = remaining.slice(0, MAX_TRANSLATION_CHARS);
        const candidates = [window.lastIndexOf('\n\n'), window.lastIndexOf('. '), window.lastIndexOf('; '), window.lastIndexOf(', '), window.lastIndexOf(' ')];
        const best = Math.max(...candidates);
        const splitAt = best > MAX_TRANSLATION_CHARS * 0.55 ? best + 1 : MAX_TRANSLATION_CHARS;
        chunks.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt);
    }
    if (remaining) chunks.push(remaining);
    return chunks;
}

function rejectTranslatorRequests(error) {
    for (const { reject } of translatorRequests.values()) reject(error);
    translatorRequests.clear();
}

function startLocalTranslator() {
    if (translatorProcess) return translatorProcess;

    const python = process.env.LOCAL_TRANSLATOR_PYTHON || join(process.cwd(), '.translation-venv', 'bin', 'python');
    const bridge = join(process.cwd(), 'scripts', 'local-translate-vi-en.py');
    const child = spawn(python, [bridge], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env,
    });
    translatorProcess = child;

    createInterface({ input: child.stdout }).on('line', line => {
        try {
            const response = JSON.parse(line);
            const request = translatorRequests.get(response.id);
            if (!request) return;
            translatorRequests.delete(response.id);
            if (response.error) request.reject(new Error(response.error));
            else request.resolve(response.translated);
        } catch (error) {
            rejectTranslatorRequests(error);
        }
    });

    let stderr = '';
    child.stderr.on('data', chunk => {
        stderr = `${stderr}${chunk}`.slice(-4000);
    });
    child.on('error', error => rejectTranslatorRequests(error));
    child.on('exit', code => {
        const detail = stderr.trim() ? `: ${stderr.trim()}` : '';
        rejectTranslatorRequests(new Error(`Local translator exited with code ${code}${detail}`));
        translatorProcess = null;
    });
    return child;
}

function stopLocalTranslator() {
    if (!translatorProcess) return;
    translatorProcess.stdin.end();
    translatorProcess = null;
}

async function requestTranslation(value) {
    const child = startLocalTranslator();
    const id = ++translatorSequence;
    return new Promise((resolve, reject) => {
        translatorRequests.set(id, { resolve, reject });
        child.stdin.write(`${JSON.stringify({ id, text: value })}\n`, error => {
            if (!error) return;
            translatorRequests.delete(id);
            reject(error);
        });
    });
}

function polishEnglish(value) {
    return value
        .replace(/\bXinjiang\b/gi, 'Tan Cuong')
        .replace(/\bBach Yep\b/gi, 'Bach Diep')
        .replace(/proudly featured\s+IN\b/gi, 'proudly featured at')
        .replace(/\bLốc\s+(\d+)\s+cans?\s*-\s*(\d+\s*ml)\/lon\b/gi, 'Pack of $1 cans - $2/can')
        .replace(/\b(?:Mango-flavored nougat)\b/gi, 'Mango gummy candy')
        .replace(/\b(?:Banana candy|Banana-flavored nougat)\b/gi, 'Banana gummy candy')
        .replace(/\bDurian marshmallow\b/gi, 'Durian gummy candy')
        .replace(/\bBlackcurrant\b/gi, 'Black goji berries')
        .replace(/\bCasshews\b/gi, 'Cashews')
        .replace(/\bcashews milk\b/gi, 'cashew milk')
        .replace(/\bcashews salad\b/gi, 'cashew salad')
        .replace(/\bcashews has\b/gi, 'cashews have')
        .replace(/\bININFRINGEMENTAL SAVE\b/gi, 'UNLIMITED SAVINGS')
        .replace(/\bINFRINGEMENTAL SAVE\b/gi, 'UNLIMITED SAVINGS')
        .replace(/\bINFRIGEMENTAL SAVE\b/gi, 'UNLIMITED SAVINGS')
        .replace(/\bNGON\s*&(?:amp;)?\s*AN TÂM\b/gi, 'DELICIOUS & TRUSTED')
        .replace(/\bKhi mua\b/gi, 'When purchasing')
        .replace(/\bcho\b/gi, 'for')
        .replace(/\bBUY 3 FREE VOUCHER\b/gi, 'BUY 3 BOXES, GET A VOUCHER')
        .replace(/\b03 cashews GONUTS box\b/gi, '03 boxes of GONUTS cashews')
        .replace(/\bcashews selective\b/gi, 'selected cashews')
        .replace(/(\d+)N(\d+)Đ\b/gi, '$1D$2N')
        .replace(/VND\s*([\d.,]+)/gi, '$1 VND')
        .replace(/([\d.,])VND\b/gi, '$1 VND')
        .replace(/cashews? with (?:the )?shell/gi, 'skin-on cashews')
        .replace(/white cashews?/gi, 'cashew kernels')
        .replace(/broken white cashews?/gi, 'split cashew kernels')
        .replace(/zip bag/gi, 'resealable pouch')
        .replace(/red apple/gi, 'red dates')
        .replace(/lotus embalmed tea/gi, 'lotus-scented tea')
        .replace(/(\d[\d.,]*)\s*[đĐ](?=\s|<|$|[🎁,.;)])/g, '$1 VND')
        .replace(/\s+([,.;:!?])/g, '$1')
        .replace(/[ \t]{2,}/g, ' ');
}

async function translatePlainText(value) {
    if (!shouldTranslate(value)) {
        return typeof value === 'string' && !/^(?:https?:\/\/|mailto:|tel:)/i.test(value.trim())
            ? polishEnglish(value)
            : value;
    }
    const exactTranslation = EXACT_TRANSLATIONS.get(value.trim().toLocaleLowerCase('vi'));
    if (exactTranslation) return exactTranslation;
    const cacheKey = createHash('sha256').update(`${TRANSLATION_CACHE_VERSION}\0${value}`).digest('hex');
    if (cache.has(cacheKey)) return polishEnglish(cache.get(cacheKey));

    const protectedText = protectText(value);
    const translatedChunks = [];
    for (const chunk of chunkText(protectedText.value)) {
        translatedChunks.push(await requestTranslation(chunk));
    }
    const translated = polishEnglish(protectedText.restore(translatedChunks.join('')));
    cache.set(cacheKey, translated);
    cacheDirty = true;
    return translated;
}

async function translateRichText(value) {
    if (!shouldTranslate(value)) return value;
    if (!/<[a-z][\s\S]*>/i.test(value)) return translatePlainText(value);

    const pieces = value.split(/(<[^>]+>)/g);
    const translated = await Promise.all(pieces.map(piece => (
        piece.startsWith('<')
            ? piece
            : translatePlainText(
                piece
                    .replace(/(?:&nbsp;|&#160;|&#x0*a0;)/gi, ' ')
                    .replace(/[ \t]{2,}/g, ' '),
            )
    )));
    return translated.join('');
}

async function translateStringArray(values) {
    if (!Array.isArray(values)) return values;
    return Promise.all(values.map(value => translatePlainText(value)));
}

async function translateImage(image) {
    if (!image || typeof image !== 'object') return image;
    return {
        ...image,
        alt: await translatePlainText(image.alt || ''),
    };
}

function slugify(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 160) || 'article';
}

function uniqueSlug(base, usedSlugs, id) {
    let slug = base;
    if (usedSlugs.has(slug)) slug = `${base}-${String(id).slice(-6)}`;
    usedSlugs.add(slug);
    return slug;
}

async function buildEnglishTranslation(collection, document, context) {
    switch (collection) {
        case 'products': {
            const [name, description, shortDescription, badgeText, linkedCategory] = await Promise.all([
                translatePlainText(document.name || ''),
                translateRichText(document.description || ''),
                translateRichText(document.shortDescription || ''),
                translatePlainText(document.badgeText || ''),
                translatePlainText(document.linkedCategory || ''),
            ]);
            return {
                name,
                description,
                shortDescription,
                badgeText,
                linkedCategory,
                isPublished: true,
            };
        }
        case 'blogs': {
            const [title, excerpt, content, category, tags] = await Promise.all([
                translatePlainText(document.title || ''),
                translateRichText(document.excerpt || ''),
                translateRichText(document.content || ''),
                translatePlainText(document.category || ''),
                translateStringArray(document.tags || []),
            ]);
            return {
                title,
                slug: uniqueSlug(slugify(title), context.usedBlogSlugs, document._id),
                excerpt,
                content,
                category,
                tags,
                isPublished: Boolean(document.isPublished),
            };
        }
        case 'banners': {
            const [title, alt] = await Promise.all([
                translatePlainText(document.title || ''),
                translatePlainText(document.title || 'Go Nuts banner'),
            ]);
            return {
                title,
                imageUrl: document.imageUrl || '',
                link: document.link || '',
                alt,
            };
        }
        case 'faqs': {
            const [question, answer] = await Promise.all([
                translatePlainText(document.question || ''),
                translateRichText(document.answer || ''),
            ]);
            return { question, answer };
        }
        case 'pagecontents':
            return {
                title: await translatePlainText(document.title || ''),
                subtitle: await translatePlainText(document.subtitle || ''),
                content: await translateRichText(document.content || ''),
                heroImage: await translateImage(document.heroImage),
                sideImage: await translateImage(document.sideImage),
                stats: await Promise.all((document.stats || []).map(async stat => ({
                    ...stat,
                    label: await translatePlainText(stat.label || ''),
                }))),
                commitments: await Promise.all((document.commitments || []).map(async commitment => ({
                    ...commitment,
                    text: await translatePlainText(commitment.text || ''),
                }))),
                metadata: document.metadata ? {
                    description: await translatePlainText(document.metadata.description || ''),
                    keywords: await translateStringArray(document.metadata.keywords || []),
                } : undefined,
            };
        case 'productcategories':
            return { name: await translatePlainText(document.name || '') };
        case 'sitesettings': {
            const [
                address,
                workingHours,
                promoText,
                homePromotionText,
                homePromoBannerTitle,
                homePromoBannerButtonText,
                homePromoBannerNote,
            ] = await Promise.all([
                translatePlainText(document.address || ''),
                translatePlainText(document.workingHours || ''),
                translatePlainText(document.promoText || ''),
                translatePlainText(document.homePromotionText || ''),
                translateRichText(document.homePromoBannerTitle || ''),
                translatePlainText(document.homePromoBannerButtonText || ''),
                translatePlainText(document.homePromoBannerNote || ''),
            ]);
            return {
                address,
                workingHours,
                promoText,
                homePromotionText,
                homeFeatures: await Promise.all((document.homeFeatures || []).map(async feature => ({
                    ...feature,
                    text: await translatePlainText(feature.text || ''),
                }))),
                productFeatures: await Promise.all((document.productFeatures || []).map(async feature => ({
                    ...feature,
                    title: await translatePlainText(feature.title || ''),
                    description: await translatePlainText(feature.description || ''),
                }))),
                productsBannerUrl: document.productsBannerUrl || '',
                homePromoBannerUrl: document.homePromoBannerUrl || '',
                homePromoBannerTitle,
                homePromoBannerButtonText,
                homePromoBannerNote,
            };
        }
        case 'subscriptionpackages': {
            const [name, description, terms, badgeText] = await Promise.all([
                translatePlainText(document.name || ''),
                translateRichText(document.description || ''),
                translateRichText(document.terms || ''),
                translatePlainText(document.badgeText || ''),
            ]);
            return { name, description, terms, badgeText };
        }
        default:
            throw new Error(`No translator configured for ${collection}`);
    }
}

function compactTranslation(value) {
    if (Array.isArray(value)) return value.map(compactTranslation);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
        Object.entries(value)
            .filter(([, child]) => child !== undefined)
            .map(([key, child]) => [key, compactTranslation(child)]),
    );
}

function hasValue(value) {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return value !== undefined && value !== null;
}

function expectedTranslationFields(collection, document) {
    const directFields = TRANSLATION_FIELDS[collection] || [];
    return directFields.filter(field => {
        if (field === 'isPublished') return collection === 'products' || collection === 'blogs';
        if (collection === 'blogs' && field === 'slug') return hasValue(document.title);
        if (collection === 'banners' && field === 'alt') return hasValue(document.title);
        return hasValue(document[field]);
    });
}

function translationCoverage(collection, document) {
    const expected = expectedTranslationFields(collection, document);
    const english = document.translations?.en;
    if (!english || !hasValue(english)) {
        return { status: 'missing', expected, present: [] };
    }

    const present = expected.filter(field => hasValue(english[field]));
    return {
        status: present.length === expected.length ? 'complete' : 'partial',
        expected,
        present,
    };
}

function missingDelta(existing, proposed) {
    if (!hasValue(existing)) return proposed;
    if (Array.isArray(proposed)) return undefined;
    if (!proposed || typeof proposed !== 'object') return undefined;

    const delta = {};
    for (const [key, proposedValue] of Object.entries(proposed)) {
        if (!hasValue(proposedValue)) continue;
        const existingValue = existing?.[key];
        if (!hasValue(existingValue)) {
            delta[key] = proposedValue;
            continue;
        }
        if (
            proposedValue &&
            typeof proposedValue === 'object' &&
            !Array.isArray(proposedValue) &&
            existingValue &&
            typeof existingValue === 'object' &&
            !Array.isArray(existingValue)
        ) {
            const nested = missingDelta(existingValue, proposedValue);
            if (nested && Object.keys(nested).length) delta[key] = nested;
        }
    }
    return Object.keys(delta).length ? delta : undefined;
}

function mergeTranslation(existing, proposed) {
    if (OVERWRITE || !hasValue(existing)) return proposed;
    const delta = missingDelta(existing, proposed);
    if (!delta) return existing;

    const merged = { ...existing };
    for (const [key, value] of Object.entries(delta)) {
        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            merged[key] &&
            typeof merged[key] === 'object' &&
            !Array.isArray(merged[key])
        ) {
            merged[key] = { ...merged[key], ...value };
        } else {
            merged[key] = value;
        }
    }
    return merged;
}

function translationsEqual(left, right) {
    return EJSON.stringify(compactTranslation(left || {})) === EJSON.stringify(compactTranslation(right || {}));
}

function validateForPublishing(collection, document, translation) {
    if (collection === 'products') {
        const required = ['name'];
        for (const field of ['description', 'shortDescription', 'badgeText']) {
            if (hasValue(document[field])) required.push(field);
        }
        if (document.isLinkedProduct && hasValue(document.linkedCategory)) {
            required.push('linkedCategory');
        }
        return required.every(field => hasValue(translation[field]));
    }
    if (collection === 'blogs') {
        const required = ['title', 'slug', 'excerpt', 'content', 'category'];
        if (Array.isArray(document.tags) && document.tags.length > 0) required.push('tags');
        return required.every(field => hasValue(translation[field]));
    }
    return true;
}

async function writeCompressedJson(path, value) {
    const payload = await gzipAsync(Buffer.from(EJSON.stringify(value), 'utf8'));
    await writeFile(path, payload);
}

async function createBackup(connection, clusterKey, timestamp) {
    const backupDir = join(BACKUP_ROOT, `i18n-${timestamp}`, `cluster-${clusterKey}`);
    await mkdir(backupDir, { recursive: true });
    const manifest = { cluster: clusterKey, createdAt: new Date().toISOString(), collections: {} };
    const existingNames = new Set((await connection.db.listCollections().toArray()).map(item => item.name));

    for (const name of COLLECTIONS) {
        if (!existingNames.has(name)) continue;
        const documents = await connection.db.collection(name).find({}).toArray();
        const payload = await gzipAsync(Buffer.from(EJSON.stringify(documents), 'utf8'));
        await writeFile(join(backupDir, `${name}.json.gz`), payload);
        manifest.collections[name] = documents.length;
    }
    await writeFile(join(backupDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    return backupDir;
}

async function saveRunArtifact(timestamp, clusterKey, mode, payload) {
    const artifactDir = join(BACKUP_ROOT, `i18n-${timestamp}`);
    await mkdir(artifactDir, { recursive: true });
    const artifactPath = join(artifactDir, `${mode}-cluster-${clusterKey}.json.gz`);
    await writeCompressedJson(artifactPath, payload);
    return artifactPath;
}

async function runCluster(cluster, timestamp) {
    const connection = await mongoose.createConnection(cluster.uri, {
        serverSelectionTimeoutMS: 20000,
        maxPoolSize: 5,
    }).asPromise();
    const mode = AUDIT_ONLY ? 'audit' : APPLY ? 'apply' : 'dry-run';
    const report = { cluster: cluster.key, mode, backup: null, artifact: null, collections: {} };
    const changes = [];

    try {
        const existingNames = new Set((await connection.db.listCollections().toArray()).map(item => item.name));
        if (APPLY) report.backup = await createBackup(connection, cluster.key, timestamp);

        const existingEnglishSlugs = existingNames.has('blogs')
            ? await connection.db.collection('blogs').distinct('translations.en.slug', { 'translations.en.slug': { $type: 'string' } })
            : [];
        const context = { usedBlogSlugs: new Set(existingEnglishSlugs.filter(Boolean)) };

        for (const collectionName of COLLECTIONS) {
            if (!existingNames.has(collectionName)) {
                report.collections[collectionName] = { status: 'missing', total: 0, eligible: 0, updated: 0 };
                continue;
            }

            const collection = connection.db.collection(collectionName);
            const allDocuments = await collection.find({}).sort({ _id: 1 }).toArray();
            const coverage = allDocuments.reduce((counts, document) => {
                counts[translationCoverage(collectionName, document).status] += 1;
                return counts;
            }, { missing: 0, partial: 0, complete: 0 });
            let documents = OVERWRITE
                ? allDocuments
                : allDocuments.filter(document => translationCoverage(collectionName, document).status !== 'complete');
            if (LIMIT) documents = documents.slice(0, LIMIT);
            const summary = {
                status: 'ok',
                total: allDocuments.length,
                coverage,
                eligible: documents.length,
                proposed: 0,
                updated: 0,
                unchanged: 0,
                conflicts: 0,
                errors: [],
            };

            if (AUDIT_ONLY) {
                report.collections[collectionName] = summary;
                continue;
            }

            for (let index = 0; index < documents.length; index += 1) {
                const document = documents[index];
                try {
                    const proposed = compactTranslation(await buildEnglishTranslation(collectionName, document, context));
                    if ((collectionName === 'products' || collectionName === 'blogs') && !validateForPublishing(collectionName, document, proposed)) {
                        proposed.isPublished = false;
                    }
                    const translation = compactTranslation(mergeTranslation(document.translations?.en, proposed));
                    if ((collectionName === 'products' || collectionName === 'blogs') && !validateForPublishing(collectionName, document, translation)) {
                        translation.isPublished = false;
                    }
                    const changed = !translationsEqual(document.translations?.en, translation);
                    if (!changed) {
                        summary.unchanged += 1;
                        continue;
                    }

                    summary.proposed += 1;
                    changes.push({
                        collection: collectionName,
                        id: String(document._id),
                        source: Object.fromEntries(
                            expectedTranslationFields(collectionName, document)
                                .filter(field => field !== 'isPublished')
                                .map(field => [field, document[field]]),
                        ),
                        existing: document.translations?.en || null,
                        proposed: translation,
                    });

                    if (APPLY) {
                        const optimisticFilter = { _id: document._id };
                        if (document.updatedAt) optimisticFilter.updatedAt = document.updatedAt;
                        const result = await collection.updateOne(
                            optimisticFilter,
                            { $set: { 'translations.en': translation } },
                        );
                        summary.updated += result.modifiedCount;
                        if (result.matchedCount === 0) summary.conflicts += 1;
                    }
                } catch (error) {
                    summary.errors.push({ id: String(document._id), message: error.message });
                }

                console.log(`[cluster ${cluster.key}] ${collectionName}: ${index + 1}/${documents.length}`);
                await saveCache();
            }
            report.collections[collectionName] = summary;
        }
        report.artifact = await saveRunArtifact(timestamp, cluster.key, mode, { report, changes });
        return report;
    } finally {
        await connection.close();
    }
}

async function main() {
    assertConfiguration();
    try {
        if (!AUDIT_ONLY) await loadCache();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reports = [];

        console.log(`${AUDIT_ONLY ? 'AUDIT' : APPLY ? 'APPLY' : 'DRY-RUN'} English content sync for ${CLUSTERS.length} MongoDB source(s).`);
        for (const cluster of CLUSTERS) {
            reports.push(await runCluster(cluster, timestamp));
        }
        if (!AUDIT_ONLY) await saveCache();
        console.log(JSON.stringify({ completedAt: new Date().toISOString(), reports }, null, 2));

        const failures = reports.flatMap(report => Object.values(report.collections).flatMap(item => item.errors || []));
        if (failures.length) process.exitCode = 1;
    } finally {
        stopLocalTranslator();
    }
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
