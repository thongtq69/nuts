import crypto from 'node:crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { isCampaignActive, milestonePrizeValues, prizeForSpin, voucherMinimumOrder } from '@/lib/lucky-wheel-rules';
import LuckyWheelAccount from '@/models/LuckyWheelAccount';
import LuckyWheelGrant from '@/models/LuckyWheelGrant';
import LuckyWheelSettings from '@/models/LuckyWheelSettings';
import LuckyWheelSpin from '@/models/LuckyWheelSpin';
import LuckyWheelMilestone from '@/models/LuckyWheelMilestone';
import Order from '@/models/Order';
import UserVoucher from '@/models/UserVoucher';

export async function getLuckyWheelSettings() {
    await dbConnect();
    return LuckyWheelSettings.findOneAndUpdate(
        { key: 'default' },
        { $setOnInsert: { key: 'default' } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
}

export async function grantLuckyWheelSpinsForCompletedOrder(orderId: string) {
    await dbConnect();
    const settings = await getLuckyWheelSettings();
    if (!isCampaignActive(settings)) return { granted: false, reason: 'campaign_inactive' };

    const order = await Order.findById(orderId).lean();
    if (!order?.user || order.orderType === 'membership') return { granted: false, reason: 'ineligible_order' };
    if (!['completed', 'delivered'].includes(order.status)) return { granted: false, reason: 'order_not_completed' };
    if (order.totalAmount < settings.qualifyingOrderMinimum) return { granted: false, reason: 'minimum_not_met' };

    try {
        await LuckyWheelGrant.create({
            userId: order.user,
            orderId: order._id,
            orderAmount: order.totalAmount,
            spins: settings.spinsPerOrder,
        });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) return { granted: false, reason: 'already_granted' };
        throw error;
    }

    await LuckyWheelAccount.findOneAndUpdate(
        { userId: order.user },
        {
            $inc: {
                availableSpins: settings.spinsPerOrder,
                lifetimeSpinsGranted: settings.spinsPerOrder,
                qualifyingRevenue: order.totalAmount,
            },
            $setOnInsert: { lifetimeSpinsUsed: 0, lifetimeVoucherWinnings: 0 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return { granted: true, spins: settings.spinsPerOrder };
}

function createVoucherCode() {
    return `VQ-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

export async function spinLuckyWheel(userId: string, requestId: string) {
    await dbConnect();
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(requestId)) throw new Error('REQUEST_ID_INVALID');

    const existing = await LuckyWheelSpin.findOne({ userId, requestId }).populate('voucherId').lean();
    if (existing) return existing;

    const settings = await getLuckyWheelSettings();
    if (!isCampaignActive(settings)) throw new Error('CAMPAIGN_INACTIVE');

    const session = await mongoose.startSession();
    let result: unknown = null;
    try {
        await session.withTransaction(async () => {
            const duplicate = await LuckyWheelSpin.findOne({ userId, requestId }).session(session);
            if (duplicate) {
                result = duplicate.toObject();
                return;
            }
            const account = await LuckyWheelAccount.findOneAndUpdate(
                { userId, availableSpins: { $gt: 0 } },
                { $inc: { availableSpins: -1, lifetimeSpinsUsed: 1 } },
                { new: true, session },
            );
            if (!account) throw new Error('NO_SPINS');

            const sequence = account.lifetimeSpinsUsed;
            const prizeValue = prizeForSpin(userId, sequence, process.env.JWT_SECRET || 'lucky-wheel');
            const [spin] = await LuckyWheelSpin.create([{
                userId,
                requestId,
                sequence,
                prizeValue,
                result: prizeValue > 0 ? 'voucher' : 'try_again',
            }], { session });

            let voucher = null;
            if (prizeValue > 0) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                [voucher] = await UserVoucher.create([{
                    userId,
                    code: createVoucherCode(),
                    discountType: 'fixed',
                    discountValue: prizeValue,
                    maxDiscount: prizeValue,
                    minOrderValue: voucherMinimumOrder(prizeValue),
                    expiresAt,
                    isUsed: false,
                    source: 'campaign',
                    sourceId: spin._id,
                }], { session });
                spin.voucherId = voucher._id as unknown as mongoose.Types.ObjectId;
                await spin.save({ session });
                await LuckyWheelAccount.updateOne(
                    { userId },
                    { $inc: { lifetimeVoucherWinnings: prizeValue } },
                    { session },
                );
            }
            result = { ...spin.toObject(), voucher: voucher?.toObject() || null };
        });
    } finally {
        await session.endSession();
    }
    return result;
}

export async function getLuckyWheelUserSummary(userId: string) {
    await dbConnect();
    const [settings, account, history] = await Promise.all([
        getLuckyWheelSettings(),
        LuckyWheelAccount.findOne({ userId }).lean(),
        LuckyWheelSpin.find({ userId }).sort({ createdAt: -1 }).limit(20).populate('voucherId').lean(),
    ]);
    return {
        campaign: {
            name: settings.campaignName,
            active: isCampaignActive(settings),
            enabled: settings.enabled,
            qualifyingOrderMinimum: settings.qualifyingOrderMinimum,
            spinsPerOrder: settings.spinsPerOrder,
            campaignStartAt: settings.campaignStartAt,
            campaignEndAt: settings.campaignEndAt,
        },
        account: account || {
            availableSpins: 0,
            lifetimeSpinsGranted: 0,
            lifetimeSpinsUsed: 0,
            lifetimeVoucherWinnings: 0,
            qualifyingRevenue: 0,
        },
        history,
    };
}

export async function getLuckyWheelAdminSummary() {
    await dbConnect();
    const [settings, accountTotals, grantTotals, spins, milestones] = await Promise.all([
        getLuckyWheelSettings(),
        LuckyWheelAccount.aggregate([{ $group: {
            _id: null,
            customers: { $sum: 1 },
            availableSpins: { $sum: '$availableSpins' },
            spinsGranted: { $sum: '$lifetimeSpinsGranted' },
            spinsUsed: { $sum: '$lifetimeSpinsUsed' },
            voucherWinnings: { $sum: '$lifetimeVoucherWinnings' },
        } }]),
        LuckyWheelGrant.aggregate([{ $group: { _id: null, revenue: { $sum: '$orderAmount' }, orders: { $sum: 1 } } }]),
        LuckyWheelSpin.find({}).sort({ createdAt: -1 }).limit(50).populate('userId', 'name email').lean(),
        LuckyWheelMilestone.find({}).sort({ cycle: -1 }).lean(),
    ]);
    const totals = accountTotals[0] || { customers: 0, availableSpins: 0, spinsGranted: 0, spinsUsed: 0, voucherWinnings: 0 };
    const grants = grantTotals[0] || { revenue: 0, orders: 0 };
    const completedCycles = Math.floor(grants.revenue / settings.milestoneRevenue);
    return {
        settings,
        totals: { ...totals, qualifyingRevenue: grants.revenue, qualifyingOrders: grants.orders },
        milestone: {
            completedCycles,
            drawnCycles: milestones.length,
            nextTarget: (milestones.length + 1) * settings.milestoneRevenue,
            remaining: Math.max(0, (milestones.length + 1) * settings.milestoneRevenue - grants.revenue),
        },
        milestones,
        recentSpins: spins,
    };
}

export async function drawLuckyWheelMilestone(adminUserId: string) {
    await dbConnect();
    const settings = await getLuckyWheelSettings();
    if (!isCampaignActive(settings)) throw new Error('CAMPAIGN_INACTIVE');
    const revenue = (await LuckyWheelGrant.aggregate([{ $group: { _id: null, total: { $sum: '$orderAmount' } } }]))[0]?.total || 0;
    const drawnCycles = await LuckyWheelMilestone.countDocuments();
    const cycle = drawnCycles + 1;
    if (revenue < cycle * settings.milestoneRevenue) throw new Error('MILESTONE_NOT_REACHED');

    const userIds = await LuckyWheelGrant.distinct('userId');
    if (userIds.length < 15) throw new Error('NOT_ENOUGH_CUSTOMERS');
    const candidates = [...userIds];
    for (let index = candidates.length - 1; index > 0; index -= 1) {
        const swapIndex = crypto.randomInt(index + 1);
        [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
    }
    const prizes = milestonePrizeValues();
    for (let index = prizes.length - 1; index > 0; index -= 1) {
        const swapIndex = crypto.randomInt(index + 1);
        [prizes[index], prizes[swapIndex]] = [prizes[swapIndex], prizes[index]];
    }

    const session = await mongoose.startSession();
    let milestone: mongoose.HydratedDocument<import('@/models/LuckyWheelMilestone').ILuckyWheelMilestone> | null = null;
    try {
        await session.withTransaction(async () => {
            [milestone] = await LuckyWheelMilestone.create([{
                cycle,
                revenueTarget: cycle * settings.milestoneRevenue,
                winners: [],
                drawnBy: adminUserId,
                drawnAt: new Date(),
            }], { session });
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            for (let index = 0; index < 15; index += 1) {
                const userId = candidates[index];
                const prizeValue = prizes[index];
                const [voucher] = await UserVoucher.create([{
                    userId,
                    code: createVoucherCode(),
                    discountType: 'fixed',
                    discountValue: prizeValue,
                    maxDiscount: prizeValue,
                    minOrderValue: voucherMinimumOrder(prizeValue),
                    expiresAt,
                    isUsed: false,
                    source: 'campaign',
                    sourceId: milestone._id,
                }], { session });
                milestone.winners.push({ userId, prizeValue, voucherId: voucher._id as unknown as mongoose.Types.ObjectId });
                await LuckyWheelAccount.updateOne(
                    { userId },
                    { $inc: { lifetimeVoucherWinnings: prizeValue }, $setOnInsert: { availableSpins: 0, lifetimeSpinsGranted: 0, lifetimeSpinsUsed: 0, qualifyingRevenue: 0 } },
                    { upsert: true, session },
                );
            }
            await milestone.save({ session });
        });
    } finally {
        await session.endSession();
    }
    return milestone;
}
