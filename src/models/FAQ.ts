import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IFAQ extends Document {
    question: string;
    answer: string;
    category: string; // e.g., 'general', 'membership', 'shipping', 'about'
    order: number;
    isActive: boolean;
}

const FAQSchema: Schema<IFAQ> = new Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, default: 'general' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

const FAQ: Model<IFAQ> = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);

export default FAQ;
