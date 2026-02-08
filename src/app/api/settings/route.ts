import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

interface SiteSettings {
    _id?: mongoose.Types.ObjectId;
    hotline: string;
    zaloLink: string;
    email: string;
    address: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    promoText: string;
    promoEnabled: boolean;
    agentRegistrationUrl: string;
    ctvRegistrationUrl: string;
    freeShippingThreshold: number;
    logoUrl: string;
    siteName: string;
    businessLicense: string;
    workingHours: string;
    productsBannerUrl: string;
    productsBannerEnabled: boolean;
    homePromoBannerUrl: string;
    homePromoBannerTitle: string;
    homePromoBannerButtonText: string;
    homePromoBannerButtonLink: string;
    homePromoBannerNote: string;
    homePromoBannerEnabled: boolean;
    supportHotline: string;
    productFeatures: {
        title: string;
        description: string;
        icon: string;
        enabled: boolean;
    }[];
    updatedAt: Date;
}

// Mongoose Schema
const settingsSchema = new mongoose.Schema({
    hotline: { type: String, default: '' },
    zaloLink: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    tiktokUrl: { type: String, default: '' },
    promoText: { type: String, default: '' },
    promoEnabled: { type: Boolean, default: true },
    agentRegistrationUrl: { type: String, default: '' },
    ctvRegistrationUrl: { type: String, default: '' },
    freeShippingThreshold: { type: Number, default: 0 },
    logoUrl: { type: String, default: '' },
    siteName: { type: String, default: '' },
    businessLicense: { type: String, default: '' },
    workingHours: { type: String, default: '' },
    productsBannerUrl: { type: String, default: '/assets/images/slide1.jpg' },
    productsBannerEnabled: { type: Boolean, default: true },
    homePromoBannerUrl: { type: String, default: '/assets/images/promotion.png' },
    homePromoBannerTitle: { type: String, default: "WIN RAHUL DRAVID'S<br />AUTOGRAPHED MERCHANDISE" },
    homePromoBannerButtonText: { type: String, default: 'BUY MORE, WIN MORE' },
    homePromoBannerButtonLink: { type: String, default: '#' },
    homePromoBannerNote: { type: String, default: '*Jersey & Miniature Bat' },
    homePromoBannerEnabled: { type: Boolean, default: true },
    supportHotline: { type: String, default: '' },
    productFeatures: [{
        title: String,
        description: String,
        icon: String,
        enabled: { type: Boolean, default: true }
    }],
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

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
            { upsert: true, new: true, runValidators: true }
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