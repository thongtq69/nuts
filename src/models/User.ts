import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string; // Optional for social login users in future
    phone?: string;
    role: 'user' | 'admin';
    address?: string;
    city?: string;
    district?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        address: { type: String },
        city: { type: String },
        district: { type: String },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
