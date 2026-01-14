import mongoose, { Schema, Model } from 'mongoose';

export interface IAffiliateCommission {
    affiliateId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    orderValue: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    note?: string;
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

const AffiliateCommission: Model<IAffiliateCommission> = mongoose.models.AffiliateCommission || mongoose.model<IAffiliateCommission>('AffiliateCommission', AffiliateCommissionSchema);

export default AffiliateCommission;
