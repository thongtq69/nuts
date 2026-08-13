import mongoose, { Schema, Model } from 'mongoose';

export interface IBanner {
    _id?: string;
    title: string;
    imageUrl: string;
    link?: string;
    isActive: boolean;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
    translations?: {
        en?: {
            title?: string;
            imageUrl?: string;
            link?: string;
            alt?: string;
        };
    };
}

const BannerEnglishTranslationSchema = new Schema({
    title: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    link: { type: String, trim: true },
    alt: { type: String, trim: true },
}, { _id: false });

const BannerSchema: Schema<IBanner> = new Schema(
    {
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },
        link: { type: String },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        translations: {
            en: { type: BannerEnglishTranslationSchema, default: undefined },
        },
    },
    {
        timestamps: true,
    }
);

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
