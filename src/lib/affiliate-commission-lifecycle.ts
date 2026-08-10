import AffiliateCommission from '@/models/AffiliateCommission';
import User from '@/models/User';
import type { HydratedDocument } from 'mongoose';
import type { IAffiliateCommission } from '@/models/AffiliateCommission';
import type { IOrder } from '@/models/Order';

type AffiliateCommissionDocument = HydratedDocument<IAffiliateCommission>;
type OrderDocument = HydratedDocument<IOrder>;

async function reverseApprovedCommission(commission: AffiliateCommissionDocument) {
    if (commission.status !== 'approved') return;

    await User.findByIdAndUpdate(commission.affiliateId, {
        $inc: {
            walletBalance: -Number(commission.commissionAmount || 0),
            totalCommission: -Number(commission.commissionAmount || 0),
        },
    });
}

export async function syncAffiliateCommissionsForOrderStatus(order: OrderDocument, statusInput: unknown) {
    const status = String(statusInput || '').trim().toLowerCase();

    if (['delivered', 'completed'].includes(status)) {
        const pendingCommissions = await AffiliateCommission.find({
            orderId: order._id,
            status: 'pending',
        });

        for (const commission of pendingCommissions) {
            const affiliate = await User.findById(commission.affiliateId);
            if (!affiliate) continue;

            affiliate.walletBalance = (affiliate.walletBalance || 0) + commission.commissionAmount;
            affiliate.totalCommission = (affiliate.totalCommission || 0) + commission.commissionAmount;
            await affiliate.save();
            commission.status = 'approved';
            await commission.save();
        }

        if (pendingCommissions.length > 0) order.commissionStatus = 'approved';
        return;
    }

    if (['cancelled', 'canceled', 'refunded', 'returned'].includes(status)) {
        const activeCommissions = await AffiliateCommission.find({
            orderId: order._id,
            status: { $in: ['pending', 'approved', 'paid'] },
        });

        for (const commission of activeCommissions) {
            await reverseApprovedCommission(commission);
            commission.status = 'rejected';
            commission.note = [commission.note, `Voided because order status is ${status}`]
                .filter(Boolean)
                .join(' - ');
            await commission.save();
        }

        order.commissionStatus = 'cancelled';
    }
}

export async function removeAffiliateCommissionsForOrder(order: OrderDocument) {
    const commissions = await AffiliateCommission.find({ orderId: order._id });
    for (const commission of commissions) {
        await reverseApprovedCommission(commission);
    }
    await AffiliateCommission.deleteMany({ orderId: order._id });
}
