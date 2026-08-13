import { Metadata } from "next";
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import SiteSettings, { ISiteSettings } from '@/models/SiteSettings';
import ProductList from '@/components/products/ProductList';
import { getRequestLocale } from '@/i18n/server';
import { localizeProduct, localizeSettings } from '@/lib/localized-content';
import type { Locale } from '@/i18n/config';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';
    const settings = localizeSettings(await getSiteSettings() as any, locale) as Partial<ISiteSettings>;
    const bannerUrl = (settings.productsBannerUrl?.startsWith('http')
        ? settings.productsBannerUrl
        : `https://gonuts.vn${settings.productsBannerUrl}`) || "https://res.cloudinary.com/du6no35fj/image/upload/v1770576812/gonuts/banners/products_banner_1770576809653.png";

    return {
        title: isEnglish ? 'All Products | Go Nuts' : 'Tất cả sản phẩm | Go Nuts',
        description: isEnglish
            ? 'Explore nutritious nuts, dried fruit and gift collections from Go Nuts.'
            : 'Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.',
        alternates: {
            canonical: isEnglish ? 'https://gonuts.vn/en/products' : 'https://gonuts.vn/products',
            languages: {
                'vi-VN': 'https://gonuts.vn/products',
                en: 'https://gonuts.vn/en/products',
                'x-default': 'https://gonuts.vn/products',
            },
        },
        openGraph: {
            title: isEnglish ? 'All Products | Go Nuts' : 'Tất cả sản phẩm | Go Nuts',
            description: isEnglish ? 'Explore nutritious products from Go Nuts.' : 'Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.',
            locale: isEnglish ? 'en_US' : 'vi_VN',
            images: [
                {
                    url: `${bannerUrl}${bannerUrl.includes('?') ? '&' : '?'}v=10`,
                    width: 1200,
                    height: 630,
                    alt: "Go Nuts Products",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: isEnglish ? 'All Products | Go Nuts' : 'Tất cả sản phẩm | Go Nuts',
            description: isEnglish ? 'Explore nutritious products from Go Nuts.' : 'Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.',
            images: [`${bannerUrl}${bannerUrl.includes('?') ? '&' : '?'}v=10`],
        },
    };
}

export const dynamic = 'force-dynamic';

// Direct database query for server-side rendering
async function getProducts(locale: Locale): Promise<IProduct[]> {
    try {
        await dbConnect();
        const products = await Product.find(
            locale === 'en' ? { 'translations.en.isPublished': true } : {},
        ).sort({ sortOrder: -1, createdAt: -1 } as any).lean();

        // Serialize MongoDB documents
        return products.map((product: any) => ({
            ...product,
            _id: product._id.toString(),
            id: product._id.toString(),
            createdAt: product.createdAt?.toISOString(),
            updatedAt: product.updatedAt?.toISOString(),
        }));
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
    }
}

async function getSiteSettings(): Promise<Partial<ISiteSettings>> {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne().sort({ updatedAt: -1 }).lean();
        if (settings) {
            return {
                productsBannerUrl: settings.productsBannerUrl,
                productsBannerEnabled: settings.productsBannerEnabled,
                translations: settings.translations,
            };
        }
    } catch (error) {
        console.error('❌ Error fetching site settings:', error);
    }
    return {
        productsBannerUrl: '/assets/images/gonuts-banner-member.png',
        productsBannerEnabled: true
    };
}

export default async function ProductsPage() {
    const locale = await getRequestLocale();
    const [products, settings] = await Promise.all([
        getProducts(locale),
        getSiteSettings()
    ]);

    const localizedProducts = products.map(product => localizeProduct(product as any, locale)) as unknown as IProduct[];
    const localizedSettings = localizeSettings(settings as any, locale) as Partial<ISiteSettings>;
    return <ProductList products={localizedProducts} initialSettings={localizedSettings} />;
}
