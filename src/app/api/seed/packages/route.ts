import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';

export async function GET() {
    try {
        await dbConnect();

        // Check if packages exist
        const count = await SubscriptionPackage.countDocuments();

        if (count > 0) {
            return NextResponse.json({ message: 'Packages already seeded', count });
        }

        // Seed initial packages
        const packages = [
            {
                name: 'Gói Bronze',
                price: 49000,
                description: 'Gói tiết kiệm cho người mới bắt đầu',
                discountType: 'percent',
                discountValue: 20,
                maxDiscount: 50000,
                minOrderValue: 0,
                voucherQuantity: 20,
                validityDays: 30,
            },
            {
                name: 'Gói Silver',
                price: 99000,
                description: 'Gói phổ biến với nhiều ưu đãi hấp dẫn',
                discountType: 'percent',
                discountValue: 25,
                maxDiscount: 100000,
                minOrderValue: 0,
                voucherQuantity: 30,
                validityDays: 60,
            },
            {
                name: 'Gói Gold',
                price: 199000,
                description: 'Gói cao cấp dành cho khách hàng thân thiết',
                discountType: 'percent',
                discountValue: 30,
                maxDiscount: 200000,
                minOrderValue: 0,
                voucherQuantity: 50,
                validityDays: 90,
            },
        ];

        await SubscriptionPackage.insertMany(packages);

        return NextResponse.json({
            message: 'Packages seeded successfully',
            count: packages.length
        }, { status: 201 });
    } catch (error) {
        console.error('Error seeding packages:', error);
        return NextResponse.json({ error: 'Failed to seed packages' }, { status: 500 });
    }
}
