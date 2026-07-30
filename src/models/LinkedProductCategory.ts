import mongoose, { Model, Schema, Types } from 'mongoose';

export interface ILinkedProductSubmenu {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
}

export interface ILinkedProductCategory {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    submenus: ILinkedProductSubmenu[];
    createdAt?: Date;
    updatedAt?: Date;
}

const LinkedProductSubmenuSchema = new Schema<ILinkedProductSubmenu>({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

const LinkedProductCategorySchema = new Schema<ILinkedProductCategory>({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    submenus: { type: [LinkedProductSubmenuSchema], default: [] },
}, {
    timestamps: true,
});

const LinkedProductCategory: Model<ILinkedProductCategory> =
    mongoose.models.LinkedProductCategory ||
    mongoose.model<ILinkedProductCategory>('LinkedProductCategory', LinkedProductCategorySchema);

export default LinkedProductCategory;
