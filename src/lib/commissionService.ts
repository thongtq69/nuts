import mongoose from 'mongoose';
import User, { IUser } from '@/models/User';
import CommissionTier, { ICommissionTier } from '@/models/CommissionTier';
import CommissionTransaction from '@/models/CommissionTransaction';
import Team from '@/models/Team';

interface OrderInput {
    _id: mongoose.Types.ObjectId;
    orderNumber: string;
    totalAmount: number;
    userId: mongoose.Types.ObjectId;
    userName?: string;
    userEmail?: string;
}

export class CommissionService {
    /**
     * Calculate and create commission transactions for an order
     */
    async calculateCommission(order: OrderInput): Promise<void> {
        const now = new Date();
        const periodYear = now.getFullYear();
        const periodMonth = now.getMonth() + 1;

        // 1. Calculate direct sale commission
        await this.calculateDirectCommission(order, periodYear, periodMonth);

        // 2. Calculate team L1 commission (manager)
        await this.calculateTeamL1Commission(order, periodYear, periodMonth);

        // 3. Calculate team L2 commission (manager's manager)
        await this.calculateTeamL2Commission(order, periodYear, periodMonth);

        // 4. Update user performance metrics
        await this.updateUserPerformance(order.userId, order.totalAmount);

        // 5. Check for tier promotion
        await this.checkAndPromoteTier(order.userId);
    }

    /**
     * Calculate direct sale commission for the order owner
     */
    private async calculateDirectCommission(
        order: OrderInput,
        periodYear: number,
        periodMonth: number
    ): Promise<void> {
        const user = await User.findById(order.userId);
        if (!user) return;

        // Skip if user is not a sale/staff with commission
        if (!['sale', 'staff'].includes(user.role)) return;

        const tier = await this.getUserTier(user);
        if (!tier) return;

        // Use personal rate if set, otherwise use tier rate
        const rate = user.commissionSettings?.personalCommissionRate ?? tier.commissionRates.directSale;
        const commissionAmount = Math.round(order.totalAmount * (rate / 100));

        if (commissionAmount <= 0) return;

        await CommissionTransaction.create({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userRole: user.role,
            userTier: user.commissionSettings?.tier || 'bronze',
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderTotal: order.totalAmount,
            commissionType: 'direct_sale',
            commissionRate: rate,
            commissionAmount,
            currency: 'VND',
            periodYear,
            periodMonth,
            status: 'pending'
        });
    }

    /**
     * Calculate team L1 commission for the user's manager
     */
    private async calculateTeamL1Commission(
        order: OrderInput,
        periodYear: number,
        periodMonth: number
    ): Promise<void> {
        const user = await User.findById(order.userId);
        if (!user || !user.commissionSettings?.managerId) return;

        const manager = await User.findById(user.commissionSettings.managerId);
        if (!manager) return;

        // Ensure only sale/staff get team commission
        if (!['sale', 'staff'].includes(manager.role)) return;

        const managerTier = await this.getUserTier(manager);
        if (!managerTier || managerTier.commissionRates.teamSaleL1 <= 0) return;


        const rate = managerTier.commissionRates.teamSaleL1;
        const commissionAmount = Math.round(order.totalAmount * (rate / 100));

        if (commissionAmount <= 0) return;

        await CommissionTransaction.create({
            userId: manager._id,
            userName: manager.name,
            userEmail: manager.email,
            userRole: manager.role,
            userTier: manager.commissionSettings?.tier || 'bronze',
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderTotal: order.totalAmount,
            commissionType: 'team_sale_l1',
            commissionRate: rate,
            commissionAmount,
            currency: 'VND',
            sourceUserId: new mongoose.Types.ObjectId(user._id as string),
            sourceUserName: user.name,
            sourceUserTier: user.commissionSettings?.tier || 'bronze',
            teamId: user.commissionSettings?.teamId as any,
            periodYear,
            periodMonth,
            status: 'pending'
        });

    }

