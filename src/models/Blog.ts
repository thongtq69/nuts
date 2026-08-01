import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IBlog {
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    author: string;
    authorId?: Types.ObjectId;
    authorRole?: 'admin' | 'staff';
    category: string;
    tags: string[];
    isPublished: boolean;
    moderationStatus?: 'draft' | 'pending' | 'published' | 'rejected';
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
    publishedAt?: Date;
    viewCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const BlogSchema: Schema<IBlog> = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        coverImage: { type: String },
        author: { type: String, default: 'Admin' },
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        authorRole: { type: String, enum: ['admin', 'staff'], default: 'admin' },
        category: { type: String, required: true },
        tags: [{ type: String }],
        isPublished: { type: Boolean, default: false },
        moderationStatus: {
            type: String,
            enum: ['draft', 'pending', 'published', 'rejected'],
            default: 'draft'
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: { type: Date },
        rejectionReason: { type: String },
        publishedAt: { type: Date },
        viewCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

BlogSchema.index({ authorId: 1, createdAt: -1 });
BlogSchema.index({ moderationStatus: 1, createdAt: -1 });

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;

// Helper function to generate slug
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
