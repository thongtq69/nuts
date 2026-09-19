import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelSettings {
    key: 'default';
    enabled: boolean;
    legalApprovalReference?: string;
    campaignName: string;
    campaignStartAt?: Date;
    campaignEndAt?: Date;
    qualifyingOrderMinimum: number;
    spinsPerOrder: number;
    milestoneRevenue: number;
    updatedBy?: mongoose.Types.ObjectId;
}

const schema = new Schema<ILuckyWheelSettings>({
    key: { type: String, default: 'default', unique: true, immutable: true },
    enabled: { type: Boolean, default: false },
    legalApprovalReference: { type: String, trim: true },
    campaignName: { type: String, default: 'Vòng quay tri ân khách hàng', trim: true },
    campaignStartAt: Date,
    campaignEndAt: Date,
    qualifyingOrderMinimum: { type: Number, default: 10_000, min: 10_000 },
    spinsPerOrder: { type: Number, default: 5, min: 5, max: 5 },
    milestoneRevenue: { type: Number, default: 1_000_000_000, min: 1_000_000_000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const LuckyWheelSettings: Model<ILuckyWheelSettings> = mongoose.models.LuckyWheelSettings
    || mongoose.model<ILuckyWheelSettings>('LuckyWheelSettings', schema);
export default LuckyWheelSettings;
