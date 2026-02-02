import mongoose, { Schema, Model } from 'mongoose';

export interface IEvent {
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    eventDate?: Date;
    eventLocation?: string;
    isPublished: boolean;
    publishedAt?: Date;
    viewCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        coverImage: { type: String },
        eventDate: { type: Date },
        eventLocation: { type: String },
        isPublished: { type: Boolean, default: false },
        publishedAt: { type: Date },
        viewCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;

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
