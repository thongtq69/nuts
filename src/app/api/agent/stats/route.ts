import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';
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

        const orders = await Order.find({ referrer: user._id })
            .sort({ createdAt: -1 })
            .lean();
        const commissions = await AffiliateCommission.find({
            affiliateId: user._id,
            orderId: { $in: orders.map((order) => order._id) },
            archivedAt: { $exists: false },
        }).lean();
        const commissionByOrder = new Map(commissions.map((commission) => [String(commission.orderId), commission]));
        const invalidStatuses = new Set(['cancelled', 'canceled', 'refunded', 'returned']);
        const validOrders = orders.filter((order) => !invalidStatuses.has(String(order.status || '').toLowerCase()));
        const recentOrders = validOrders.slice(0, 20).map((order) => {
            const commission = commissionByOrder.get(String(order._id));
            return {
                _id: String(order._id),
                orderId: String(order._id).slice(-8).toUpperCase(),
                customerName: order.shippingInfo?.fullName || 'Khách vãng lai',
                totalAmount: Number(order.totalAmount || 0),
                commissionAmount: Number(commission?.commissionAmount || 0),
                status: order.status || 'pending',
                createdAt: order.createdAt,
            };
        });
        const commissionData = Array.from({ length: 7 }, (_, offset) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (6 - offset));
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const amount = commissions
                .filter((commission) => commission.status !== 'rejected')
                .filter((commission) => {
                    const createdAt = new Date(commission.createdAt || 0);
                    return createdAt >= date && createdAt < nextDate;
                })
                .reduce((sum, commission) => sum + Number(commission.commissionAmount || 0), 0);
            return { date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), commission: amount };
        });

        return NextResponse.json({
            referralCode: user.referralCode,
            encodedAffiliateCode: user.encodedAffiliateCode || '',
            walletBalance: user.walletBalance,
            totalCommission: user.totalCommission,
            totalReferrals: validOrders.length,
            pendingOrders: validOrders.filter((order) => ['pending', 'processing', 'confirmed', 'shipping'].includes(String(order.status))).length,
            totalRevenue: validOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
            recentOrders,
            commissionData,
        });

    } catch (error) {
        console.error('Agent stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
