import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AffiliateSettings from '@/models/AffiliateSettings';

export async function GET() {
    await dbConnect();
    let settings = await AffiliateSettings.findOne();
    if (!settings) {
        settings = await AffiliateSettings.create({});
    }
    return NextResponse.json(settings);
}

export async function POST(req: Request) {
    await dbConnect();
    const body = await req.json();
    const settings = await AffiliateSettings.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(settings);
}
