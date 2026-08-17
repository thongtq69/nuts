import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import UserMembership from '@/models/UserMembership';
import UserVoucher from '@/models/UserVoucher';
import { buildMembershipVoucherCode, isConfirmedPaymentStatus } from '@/lib/customer-ownership';
import { syncAffiliateCommissionsForOrderStatus } from '@/lib/affiliate-commission-lifecycle';
import { buildMembershipVoucherIssuance } from '@/lib/membership-vouchers';

export class MembershipActivationError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = 'MembershipActivationError';
        this.status = status;
    }
}

export async function activateMembershipOrder(orderId: string) {
    await dbConnect();
    const order: any = await Order.findById(orderId);
    if (!order) throw new MembershipActivationError('Không tìm thấy đơn hàng', 404);
    if (order.orderType !== 'membership' || !order.packageInfo?.packageId) {
        throw new MembershipActivationError('Đây không phải đơn gói hội viên');
    }
    if (!order.user) throw new MembershipActivationError('Đơn hàng chưa gắn với khách hàng');
    if (!isConfirmedPaymentStatus(order.paymentStatus)) {
        throw new MembershipActivationError('Chưa xác nhận thanh toán nên không thể kích hoạt gói hoặc tạo voucher', 409);
    }

    const pkg: any = await SubscriptionPackage.findById(order.packageInfo.packageId);
    if (!pkg) throw new MembershipActivationError('Gói hội viên không còn tồn tại', 404);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(pkg.validityDays || 30));

    const membership = await UserMembership.findOneAndUpdate(
        { orderId: order._id },
        {
            $setOnInsert: {
                userId: order.user,
                packageId: pkg._id,
                orderId: order._id,
                startDate,
                endDate,
                isActive: true,
                purchasePrice: Number(order.totalAmount),
            },
        },
        { upsert: true, new: true },
    );

    const voucherIssuance = buildMembershipVoucherIssuance(pkg);
    const voucherOperations = voucherIssuance.map((voucher) => ({
            updateOne: {
                filter: { sourceOrderId: order._id, sourceIndex: voucher.sourceIndex },
                update: {
                    $setOnInsert: {
                        userId: order.user,
                        code: buildMembershipVoucherCode(String(order._id), voucher.sourceIndex),
                        discountType: voucher.discountType,
                        discountValue: voucher.discountValue,
                        maxDiscount: voucher.maxDiscount,
                        minOrderValue: voucher.minOrderValue,
                        isUsed: false,
                        source: 'package' as const,
                        sourceId: pkg._id,
                        sourceOrderId: order._id,
                        sourceIndex: voucher.sourceIndex,
                    },
                    $set: {
                        isUnlimited: voucher.isUnlimited,
                        expiresAt: membership.endDate,
                    },
                },
                upsert: true,
            },
        }));
    if (voucherOperations.length > 0) {
        await UserVoucher.bulkWrite(voucherOperations, { ordered: false });
    }

    order.status = 'completed';
    order.membershipActivatedAt = membership.startDate;
    if (order.packageInfo) {
        order.packageInfo.isUnlimitedVoucher = Boolean(pkg.isUnlimitedVoucher);
    }
    await syncAffiliateCommissionsForOrderStatus(order, 'completed');
    await order.save();

    return {
        membershipId: String(membership._id),
        vouchersIssued: voucherIssuance.length,
        isUnlimitedVoucher: Boolean(pkg.isUnlimitedVoucher),
        activatedAt: membership.startDate,
    };
}
