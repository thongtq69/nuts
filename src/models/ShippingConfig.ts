import mongoose, { Schema, Model } from 'mongoose';

export interface IWeightTier {
    name: string; // e.g. "Đến 2kg", "2-30kg"
    minWeight: number;
    maxWeight: number;
    basePrice: number; // Giá cho mốc dưới của tier này
    extraPricePerKg: number; // Giá cho mỗi kg vượt mốc dưới
    isDirectMultiplier: boolean; // Nếu true, lấy Tổng weight * extraPricePerKg
}

export interface IShippingZone {
    name: string; // "Nội tỉnh 1", "Nội miền 2", v.v.
    provinceNames: string[]; // Danh sách tỉnh/thành phố thuộc vùng này
    tiers: IWeightTier[];
}

export interface IShippingConfig {
    originCity: string; // "Hà Nội"
    fuelSurchargePercent: number; // Phụ phí nhiên liệu (%), ví dụ: 18
    vatPercent: number; // Thuế VAT (%), ví dụ: 8
    zones: IShippingZone[];
}

const WeightTierSchema = new Schema<IWeightTier>({
    name: { type: String, required: true },
    minWeight: { type: Number, required: true },
    maxWeight: { type: Number, required: true },
    basePrice: { type: Number, default: 0 },
    extraPricePerKg: { type: Number, default: 0 },
    isDirectMultiplier: { type: Boolean, default: false }
}, { _id: false });

const ShippingZoneSchema = new Schema<IShippingZone>({
    name: { type: String, required: true },
    provinceNames: [{ type: String }],
    tiers: [WeightTierSchema]
});

const ShippingConfigSchema = new Schema<IShippingConfig>(
    {
        originCity: { type: String, default: 'Hà Nội' },
        fuelSurchargePercent: { type: Number, default: 18 },
        vatPercent: { type: Number, default: 8 },
        zones: [ShippingZoneSchema]
    },
    {
        timestamps: true,
    }
);

const ShippingConfig: Model<IShippingConfig> = mongoose.models.ShippingConfig || mongoose.model<IShippingConfig>('ShippingConfig', ShippingConfigSchema);

export default ShippingConfig;
