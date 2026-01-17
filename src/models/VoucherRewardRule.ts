import mongoose, { Schema, Model } from 'mongoose';

export interface IVoucherRewardRule {
    _id?: string;
    name: string;                    // Tên rule
    minOrderValue: number;           // Giá trị đơn hàng tối thiểu để nhận voucher
    voucherValue: number;            // Giá trị voucher (VD: 50000, 100000)
    validityDays: number;            // Số ngày hiệu lực (90 = 3 tháng)
    extensionFee: number;            // Phí gia hạn (VD: 5000, 10000)
    extensionDays: number;           // Số ngày được gia hạn (90)
    maxExtensions: number;           // Số lần gia hạn tối đa
    minOrderForVoucher: number;      // Đơn tối thiểu để dùng voucher này
    isActive: boolean;               // Bật/tắt rule
    priority: number;                // Độ ưu tiên (càng cao càng ưu tiên)
    createdAt?: Date;
    updatedAt?: Date;
}

const VoucherRewardRuleSchema: Schema<IVoucherRewardRule> = new Schema(
    {
        name: { type: String, required: true },
        minOrderValue: { type: Number, required: true },
        voucherValue: { type: Number, required: true },
        validityDays: { type: Number, required: true, default: 90 },
        extensionFee: { type: Number, required: true, default: 5000 },
        extensionDays: { type: Number, required: true, default: 90 },
        maxExtensions: { type: Number, required: true, default: 1 },
        minOrderForVoucher: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        priority: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
VoucherRewardRuleSchema.index({ isActive: 1, minOrderValue: -1 });

const VoucherRewardRule: Model<IVoucherRewardRule> = mongoose.models.VoucherRewardRule || mongoose.model<IVoucherRewardRule>('VoucherRewardRule', VoucherRewardRuleSchema);

export default VoucherRewardRule;
