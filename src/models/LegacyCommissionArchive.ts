import mongoose, { Model, Schema } from 'mongoose';

export interface ILegacyCommissionArchive {
    sourceCommissionId: mongoose.Types.ObjectId;
    affiliateId?: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    orderValue: number;
    commissionRate: number;
    commissionAmount: number;
    status: string;
    note?: string;
    affiliateSnapshot?: {
        name?: string;
        email?: string;
        referralCode?: string;
    };
    orderSnapshot?: {
        orderNumber?: string;
        totalAmount?: number;
        status?: string;
        createdAt?: Date;
    };
    integrityStatus: string;
    archiveReason: string;
    sourceCreatedAt?: Date;
    sourceUpdatedAt?: Date;
    archivedAt: Date;
}

const LegacyCommissionArchiveSchema = new Schema<ILegacyCommissionArchive>({
    sourceCommissionId: { type: Schema.Types.ObjectId, required: true, unique: true },
    affiliateId: { type: Schema.Types.ObjectId },
    orderId: { type: Schema.Types.ObjectId },
    orderValue: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    status: { type: String, required: true },
    note: { type: String },
    affiliateSnapshot: {
        name: String,
        email: String,
        referralCode: String,
    },
    orderSnapshot: {
        orderNumber: String,
        totalAmount: Number,
        status: String,
        createdAt: Date,
    },
    integrityStatus: { type: String, required: true },
    archiveReason: { type: String, required: true },
    sourceCreatedAt: { type: Date },
    sourceUpdatedAt: { type: Date },
    archivedAt: { type: Date, required: true },
}, { timestamps: true });

const LegacyCommissionArchive: Model<ILegacyCommissionArchive> =
    mongoose.models.LegacyCommissionArchive
    || mongoose.model<ILegacyCommissionArchive>('LegacyCommissionArchive', LegacyCommissionArchiveSchema);

export default LegacyCommissionArchive;
