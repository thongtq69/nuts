import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const banners = await Banner.find({}).sort({ order: 1 }).lean();

        return NextResponse.json(banners.map((banner: any) => ({
            ...banner,
            _id: banner._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        const banner = await Banner.create(body);

        return NextResponse.json(banner, { status: 201 });
    } catch (error) {
        console.error('Error creating banner:', error);
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }
}
