import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import Order from '@/models/Order';
import UserMembership from '@/models/UserMembership';
import UserVoucher from '@/models/UserVoucher';
import { isConfirmedPaymentStatus } from '@/lib/customer-ownership';

export const dynamic = 'force-dynamic';

export type MembershipState = 'pending_payment' | 'awaiting_activation' | 'active' | 'expired';

export async function GET() {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as any;
            userId = decoded.id || decoded.userId;
        } catch (e) {
            return NextResponse.json({ message: 'Token không hợp lệ' }, { status: 401 });
        }

        // Every package the customer has bought, whatever stage it is at. Hiding
        // unpaid or not-yet-activated orders is what made this tab look empty
        // right after a purchase.
        const membershipOrders = await Order.find({
            user: userId,
            status: { $ne: 'cancelled' },
            $or: [
                { orderType: 'membership' },
                { 'packageInfo.packageId': { $exists: true, $ne: null } },
                { 'items.name': { $regex: /Gói Hội Viên|Gói VIP/i } },
            ],
        }).sort({ createdAt: -1 }).lean();

        if (membershipOrders.length === 0) return NextResponse.json([]);

        const orderIds = membershipOrders.map((order: any) => order._id);

        const [memberships, vouchers] = await Promise.all([
            UserMembership.find({ orderId: { $in: orderIds } }).lean(),
            UserVoucher.find({ sourceOrderId: { $in: orderIds } })
                .select('sourceOrderId isUsed isUnlimited expiresAt')
                .lean(),
        ]);

        const membershipByOrder = new Map(memberships.map((m: any) => [String(m.orderId), m]));
        const voucherStatsByOrder = new Map<string, { issued: number; available: number; isUnlimited: boolean }>();
        for (const voucher of vouchers as any[]) {
            const key = String(voucher.sourceOrderId);
            const stats = voucherStatsByOrder.get(key) || { issued: 0, available: 0, isUnlimited: false };
            stats.issued += 1;
            if (!voucher.isUsed && new Date(voucher.expiresAt) > new Date()) stats.available += 1;
            if (voucher.isUnlimited) stats.isUnlimited = true;
            voucherStatsByOrder.set(key, stats);
        }

        const packages = membershipOrders.map((order: any) => {
            const orderKey = String(order._id);
            const membership = membershipByOrder.get(orderKey);
            const voucherStats = voucherStatsByOrder.get(orderKey) || { issued: 0, available: 0, isUnlimited: false };
            const isUnlimitedVoucher = Boolean(
                order.packageInfo?.isUnlimitedVoucher || voucherStats.isUnlimited,
            );
            const isPaid = isConfirmedPaymentStatus(order.paymentStatus);

            let packageName = order.packageInfo?.name;
            if (!packageName && order.items?.length > 0) {
                const membershipItem = order.items.find((item: any) =>
                    item.name?.includes('Gói Hội Viên') || item.name?.includes('Gói VIP')
                );
                packageName = membershipItem?.name
                    ?.replace('Gói Hội Viên: ', '')
                    ?.replace('Gói VIP: ', '');
            }

            const activatedAt = membership?.startDate || order.membershipActivatedAt || null;
            const expiresAt = membership?.endDate || order.packageInfo?.expiresAt || null;
            const isExpired = Boolean(expiresAt) && new Date(expiresAt) <= new Date();

            const state: MembershipState = !isPaid
                ? 'pending_payment'
                : !activatedAt
                    ? 'awaiting_activation'
                    : isExpired
                        ? 'expired'
                        : 'active';

            return {
                _id: orderKey,
                orderCode: orderKey.slice(-6).toUpperCase(),
                packageName: packageName || 'Gói hội viên',
                price: order.totalAmount,
                purchasedAt: order.createdAt,
                activatedAt,
                expiresAt,
                state,
                status: state === 'active' ? 'active' : state === 'expired' ? 'expired' : 'pending',
                vouchersReceived: voucherStats.issued,
                vouchersAvailable: voucherStats.available,
                vouchersExpected: isUnlimitedVoucher ? voucherStats.issued : order.packageInfo?.voucherQuantity || 0,
                isUnlimitedVoucher,
                // Lets the account page offer "thanh toán tiếp" without a second request.
                paymentStatus: order.paymentStatus || 'pending',
                paymentMethod: order.paymentMethod || '',
                paymentRef: order.paymentRef || '',
            };
        });

        return NextResponse.json(packages);
    } catch (error) {
        console.error('Error fetching membership:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
