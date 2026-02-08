import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Use the shared model instead of local definition
const Settings = SiteSettings;

// GET - Lấy cài đặt website
export async function GET() {
    try {
        await dbConnect();

        let settings = await Settings.findOne({});

        // Nếu chưa có settings, tạo mặc định
        if (!settings) {
            const defaultSettings = {
                hotline: '096 118 5753',
                zaloLink: 'https://zalo.me/...',
                email: 'contact.gonuts@gmail.com',
                address: 'Tầng 4, VT1-B09, Khu đô thị mới An Hưng, Phường Dương Nội, Thành phố Hà Nội, Việt Nam',
                facebookUrl: 'https://www.facebook.com/profile.php?id=61572944004088',
                instagramUrl: 'https://instagram.com/...',
                youtubeUrl: 'https://youtube.com/...',
                tiktokUrl: 'https://tiktok.com/...',
                promoText: 'Giảm giá 8% khi mua hàng từ 899 trở lên với mã "SAVE8P"',
                promoEnabled: true,
                agentRegistrationUrl: '/agent/register',
                ctvRegistrationUrl: '/agent/register',
                freeShippingThreshold: 2000000,
                logoUrl: '/assets/logo.png',
                siteName: 'Go Nuts Vietnam',
                businessLicense: '0123xxxxxx',
                workingHours: 'Thứ 2 - Thứ 7: 8:00 - 17:30',
                productsBannerUrl: '/assets/images/slide1.jpg',
                productsBannerEnabled: true,
                homePromoBannerUrl: '/assets/images/promotion.png',
                homePromoBannerTitle: "WIN RAHUL DRAVID'S<br />AUTOGRAPHED MERCHANDISE",
                homePromoBannerButtonText: 'BUY MORE, WIN MORE',
                homePromoBannerButtonLink: '#',
                homePromoBannerNote: '*Jersey & Miniature Bat',
                homePromoBannerEnabled: true,
            };

            settings = await Settings.create(defaultSettings);
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Lỗi khi lấy cài đặt' }, { status: 500 });
    }
}

// PUT - Cập nhật cài đặt website
export async function PUT(request: NextRequest) {
    try {
        const { _id, __v, createdAt, updatedAt: bodyUpdatedAt, ...updateData } = await request.json();
        await dbConnect();

        // Sanitize updateData - remove any fields that shouldn't be updated or cause issues
        const sanitizedUpdateData = {
            ...updateData,
            updatedAt: new Date()
        };

        // Upsert - cập nhật nếu có, tạo mới nếu chưa có
        const settings = await Settings.findOneAndUpdate(
            {},
            { $set: sanitizedUpdateData },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Cập nhật cài đặt thành công',
            settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Lỗi khi cập nhật cài đặt' }, { status: 500 });
    }
}