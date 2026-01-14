import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AffiliateSettings from '@/models/AffiliateSettings'; // We might need this for duration
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { refCode } = await req.json();

        if (!refCode) {
            return NextResponse.json({ message: 'Missing refCode' }, { status: 400 });
        }

        const affiliate = await User.findOne({ referralCode: refCode.toUpperCase() });

        if (!affiliate) {
            return NextResponse.json({ message: 'Invalid refCode' }, { status: 404 });
        }

        // Get cookie duration settings
        let durationDays = 30; // Default
        const settings = await AffiliateSettings.findOne();
        if (settings) {
            durationDays = settings.cookieDurationDays;
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('gonuts_ref', refCode.toUpperCase(), {
            maxAge: durationDays * 24 * 60 * 60, // seconds
            path: '/',
            httpOnly: true, // secure
        });

        return NextResponse.json({ message: 'Cookie set' });

    } catch (error) {
        console.error('Cookie tracking error:', error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
