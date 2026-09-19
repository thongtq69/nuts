import mongoose, { Model, Schema } from 'mongoose';

interface Winner {
    userId: mongoose.Types.ObjectId;
    prizeValue: number;
}

export interface ILuckyWheelMilestone {
    cycle: number;
    topUpTarget: number;
    winners: Winner[];
    drawnBy: mongoose.Types.ObjectId;
    drawnAt: Date;
}

const schema = new Schema<ILuckyWheelMilestone>({
    cycle: { type: Number, required: true, unique: true, min: 1 },
    topUpTarget: { type: Number, required: true },
    winners: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        prizeValue: { type: Number, required: true },
    }],
    drawnBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    drawnAt: { type: Date, required: true },
}, { timestamps: true });

const LuckyWheelMilestone: Model<ILuckyWheelMilestone> = mongoose.models.LuckyWheelMilestone
    || mongoose.model<ILuckyWheelMilestone>('LuckyWheelMilestone', schema);
export default LuckyWheelMilestone;
