import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelTopUp {
    userId: mongoose.Types.ObjectId;
    paymentRef: string;
    amount: number;
    spins: number;
    status: 'pending' | 'paid' | 'expired';
    acbTransactionNo?: string;
    paidAt?: Date;
    manuallyApprovedBy?: mongoose.Types.ObjectId;
    manuallyApprovedAt?: Date;
    manualApprovalNote?: string;
    adminNotificationStatus?: 'processing' | 'sent' | 'failed' | 'skipped';
    adminNotificationSentAt?: Date;
    adminNotificationLastAttemptAt?: Date;
}

const schema = new Schema<ILuckyWheelTopUp>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentRef: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 10_000 },
    spins: { type: Number, required: true, min: 5 },
    status: { type: String, enum: ['pending', 'paid', 'expired'], default: 'pending', index: true },
    acbTransactionNo: { type: String, sparse: true, unique: true },
    paidAt: Date,
    manuallyApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    manuallyApprovedAt: Date,
    manualApprovalNote: { type: String, maxlength: 500 },
    adminNotificationStatus: { type: String, enum: ['processing', 'sent', 'failed', 'skipped'] },
    adminNotificationSentAt: Date,
    adminNotificationLastAttemptAt: Date,
}, { timestamps: true });

const LuckyWheelTopUp: Model<ILuckyWheelTopUp> = mongoose.models.LuckyWheelTopUp
    || mongoose.model<ILuckyWheelTopUp>('LuckyWheelTopUp', schema);
export default LuckyWheelTopUp;
