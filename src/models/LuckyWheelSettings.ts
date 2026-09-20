import mongoose, { Model, Schema } from 'mongoose';
import {
    DEFAULT_MILESTONE_REWARDS,
    DEFAULT_REGULAR_SPIN_PRIZES,
    DEFAULT_TOP_UP_OPTIONS,
    DEFAULT_WHEEL_COPY,
    DEFAULT_WHEEL_SEGMENTS,
    DEFAULT_WHEEL_TERMS,
    type LuckyWheelMilestoneRewardConfig,
    type LuckyWheelSegmentConfig,
} from '@/lib/lucky-wheel-config';

export interface ILuckyWheelSettings {
    key: 'default';
    programVersion: number;
    enabled: boolean;
    campaignName: string;
    memberBadgeText: string;
    introText: string;
    inactiveMessage: string;
    spinButtonText: string;
    totalWinningsLabel: string;
    balanceLabel: string;
    topUpTitle: string;
    withdrawalTitle: string;
    termsTitle: string;
    historyTitle: string;
    campaignStartAt?: Date;
    campaignEndAt?: Date;
    minimumTopUp: number;
    spinsPerTopUpUnit: number;
    milestoneTopUps: number;
    minimumWithdrawal: number;
    topUpOptions: number[];
    regularSpinPrizes: number[];
    wheelSegments: LuckyWheelSegmentConfig[];
    terms: string[];
    milestoneRewards: LuckyWheelMilestoneRewardConfig[];
    updatedBy?: mongoose.Types.ObjectId;
}

const schema = new Schema<ILuckyWheelSettings>({
    key: { type: String, default: 'default', unique: true, immutable: true },
    programVersion: { type: Number, default: 6 },
    enabled: { type: Boolean, default: true },
    campaignName: { type: String, default: DEFAULT_WHEEL_COPY.campaignName, trim: true, maxlength: 120 },
    memberBadgeText: { type: String, default: DEFAULT_WHEEL_COPY.memberBadgeText, trim: true, maxlength: 80 },
    introText: { type: String, default: DEFAULT_WHEEL_COPY.introText, trim: true, maxlength: 500 },
    inactiveMessage: { type: String, default: DEFAULT_WHEEL_COPY.inactiveMessage, trim: true, maxlength: 200 },
    spinButtonText: { type: String, default: DEFAULT_WHEEL_COPY.spinButtonText, trim: true, maxlength: 30 },
    totalWinningsLabel: { type: String, default: DEFAULT_WHEEL_COPY.totalWinningsLabel, trim: true, maxlength: 80 },
    balanceLabel: { type: String, default: DEFAULT_WHEEL_COPY.balanceLabel, trim: true, maxlength: 80 },
    topUpTitle: { type: String, default: DEFAULT_WHEEL_COPY.topUpTitle, trim: true, maxlength: 80 },
    withdrawalTitle: { type: String, default: DEFAULT_WHEEL_COPY.withdrawalTitle, trim: true, maxlength: 80 },
    termsTitle: { type: String, default: DEFAULT_WHEEL_COPY.termsTitle, trim: true, maxlength: 80 },
    historyTitle: { type: String, default: DEFAULT_WHEEL_COPY.historyTitle, trim: true, maxlength: 80 },
    campaignStartAt: Date,
    campaignEndAt: Date,
    minimumTopUp: { type: Number, default: 10_000, min: 1_000 },
    spinsPerTopUpUnit: { type: Number, default: 5, min: 1, max: 100 },
    milestoneTopUps: { type: Number, default: 1_000_000, min: 1 },
    minimumWithdrawal: { type: Number, default: 100_000, min: 100_000 },
    topUpOptions: { type: [Number], default: DEFAULT_TOP_UP_OPTIONS },
    regularSpinPrizes: { type: [Number], default: DEFAULT_REGULAR_SPIN_PRIZES },
    wheelSegments: { type: [{ label: { type: String, required: true }, value: { type: Number, required: true, min: 0 }, color: { type: String, required: true } }], default: DEFAULT_WHEEL_SEGMENTS },
    terms: { type: [String], default: DEFAULT_WHEEL_TERMS },
    milestoneRewards: { type: [{ value: { type: Number, required: true, min: 0 }, count: { type: Number, required: true, min: 1, max: 100 } }], default: DEFAULT_MILESTONE_REWARDS },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const LuckyWheelSettings: Model<ILuckyWheelSettings> = mongoose.models.LuckyWheelSettings
    || mongoose.model<ILuckyWheelSettings>('LuckyWheelSettings', schema);
export default LuckyWheelSettings;