    /**
     * Calculate team L2 commission for the manager's manager
     */
    private async calculateTeamL2Commission(
        order: OrderInput,
        periodYear: number,
        periodMonth: number
    ): Promise<void> {
        const user = await User.findById(order.userId);
        if (!user || !user.commissionSettings?.managerId) return;

        const manager = await User.findById(user.commissionSettings.managerId);
        if (!manager || !manager.commissionSettings?.managerId) return;

        const l2Manager = await User.findById(manager.commissionSettings.managerId);
        if (!l2Manager) return;

        // Ensure only sale/staff get team commission
        if (!['sale', 'staff'].includes(l2Manager.role)) return;

        const l2Tier = await this.getUserTier(l2Manager);
        if (!l2Tier || !l2Tier.commissionRates.teamSaleL2 || l2Tier.commissionRates.teamSaleL2 <= 0) return;


        const rate = l2Tier.commissionRates.teamSaleL2;
        const commissionAmount = Math.round(order.totalAmount * (rate / 100));

        if (commissionAmount <= 0) return;

        await CommissionTransaction.create({
            userId: l2Manager._id,
            userName: l2Manager.name,
            userEmail: l2Manager.email,
            userRole: l2Manager.role,
            userTier: l2Manager.commissionSettings?.tier || 'bronze',
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderTotal: order.totalAmount,
            commissionType: 'team_sale_l2',
            commissionRate: rate,
            commissionAmount,
            currency: 'VND',
            sourceUserId: new mongoose.Types.ObjectId(user._id as string),
            sourceUserName: user.name,
            sourceUserTier: user.commissionSettings?.tier || 'bronze',
            periodYear,
            periodMonth,
            status: 'pending'
        });

    }

    /**
     * Get user's commission tier
     */
    private async getUserTier(user: IUser): Promise<ICommissionTier | null> {
        const tierName = user.commissionSettings?.tier || 'bronze';
        return CommissionTier.findOne({ name: tierName, isActive: true });
    }

