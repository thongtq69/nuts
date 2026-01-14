import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createPaymentUrl } from '@/lib/vnpay';

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

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const userId = await getUserId();
        const cookieStore = await cookies();

        // Validate environment variables
        if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
            console.error('VNPay config missing:', {
                hasTmnCode: !!process.env.VNPAY_TMN_CODE,
                hasHashSecret: !!process.env.VNPAY_HASH_SECRET
            });
            return NextResponse.json(
                { message: 'Cấu hình VNPay chưa đầy đủ' },
                { status: 500 }
            );
        }

        // Affiliate Logic
        const refCode = cookieStore.get('gonuts_ref')?.value;
        let referrerId = undefined;
        let commissionAmount = 0;

        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser && referrerUser._id.toString() !== userId) {
                referrerId = referrerUser._id;
                const subtotal = body.totalAmount - (body.shippingFee || 0);
                if (subtotal > 0) {
                    commissionAmount = Math.round(subtotal * 0.10);
                }
            }
        }

        // Create order with pending payment status
        const order = await Order.create({
            ...body,
            user: userId || undefined,
            referrer: referrerId,
            commissionAmount,
            commissionStatus: 'pending',
            paymentMethod: 'vnpay',
            paymentStatus: 'pending',
            status: 'pending',
        });

        console.log('Order created:', order._id);

        // Get client IP
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

        // Create VNPay payment URL
        const paymentUrl = createPaymentUrl({
            orderId: order._id.toString(),
            amount: body.totalAmount,
            orderInfo: `Thanh toan don hang ${order._id}`,
            ipAddr: ip,
            locale: 'vn',
        });

        console.log('Payment URL created:', paymentUrl.substring(0, 100) + '...');

        return NextResponse.json({ 
            success: true,
            paymentUrl,
            orderId: order._id 
        });
    } catch (error) {
        console.error('VNPay create payment error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi tạo thanh toán VNPay', error: String(error) },
            { status: 500 }
        );
    }
}
