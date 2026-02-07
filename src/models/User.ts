import mongoose, { Schema, Model } from 'mongoose';
import type { Permission, RoleType } from '@/constants/permissions';

export interface IUserCommissionSettings {
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    personalCommissionRate?: number;
    overrideTeamCommission?: boolean;
    managerId?: Schema.Types.ObjectId;
    teamId?: Schema.Types.ObjectId;
}

export interface IUserPerformance {
    currentMonthSales: number;
    currentMonthOrders: number;
    currentMonthNewCustomers: number;
    totalSales: number;
    totalOrders: number;
    lastResetAt?: Date;
}

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
    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    saleAppliedAt?: Date;
    saleApprovedAt?: Date;
    saleRejectedAt?: Date;
    saleRejectionReason?: string;
    saleType?: 'agent' | 'collaborator' | null;
    welcomeVoucherIssued?: boolean;
    referralCode?: string;
    encodedAffiliateCode?: string;
    walletBalance?: number;
    totalCommission?: number;
    referrer?: Schema.Types.ObjectId;
    commissionRateOverride?: number;
    bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
    parentStaff?: Schema.Types.ObjectId;
    affiliateLevel?: 'staff' | 'collaborator';
    staffCode?: string;
    collaboratorCount?: number;
    staffCommissionRate?: number;
    roleType?: RoleType;
    customPermissions?: Permission[];
    // New commission system fields
    commissionSettings?: IUserCommissionSettings;
    performance?: IUserPerformance;
    lastPromotionAt?: Date;
    consecutiveMonthsInTier?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserCommissionSettingsSchema = new Schema<IUserCommissionSettings>({
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        default: 'bronze'
    },
    personalCommissionRate: { type: Number },
    overrideTeamCommission: { type: Boolean, default: false },
    managerId: { type: Schema.Types.ObjectId, ref: 'User' },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' }
}, { _id: false });

const UserPerformanceSchema = new Schema<IUserPerformance>({
    currentMonthSales: { type: Number, default: 0 },
    currentMonthOrders: { type: Number, default: 0 },
    currentMonthNewCustomers: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    lastResetAt: { type: Date }
}, { _id: false });

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
        saleApplicationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', null],
            default: null
        },
        saleAppliedAt: { type: Date },
        saleApprovedAt: { type: Date },
        saleRejectedAt: { type: Date },
        saleRejectionReason: { type: String },
        saleType: { type: String, enum: ['agent', 'collaborator', null], default: null },
        welcomeVoucherIssued: { type: Boolean, default: false },
        referralCode: { type: String, unique: true, sparse: true },
        encodedAffiliateCode: { type: String, unique: true, sparse: true },
        walletBalance: { type: Number, default: 0 },
        totalCommission: { type: Number, default: 0 },
        referrer: { type: Schema.Types.ObjectId, ref: 'User' },
        commissionRateOverride: { type: Number },
        bankInfo: {
            bankName: String,
            accountNumber: String,
            accountName: String,
        },
        parentStaff: { type: Schema.Types.ObjectId, ref: 'User' },
        affiliateLevel: {
            type: String,
            enum: ['staff', 'collaborator'],
        },
        staffCode: { type: String, unique: true, sparse: true },
        collaboratorCount: { type: Number, default: 0 },
        staffCommissionRate: { type: Number, default: 2 },
        roleType: {
            type: String,
            enum: ['admin', 'manager', 'sales', 'support', 'warehouse', 'accountant', 'collaborator', 'viewer'],
        },
        customPermissions: [{
            type: String,
            enum: [
                'dashboard:view', 'dashboard:stats',
                'products:view', 'products:create', 'products:edit', 'products:delete', 'products:pricing',
                'orders:view', 'orders:edit', 'orders:delete', 'orders:process', 'orders:export',
                'users:view', 'users:create', 'users:edit', 'users:delete', 'users:roles',
                'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:permissions',
                'collaborators:view', 'collaborators:create', 'collaborators:edit', 'collaborators:delete', 'collaborators:commissions',
                'affiliate:view', 'affiliate:settings', 'affiliate:commissions', 'affiliate:pay',
                'vouchers:view', 'vouchers:create', 'vouchers:edit', 'vouchers:delete', 'vouchers:rewards',
                'banners:view', 'banners:create', 'banners:edit', 'banners:delete',
                'blogs:view', 'blogs:create', 'blogs:edit', 'blogs:delete',
                'reports:view', 'reports:export', 'reports:financial',
                'settings:view', 'settings:edit', 'settings:site', 'settings:payments',
                'admin:super', 'admin:logs',
                // New commission permissions
                'commission:view', 'commission:edit', 'commission:approve', 'commission:pay',
                'kpi:view', 'kpi:edit', 'kpi:manage',
                'teams:view', 'teams:create', 'teams:edit', 'teams:delete'
            ]
        }],
        // New commission system fields
        commissionSettings: { type: UserCommissionSettingsSchema, default: { tier: 'bronze' } },
        performance: { type: UserPerformanceSchema, default: {} },
        lastPromotionAt: { type: Date },
        consecutiveMonthsInTier: { type: Number, default: 0 }
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ roleType: 1 });
UserSchema.index({ role: 1, roleType: 1 });
UserSchema.index({ 'commissionSettings.tier': 1 });
UserSchema.index({ 'commissionSettings.teamId': 1 });
UserSchema.index({ 'commissionSettings.managerId': 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
