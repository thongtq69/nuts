import mongoose, { Model, Schema } from 'mongoose';

export interface IPartnerMembership {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  sourceBrand: 'gonuts' | 'chillpop';
  externalMembershipId: string;
  externalPackageName: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount: number;
  minOrderValue: number;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PartnerMembershipSchema = new Schema<IPartnerMembership>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceBrand: { type: String, enum: ['gonuts', 'chillpop'], required: true },
  externalMembershipId: { type: String, required: true },
  externalPackageName: { type: String, required: true },
  discountType: { type: String, enum: ['percent', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: 0, min: 0 },
  minOrderValue: { type: Number, default: 0, min: 0 },
  startsAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

PartnerMembershipSchema.index({ sourceBrand: 1, externalMembershipId: 1 }, { unique: true });

const PartnerMembership: Model<IPartnerMembership> =
  mongoose.models.PartnerMembership || mongoose.model<IPartnerMembership>('PartnerMembership', PartnerMembershipSchema);

export default PartnerMembership;
