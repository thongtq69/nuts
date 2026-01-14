import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasTmnCode: !!process.env.VNPAY_TMN_CODE,
        hasHashSecret: !!process.env.VNPAY_HASH_SECRET,
        hasUrl: !!process.env.VNPAY_URL,
        hasReturnUrl: !!process.env.VNPAY_RETURN_URL,
        tmnCodeLength: process.env.VNPAY_TMN_CODE?.length || 0,
        hashSecretLength: process.env.VNPAY_HASH_SECRET?.length || 0,
        url: process.env.VNPAY_URL || 'not set',
        returnUrl: process.env.VNPAY_RETURN_URL || 'not set',
    });
}
