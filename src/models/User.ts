import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    role: 'user' | 'sale' | 'admin' | 'staff';
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

    // Affiliate Marketing Fields
    referralCode?: string;
    walletBalance?: number;
    totalCommission?: number;
    referrer?: Schema.Types.ObjectId; // Who referred this user
    commissionRateOverride?: number; // Custom rate for this specific user
    bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };

    // Multi-level Affiliate Fields (Staff → Collaborator)
    parentStaff?: Schema.Types.ObjectId; // For collaborators: which staff manages them
    affiliateLevel?: 'staff' | 'collaborator'; // Level in hierarchy
    staffCode?: string; // Code assigned by admin to staff (e.g., NV001)
    collaboratorCount?: number; // Number of collaborators under this staff
    staffCommissionRate?: number; // Commission rate staff gets from collaborators' sales

    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        role: { type: String, enum: ['user', 'sale', 'admin', 'staff'], default: 'user' },
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

        // Affiliate Marketing Fields
        referralCode: { type: String, unique: true, sparse: true },
        walletBalance: { type: Number, default: 0 },
        totalCommission: { type: Number, default: 0 }, // Lifetime earnings
        referrer: { type: Schema.Types.ObjectId, ref: 'User' }, // Who referred this user
        commissionRateOverride: { type: Number },
        bankInfo: {
            bankName: String,
            accountNumber: String,
            accountName: String,
        },

        // Multi-level Affiliate Fields (Staff → Collaborator)
        parentStaff: { type: Schema.Types.ObjectId, ref: 'User' }, // For collaborators: which staff manages them
        affiliateLevel: {
            type: String,
            enum: ['staff', 'collaborator'],
        },
        staffCode: { type: String, unique: true, sparse: true }, // Code assigned by admin to staff (e.g., NV001)
        collaboratorCount: { type: Number, default: 0 }, // Number of collaborators under this staff
        staffCommissionRate: { type: Number, default: 2 }, // Commission rate staff gets from collaborators' sales (%)
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
