import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to get user ID if logged in
async function getUserId() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        return decoded.id;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const userId = await getUserId();
        const cookieStore = await cookies();

        // Affiliate Logic
        const refCode = cookieStore.get('gonuts_ref')?.value;
        let referrerId = undefined;
        let commissionAmount = 0;
        let commissionStatus = 'pending';

        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser && referrerUser._id.toString() !== userId) { // Prevent self-referral
                referrerId = referrerUser._id;
                // Calculate Commission: 10% of Subtotal (excluding shipping)
                // Assuming body.totalAmount includes shipping, we might need pre-shipping total.
                // For simplicity, let's use (totalAmount - shippingFee) * 0.10

                const subtotal = body.totalAmount - (body.shippingFee || 0);
                if (subtotal > 0) {
                    commissionAmount = Math.round(subtotal * 0.10);
                }
            }
        }

        const order = await Order.create({
            ...body,
            user: userId || undefined,
            referrer: referrerId,
            commissionAmount,
            commissionStatus,
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi tạo đơn hàng' },
            { status: 500 }
        );
    }
}

// GET orders for current user
export async function GET(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json(
                { message: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
