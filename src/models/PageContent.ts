import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPageContent extends Document {
    slug: string; // e.g., 'about-us', 'return-policy', 'privacy-policy', 'terms'
    title: string;
    content: string; // Rich text/HTML
    metadata?: {
        description?: string;
        keywords?: string[];
    };
    updatedAt: Date;
}

const PageContentSchema: Schema<IPageContent> = new Schema(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
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
