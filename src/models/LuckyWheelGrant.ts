import mongoose, { Model, Schema } from 'mongoose';

export interface ILuckyWheelGrant {
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    orderAmount: number;
    spins: number;
}

const schema = new Schema<ILuckyWheelGrant>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    orderAmount: { type: Number, required: true, min: 0 },
    spins: { type: Number, required: true, min: 1 },
}, { timestamps: true });

const LuckyWheelGrant: Model<ILuckyWheelGrant> = mongoose.models.LuckyWheelGrant
    || mongoose.model<ILuckyWheelGrant>('LuckyWheelGrant', schema);
export default LuckyWheelGrant;
