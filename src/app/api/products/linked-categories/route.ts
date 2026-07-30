import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Product.distinct('linkedCategory', {
            isLinkedProduct: true,
            linkedCategory: { $type: 'string', $ne: '' },
        });

        return NextResponse.json(
            categories
                .map((category) => String(category).trim())
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b, 'vi'))
        );
    } catch (error) {
        console.error('Error fetching linked product categories:', error);
        return NextResponse.json(
            { message: 'Không thể tải danh mục sản phẩm liên kết' },
            { status: 500 }
        );
    }
}
