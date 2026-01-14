import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'sale') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch referred orders
        const recentOrders = await Order.find({ referrer: user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const totalReferrals = await Order.countDocuments({ referrer: user._id });

        return NextResponse.json({
            referralCode: user.referralCode,
            walletBalance: user.walletBalance,
            totalCommission: user.totalCommission,
            totalReferrals,
            recentOrders,
        });

    } catch (error) {
        console.error('Agent stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
