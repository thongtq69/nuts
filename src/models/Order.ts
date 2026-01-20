import mongoose, { Schema, Model } from 'mongoose';

export interface IOrder {
    user?: mongoose.Types.ObjectId;
    orderType?: 'product' | 'membership';
    shippingInfo: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        district: string;
    };
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        originalPrice?: number;
        image?: string;
        isAgent?: boolean;
    }[];
    packageInfo?: {
        packageId: mongoose.Types.ObjectId;
        name: string;
        voucherQuantity: number;
        expiresAt: Date;
    };
    paymentMethod: string;
    paymentStatus?: string;
    vnpayTransactionNo?: string;
    shippingFee: number;
    totalAmount: number;
    status: string;
    note?: string;
    referrer?: mongoose.Types.ObjectId;
    commissionId?: mongoose.Types.ObjectId;
    commissionAmount?: number;
    commissionStatus?: 'pending' | 'approved' | 'cancelled';
    originalTotalAmount?: number;
    agentSavings?: number;
    isAgentOrder?: boolean;
    createdAt?: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        orderType: { type: String, enum: ['product', 'membership'], default: 'product' },
        shippingInfo: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: {
                type: String,
                required: true
            },
            city: { type: String, required: true },
            district: { type: String },
        },
        items: [
            {
                productId: { type: String, required: true },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                originalPrice: { type: Number },
                image: { type: String },
                isAgent: { type: Boolean, default: false }
            },
        ],
        packageInfo: {
            packageId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPackage' },
            name: { type: String },
            voucherQuantity: { type: Number },
            expiresAt: { type: Date },
        },
        paymentMethod: { type: String, required: true, default: 'cod' },
        paymentStatus: { type: String, default: 'pending' },
        vnpayTransactionNo: { type: String },
        shippingFee: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        status: { type: String, default: 'pending' },
        note: { type: String },
        referrer: { type: Schema.Types.ObjectId, ref: 'User' },
        commissionId: { type: Schema.Types.ObjectId, ref: 'AffiliateCommission' },
        commissionAmount: { type: Number, default: 0 },
        commissionStatus: {
            type: String,
            enum: ['pending', 'approved', 'cancelled'],
            default: 'pending'
        },
        originalTotalAmount: { type: Number, default: 0 },
        agentSavings: { type: Number, default: 0 },
        isAgentOrder: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
