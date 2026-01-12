import mongoose, { Schema, Model } from 'mongoose';

export interface IOrder {
    user?: mongoose.Types.ObjectId;
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
    paymentMethod: string; // 'cod' | 'banking'
    paymentStatus?: string; // 'pending' | 'completed'
    shippingFee: number;
    totalAmount: number;
    status: string; // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    note?: string;
    createdAt?: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
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
        paymentMethod: { type: String, required: true, default: 'cod' },
        paymentStatus: { type: String, default: 'pending' },
        shippingFee: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        status: { type: String, default: 'pending' },
        note: { type: String },
    },
    {
        timestamps: true,
    }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
