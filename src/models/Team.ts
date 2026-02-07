import mongoose, { Schema, Model, Types } from 'mongoose';

export interface ITeamMember {
    userId: Types.ObjectId;
    userName?: string;
    userEmail?: string;
    joinedAt: Date;
    role: 'leader' | 'member';
    status: 'active' | 'inactive' | 'pending';
}

export interface ITeamPerformance {
    currentMonthSales: number;
    currentMonthOrders: number;
    currentMonthNewMembers: number;
    totalSales: number;
    totalOrders: number;
}

export interface ITeam {
    id?: string;
    name: string;
    description?: string;
    code: string;
    leaderId: Types.ObjectId;
    leaderName?: string;
    members: ITeamMember[];
    maxMembers?: number;
    teamCommissionRate?: number;
    autoAcceptMembers: boolean;
    performance: ITeamPerformance;
    status: 'active' | 'inactive';
    createdAt?: Date;
    updatedAt?: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userEmail: { type: String },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['leader', 'member'], default: 'member' },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, { _id: false });

const TeamPerformanceSchema = new Schema<ITeamPerformance>({
    currentMonthSales: { type: Number, default: 0 },
    currentMonthOrders: { type: Number, default: 0 },
    currentMonthNewMembers: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 }
}, { _id: false });

const TeamSchema: Schema<ITeam> = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        code: { type: String, required: true, unique: true },
        leaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        leaderName: { type: String },
        members: { type: [TeamMemberSchema], default: [] },
        maxMembers: { type: Number, default: 50 },
        teamCommissionRate: { type: Number },
        autoAcceptMembers: { type: Boolean, default: false },
        performance: { type: TeamPerformanceSchema, default: {} },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

// Indexes
TeamSchema.index({ code: 1 }, { unique: true });
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ status: 1 });
TeamSchema.index({ 'members.userId': 1 });

// Virtual for member count
TeamSchema.virtual('memberCount').get(function () {
    return this.members.filter(m => m.status === 'active').length;
});

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team;
