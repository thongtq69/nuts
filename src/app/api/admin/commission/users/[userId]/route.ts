import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CommissionTier from '@/models/CommissionTier';
import CommissionTransaction from '@/models/CommissionTransaction';
import mongoose from 'mongoose';

// GET - Get user's commission settings and performance
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await verifyToken();
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Chưa đăng nhập' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { userId } = params;

        // Non-admin can only view their own data
        if (session.role !== 'admin' && session.id !== userId) {
            return NextResponse.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 403 }
            );
        }

        const user = await User.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy user' },
                { status: 404 }
            );
        }

        // Get current tier details
        const tierName = user.commissionSettings?.tier || 'bronze';
        const currentTier = await CommissionTier.findOne({ name: tierName }).lean();

        // Get next tier
        const nextTier = currentTier
            ? await CommissionTier.findOne({
                order: { $gt: (currentTier as any).order },
                isActive: true
            })
                .sort({ order: 1 })
                .lean()
            : null;

        // Get team members count
        const teamMembersCount = await User.countDocuments({
            'commissionSettings.managerId': new mongoose.Types.ObjectId(userId)
        } as any);

        // Get team total sales this month
        const teamMembers = await User.find({
            'commissionSettings.managerId': new mongoose.Types.ObjectId(userId)
        } as any).select('performance.currentMonthSales');

        const teamSales = teamMembers.reduce(
            (sum, m) => sum + (m.performance?.currentMonthSales || 0),
            0
        );

        // Get commission stats
        const now = new Date();
        const [thisMonthEarnings, pendingCommission, totalPaid] = await Promise.all([
            CommissionTransaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        periodYear: now.getFullYear(),
                        periodMonth: now.getMonth() + 1
                    }
                },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ]),
            CommissionTransaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        status: { $in: ['pending', 'approved'] }
                    }
                },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ]),
            CommissionTransaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        status: 'paid'
                    }
                },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ])
        ]);

        // Calculate progress to next tier
        let progressToNextTier = null;
        if (nextTier && (nextTier as any).requirements) {
            const perf = user.performance || {
                currentMonthSales: 0,
                currentMonthOrders: 0
            };
            const reqs = (nextTier as any).requirements;

            progressToNextTier = {
                sales: {
                    current: perf.currentMonthSales,
                    required: reqs.minMonthlySales || 0,
                    percentage: reqs.minMonthlySales
                        ? Math.min(100, (perf.currentMonthSales / reqs.minMonthlySales) * 100)
                        : 100
                },
                orders: {
                    current: perf.currentMonthOrders,
                    required: reqs.minMonthlyOrders || 0,
                    percentage: reqs.minMonthlyOrders
                        ? Math.min(100, (perf.currentMonthOrders / reqs.minMonthlyOrders) * 100)
                        : 100
                },
                teamSize: {
                    current: teamMembersCount,
                    required: reqs.minTeamSize || 0,
                    percentage: reqs.minTeamSize
                        ? Math.min(100, (teamMembersCount / reqs.minTeamSize) * 100)
                        : 100
                },
                teamSales: {
                    current: teamSales,
                    required: reqs.minTeamSales || 0,
                    percentage: reqs.minTeamSales
                        ? Math.min(100, (teamSales / reqs.minTeamSales) * 100)
                        : 100
                }
            };
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    commissionSettings: user.commissionSettings,
                    performance: user.performance,
                    lastPromotionAt: user.lastPromotionAt,
                    consecutiveMonthsInTier: user.consecutiveMonthsInTier
                },
                currentTier,
                nextTier,
                progressToNextTier,
                teamStats: {
                    membersCount: teamMembersCount,
                    teamSales
                },
                commissionStats: {
                    thisMonthEarnings: thisMonthEarnings[0]?.total || 0,
                    pendingCommission: pendingCommission[0]?.total || 0,
                    totalPaid: totalPaid[0]?.total || 0
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching user commission:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi lấy thông tin hoa hồng' },
            { status: 500 }
        );
    }
}

// PATCH - Update user's commission settings
export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await verifyToken();
        if (!session || session.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Không có quyền truy cập' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { userId } = params;
        const body = await request.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy user' },
                { status: 404 }
            );
        }

        // Prepare update object
        const updateData: any = {};

        // Update tier
        if (body.tier) {
            const tierExists = await CommissionTier.findOne({
                name: body.tier,
                isActive: true
            });
            if (!tierExists) {
                return NextResponse.json(
                    { success: false, error: 'Cấp bậc không hợp lệ' },
                    { status: 400 }
                );
            }
            updateData['commissionSettings.tier'] = body.tier;
        }

        // Update personal commission rate
        if (typeof body.personalCommissionRate === 'number') {
            if (body.personalCommissionRate < 0 || body.personalCommissionRate > 100) {
                return NextResponse.json(
                    { success: false, error: 'Tỷ lệ hoa hồng phải từ 0-100%' },
                    { status: 400 }
                );
            }
            updateData['commissionSettings.personalCommissionRate'] = body.personalCommissionRate;
        }

        // Clear personal commission rate
        if (body.clearPersonalRate === true) {
            updateData['commissionSettings.personalCommissionRate'] = undefined;
        }

        // Update manager
        if (body.managerId !== undefined) {
            if (body.managerId === null || body.managerId === '') {
                updateData['commissionSettings.managerId'] = undefined;
            } else {
                const managerExists = await User.findById(body.managerId);
                if (!managerExists) {
                    return NextResponse.json(
                        { success: false, error: 'Không tìm thấy quản lý' },
                        { status: 400 }
                    );
                }
                updateData['commissionSettings.managerId'] = new mongoose.Types.ObjectId(body.managerId);
            }
        }

        // Update team
        if (body.teamId !== undefined) {
            if (body.teamId === null || body.teamId === '') {
                updateData['commissionSettings.teamId'] = undefined;
            } else {
                updateData['commissionSettings.teamId'] = new mongoose.Types.ObjectId(body.teamId);
            }
        }

        // Override team commission flag
        if (typeof body.overrideTeamCommission === 'boolean') {
            updateData['commissionSettings.overrideTeamCommission'] = body.overrideTeamCommission;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        return NextResponse.json({
            success: true,
            message: 'Đã cập nhật cài đặt hoa hồng',
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Error updating user commission:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Lỗi khi cập nhật hoa hồng' },
            { status: 500 }
        );
    }
}