    /**
     * Update user's performance metrics
     */
    private async updateUserPerformance(
        userId: mongoose.Types.ObjectId,
        orderAmount: number
    ): Promise<void> {
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'performance.currentMonthSales': orderAmount,
                'performance.currentMonthOrders': 1,
                'performance.totalSales': orderAmount,
                'performance.totalOrders': 1
            }
        });

        // Also update team performance if user is in a team
        const user = await User.findById(userId);
        if (user?.commissionSettings?.teamId) {
            await Team.findByIdAndUpdate(user.commissionSettings.teamId, {
                $inc: {
                    'performance.currentMonthSales': orderAmount,
                    'performance.currentMonthOrders': 1,
                    'performance.totalSales': orderAmount,
                    'performance.totalOrders': 1
                }
            });
        }
    }

    /**
     * Check if user qualifies for tier promotion
     */
    async checkAndPromoteTier(userId: mongoose.Types.ObjectId): Promise<boolean> {
        const user = await User.findById(userId);
        if (!user) return false;

        const currentTierName = user.commissionSettings?.tier || 'bronze';
        const currentTier = await CommissionTier.findOne({ name: currentTierName });
        if (!currentTier) return false;

        // Find next tier
        const nextTier = await CommissionTier.findOne({
            order: { $gt: currentTier.order },
            isActive: true
        }).sort({ order: 1 });

        if (!nextTier) return false;

        // Check if user meets requirements
        const meetsRequirements = await this.checkTierRequirements(user, nextTier);

        if (meetsRequirements) {
            // Promote user
            await User.findByIdAndUpdate(userId, {
                'commissionSettings.tier': nextTier.name,
                lastPromotionAt: new Date(),
                consecutiveMonthsInTier: 0
            });

            // Create bonus transaction if applicable
            if (nextTier.benefits.monthlyBonus && nextTier.benefits.monthlyBonus > 0) {
                const now = new Date();
                await CommissionTransaction.create({
                    userId: user._id,
                    userName: user.name,
                    userEmail: user.email,
                    userRole: user.role,
                    userTier: nextTier.name,
                    commissionType: 'kpi_bonus',
                    commissionRate: 0,
                    commissionAmount: nextTier.benefits.monthlyBonus,
                    currency: 'VND',
                    periodYear: now.getFullYear(),
                    periodMonth: now.getMonth() + 1,
                    status: 'pending',
                    notes: `Thưởng thăng hạng lên ${nextTier.displayName}`
                });
            }

            return true;
        }

        return false;
    }

    /**
     * Check if user meets tier requirements
     */
    private async checkTierRequirements(
        user: IUser,
        tier: ICommissionTier
    ): Promise<boolean> {
        const reqs = tier.requirements;
        const perf = user.performance || {
            currentMonthSales: 0,
            currentMonthOrders: 0,
            currentMonthNewCustomers: 0,
            totalSales: 0,
            totalOrders: 0
        };

        // Check monthly sales
        if (reqs.minMonthlySales && perf.currentMonthSales < reqs.minMonthlySales) {
            return false;
        }

        // Check monthly orders
        if (reqs.minMonthlyOrders && perf.currentMonthOrders < reqs.minMonthlyOrders) {
            return false;
        }

        // Check team size
        if (reqs.minTeamSize && reqs.minTeamSize > 0) {
            const teamSize = await User.countDocuments({
                'commissionSettings.managerId': new mongoose.Types.ObjectId(user._id as string),
                role: { $in: ['sale', 'staff'] }
            } as any);
            if (teamSize < reqs.minTeamSize) {
                return false;
            }
        }


        // Check team sales
        if (reqs.minTeamSales && reqs.minTeamSales > 0) {
            const teamMembers = await User.find({
                'commissionSettings.managerId': new mongoose.Types.ObjectId(user._id as string)
            } as any);
            const teamSales = teamMembers.reduce(
                (sum, m) => sum + (m.performance?.currentMonthSales || 0),
                0
            );
            if (teamSales < reqs.minTeamSales) {
                return false;
            }
        }


        // Check consecutive months (only if > 1)
        if (reqs.consecutiveMonths && reqs.consecutiveMonths > 1) {
            const consecutiveMonths = user.consecutiveMonthsInTier || 0;
            if (consecutiveMonths < reqs.consecutiveMonths - 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get commission summary for a user
     */
    async getUserCommissionSummary(
        userId: string,
        year?: number,
        month?: number
    ): Promise<{
        totalPending: number;
        totalApproved: number;
        totalPaid: number;
        thisMonthEarnings: number;
        transactions: any[];
    }> {
        const now = new Date();
        const currentYear = year || now.getFullYear();
        const currentMonth = month || now.getMonth() + 1;

        const [pending, approved, paid, thisMonth, transactions] = await Promise.all([
            CommissionTransaction.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'pending' } },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ]),
            CommissionTransaction.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'approved' } },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ]),
            CommissionTransaction.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ]),
            CommissionTransaction.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        periodYear: currentYear,
                        periodMonth: currentMonth
                    }
                },
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
            ]),
            CommissionTransaction.find({ userId })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean()
        ]);

        return {
            totalPending: pending[0]?.total || 0,
            totalApproved: approved[0]?.total || 0,
            totalPaid: paid[0]?.total || 0,
            thisMonthEarnings: thisMonth[0]?.total || 0,
            transactions
        };
    }

    /**
     * Approve commission transactions
     */
    async approveTransactions(
        transactionIds: string[],
        approvedBy: { id: string; name: string }
    ): Promise<number> {
        const result = await CommissionTransaction.updateMany(
            {
                _id: { $in: transactionIds.map(id => new mongoose.Types.ObjectId(id)) },
                status: 'pending'
            },
            {
                status: 'approved',
                approvedBy: new mongoose.Types.ObjectId(approvedBy.id),
                approvedByName: approvedBy.name,
                approvedAt: new Date()
            }
        );

        return result.modifiedCount;
    }

    /**
     * Mark transactions as paid
     */
    async markAsPaid(
        transactionIds: string[],
        paymentInfo: { method: string; reference: string; batch?: string }
    ): Promise<number> {
        const result = await CommissionTransaction.updateMany(
            {
                _id: { $in: transactionIds.map(id => new mongoose.Types.ObjectId(id)) },
                status: 'approved'
            },
            {
                status: 'paid',
                paidAt: new Date(),
                paymentMethod: paymentInfo.method,
                paymentReference: paymentInfo.reference,
                paymentBatch: paymentInfo.batch
            }
        );

        // Update user wallet balances
        for (const txId of transactionIds) {
            const tx = await CommissionTransaction.findById(txId);
            if (tx) {
                await User.findByIdAndUpdate(tx.userId, {
                    $inc: { totalCommission: tx.commissionAmount }
                });
            }
        }

        return result.modifiedCount;
    }

    /**
     * Reset monthly performance (should be called by cron job)
     */
    async resetMonthlyPerformance(): Promise<void> {
        // Increment consecutive months for users who maintained their tier
        await User.updateMany(
            { 'commissionSettings.tier': { $exists: true } },
            {
                $inc: { consecutiveMonthsInTier: 1 },
                $set: {
                    'performance.currentMonthSales': 0,
                    'performance.currentMonthOrders': 0,
                    'performance.currentMonthNewCustomers': 0,
                    'performance.lastResetAt': new Date()
                }
            }
        );

        // Reset team performance
        await Team.updateMany(
            {},
            {
                $set: {
                    'performance.currentMonthSales': 0,
                    'performance.currentMonthOrders': 0,
                    'performance.currentMonthNewMembers': 0
                }
            }
        );
    }
}

// Export singleton instance
export const commissionService = new CommissionService();
