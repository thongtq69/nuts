import mongoose, { Schema, Model } from 'mongoose';

export interface ICommissionRequirements {
    minMonthlySales?: number;
    minMonthlyOrders?: number;
    minTeamSize?: number;
    minTeamSales?: number;
    consecutiveMonths?: number;
}

export interface ICommissionRates {
    directSale: number;
    teamSaleL1: number;
    teamSaleL2?: number;
}

export interface ITierBenefits {
    bonusPerOrder?: number;
    monthlyBonus?: number;
    freeShipping?: boolean;
    prioritySupport?: boolean;
    discountPercent?: number;
}

export interface ICommissionTier {
    id?: string;
    name: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'custom';
    displayName: string;
    description?: string;
    color: string;
    icon?: string;
    requirements: ICommissionRequirements;
    commissionRates: ICommissionRates;
    benefits: ITierBenefits;
    order: number;
    isActive: boolean;
    isDefault?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CommissionRequirementsSchema = new Schema<ICommissionRequirements>({
    minMonthlySales: { type: Number, default: 0 },
    minMonthlyOrders: { type: Number, default: 0 },
    minTeamSize: { type: Number, default: 0 },
    minTeamSales: { type: Number, default: 0 },
    consecutiveMonths: { type: Number, default: 1 }
}, { _id: false });

const CommissionRatesSchema = new Schema<ICommissionRates>({
    directSale: { type: Number, required: true, min: 0, max: 100 },
    teamSaleL1: { type: Number, default: 0, min: 0, max: 100 },
    teamSaleL2: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });

const TierBenefitsSchema = new Schema<ITierBenefits>({
    bonusPerOrder: { type: Number, default: 0 },
    monthlyBonus: { type: Number, default: 0 },
    freeShipping: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 }
}, { _id: false });

const CommissionTierSchema: Schema<ICommissionTier> = new Schema(
    {
        name: {
            type: String,
            required: true,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'custom']
        },
        displayName: { type: String, required: true },
        description: { type: String },
        color: { type: String, required: true, default: '#CD7F32' },
        icon: { type: String },
        requirements: { type: CommissionRequirementsSchema, default: {} },
        commissionRates: { type: CommissionRatesSchema, required: true },
        benefits: { type: TierBenefitsSchema, default: {} },
        order: { type: Number, required: true, default: 1 },
        isActive: { type: Boolean, default: true },
        isDefault: { type: Boolean, default: false }
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
CommissionTierSchema.index({ name: 1 }, { unique: true });
CommissionTierSchema.index({ order: 1 });
CommissionTierSchema.index({ isActive: 1 });

const CommissionTier: Model<ICommissionTier> =
    mongoose.models.CommissionTier ||
    mongoose.model<ICommissionTier>('CommissionTier', CommissionTierSchema);

export default CommissionTier;
