import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelSpin {
    userId: mongoose.Types.ObjectId;
    requestId: string;
    sequence: number;
    prizeValue: number;
    result: 'try_again' | 'cash';
    isTest?: boolean;
    voucherId?: mongoose.Types.ObjectId;
}

const schema = new Schema<ILuckyWheelSpin>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestId: { type: String, required: true },
    sequence: { type: Number, required: true, min: 1 },
    prizeValue: { type: Number, required: true, min: 0 },
    result: { type: String, enum: ['try_again', 'cash', 'voucher'], required: true },
    isTest: { type: Boolean, default: false, index: true },
    voucherId: { type: Schema.Types.ObjectId, ref: 'UserVoucher' },
}, { timestamps: true });
schema.index({ userId: 1, requestId: 1 }, { unique: true });
schema.index({ userId: 1, sequence: 1 }, { unique: true });

const LuckyWheelSpin: Model<ILuckyWheelSpin> = mongoose.models.LuckyWheelSpin
    || mongoose.model<ILuckyWheelSpin>('LuckyWheelSpin', schema);
export default LuckyWheelSpin;
