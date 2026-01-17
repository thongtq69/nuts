import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const banners = await Banner.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return NextResponse.json(banners.map((banner: any) => ({
            ...banner,
            _id: banner._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching active banners:', error);
        return NextResponse.json({ error: 'Failed to fetch active banners' }, { status: 500 });
    }
}