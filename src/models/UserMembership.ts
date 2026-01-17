import mongoose, { Schema, Model } from 'mongoose';

export interface IUserMembership {
    _id?: string;
    userId: mongoose.Types.ObjectId;
    packageId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    purchasePrice: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserMembershipSchema: Schema<IUserMembership> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        packageId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPackage', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        purchasePrice: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

const UserMembership: Model<IUserMembership> = mongoose.models.UserMembership || mongoose.model<IUserMembership>('UserMembership', UserMembershipSchema);

export default UserMembership;