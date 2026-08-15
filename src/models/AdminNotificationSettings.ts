import mongoose, { Model, Schema } from 'mongoose';

export interface IAdminNotificationSettings {
    key: 'default';
    recipients: string[];
    notifyNewAccount: boolean;
    notifyNewOrder: boolean;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const AdminNotificationSettingsSchema = new Schema<IAdminNotificationSettings>({
    key: { type: String, default: 'default', unique: true, immutable: true },
    recipients: {
        type: [String],
        default: [],
        validate: {
            validator: (items: string[]) => items.length <= 10,
            message: 'Chỉ được cấu hình tối đa 10 email nhận thông báo',
        },
    },
    notifyNewAccount: { type: Boolean, default: true },
    notifyNewOrder: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const AdminNotificationSettings: Model<IAdminNotificationSettings> =
    mongoose.models.AdminNotificationSettings
    || mongoose.model<IAdminNotificationSettings>(
        'AdminNotificationSettings',
        AdminNotificationSettingsSchema,
    );

export default AdminNotificationSettings;
