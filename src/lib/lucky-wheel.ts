import crypto from 'node:crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { isCampaignActive, prizeForSpin, spinsForTopUp } from '@/lib/lucky-wheel-rules';
import LuckyWheelAccount from '@/models/LuckyWheelAccount';
import LuckyWheelSettings from '@/models/LuckyWheelSettings';
import LuckyWheelSpin from '@/models/LuckyWheelSpin';
import LuckyWheelMilestone from '@/models/LuckyWheelMilestone';
import LuckyWheelTopUp from '@/models/LuckyWheelTopUp';
import LuckyWheelWithdrawal from '@/models/LuckyWheelWithdrawal';

export async function getLuckyWheelSettings() {
    await dbConnect();
    const settings = await LuckyWheelSettings.findOneAndUpdate(
        { key: 'default' },
        { $setOnInsert: { key: 'default', enabled: true, programVersion: 3 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    if ((settings.programVersion || 0) < 3) {
        settings.programVersion = 3;
        settings.enabled = true;
        settings.campaignName = 'Vòng quay may mắn Go Nuts';
        settings.minimumTopUp = 10_000;
        settings.spinsPerTopUpUnit = 5;
        settings.milestoneTopUps = 1_000_000;
        await settings.save();
    }
    return settings;
}

export function createLuckyWheelPaymentRef() {
    return `LW${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

export async function createLuckyWheelTopUp(userId: string, amount: number) {
    await dbConnect();
    const normalizedAmount = Math.floor(Number(amount));
    const spins = spinsForTopUp(normalizedAmount);
    if (!spins || normalizedAmount % 10_000 !== 0) throw new Error('INVALID_TOP_UP');
    const settings = await getLuckyWheelSettings();
    if (!isCampaignActive(settings)) throw new Error('CAMPAIGN_INACTIVE');
    return LuckyWheelTopUp.create({ userId, amount: normalizedAmount, spins, paymentRef: createLuckyWheelPaymentRef() });
}

export async function applyPaidLuckyWheelTopUp(paymentRef: string, amount: number, transactionId: string) {
    await dbConnect();
    const session = await mongoose.startSession();
    let topUp = null;
    try {
        await session.withTransaction(async () => {
            topUp = await LuckyWheelTopUp.findOne({ paymentRef, status: 'pending' }).session(session);
            if (!topUp) return;
            if (Number(topUp.amount) !== Number(amount)) throw new Error('TOP_UP_AMOUNT_MISMATCH');
            topUp.status = 'paid';
            topUp.acbTransactionNo = transactionId;
            topUp.paidAt = new Date();
            await topUp.save({ session });
            await LuckyWheelAccount.findOneAndUpdate(
                { userId: topUp.userId },
                { $inc: { availableSpins: topUp.spins, lifetimeSpinsGranted: topUp.spins, qualifyingRevenue: topUp.amount }, $setOnInsert: { lifetimeSpinsUsed: 0 } },
                { upsert: true, session, setDefaultsOnInsert: true },
            );
        });
    } finally { await session.endSession(); }
    return topUp;
}

export async function requestLuckyWheelWithdrawal(userId: string, input: { amount: number; bankName: string; accountNumber: string; accountName: string }) {
    await dbConnect();
    const amount = Math.floor(Number(input.amount));
    if (amount < 100_000 || amount % 1_000 !== 0) throw new Error('INVALID_WITHDRAWAL_AMOUNT');
    if (!input.bankName.trim() || !/^\d{6,30}$/.test(input.accountNumber.trim()) || !input.accountName.trim()) throw new Error('INVALID_BANK_INFO');
    const session = await mongoose.startSession();
    let withdrawal = null;
    try {
        await session.withTransaction(async () => {
            const account = await LuckyWheelAccount.findOneAndUpdate(
                { userId, prizeBalance: { $gte: amount } },
                { $inc: { prizeBalance: -amount, pendingWithdrawal: amount } },
                { new: true, session },
            );
            if (!account) throw new Error('INSUFFICIENT_PRIZE_BALANCE');
            [withdrawal] = await LuckyWheelWithdrawal.create([{
                userId, amount, bankName: input.bankName.trim(), accountNumber: input.accountNumber.trim(), accountName: input.accountName.trim().toUpperCase(), status: 'pending',
            }], { session });
        });
    } finally { await session.endSession(); }
    return withdrawal;
}

export async function reviewLuckyWheelWithdrawal(adminUserId: string, withdrawalId: string, action: 'paid' | 'rejected', note = '') {
    await dbConnect();
    const session = await mongoose.startSession();
    let withdrawal = null;
    try {
        await session.withTransaction(async () => {
            withdrawal = await LuckyWheelWithdrawal.findOneAndUpdate(
                { _id: withdrawalId, status: 'pending' },
                { $set: { status: action, note: note.trim(), reviewedBy: adminUserId, reviewedAt: new Date() } },
                { new: true, session },
            );
            if (!withdrawal) throw new Error('WITHDRAWAL_NOT_FOUND');
            const update = action === 'paid'
                ? { $inc: { pendingWithdrawal: -withdrawal.amount, lifetimeWithdrawn: withdrawal.amount } }
                : { $inc: { pendingWithdrawal: -withdrawal.amount, prizeBalance: withdrawal.amount } };
            await LuckyWheelAccount.updateOne({ userId: withdrawal.userId }, update, { session });
        });
    } finally { await session.endSession(); }
    return withdrawal;
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
            const prizeValue = prizeForSpin(sequence);
            const [spin] = await LuckyWheelSpin.create([{
                userId,
                requestId,
                sequence,
                prizeValue,
                result: prizeValue > 0 ? 'cash' : 'try_again',
            }], { session });

            if (prizeValue > 0) {
                await LuckyWheelAccount.updateOne(
                    { userId },
                    { $inc: { prizeBalance: prizeValue, lifetimeWinnings: prizeValue, lifetimeVoucherWinnings: prizeValue } },
                    { session },
                );
            }
            result = spin.toObject();
        });
    } finally {
        await session.endSession();
    }
    return result;
}

export async function getLuckyWheelUserSummary(userId: string) {
    await dbConnect();
    const [settings, account, history, topUps, withdrawals] = await Promise.all([
        getLuckyWheelSettings(),
        LuckyWheelAccount.findOne({ userId }).lean(),
        LuckyWheelSpin.find({ userId }).sort({ createdAt: -1 }).limit(20).populate('voucherId').lean(),
        LuckyWheelTopUp.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
        LuckyWheelWithdrawal.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    return {
        campaign: {
            name: settings.campaignName,
            active: isCampaignActive(settings),
            enabled: settings.enabled,
            minimumTopUp: settings.minimumTopUp,
            spinsPerTopUpUnit: settings.spinsPerTopUpUnit,
            campaignStartAt: settings.campaignStartAt,
            campaignEndAt: settings.campaignEndAt,
        },
        account: account || {
            availableSpins: 0,
            lifetimeSpinsGranted: 0,
            lifetimeSpinsUsed: 0,
            lifetimeVoucherWinnings: 0,
            qualifyingRevenue: 0,
            prizeBalance: 0,
            pendingWithdrawal: 0,
            lifetimeWinnings: 0,
            lifetimeWithdrawn: 0,
            lifetimeSpentOnOrders: 0,
        },
        history,
        topUps,
        withdrawals,
    };
}

export async function getLuckyWheelAdminSummary() {
    await dbConnect();
    const [settings, accountTotals, topUpTotals, spins, milestones, withdrawals] = await Promise.all([
        getLuckyWheelSettings(),
        LuckyWheelAccount.aggregate([{ $group: {
            _id: null,
            customers: { $sum: 1 },
            availableSpins: { $sum: '$availableSpins' },
            spinsGranted: { $sum: '$lifetimeSpinsGranted' },
            spinsUsed: { $sum: '$lifetimeSpinsUsed' },
            voucherWinnings: { $sum: '$lifetimeVoucherWinnings' },
            prizeBalance: { $sum: '$prizeBalance' },
        } }]),
        LuckyWheelTopUp.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$amount' }, topUps: { $sum: 1 } } }]),
        LuckyWheelSpin.find({}).sort({ createdAt: -1 }).limit(50).populate('userId', 'name email').lean(),
        LuckyWheelMilestone.find({}).sort({ cycle: -1 }).lean(),
        LuckyWheelWithdrawal.find({}).sort({ createdAt: -1 }).limit(50).populate('userId', 'name email').lean(),
    ]);
    const totals = accountTotals[0] || { customers: 0, availableSpins: 0, spinsGranted: 0, spinsUsed: 0, voucherWinnings: 0 };
    const paid = topUpTotals[0] || { revenue: 0, topUps: 0 };
    const completedCycles = Math.floor(paid.topUps / settings.milestoneTopUps);
    return {
        settings,
        totals: { ...totals, topUpRevenue: paid.revenue, paidTopUps: paid.topUps },
        milestone: {
            completedCycles,
            drawnCycles: milestones.length,
            nextTarget: (milestones.length + 1) * settings.milestoneTopUps,
            remaining: Math.max(0, (milestones.length + 1) * settings.milestoneTopUps - paid.topUps),
        },
        milestones,
        recentSpins: spins,
        withdrawals,
    };
}

export async function awardLuckyWheelMilestone(adminUserId: string) {
    await dbConnect();
    const settings = await getLuckyWheelSettings();
    if (!isCampaignActive(settings)) throw new Error('CAMPAIGN_INACTIVE');
    const paidTopUps = await LuckyWheelTopUp.countDocuments({ status: 'paid' });
    const drawnCycles = await LuckyWheelMilestone.countDocuments();
    const cycle = drawnCycles + 1;
    if (paidTopUps < cycle * settings.milestoneTopUps) throw new Error('MILESTONE_NOT_REACHED');

    const candidates = await LuckyWheelTopUp.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: '$userId' } },
        { $sample: { size: 15 } },
    ]);
    if (candidates.length < 15) throw new Error('NOT_ENOUGH_CUSTOMERS');

    const session = await mongoose.startSession();
    let milestone: mongoose.HydratedDocument<import('@/models/LuckyWheelMilestone').ILuckyWheelMilestone> | null = null;
    try {
        await session.withTransaction(async () => {
            [milestone] = await LuckyWheelMilestone.create([{
                cycle,
                topUpTarget: cycle * settings.milestoneTopUps,
                winners: [],
                drawnBy: adminUserId,
                drawnAt: new Date(),
            }], { session });
            for (let index = 0; index < 15; index += 1) {
                const userId = candidates[index]._id;
                const prizeValue = index < 10 ? 100_000 : 50_000;
                milestone.winners.push({ userId, prizeValue });
                await LuckyWheelAccount.updateOne(
                    { userId },
                    { $inc: { prizeBalance: prizeValue, lifetimeWinnings: prizeValue, lifetimeVoucherWinnings: prizeValue }, $setOnInsert: { availableSpins: 0, lifetimeSpinsGranted: 0, lifetimeSpinsUsed: 0, qualifyingRevenue: 0 } },
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
