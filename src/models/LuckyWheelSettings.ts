import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelSettings {
    key: 'default';
    programVersion: number;
    enabled: boolean;
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
    programVersion: { type: Number, default: 2 },
    enabled: { type: Boolean, default: true },
    campaignName: { type: String, default: 'Vòng quà tri ân cố định', trim: true },
    campaignStartAt: Date,
    campaignEndAt: Date,
    qualifyingOrderMinimum: { type: Number, default: 20_000, min: 20_000 },
    spinsPerOrder: { type: Number, default: 5, min: 5, max: 5 },
    milestoneRevenue: { type: Number, default: 1_000_000_000, min: 1_000_000_000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const LuckyWheelSettings: Model<ILuckyWheelSettings> = mongoose.models.LuckyWheelSettings
    || mongoose.model<ILuckyWheelSettings>('LuckyWheelSettings', schema);
export default LuckyWheelSettings;
