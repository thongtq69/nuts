import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
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

        const order = await Order.create({
            ...body,
            user: userId || undefined, // undefined if guest, though likely we want to force login or handle guest checkout
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
