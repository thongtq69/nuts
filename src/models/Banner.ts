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
}

const BannerSchema: Schema<IBanner> = new Schema(
    {
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },
        link: { type: String },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
