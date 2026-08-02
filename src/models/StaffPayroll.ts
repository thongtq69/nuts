import mongoose, { Model, Schema, Types } from 'mongoose';

export interface IStaffPayrollSnapshot {
    revenue: number;
    achievementPercentage: number;
    kpiShortfallPercentage: number;
    earnedBaseSalary: number;
    excessRevenue: number;
    commissionAmount: number;
    totalSalary: number;
    calculatedAt: Date;
}

export interface IStaffPayroll {
    staffId: Types.ObjectId;
    year: number;
    month: number;
    baseSalary: number;
    kpiTarget: number;
    commissionRate: number;
    status: 'draft' | 'finalized' | 'paid';
    snapshot?: IStaffPayrollSnapshot;
    notes?: string;
    createdBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const StaffPayrollSnapshotSchema = new Schema<IStaffPayrollSnapshot>({
    revenue: { type: Number, required: true },
    achievementPercentage: { type: Number, required: true },
    kpiShortfallPercentage: { type: Number, required: true },
    earnedBaseSalary: { type: Number, required: true },
    excessRevenue: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    totalSalary: { type: Number, required: true },
    calculatedAt: { type: Date, required: true },
}, { _id: false });

const StaffPayrollSchema = new Schema<IStaffPayroll>({
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true, min: 2020, max: 2200 },
    month: { type: Number, required: true, min: 1, max: 12 },
    baseSalary: { type: Number, required: true, min: 0 },
    kpiTarget: { type: Number, required: true, min: 1 },
    commissionRate: { type: Number, required: true, min: 0, max: 100 },
    status: {
        type: String,
        enum: ['draft', 'finalized', 'paid'],
        default: 'draft',
    },
    snapshot: { type: StaffPayrollSnapshotSchema },
    notes: { type: String, trim: true, maxlength: 1000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

StaffPayrollSchema.index({ staffId: 1, year: 1, month: 1 }, { unique: true });
StaffPayrollSchema.index({ year: 1, month: 1, status: 1 });

const StaffPayroll: Model<IStaffPayroll> = mongoose.models.StaffPayroll
    || mongoose.model<IStaffPayroll>('StaffPayroll', StaffPayrollSchema);

export default StaffPayroll;
