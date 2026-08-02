import Order from '@/models/Order';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import User from '@/models/User';
import UserMembership from '@/models/UserMembership';
import UserVoucher from '@/models/UserVoucher';
import { getCustomerFinancialSummary } from '@/lib/customer-financials';

function publicUser(user: any) {
    const object = user.toObject ? user.toObject() : { ...user };
    delete object.password;
    delete object.resetPasswordToken;
    delete object.resetPasswordExpires;
    return object;
}

async function resolveManagingStaff(user: any) {
    const directManagerId = user.parentStaff || user.commissionSettings?.managerId;
    if (directManagerId) {
        const manager = await User.findById(directManagerId)
            .select('name email phone staffCode')
            .lean();
        if (manager) return manager;
    }

    if (!user.referrer) return null;
    const referrer: any = await User.findById(user.referrer)
        .select('name email phone role affiliateLevel staffCode parentStaff')
        .populate('parentStaff', 'name email phone staffCode')
        .lean();
    if (!referrer) return null;
    if (referrer.role === 'staff' || referrer.affiliateLevel === 'staff') return referrer;
    return referrer.parentStaff || null;
}

export async function getCustomerDetail(user: any) {
    const orderMatch = {
        $or: [
            { user: user._id },
            { userId: user._id },
        ],
    };

    const [financialSummary, recentOrders, vouchers, storedMemberships, managingStaff] = await Promise.all([
        getCustomerFinancialSummary(String(user._id)),
        Order.find(orderMatch)
            .sort({ createdAt: -1 })
            .limit(20)
            .select('_id totalAmount status paymentStatus orderType createdAt')
            .lean(),
        UserVoucher.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .select('code discountValue discountType maxDiscount isUsed expiresAt createdAt')
            .lean(),
        UserMembership.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'packageId',
                model: SubscriptionPackage,
                select: 'name price',
            })
            .select('packageId orderId startDate endDate isActive purchasePrice')
            .lean(),
        resolveManagingStaff(user),
    ]);

    let membershipPackages: any[] = storedMemberships;
    if (membershipPackages.length === 0) {
        membershipPackages = await Order.find({
            ...orderMatch,
            orderType: 'membership',
            paymentStatus: { $in: ['paid', 'completed'] },
            status: { $in: ['completed', 'delivered'] },
        })
            .sort({ createdAt: -1 })
            .select('_id packageInfo totalAmount createdAt')
            .lean();
    }

    return {
        ...publicUser(user),
        totalOrders: financialSummary.totalOrders,
        totalSpent: financialSummary.totalSpent,
        totalVipSavings: financialSummary.totalVipSavings,
        vipSavingsOrderCount: financialSummary.vipSavingsOrderCount,
        vipSavingsOrders: financialSummary.vipSavingsOrders,
        recentOrders,
        vouchers,
        membershipPackages,
        managedBy: managingStaff
            ? {
                _id: String((managingStaff as any)._id),
                name: (managingStaff as any).name,
                email: (managingStaff as any).email,
                phone: (managingStaff as any).phone,
                staffCode: (managingStaff as any).staffCode,
            }
            : null,
    };
}
