import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { decodeAffiliateId } from '@/lib/affiliate';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        await dbConnect();
        const { code } = await params;

        if (!code) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        const userId = decodeAffiliateId(code);

        if (!userId) {
            console.error('Invalid affiliate code:', code);
            return NextResponse.redirect(new URL('/', req.url));
        }

        const user = await User.findById(userId);

        if (!user || !user.referralCode) {
            console.error('User not found or no referral code for id:', userId);
            return NextResponse.redirect(new URL('/', req.url));
        }

        const redirectUrl = new URL('/', req.url);
        redirectUrl.searchParams.set('ref', user.referralCode);

        const response = NextResponse.redirect(redirectUrl);

        response.cookies.set('gonuts_ref', user.referralCode, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Error processing affiliate code:', error);
        return NextResponse.redirect(new URL('/', req.url));
    }
}
