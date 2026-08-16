import Order from '@/models/Order';
import UserVoucher from '@/models/UserVoucher';
import { calculateLegacyVipSavings } from '@/lib/vip-savings';

export async function getCustomerFinancialSummary(userId: string) {
    const orderMatch = { $or: [{ user: userId }, { userId }] };
    const orders = await Order.find(orderMatch)
        .select('_id items shippingFee totalAmount status paymentStatus orderType createdAt voucherSource vipSavings voucherDiscountAmount')
        .sort({ createdAt: -1 })
        .lean();
    const settledOrders = orders.filter((order) => {
        const status = String(order.status || '').toLowerCase();
        // A cancelled order is money that never stayed with the shop, even if it
        // was marked paid before the cancellation.
        if (status === 'cancelled') return false;
        return ['paid', 'completed'].includes(String(order.paymentStatus || '').toLowerCase())
            || ['completed', 'delivered'].includes(status);
    });
    const settledOrderIds = settledOrders.map((order) => order._id);
    const legacyVipVouchers = settledOrderIds.length > 0
        ? await UserVoucher.find({
            userId,
            source: 'package',
            isUsed: true,
            orderId: { $in: settledOrderIds },
        }).select('orderId').lean()
        : [];
    const legacyVipOrderIds = new Set(legacyVipVouchers.map((voucher) => String(voucher.orderId)));

    const vipSavingsOrders = settledOrders.flatMap((order) => {
        const isVipOrder = order.voucherSource === 'package' || legacyVipOrderIds.has(String(order._id));
        if (!isVipOrder) return [];
        const storedSavings = Number(order.vipSavings);
        const amount = Number.isFinite(storedSavings)
            ? Math.max(0, Math.round(storedSavings))
            : calculateLegacyVipSavings(order);
        return [{
            _id: String(order._id),
            amount,
            totalAmount: Number(order.totalAmount) || 0,
            createdAt: order.createdAt,
        }];
    });

    return {
        totalOrders: orders.length,
        totalSpent: settledOrders.reduce((total, order) => total + Math.max(0, Number(order.totalAmount) || 0), 0),
        totalVipSavings: vipSavingsOrders.reduce((total, order) => total + order.amount, 0),
        vipSavingsOrderCount: vipSavingsOrders.length,
        vipSavingsOrders,
    };
}
