import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';

async function getCurrentAgent() {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) return null;
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_change_me',
        ) as JwtPayload;
        if (!decoded.id) return null;
        await dbConnect();
        return User.findById(decoded.id);
    } catch {
        return null;
    }
}

const invalidOrderStatuses = new Set(['cancelled', 'canceled', 'refunded', 'returned']);

export async function GET() {
    try {
        const agent = await getCurrentAgent();
        if (!agent || agent.role !== 'sale') {
            return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
        }

        const records = await AffiliateCommission.find({
            affiliateId: agent._id,
            archivedAt: { $exists: false },
        }).sort({ createdAt: -1 }).lean();

        const orderIds = records.map((record) => record.orderId).filter(Boolean);
        const orders = await Order.find({ _id: { $in: orderIds } })
            .select('_id status shippingInfo items paymentMethod totalAmount createdAt')
            .lean();
        const orderMap = new Map(orders.map((order) => [String(order._id), order]));

        const commissions = records.flatMap((record) => {
            const order = orderMap.get(String(record.orderId));
            if (!order || invalidOrderStatuses.has(String(order.status || '').toLowerCase())) return [];

            const fullOrderId = String(order._id);
            return [{
                id: String(record._id),
                orderId: fullOrderId.slice(-8).toUpperCase(),
                orderIdFull: fullOrderId,
                orderValue: Number(record.orderValue || order.totalAmount || 0),
                commissionRate: Number(record.commissionRate || 0),
                commissionAmount: Number(record.commissionAmount || 0),
                status: record.status,
                note: record.note || '',
                orderStatus: order.status || 'pending',
                customerName: order.shippingInfo?.fullName || 'Khách vãng lai',
                customerPhone: order.shippingInfo?.phone || '',
                orderItems: order.items || [],
                paymentMethod: order.paymentMethod || 'cod',
                createdAt: record.createdAt || order.createdAt,
            }];
        });

        const sumByStatus = (status: string) => commissions
            .filter((record) => record.status === status)
            .reduce((sum, record) => sum + record.commissionAmount, 0);

        return NextResponse.json({
            commissions,
            stats: {
                totalPending: sumByStatus('pending'),
                totalApproved: sumByStatus('approved'),
                totalPaid: sumByStatus('paid'),
                totalAll: commissions
                    .filter((record) => record.status !== 'rejected')
                    .reduce((sum, record) => sum + record.commissionAmount, 0),
            },
        });
    } catch (error) {
        console.error('Get agent commissions error:', error);
        return NextResponse.json({ message: 'Không thể tải dữ liệu hoa hồng' }, { status: 500 });
    }
}
