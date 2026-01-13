import mongoose, { Schema, Model } from 'mongoose';

export interface IUserVoucher {
    _id?: string;
    userId: mongoose.Types.ObjectId;
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    expiresAt: Date;
    isUsed: boolean;
    usedAt?: Date;
    orderId?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserVoucherSchema: Schema<IUserVoucher> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        code: { type: String, required: true, unique: true },
        discountType: { type: String, enum: ['percent', 'fixed'], required: true },
        discountValue: { type: Number, required: true },
        maxDiscount: { type: Number, default: 0 },
        minOrderValue: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
        isUsed: { type: Boolean, default: false },
        usedAt: { type: Date },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    },
    {
        timestamps: true,
    }
);

const UserVoucher: Model<IUserVoucher> = mongoose.models.UserVoucher || mongoose.model<IUserVoucher>('UserVoucher', UserVoucherSchema);

export default UserVoucher;
