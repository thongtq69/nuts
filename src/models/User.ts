import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    role: 'user' | 'sale' | 'admin';
    address?: string;
    city?: string;
    district?: string;
    // Sale application fields
    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    saleAppliedAt?: Date;
    saleApprovedAt?: Date;
    saleRejectedAt?: Date;
    saleRejectionReason?: string;
    // Welcome voucher tracking
    welcomeVoucherIssued?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        role: { type: String, enum: ['user', 'sale', 'admin'], default: 'user' },
        address: { type: String },
        city: { type: String },
        district: { type: String },
        // Sale application fields
        saleApplicationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', null],
            default: null
        },
        saleAppliedAt: { type: Date },
        saleApprovedAt: { type: Date },
        saleRejectedAt: { type: Date },
        saleRejectionReason: { type: String },
        // Welcome voucher tracking
        welcomeVoucherIssued: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
