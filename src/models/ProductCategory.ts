import mongoose, { Model, Schema } from 'mongoose';

export interface IProductCategory {
    name: string;
    normalizedName: string;
    value: string;
    createdAt?: Date;
    updatedAt?: Date;
    translations?: {
        en?: {
            name?: string;
        };
    };
}

const ProductCategoryEnglishTranslationSchema = new Schema({
    name: { type: String, trim: true },
}, { _id: false });

const ProductCategorySchema = new Schema<IProductCategory>({
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true, unique: true, trim: true },
    translations: {
        en: { type: ProductCategoryEnglishTranslationSchema, default: undefined },
    },
}, {
    timestamps: true,
});

const ProductCategory: Model<IProductCategory> =
    mongoose.models.ProductCategory ||
    mongoose.model<IProductCategory>('ProductCategory', ProductCategorySchema);

export default ProductCategory;
