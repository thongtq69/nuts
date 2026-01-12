import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
    id?: string; // Optional because MongoDB uses _id
    name: string;
    image: string;
    currentPrice: number;
    originalPrice?: number;
    badgeText?: string;
    badgeColor?: string; // 'sale' | 'new' | 'best'
    rating?: number;
    reviewsCount?: number;
    description?: string;
    images?: string[];
    category?: string;
    buttonColor?: string;
    priceColor?: string;
}

const ProductSchema: Schema<IProduct> = new Schema(
    {
        name: { type: String, required: true },
        image: { type: String, required: true }, // Main image
        currentPrice: { type: Number, required: true },
        originalPrice: { type: Number },
        badgeText: { type: String },
        badgeColor: { type: String },
        rating: { type: Number, default: 5 },
        reviewsCount: { type: Number, default: 0 },
        description: { type: String },
        images: { type: [String] }, // Gallery images
        category: { type: String },
        buttonColor: { type: String },
        priceColor: { type: String },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

// Prevent overwriting the model if it's already compiled
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
