import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelWithdrawal {
    userId: mongoose.Types.ObjectId;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    status: 'pending' | 'paid' | 'rejected';
    payoutReference?: string;
    bankTransactionId?: string;
    bankTransactionDate?: Date;
    bankVerifiedAt?: Date;
    rejectionCode?: 'BELOW_MINIMUM' | 'INSUFFICIENT_BALANCE' | 'ADMIN_REJECTED';
    rejectionReason?: string;
    automaticDecision?: boolean;
    note?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
}

const schema = new Schema<ILuckyWheelWithdrawal>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    bankName: { type: String, required: true, trim: true, maxlength: 100 },
    accountNumber: { type: String, required: true, trim: true, maxlength: 30 },
    accountName: { type: String, required: true, trim: true, maxlength: 100 },
    status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending', index: true },
    payoutReference: { type: String, trim: true, uppercase: true, maxlength: 30, unique: true, sparse: true },
    bankTransactionId: { type: String, trim: true, uppercase: true, maxlength: 120, unique: true, sparse: true },
    bankTransactionDate: Date,
    bankVerifiedAt: Date,
    rejectionCode: { type: String, enum: ['BELOW_MINIMUM', 'INSUFFICIENT_BALANCE', 'ADMIN_REJECTED'] },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    automaticDecision: { type: Boolean, default: false },
    note: { type: String, trim: true, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
}, { timestamps: true });

const LuckyWheelWithdrawal: Model<ILuckyWheelWithdrawal> = mongoose.models.LuckyWheelWithdrawal
    || mongoose.model<ILuckyWheelWithdrawal>('LuckyWheelWithdrawal', schema);
export default LuckyWheelWithdrawal;
