import mongoose, { Schema, Model, Types } from 'mongoose';

export type CommissionType =
    | 'direct_sale'
    | 'team_sale_l1'
    | 'team_sale_l2'
    | 'bonus'
    | 'kpi_bonus'
    | 'referral_bonus'
    | 'monthly_bonus'
    | 'adjustment';

export type TransactionStatus = 'pending' | 'approved' | 'paid' | 'cancelled' | 'rejected';

export interface ICommissionTransaction {
    id?: string;
    // Recipient
    userId: Types.ObjectId;
    userName: string;
    userEmail?: string;
    userRole: string;
    userTier: string;

    // Source order (if applicable)
    orderId?: Types.ObjectId;
    orderNumber?: string;
    orderTotal?: number;

    // Commission details
    commissionType: CommissionType;
    commissionRate: number;
    commissionAmount: number;
    currency: string;

    // Source user (for team sales)
    sourceUserId?: Types.ObjectId;
    sourceUserName?: string;
    sourceUserTier?: string;

    // Team info (if applicable)
    teamId?: Types.ObjectId;
    teamName?: string;

    // Status & approval
    status: TransactionStatus;
    approvedBy?: Types.ObjectId;
    approvedByName?: string;
    approvedAt?: Date;
    rejectedReason?: string;

    // Payment
    paidAt?: Date;
    paymentMethod?: string;
    paymentReference?: string;
    paymentBatch?: string;

    // Period
    periodYear: number;
    periodMonth: number;

    // Notes
    notes?: string;
    internalNotes?: string;

    // Metadata
    createdAt?: Date;
    updatedAt?: Date;
}

const CommissionTransactionSchema: Schema<ICommissionTransaction> = new Schema(
    {
        // Recipient
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        userEmail: { type: String },
        userRole: { type: String, required: true },
        userTier: { type: String, required: true },

        // Source order
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        orderNumber: { type: String },
        orderTotal: { type: Number },

        // Commission details
        commissionType: {
            type: String,
            required: true,
            enum: [
                'direct_sale',
                'team_sale_l1',
                'team_sale_l2',
                'bonus',
                'kpi_bonus',
                'referral_bonus',
                'monthly_bonus',
                'adjustment'
            ]
        },
        commissionRate: { type: Number, required: true },
        commissionAmount: { type: Number, required: true },
        currency: { type: String, default: 'VND' },

        // Source user
        sourceUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        sourceUserName: { type: String },
        sourceUserTier: { type: String },

        // Team
        teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
        teamName: { type: String },

        // Status
        status: {
            type: String,
            enum: ['pending', 'approved', 'paid', 'cancelled', 'rejected'],
            default: 'pending'
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedByName: { type: String },
        approvedAt: { type: Date },
        rejectedReason: { type: String },

        // Payment
        paidAt: { type: Date },
        paymentMethod: { type: String },
        paymentReference: { type: String },
        paymentBatch: { type: String },

        // Period
        periodYear: { type: Number, required: true },
        periodMonth: { type: Number, required: true },

        // Notes
        notes: { type: String },
        internalNotes: { type: String }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

// Indexes
CommissionTransactionSchema.index({ userId: 1, createdAt: -1 });
CommissionTransactionSchema.index({ orderId: 1 });
CommissionTransactionSchema.index({ status: 1 });
CommissionTransactionSchema.index({ commissionType: 1 });
CommissionTransactionSchema.index({ periodYear: 1, periodMonth: 1 });
CommissionTransactionSchema.index({ teamId: 1 });
CommissionTransactionSchema.index({ createdAt: -1 });

// Compound index for reporting
CommissionTransactionSchema.index({
    userId: 1,
    periodYear: 1,
    periodMonth: 1,
    status: 1
});

const CommissionTransaction: Model<ICommissionTransaction> =
    mongoose.models.CommissionTransaction ||
    mongoose.model<ICommissionTransaction>('CommissionTransaction', CommissionTransactionSchema);

export default CommissionTransaction;
