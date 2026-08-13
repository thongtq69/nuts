import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import { getUrlLocale } from '@/i18n/server';
import { localizeBanner } from '@/lib/localized-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const banners = await Banner.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return NextResponse.json(banners.map((banner) => ({
            ...localizeBanner(banner, getUrlLocale(request)),
            _id: banner._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching active banners:', error);
        return NextResponse.json({ error: 'Failed to fetch active banners' }, { status: 500 });
    }
}
