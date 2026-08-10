import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import StaffPayroll from '@/models/StaffPayroll';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getStaffEligibleRevenueOrders } from '@/lib/staff-payroll';
import {
    allocateKpiCommission,
    getEligibleProductRevenue,
} from '@/lib/staff-commission-rules';

async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_change_me',
        ) as jwt.JwtPayload;
        if (!decoded.id) return null;
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

function getCurrentBangkokPeriod() {
    const bangkokNow = new Date(Date.now() + (7 * 60 * 60 * 1000));
    return {
        year: bangkokNow.getUTCFullYear(),
        month: bangkokNow.getUTCMonth() + 1,
    };
}

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'staff') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const period = getCurrentBangkokPeriod();
        const payroll = await StaffPayroll.findOne({
            staffId: user._id,
            year: period.year,
            month: period.month,
        }).lean();

        if (!payroll) {
            return NextResponse.json({
                ...period,
                configured: false,
                commissions: [],
                stats: { totalPending: 0, totalApproved: 0, totalPaid: 0, totalAll: 0 },
            });
        }

        const orders = await getStaffEligibleRevenueOrders(
            String(user._id),
            period.year,
            period.month,
        );
        const allocations = allocateKpiCommission(
            orders,
            payroll.kpiTarget,
            payroll.commissionRate,
        );
        const commissionStatus = payroll.status === 'paid'
            ? 'paid'
            : payroll.status === 'finalized'
                ? 'approved'
                : 'pending';

        // Orders below KPI are still counted as KPI revenue, but must never appear
        // as earned commission. Only the part crossing the KPI threshold is listed.
        const commissions = allocations
            .filter((allocation) => allocation.commissionAmount > 0)
            .map((allocation) => {
                const order = allocation.order;
                const fullOrderId = String(order._id);
                return {
                    id: `${String(payroll._id)}-${fullOrderId}`,
                    orderId: fullOrderId.slice(-8).toUpperCase(),
                    orderIdFull: fullOrderId,
                    orderValue: getEligibleProductRevenue(order),
                    commissionRate: payroll.commissionRate,
                    commissionAmount: allocation.commissionAmount,
                    commissionableRevenue: allocation.commissionableRevenue,
                    status: commissionStatus,
                    note: `Hoa hồng phần doanh thu vượt KPI tháng ${period.month}/${period.year}`,
                    orderStatus: order.status || 'unknown',
                    orderItems: order.items || [],
                    customerName: order.shippingInfo?.fullName || 'Khách vãng lai',
                    customerPhone: order.shippingInfo?.phone || '',
                    customerAddress: order.shippingInfo
                        ? `${order.shippingInfo.address || ''}, ${order.shippingInfo.district || ''}, ${order.shippingInfo.city || ''}`
                        : '',
                    paymentMethod: order.paymentMethod || 'cod',
                    createdAt: order.createdAt,
                };
            })
            .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

        const totalPending = commissions
            .filter((commission) => commission.status === 'pending')
            .reduce((sum, commission) => sum + commission.commissionAmount, 0);
        const totalApproved = commissions
            .filter((commission) => commission.status === 'approved')
            .reduce((sum, commission) => sum + commission.commissionAmount, 0);
        const totalPaid = commissions
            .filter((commission) => commission.status === 'paid')
            .reduce((sum, commission) => sum + commission.commissionAmount, 0);

        return NextResponse.json({
            ...period,
            configured: true,
            commissions,
            stats: {
                totalPending,
                totalApproved,
                totalPaid,
                totalAll: totalPending + totalApproved + totalPaid,
            },
        });
    } catch (error) {
        console.error('Get staff KPI commissions error:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}
