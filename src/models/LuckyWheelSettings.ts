import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelSettings {
    key: 'default';
    programVersion: number;
    enabled: boolean;
    campaignName: string;
    campaignStartAt?: Date;
    campaignEndAt?: Date;
    minimumTopUp: number;
    spinsPerTopUpUnit: number;
    milestoneTopUps: number;
    updatedBy?: mongoose.Types.ObjectId;
}

const schema = new Schema<ILuckyWheelSettings>({
    key: { type: String, default: 'default', unique: true, immutable: true },
    programVersion: { type: Number, default: 3 },
    enabled: { type: Boolean, default: true },
    campaignName: { type: String, default: 'Vòng quay may mắn Go Nuts', trim: true },
    campaignStartAt: Date,
    campaignEndAt: Date,
    minimumTopUp: { type: Number, default: 10_000, min: 10_000 },
    spinsPerTopUpUnit: { type: Number, default: 5, min: 5, max: 5 },
    milestoneTopUps: { type: Number, default: 1_000_000, min: 1_000_000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const LuckyWheelSettings: Model<ILuckyWheelSettings> = mongoose.models.LuckyWheelSettings
    || mongoose.model<ILuckyWheelSettings>('LuckyWheelSettings', schema);
export default LuckyWheelSettings;
