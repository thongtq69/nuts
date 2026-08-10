import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import StaffPayroll from '@/models/StaffPayroll';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { calculatePayrollAmounts } from '@/lib/payroll-formula';
import {
    getStaffEligibleRevenueOrders,
    getStaffMonthlyRevenue,
} from '@/lib/staff-payroll';
import { allocateKpiCommission } from '@/lib/staff-commission-rules';

// Helper to get current user
async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get all collaborators under this staff
        const collaborators = await User.find({
            parentStaff: user._id,
            affiliateLevel: 'collaborator'
        } as any).select('name email referralCode createdAt');

        // Get all referral codes (staff's own + all collaborators')
        const allCodes = [
            user.referralCode,
            ...collaborators.map(c => c.referralCode)
        ].filter(Boolean);

        // Get orders with these referral codes
        const referrers = await User.find({
            referralCode: { $in: allCodes }
        } as any).select('_id referralCode');

        const referrerIds = referrers.map(r => r._id);
        const referrerCodeMap = Object.fromEntries(referrers.map(r => [r._id.toString(), r.referralCode]));

        // Get all orders from team
        const orders = await Order.find({
            referrer: { $in: referrerIds }
        }).sort({ createdAt: -1 }).limit(100);

        // Calculate stats
        const totalOrders = orders.length;
        const teamRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // KPI revenue and commission use the same shared monthly calculation as Admin.
        const now = new Date();
        const bangkokNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const year = bangkokNow.getUTCFullYear();
        const month = bangkokNow.getUTCMonth() + 1;
        const lastMonthDate = new Date(Date.UTC(year, month - 2, 1));
        const lastMonthYear = lastMonthDate.getUTCFullYear();
        const lastMonthNumber = lastMonthDate.getUTCMonth() + 1;
        const [payroll, eligibleOrders, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
            StaffPayroll.findOne({ staffId: user._id, year, month }).lean(),
            getStaffEligibleRevenueOrders(String(user._id), year, month),
            getStaffMonthlyRevenue(String(user._id), year, month),
            getStaffMonthlyRevenue(String(user._id), lastMonthYear, lastMonthNumber),
        ]);
        const payrollAmounts = payroll
            ? calculatePayrollAmounts({
                baseSalary: payroll.baseSalary,
                kpiTarget: payroll.kpiTarget,
                commissionRate: payroll.commissionRate,
                revenue: thisMonthRevenue,
            })
            : null;
        const totalCommission = payrollAmounts?.commissionAmount || 0;
        const pendingCommission = payroll?.status === 'draft' ? totalCommission : 0;
        const allocations = payroll
            ? allocateKpiCommission(eligibleOrders, payroll.kpiTarget, payroll.commissionRate)
            : [];

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const commissionByDate = new Map<string, number>();
        for (const allocation of allocations) {
            const createdAt = new Date(allocation.order.createdAt || 0);
            if (createdAt < sevenDaysAgo || allocation.commissionAmount <= 0) continue;
            const date = createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            commissionByDate.set(date, (commissionByDate.get(date) || 0) + allocation.commissionAmount);
        }
        const commissionData = Array.from(commissionByDate, ([date, commission]) => ({ date, commission }));

        // Get collaborator stats
        const collaboratorStats = await Promise.all(
            collaborators.map(async (collab) => {
                const collabOrders = await Order.find({ referrer: collab._id });
                return {
                    id: collab._id.toString(),
                    name: collab.name,
                    code: collab.referralCode || '',
                    orders: collabOrders.length,
                    revenue: collabOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                };
            })
        );

        return NextResponse.json({
            totalCommission,
            pendingCommission,
            walletBalance: user.walletBalance || 0,
            totalCollaborators: collaborators.length,
            totalOrders,
            teamRevenue,
            thisMonthRevenue,
            lastMonthRevenue,
            commissionData,
            recentCollaborators: collaboratorStats.slice(0, 5)
        });
    } catch (error) {
        console.error('Get staff stats error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
