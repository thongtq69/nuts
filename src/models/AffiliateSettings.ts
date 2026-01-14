import mongoose, { Schema, Model } from 'mongoose';

export interface IAffiliateSettings {
    defaultCommissionRate: number; // Percent, e.g., 10
    cookieDurationDays: number; // e.g., 30
    minWithdrawalAmount: number; // e.g., 200000
    commissionType: 'percent' | 'fixed'; // Usually 'percent'
    createdAt?: Date;
    updatedAt?: Date;
}

const AffiliateSettingsSchema: Schema<IAffiliateSettings> = new Schema(
    {
        defaultCommissionRate: { type: Number, required: true, default: 10 },
        cookieDurationDays: { type: Number, required: true, default: 30 },
        minWithdrawalAmount: { type: Number, required: true, default: 200000 },
        commissionType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    },
    {
        timestamps: true,
    }
);

const AffiliateSettings: Model<IAffiliateSettings> = mongoose.models.AffiliateSettings || mongoose.model<IAffiliateSettings>('AffiliateSettings', AffiliateSettingsSchema);

export default AffiliateSettings;
