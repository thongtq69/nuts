import mongoose, { Schema, Model } from 'mongoose';

export interface INotification {
    title: string;
    message: string;
    type: 'order' | 'user' | 'system';
    link?: string;
    isRead: boolean;
    createdAt?: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['order', 'user', 'system'], default: 'system' },
        link: { type: String },
        isRead: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
