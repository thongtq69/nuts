import mongoose, { Schema, Model } from 'mongoose';
import { getLegacyCommissionIntegrity } from '@/lib/legacy-commission';

export interface IAffiliateCommission {
    affiliateId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    orderValue: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    note?: string;
    affiliateName?: string;
    affiliateEmail?: string;
    affiliateReferralCode?: string;
    orderNumber?: string;
    orderStatus?: string;
    integrityStatus?: 'valid' | 'missing_affiliate' | 'missing_order' | 'missing_both';
    integrityCheckedAt?: Date;
    requiresReconciliation?: boolean;
    archivedAt?: Date;
    archiveReason?: string;
    approvedAt?: Date;
    paidAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const AffiliateCommissionSchema: Schema<IAffiliateCommission> = new Schema(
    {
        affiliateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        orderValue: { type: Number, required: true },
        commissionRate: { type: Number, required: true }, // Snapshot of rate at time of order
        commissionAmount: { type: Number, required: true },
        affiliateName: { type: String },
        affiliateEmail: { type: String },
        affiliateReferralCode: { type: String },
        orderNumber: { type: String },
        orderStatus: { type: String },
        integrityStatus: {
            type: String,
            enum: ['valid', 'missing_affiliate', 'missing_order', 'missing_both'],
        },
        integrityCheckedAt: { type: Date },
        requiresReconciliation: { type: Boolean, default: false },
        archivedAt: { type: Date },
        archiveReason: { type: String },
        approvedAt: { type: Date },
        paidAt: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'paid'],
            default: 'pending'
        },
        note: { type: String },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster lookups
AffiliateCommissionSchema.index({ affiliateId: 1, status: 1 });
AffiliateCommissionSchema.index({ orderId: 1 });
AffiliateCommissionSchema.index({ archivedAt: 1, status: 1 });

AffiliateCommissionSchema.pre('save', async function snapshotReferences() {
    if (!this.isNew) return;

    const UserModel = mongoose.models.User;
    const OrderModel = mongoose.models.Order;
    if (!UserModel || !OrderModel) return;

    const [affiliate, order] = await Promise.all([
        UserModel.findById(this.affiliateId).select('name email referralCode').lean(),
        OrderModel.findById(this.orderId).select('_id status').lean(),
    ]);

    this.affiliateName = affiliate?.name;
    this.affiliateEmail = affiliate?.email;
    this.affiliateReferralCode = affiliate?.referralCode;
    this.orderNumber = order?._id?.toString();
    this.orderStatus = order?.status;
    this.integrityStatus = getLegacyCommissionIntegrity(Boolean(affiliate), Boolean(order));
    this.integrityCheckedAt = new Date();
    this.requiresReconciliation = this.integrityStatus !== 'valid';
});

const AffiliateCommission: Model<IAffiliateCommission> = mongoose.models.AffiliateCommission || mongoose.model<IAffiliateCommission>('AffiliateCommission', AffiliateCommissionSchema);

export default AffiliateCommission;
