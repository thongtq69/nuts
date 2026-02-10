import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Settings = SiteSettings;

// Helper to ensure only one settings document exists
async function ensureSingleton() {
    const count = await Settings.countDocuments();
    if (count > 1) {
        console.log(`🧹 Cleaning up ${count} settings documents, keeping only the latest...`);
        const latest = await Settings.findOne().sort({ updatedAt: -1 });
        if (latest) {
            await Settings.deleteMany({ _id: { $ne: latest._id } });
        }
    }
}

// GET - Lấy cài đặt website
export async function GET() {
    try {
        await dbConnect();
        await ensureSingleton();

        let settings = await Settings.findOne().sort({ updatedAt: -1 });

        // Nếu chưa có settings, tạo mặc định
        if (!settings) {
            console.log('🆕 Creating default site settings...');
            const defaultSettings = {
                hotline: '096 118 5753',
                zaloLink: 'https://zalo.me/0961185753',
                email: 'contact.gonuts@gmail.com',
                address: 'Tầng 4, VT1-B09, Khu đô thị mới An Hưng, Phường Dương Nội, Thành phố Hà Nội, Việt Nam',
                facebookUrl: 'https://www.facebook.com/profile.php?id=61572944004088',
                instagramUrl: 'https://instagram.com/gonuts',
                youtubeUrl: 'https://youtube.com/gonuts',
                tiktokUrl: 'https://tiktok.com/@gonuts',
                promoText: 'TẶNG VOUCHER 50.000 VNĐ KHI ĐĂNG KÝ THÀNH VIÊN',
                promoEnabled: true,
                agentRegistrationUrl: '/register?type=agent',
                ctvRegistrationUrl: '/register?type=collaborator',
                freeShippingThreshold: 500000,
                logoUrl: '/assets/logo.png',
                siteName: 'Go Nuts Vietnam',
                businessLicense: '0123xxxxxx',
                workingHours: 'Thứ 2 - Thứ 7: 8:00 - 17:30',
                productsBannerUrl: '/assets/images/promotion.png',
                productsBannerEnabled: true,
                homePromoBannerUrl: '/assets/images/promotion.png',
                homePromoBannerTitle: "TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN",
                homePromoBannerButtonText: 'ĐĂNG KÝ NGAY',
                homePromoBannerButtonLink: '/register',
                homePromoBannerNote: '*Áp dụng cho đơn hàng từ 300.000đ',
                homePromoBannerEnabled: true,
                supportHotline: '096 118 5753',
            };

            settings = await Settings.create(defaultSettings);
        }

        // Forced cleanup of old English defaults if they persist in DB
        if (settings.homePromoBannerButtonText === 'BUY MORE, WIN MORE') {
            settings.homePromoBannerButtonText = 'ĐĂNG KÝ NGAY';
            settings.homePromoBannerTitle = "TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN";
            settings.homePromoBannerNote = '*Áp dụng cho đơn hàng từ 300.000đ';
            await settings.save();
        }

        // Forced cleanup of old banner images
        if (settings.productsBannerUrl === '/assets/images/slide1.jpg') {
            settings.productsBannerUrl = '/assets/images/promotion.png';
            await settings.save();
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

        // Always update the latest document to avoid duplicates
        const latest = await Settings.findOne().sort({ updatedAt: -1 });
        const filter = latest ? { _id: latest._id } : {};

        const settings = await Settings.findOneAndUpdate(
            filter,
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