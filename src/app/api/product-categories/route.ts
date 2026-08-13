import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { normalizeMenuName } from '@/lib/menu-name';
import Product from '@/models/Product';
import ProductCategory from '@/models/ProductCategory';
import {
    PRODUCT_CATEGORIES,
    sortProductCategoriesAlphabetically,
} from '@/constants/product-categories';
import { getUrlLocale } from '@/i18n/server';
import { translate } from '@/i18n/messages';

export const dynamic = 'force-dynamic';

function normalizeKey(value: unknown) {
    return normalizeMenuName(value).toLocaleLowerCase('vi');
}

export async function GET(request: Request) {
    try {
        const locale = getUrlLocale(request);
        await dbConnect();
        const [customCategories, productValues] = await Promise.all([
            ProductCategory.find().sort({ name: 1 }).lean(),
            Product.distinct('category', {
                category: { $type: 'string', $ne: '' },
            }),
        ]);

        const categories = new Map<string, { value: string; label: string; isDefault: boolean }>();
        for (const category of PRODUCT_CATEGORIES) {
            categories.set(normalizeKey(category.value), {
                value: category.value,
                label: translate(locale, category.label),
                isDefault: true,
            });
        }
        for (const category of customCategories) {
            categories.set(normalizeKey(category.value), {
                value: category.value,
                label: locale === 'en' && category.translations?.en?.name
                    ? category.translations.en.name
                    : category.name,
                isDefault: false,
            });
        }
        for (const value of productValues) {
            const cleanValue = normalizeMenuName(value);
            if (!cleanValue) continue;
            const defaultCategory = PRODUCT_CATEGORIES.find(category =>
                normalizeKey(category.value) === normalizeKey(cleanValue)
            );
            if (!categories.has(normalizeKey(cleanValue))) {
                categories.set(normalizeKey(cleanValue), {
                    value: cleanValue,
                    label: defaultCategory ? translate(locale, defaultCategory.label) : cleanValue,
                    isDefault: Boolean(defaultCategory),
                });
            }
        }

        return NextResponse.json(
            sortProductCategoriesAlphabetically(Array.from(categories.values())),
        );
    } catch (error) {
        console.error('Failed to fetch product categories:', error);
        return NextResponse.json({ error: 'Không thể tải danh mục sản phẩm' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await verifyToken(request);
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 403 });
        }

        const body = await request.json();
        const name = normalizeMenuName(body.name);
        if (!name || name.length > 80) {
            return NextResponse.json(
                { error: 'Tên danh mục phải có từ 1 đến 80 ký tự' },
                { status: 400 },
            );
        }

        const defaultCategory = PRODUCT_CATEGORIES.find(category =>
            normalizeKey(category.label) === normalizeKey(name) ||
            normalizeKey(category.value) === normalizeKey(name)
        );
        if (defaultCategory) {
            return NextResponse.json({
                value: defaultCategory.value,
                label: defaultCategory.label,
                isDefault: true,
            });
        }

        await dbConnect();
        const normalizedName = normalizeKey(name);
        const existing = await ProductCategory.findOne({ normalizedName }).lean();
        if (existing) {
            return NextResponse.json({
                value: existing.value,
                label: existing.name,
                isDefault: false,
            });
        }

        const category = await ProductCategory.create({
            name,
            normalizedName,
            value: name,
        });

        return NextResponse.json({
            value: category.value,
            label: category.name,
            isDefault: false,
        }, { status: 201 });
    } catch (error: unknown) {
        if ((error as { code?: number })?.code === 11000) {
            return NextResponse.json({ error: 'Danh mục này đã tồn tại' }, { status: 409 });
        }
        console.error('Failed to create product category:', error);
        return NextResponse.json({ error: 'Không thể tạo danh mục sản phẩm' }, { status: 500 });
    }
}
