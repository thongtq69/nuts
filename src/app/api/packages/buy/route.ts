import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import UserVoucher from '@/models/UserVoucher';
import { verifyToken } from '@/lib/auth'; // Mock auth verification or implement it
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const getUserFromRequest = async (req: Request) => {
    // Basic JWT extraction
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as any;
        return decoded.id;
    } catch (e) {
        return null;
    }
};

export async function POST(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserFromRequest(req);

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { packageId } = await req.json();
        const pkg = await SubscriptionPackage.findById(packageId);

        if (!pkg) {
            return NextResponse.json({ message: 'Package not found' }, { status: 404 });
        }

        // Mock Payment Verification (Assume success)
        // In real app, verify payment status here.

        // Generate Vouchers
        // Package: 49k -> 20 vouchers
        const vouchers = [];
        const quantity = pkg.voucherQuantity;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + pkg.validityDays * 24 * 60 * 60 * 1000);

        for (let i = 0; i < quantity; i++) {
            const code = `PKG-${pkg.discountValue}${pkg.discountType === 'percent' ? 'P' : 'F'}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            vouchers.push({
                userId,
                code,
                discountType: pkg.discountType,
                discountValue: pkg.discountValue,
                maxDiscount: pkg.maxDiscount,
                minOrderValue: pkg.minOrderValue,
                expiresAt,
                isUsed: false
            });
        }

        await UserVoucher.insertMany(vouchers);

        return NextResponse.json({ message: 'Purchase successful', vouchersCount: vouchers.length }, { status: 200 });

    } catch (error) {
        console.error("Buy package error:", error);
        return NextResponse.json({ message: 'Error processing purchase' }, { status: 500 });
    }
}
