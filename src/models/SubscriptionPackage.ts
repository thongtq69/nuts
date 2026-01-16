import mongoose, { Schema, Model } from 'mongoose';

export interface IVoucherConfig {
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    quantity: number;
}

export interface ISubscriptionPackage {
    _id?: string;
    name: string;
    price: number;
    description: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    voucherQuantity: number;
    validityDays: number;
    isActive: boolean;
    vouchers?: IVoucherConfig[];
    createdAt?: Date;
    updatedAt?: Date;
}

const VoucherConfigSchema = new Schema({
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    maxDiscount: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

const SubscriptionPackageSchema: Schema<ISubscriptionPackage> = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        discountType: { type: String, enum: ['percent', 'fixed'], required: true },
        discountValue: { type: Number, required: true },
        maxDiscount: { type: Number, default: 0 },
        minOrderValue: { type: Number, default: 0 },
        voucherQuantity: { type: Number, required: true, default: 1 },
        validityDays: { type: Number, required: true, default: 30 },
        isActive: { type: Boolean, default: true },
        vouchers: { type: [VoucherConfigSchema], default: [] },
    },
    {
        timestamps: true,
    }
);

const SubscriptionPackage: Model<ISubscriptionPackage> = mongoose.models.SubscriptionPackage || mongoose.model<ISubscriptionPackage>('SubscriptionPackage', SubscriptionPackageSchema);

export default SubscriptionPackage;

