import type { HydratedDocument } from 'mongoose';
import Order, { type IOrder } from '@/models/Order';
import Product from '@/models/Product';
import UserVoucher from '@/models/UserVoucher';
import UserMembership from '@/models/UserMembership';
import { syncAffiliateCommissionsForOrderStatus } from '@/lib/affiliate-commission-lifecycle';

export { canCustomerCancelOrder, describeCustomerCancelBlock } from '@/lib/order-status';

type OrderDocument = HydratedDocument<IOrder>;

export type CancellationActor = 'customer' | 'admin' | 'system';

export interface CancellationEffects {
    restockedItems: number;
    voucherRestored: boolean;
    rewardVouchersRevoked: number;
    membershipRevoked: boolean;
    packageVouchersRevoked: number;
}

/**
 * Puts back everything the order consumed when it was created. Safe to call
 * more than once for the same order: the write guard on the order document
 * means a second call is a no-op instead of double-restocking.
 */
export async function applyOrderCancellationEffects(
    order: OrderDocument,
    actor: CancellationActor = 'admin',
): Promise<CancellationEffects> {
    const effects: CancellationEffects = {
        restockedItems: 0,
        voucherRestored: false,
        rewardVouchersRevoked: 0,
        membershipRevoked: false,
        packageVouchersRevoked: 0,
    };

    if (order.cancellationEffectsAppliedAt) return effects;

    // Claim the order first so two concurrent cancels cannot both restock it.
    const appliedAt = new Date();
    const claim = await Order.updateOne(
        { _id: order._id, cancellationEffectsAppliedAt: { $exists: false } },
        { $set: { cancellationEffectsAppliedAt: appliedAt, cancelledBy: actor } },
    );
    if (claim.modifiedCount === 0) return effects;

    // Keep the in-memory document in step so a later save() does not rewrite it.
    order.cancellationEffectsAppliedAt = appliedAt;
    order.cancelledBy = actor;

    // 1. Return the reserved stock. Mirrors the thresholds used when the order
    //    was placed in POST /api/orders.
    for (const item of order.items || []) {
        const product = await Product.findById(item.productId);
        if (!product || typeof product.stock !== 'number') continue;

        product.stock = product.stock + Number(item.quantity || 0);
        product.stockStatus = product.stock === 0
            ? 'out_of_stock'
            : product.stock <= 10
                ? 'low_stock'
                : 'in_stock';
        await product.save();
        effects.restockedItems += 1;
    }

    // 2. Void affiliate commissions (reverses approved wallet credits too).
    await syncAffiliateCommissionsForOrderStatus(order, 'cancelled');

    // 3. Give the customer back the voucher this order consumed.
    if (order.voucherId) {
        const restored = await UserVoucher.updateOne(
            { _id: String(order.voucherId), isUsed: true },
            { $set: { isUsed: false }, $unset: { usedAt: 1, orderId: 1 } },
        );
        effects.voucherRestored = restored.modifiedCount > 0;
    }

    // 4. Take back the reward voucher this order earned, unless it was already spent.
    const revokedRewards = await UserVoucher.deleteMany({
        source: 'order_reward',
        sourceId: order._id,
        isUsed: false,
    });
    effects.rewardVouchersRevoked = revokedRewards.deletedCount || 0;

    // 5. A cancelled membership order must not leave an active package behind.
    if (order.orderType === 'membership') {
        const membership = await UserMembership.findOneAndUpdate(
            { orderId: order._id },
            { $set: { isActive: false } },
        );
        effects.membershipRevoked = Boolean(membership);

        const revokedPackageVouchers = await UserVoucher.deleteMany({
            sourceOrderId: order._id,
            source: 'package',
            isUsed: false,
        });
        effects.packageVouchersRevoked = revokedPackageVouchers.deletedCount || 0;
    }

    return effects;
}

/**
 * Single entry point every cancel path should use: customer self-service, the
 * admin screens, and payment failures all need the same clean-up.
 */
export async function cancelOrder(
    order: OrderDocument,
    actor: CancellationActor = 'admin',
): Promise<CancellationEffects> {
    const effects = await applyOrderCancellationEffects(order, actor);

    order.status = 'cancelled';
    order.cancelledAt = order.cancelledAt || new Date();
    order.cancelledBy = order.cancelledBy || actor;
    order.commissionStatus = 'cancelled';
    await order.save();

    return effects;
}
