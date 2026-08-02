import Order from '@/models/Order';
import User from '@/models/User';
import UserMembership from '@/models/UserMembership';
import UserVoucher from '@/models/UserVoucher';

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

    const [orderStats, recentOrders, vouchers, storedMemberships, managingStaff] = await Promise.all([
        Order.aggregate([
            { $match: orderMatch },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $in: ['$paymentStatus', ['paid', 'completed']] },
                                        { $in: ['$status', ['completed', 'delivered']] },
                                    ],
                                },
                                '$totalAmount',
                                0,
                            ],
                        },
                    },
                },
            },
        ]),
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
            .populate('packageId', 'name price')
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

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };
    return {
        ...publicUser(user),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
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

