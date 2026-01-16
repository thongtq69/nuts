import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Model for user membership purchases - we'll check orders with type 'membership'
import Order from '@/models/Order';

export async function GET() {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // Find membership orders for this user
        const membershipOrders = await Order.find({
            user: decoded.userId,
            orderType: 'membership',
            status: { $in: ['completed', 'paid'] }
        }).sort({ createdAt: -1 }).lean();

        // Transform to membership package format
        const packages = membershipOrders.map((order: any) => ({
            _id: order._id.toString(),
            packageName: order.packageInfo?.name || 'Gói hội viên',
            price: order.totalAmount,
            purchasedAt: order.createdAt,
            expiresAt: order.packageInfo?.expiresAt || new Date(new Date(order.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
            vouchersReceived: order.packageInfo?.voucherQuantity || 0,
            status: new Date(order.packageInfo?.expiresAt || new Date()) > new Date() ? 'active' : 'expired'
        }));

        return NextResponse.json(packages);
    } catch (error) {
        console.error('Error fetching membership:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
