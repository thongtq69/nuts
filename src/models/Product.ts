import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
    id?: string;
    name: string;
    image: string;
    currentPrice: number;
    originalPrice?: number;
    badgeText?: string;
    badgeColor?: string;
    rating?: number;
    reviewsCount?: number;
    description?: string;
    shortDescription?: string;
    images?: string[];
    category?: string;
    isLinkedProduct?: boolean;
    linkedMenuCategoryId?: mongoose.Types.ObjectId | string;
    linkedMenuSubmenuId?: mongoose.Types.ObjectId | string;
    linkedMenuCategory?: string;
    linkedCategory?: string;
    tags?: string[];
    buttonColor?: string;
    priceColor?: string;
    agentPrice?: number;
    bulkPricing?: IBulkPricingTier[];
    stock?: number;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
    sku?: string;
    soldCount?: number;
    weight?: number; // In kg
    vipMaxDiscount?: number; // Maximum VIP voucher discount per unit; 0 means unlimited
    sortOrder?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBulkPricingTier {
    minQuantity: number;
    discountPercent: number;
    discountedPrice?: number;
}

const BulkPricingTierSchema = new Schema<IBulkPricingTier>({
    minQuantity: { type: Number, required: true, min: 1 },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    discountedPrice: { type: Number }
}, { _id: false });

const ProductSchema: Schema<IProduct> = new Schema(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        currentPrice: { type: Number, required: true },
        originalPrice: { type: Number },
        badgeText: { type: String },
        badgeColor: { type: String },
        rating: { type: Number, default: 5 },
        reviewsCount: { type: Number, default: 0 },
        description: { type: String },
        shortDescription: { type: String },
        images: { type: [String] },
        category: { type: String },
        isLinkedProduct: { type: Boolean, default: false, index: true },
        linkedMenuCategoryId: { type: Schema.Types.ObjectId, ref: 'LinkedProductCategory', index: true },
        linkedMenuSubmenuId: { type: Schema.Types.ObjectId, index: true },
        linkedMenuCategory: { type: String, trim: true, default: '' },
        linkedCategory: { type: String, trim: true, default: '' },
        tags: { type: [String] },
        buttonColor: { type: String },
        priceColor: { type: String },
        agentPrice: { type: Number },
        bulkPricing: { type: [BulkPricingTierSchema], default: [] },
        stock: { type: Number, default: 100 },
        stockStatus: {
            type: String,
            enum: ['in_stock', 'out_of_stock', 'low_stock'],
            default: 'in_stock'
        },
        sku: { type: String },
        soldCount: { type: Number, default: 0 },
        weight: { type: Number, default: 0.5 },
        vipMaxDiscount: { type: Number, default: 0, min: 0 },
        sortOrder: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret: any) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
