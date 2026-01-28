import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    phone?: string;
    message: string;
    status: 'pending' | 'processing' | 'completed' | 'canceled';
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: false, default: '' },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'canceled'],
            default: 'pending'
        },
    },
    {
        timestamps: true,
    }
);

// Better Next.js model handling: delete if exists in development to force schema updates
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Contact;
}

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
