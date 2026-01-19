import mongoose, { Schema, Model } from 'mongoose';

export interface IAffiliateSettings {
    defaultCommissionRate: number;
    cookieDurationDays: number;
    minWithdrawalAmount: number;
    commissionType: 'percent' | 'fixed';
    agentDiscountEnabled: boolean;
    agentDiscountPercent: number;
    bulkDiscountEnabled: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const AffiliateSettingsSchema: Schema<IAffiliateSettings> = new Schema(
    {
        defaultCommissionRate: { type: Number, required: true, default: 10 },
        cookieDurationDays: { type: Number, required: true, default: 30 },
        minWithdrawalAmount: { type: Number, required: true, default: 200000 },
        commissionType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
        agentDiscountEnabled: { type: Boolean, default: true },
        agentDiscountPercent: { type: Number, default: 10, min: 0, max: 100 },
        bulkDiscountEnabled: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const AffiliateSettings: Model<IAffiliateSettings> = mongoose.models.AffiliateSettings || mongoose.model<IAffiliateSettings>('AffiliateSettings', AffiliateSettingsSchema);

export default AffiliateSettings;
