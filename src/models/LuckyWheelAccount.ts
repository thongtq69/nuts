import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelAccount {
    userId: mongoose.Types.ObjectId;
    availableSpins: number;
    lifetimeSpinsGranted: number;
    lifetimeSpinsUsed: number;
    lifetimeVoucherWinnings: number;
    qualifyingRevenue: number;
    prizeBalance: number;
    pendingWithdrawal: number;
    lifetimeWinnings: number;
    lifetimeWithdrawn: number;
    lifetimeSpentOnOrders: number;
}

const schema = new Schema<ILuckyWheelAccount>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    availableSpins: { type: Number, default: 0, min: 0 },
    lifetimeSpinsGranted: { type: Number, default: 0, min: 0 },
    lifetimeSpinsUsed: { type: Number, default: 0, min: 0 },
    lifetimeVoucherWinnings: { type: Number, default: 0, min: 0 },
    qualifyingRevenue: { type: Number, default: 0, min: 0 },
    prizeBalance: { type: Number, default: 0, min: 0 },
    pendingWithdrawal: { type: Number, default: 0, min: 0 },
    lifetimeWinnings: { type: Number, default: 0, min: 0 },
    lifetimeWithdrawn: { type: Number, default: 0, min: 0 },
    lifetimeSpentOnOrders: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const LuckyWheelAccount: Model<ILuckyWheelAccount> = mongoose.models.LuckyWheelAccount
    || mongoose.model<ILuckyWheelAccount>('LuckyWheelAccount', schema);
export default LuckyWheelAccount;
