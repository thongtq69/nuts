import mongoose, { Schema, Model } from 'mongoose';

export interface IOrder {
    user?: mongoose.Types.ObjectId;
    orderType?: 'product' | 'membership'; // Type of order
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
        image: string;
    }[];
    // Package info for membership orders
    packageInfo?: {
        packageId: mongoose.Types.ObjectId;
        name: string;
        voucherQuantity: number;
        expiresAt: Date;
    };
    paymentMethod: string; // 'cod' | 'banking' | 'vnpay'
    paymentStatus?: string; // 'pending' | 'completed' | 'failed'
    vnpayTransactionNo?: string;
    shippingFee: number;
    totalAmount: number;
    status: string; // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    note?: string;

    // Affiliate Marketing Fields
    referrer?: mongoose.Types.ObjectId;
    commissionId?: mongoose.Types.ObjectId;
    commissionAmount?: number;
    commissionStatus?: 'pending' | 'approved' | 'cancelled';

    createdAt?: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        orderType: { type: String, enum: ['product', 'membership'], default: 'product' },
        shippingInfo: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            district: { type: String },
        },
        items: [
            {
                productId: { type: String, required: true },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                image: { type: String },
            },
        ],
        // Package info for membership orders
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

        // Affiliate Marketing Fields
        referrer: { type: Schema.Types.ObjectId, ref: 'User' },
        commissionId: { type: Schema.Types.ObjectId, ref: 'AffiliateCommission' },
        commissionAmount: { type: Number, default: 0 },
        commissionStatus: {
            type: String,
            enum: ['pending', 'approved', 'cancelled'],
            default: 'pending'
        },
    },
    {
        timestamps: true,
    }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
