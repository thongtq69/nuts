import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface SiteSettings {
    _id?: ObjectId;
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
    updatedAt: Date;
}

// GET - Lấy cài đặt website
export async function GET() {
    try {
        const { db } = await connectDB();
        
        let settings = await db.collection('settings').findOne({});
        
        // Nếu chưa có settings, tạo mặc định
        if (!settings) {
            const defaultSettings: Omit<SiteSettings, '_id'> = {
                hotline: '090 118 5753',
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
                updatedAt: new Date()
            };
            
            const result = await db.collection('settings').insertOne(defaultSettings);
            settings = { ...defaultSettings, _id: result.insertedId };
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
        const body = await request.json();
        const { db } = await connectDB();
        
        const updateData = {
            ...body,
            updatedAt: new Date()
        };
        
        // Upsert - cập nhật nếu có, tạo mới nếu chưa có
        const result = await db.collection('settings').updateOne(
            {},
            { $set: updateData },
            { upsert: true }
        );
        
        return NextResponse.json({ 
            success: true, 
            message: 'Cập nhật cài đặt thành công',
            result 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Lỗi khi cập nhật cài đặt' }, { status: 500 });
    }
}