import mongoose, { Schema, Model } from 'mongoose';

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
    createdAt?: Date;
    updatedAt?: Date;
}

const SubscriptionPackageSchema: Schema<ISubscriptionPackage> = new Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String },
        discountType: { type: String, enum: ['percent', 'fixed'], required: true },
        discountValue: { type: Number, required: true },
        maxDiscount: { type: Number, default: 0 }, // 0 means no limit if type is fixed, but usually relevant for percent
        minOrderValue: { type: Number, default: 0 },
        voucherQuantity: { type: Number, required: true, default: 1 },
        validityDays: { type: Number, required: true, default: 30 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const SubscriptionPackage: Model<ISubscriptionPackage> = mongoose.models.SubscriptionPackage || mongoose.model<ISubscriptionPackage>('SubscriptionPackage', SubscriptionPackageSchema);

export default SubscriptionPackage;
