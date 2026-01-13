import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hotline: '090xxxxxxx',
        promoText: 'Giảm giá 8% khi mua hàng từ 899k trở lên với mã "SAVER8"',
        socialLinks: {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            youtube: 'https://youtube.com',
            zalo: 'https://zalo.me'
        }
    });
}
