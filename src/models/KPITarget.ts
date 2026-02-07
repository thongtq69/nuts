import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IKPITargets {
    salesTarget?: number;
    ordersTarget?: number;
    newCustomersTarget?: number;
    teamGrowthTarget?: number;
    newMembersTarget?: number;
}

export interface IKPIRewards {
    bonusAmount?: number;
    commissionBoost?: number;
    promotionToTier?: string;
    specialGift?: string;
    description?: string;
}

export interface IKPIProgress {
    currentSales: number;
    currentOrders: number;
    currentNewCustomers: number;
    currentTeamGrowth: number;
    currentNewMembers: number;
}

export interface IKPITarget {
    id?: string;
    // Period
    year: number;
    month: number;
    quarter?: number;

    // Target type
    targetType: 'user' | 'team' | 'tier' | 'global';
    targetId?: Types.ObjectId;
    targetName?: string;
    tierName?: string;

    // Targets
    targets: IKPITargets;

    // Rewards
    rewards: IKPIRewards;

    // Progress
    progress: IKPIProgress;

    // Achievement
    achievementPercentage: number;
    isAchieved: boolean;
    achievedAt?: Date;
    achievementLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';

    // Status
    status: 'draft' | 'active' | 'completed' | 'cancelled';

    // Metadata
    createdBy?: Types.ObjectId;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const KPITargetsSchema = new Schema<IKPITargets>({
    salesTarget: { type: Number, default: 0 },
    ordersTarget: { type: Number, default: 0 },
    newCustomersTarget: { type: Number, default: 0 },
    teamGrowthTarget: { type: Number, default: 0 },
    newMembersTarget: { type: Number, default: 0 }
}, { _id: false });

const KPIRewardsSchema = new Schema<IKPIRewards>({
    bonusAmount: { type: Number, default: 0 },
    commissionBoost: { type: Number, default: 0 },
    promotionToTier: { type: String },
    specialGift: { type: String },
    description: { type: String }
}, { _id: false });

const KPIProgressSchema = new Schema<IKPIProgress>({
    currentSales: { type: Number, default: 0 },
    currentOrders: { type: Number, default: 0 },
    currentNewCustomers: { type: Number, default: 0 },
    currentTeamGrowth: { type: Number, default: 0 },
    currentNewMembers: { type: Number, default: 0 }
}, { _id: false });

const KPITargetSchema: Schema<IKPITarget> = new Schema(
    {
        year: { type: Number, required: true },
        month: { type: Number, required: true, min: 1, max: 12 },
        quarter: { type: Number, min: 1, max: 4 },

        targetType: {
            type: String,
            required: true,
            enum: ['user', 'team', 'tier', 'global']
        },
        targetId: { type: Schema.Types.ObjectId },
        targetName: { type: String },
        tierName: { type: String },

        targets: { type: KPITargetsSchema, default: {} },
        rewards: { type: KPIRewardsSchema, default: {} },
        progress: { type: KPIProgressSchema, default: {} },

        achievementPercentage: { type: Number, default: 0 },
        isAchieved: { type: Boolean, default: false },
        achievedAt: { type: Date },
        achievementLevel: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum']
        },

        status: {
            type: String,
            enum: ['draft', 'active', 'completed', 'cancelled'],
            default: 'active'
        },

        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

// Indexes
KPITargetSchema.index({ year: 1, month: 1, targetType: 1 });
KPITargetSchema.index({ targetId: 1 });
KPITargetSchema.index({ tierName: 1 });
KPITargetSchema.index({ status: 1 });
KPITargetSchema.index({ isAchieved: 1 });

// Unique compound index
KPITargetSchema.index(
    { year: 1, month: 1, targetType: 1, targetId: 1, tierName: 1 },
    { unique: true, sparse: true }
);

// Method to calculate achievement percentage
KPITargetSchema.methods.calculateAchievement = function () {
    const targets = this.targets;
    const progress = this.progress;
    let totalWeight = 0;
    let totalAchieved = 0;

    if (targets.salesTarget && targets.salesTarget > 0) {
        totalWeight += 40;
        totalAchieved += Math.min(40, (progress.currentSales / targets.salesTarget) * 40);
    }

    if (targets.ordersTarget && targets.ordersTarget > 0) {
        totalWeight += 30;
        totalAchieved += Math.min(30, (progress.currentOrders / targets.ordersTarget) * 30);
    }

    if (targets.newCustomersTarget && targets.newCustomersTarget > 0) {
        totalWeight += 15;
        totalAchieved += Math.min(15, (progress.currentNewCustomers / targets.newCustomersTarget) * 15);
    }

    if (targets.teamGrowthTarget && targets.teamGrowthTarget > 0) {
        totalWeight += 15;
        totalAchieved += Math.min(15, (progress.currentTeamGrowth / targets.teamGrowthTarget) * 15);
    }

    if (totalWeight === 0) return 0;

    return Math.round((totalAchieved / totalWeight) * 100);
};

const KPITarget: Model<IKPITarget> =
    mongoose.models.KPITarget ||
    mongoose.model<IKPITarget>('KPITarget', KPITargetSchema);

export default KPITarget;
