import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPageImage {
    url: string;
    alt: string;
    publicId?: string;
}

export interface IPageStat {
    label: string;
    value: string;
    icon: string;
    color: string;
}

export interface IPageCommitment {
    text: string;
}

export interface IPageContent extends Document {
    slug: string;
    title: string;
    content: string;
    subtitle?: string;
    heroImage?: IPageImage;
    sideImage?: IPageImage;
    stats?: IPageStat[];
    commitments?: IPageCommitment[];
    metadata?: {
        description?: string;
        keywords?: string[];
    };
    updatedAt: Date;
}

const PageImageSchema = new Schema<IPageImage>({
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    publicId: { type: String },
}, { _id: false });

const PageStatSchema = new Schema<IPageStat>({
    label: { type: String, required: true },
    value: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
}, { _id: false });

const PageCommitmentSchema = new Schema<IPageCommitment>({
    text: { type: String, required: true },
}, { _id: false });

const PageContentSchema: Schema<IPageContent> = new Schema(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        subtitle: { type: String },
        content: { type: String, required: true },
        heroImage: { type: PageImageSchema },
        sideImage: { type: PageImageSchema },
        stats: { type: [PageStatSchema], default: [] },
        commitments: { type: [PageCommitmentSchema], default: [] },
        metadata: {
            description: { type: String },
            keywords: [{ type: String }],
        },
    },
    {
        timestamps: true,
    }
);

const PageContent: Model<IPageContent> = mongoose.models.PageContent || mongoose.model<IPageContent>('PageContent', PageContentSchema);

export default PageContent;
