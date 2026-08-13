import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getUrlLocale } from '@/i18n/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const locale = getUrlLocale(request);
        const categoryField = locale === 'en'
            ? 'translations.en.linkedCategory'
            : 'linkedCategory';
        const categories = await Product.distinct(categoryField, {
            isLinkedProduct: true,
            ...(locale === 'en' ? { 'translations.en.isPublished': true } : {}),
            [categoryField]: { $type: 'string', $ne: '' },
        });

        const normalizedCategories = new Map<string, string>();
        categories.forEach(category => {
            const normalized = String(category).trim().replace(/\s+/g, ' ');
            if (!normalized) return;

            const key = normalized.toLocaleLowerCase(locale);
            if (!normalizedCategories.has(key)) {
                normalizedCategories.set(key, normalized);
            }
        });

        return NextResponse.json(
            Array.from(normalizedCategories.values())
                .sort((a, b) => a.localeCompare(b, locale)),
        );
    } catch (error) {
        console.error('Error fetching linked product submenus:', error);
        return NextResponse.json(
            { message: 'Không thể tải submenu sản phẩm liên kết' },
            { status: 500 },
        );
    }
}
