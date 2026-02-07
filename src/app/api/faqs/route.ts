import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FAQ from '@/models/FAQ';

export const dynamic = 'force-dynamic';

// GET all FAQs or by category
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const admin = searchParams.get('admin'); // For admin panel, return all FAQs including inactive

        const query: any = admin === 'true' ? {} : { isActive: true };
        if (category) {
            query.category = category;
        }

        const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 }).lean();

        return NextResponse.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }
}

// POST - Create new FAQ
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const faq = await FAQ.create(body);

        return NextResponse.json({
            success: true,
            faq
        });
    } catch (error: any) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json({ error: error.message || 'Failed to create FAQ' }, { status: 500 });
    }
}
