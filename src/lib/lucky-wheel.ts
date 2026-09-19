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
import {
    DEFAULT_MILESTONE_REWARDS,
    DEFAULT_REGULAR_SPIN_PRIZES,
    DEFAULT_TOP_UP_OPTIONS,
    DEFAULT_WHEEL_COPY,
    DEFAULT_WHEEL_SEGMENTS,
    DEFAULT_WHEEL_TERMS,
} from '@/lib/lucky-wheel-config';

export async function getLuckyWheelSettings() {
    await dbConnect();
    const settings = await LuckyWheelSettings.findOneAndUpdate(
        { key: 'default' },
        { $setOnInsert: { key: 'default', enabled: true, programVersion: 4 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    if ((settings.programVersion || 0) < 4) {
        settings.programVersion = 4;
        settings.memberBadgeText ||= DEFAULT_WHEEL_COPY.memberBadgeText;
        settings.introText ||= DEFAULT_WHEEL_COPY.introText;
        settings.inactiveMessage ||= DEFAULT_WHEEL_COPY.inactiveMessage;
        settings.spinButtonText ||= DEFAULT_WHEEL_COPY.spinButtonText;
        settings.totalWinningsLabel ||= DEFAULT_WHEEL_COPY.totalWinningsLabel;
        settings.balanceLabel ||= DEFAULT_WHEEL_COPY.balanceLabel;
        settings.topUpTitle ||= DEFAULT_WHEEL_COPY.topUpTitle;
        settings.withdrawalTitle ||= DEFAULT_WHEEL_COPY.withdrawalTitle;
        settings.termsTitle ||= DEFAULT_WHEEL_COPY.termsTitle;
        settings.historyTitle ||= DEFAULT_WHEEL_COPY.historyTitle;
        settings.minimumWithdrawal ||= 100_000;
        if (!settings.topUpOptions?.length) settings.topUpOptions = DEFAULT_TOP_UP_OPTIONS;
        if (!settings.regularSpinPrizes?.length) settings.regularSpinPrizes = DEFAULT_REGULAR_SPIN_PRIZES;
        if (!settings.wheelSegments?.length) settings.wheelSegments = DEFAULT_WHEEL_SEGMENTS;
        if (!settings.terms?.length) settings.terms = DEFAULT_WHEEL_TERMS;
        if (!settings.milestoneRewards?.length) settings.milestoneRewards = DEFAULT_MILESTONE_REWARDS;
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
    const settings = await getLuckyWheelSettings();
    const spins = spinsForTopUp(normalizedAmount, settings.minimumTopUp, settings.spinsPerTopUpUnit);
    if (!spins || normalizedAmount % settings.minimumTopUp !== 0) throw new Error('INVALID_TOP_UP');
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
    const settings = await getLuckyWheelSettings();
    if (amount < settings.minimumWithdrawal || amount % 1_000 !== 0) throw new Error('INVALID_WITHDRAWAL_AMOUNT');
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

export async function spinLuckyWheel(userId: string, requestId: string, adminTestMode = false) {
    await dbConnect();
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(requestId)) throw new Error('REQUEST_ID_INVALID');

    const existing = await LuckyWheelSpin.findOne({ userId, requestId }).populate('voucherId').lean();
    if (existing) return existing;

    const settings = await getLuckyWheelSettings();
    if (adminTestMode) {
        const latestTestSpin = await LuckyWheelSpin.findOne({ userId, isTest: true }).sort({ sequence: -1 }).select('sequence').lean();
        const testSequence = latestTestSpin ? Math.max(1, latestTestSpin.sequence - 1_000_000_000 + 1) : 1;
        const prizeValue = prizeForSpin(testSequence, settings.regularSpinPrizes);
        return LuckyWheelSpin.create({
            userId,
            requestId,
            sequence: 1_000_000_000 + testSequence,
            prizeValue,
            result: prizeValue > 0 ? 'cash' : 'try_again',
            isTest: true,
        });
    }
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
            const prizeValue = prizeForSpin(sequence, settings.regularSpinPrizes);
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

export async function getLuckyWheelUserSummary(userId: string, adminTestMode = false) {
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
            memberBadgeText: settings.memberBadgeText,
            introText: settings.introText,
            inactiveMessage: settings.inactiveMessage,
            spinButtonText: settings.spinButtonText,
            totalWinningsLabel: settings.totalWinningsLabel,
            balanceLabel: settings.balanceLabel,
            topUpTitle: settings.topUpTitle,
            withdrawalTitle: settings.withdrawalTitle,
            termsTitle: settings.termsTitle,
            historyTitle: settings.historyTitle,
            adminTestMode,
            active: isCampaignActive(settings),
            enabled: settings.enabled,
            minimumTopUp: settings.minimumTopUp,
            spinsPerTopUpUnit: settings.spinsPerTopUpUnit,
            minimumWithdrawal: settings.minimumWithdrawal,
            topUpOptions: settings.topUpOptions,
            wheelSegments: settings.wheelSegments,
            terms: settings.terms,
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
    const [settings, accountTotals, topUpTotals, spins, milestones, withdrawals, memberAccounts] = await Promise.all([
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
        LuckyWheelAccount.find({}).sort({ updatedAt: -1 }).limit(100).populate('userId', 'name email').lean(),
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
        memberAccounts,
    };
}

export async function updateLuckyWheelMemberAccount(userId: string, input: { availableSpins: number; prizeBalance: number; lifetimeWinnings: number }) {
    await dbConnect();
    if (!mongoose.isValidObjectId(userId)) throw new Error('ACCOUNT_NOT_FOUND');
    const values = {
        availableSpins: Math.floor(Number(input.availableSpins)),
        prizeBalance: Math.floor(Number(input.prizeBalance)),
        lifetimeWinnings: Math.floor(Number(input.lifetimeWinnings)),
    };
    if (Object.values(values).some(value => !Number.isFinite(value) || value < 0)) throw new Error('INVALID_ACCOUNT_VALUES');
    const account = await LuckyWheelAccount.findOneAndUpdate(
        { userId },
        { $set: { ...values, lifetimeVoucherWinnings: values.lifetimeWinnings } },
        { new: true, runValidators: true },
    ).populate('userId', 'name email');
    if (!account) throw new Error('ACCOUNT_NOT_FOUND');
    return account;
}

export async function awardLuckyWheelMilestone(adminUserId: string) {
    await dbConnect();
    const settings = await getLuckyWheelSettings();
    if (!isCampaignActive(settings)) throw new Error('CAMPAIGN_INACTIVE');
    const paidTopUps = await LuckyWheelTopUp.countDocuments({ status: 'paid' });
    const drawnCycles = await LuckyWheelMilestone.countDocuments();
    const cycle = drawnCycles + 1;
    if (paidTopUps < cycle * settings.milestoneTopUps) throw new Error('MILESTONE_NOT_REACHED');

    const milestoneRewards = settings.milestoneRewards?.length ? settings.milestoneRewards : DEFAULT_MILESTONE_REWARDS;
    const winnerCount = milestoneRewards.reduce((sum, reward) => sum + reward.count, 0);
    const candidates = await LuckyWheelTopUp.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: '$userId' } },
        { $sample: { size: winnerCount } },
    ]);
    if (candidates.length < winnerCount) throw new Error('NOT_ENOUGH_CUSTOMERS');

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
            const prizeValues = milestoneRewards.flatMap(reward => Array.from({ length: reward.count }, () => reward.value));
            for (let index = 0; index < winnerCount; index += 1) {
                const userId = candidates[index]._id;
                const prizeValue = prizeValues[index];
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
    if (!milestone) throw new Error('MILESTONE_CREATE_FAILED');
    return milestone as mongoose.HydratedDocument<import('@/models/LuckyWheelMilestone').ILuckyWheelMilestone>;
}
