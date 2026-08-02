import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireStaffAuth } from '@/lib/auth-permissions';
import { calculatePayrollAmounts } from '@/lib/payroll-formula';
import { getStaffMonthlyRevenue } from '@/lib/staff-payroll';
import StaffPayroll from '@/models/StaffPayroll';

export async function GET(request: NextRequest) {
    const auth = await requireStaffAuth();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (auth.user.role !== 'staff') {
        return NextResponse.json({ error: 'Chỉ tài khoản nhân viên được xem bảng lương cá nhân' }, { status: 403 });
    }

    const today = new Date();
    const year = Number(request.nextUrl.searchParams.get('year') || today.getFullYear());
    const month = Number(request.nextUrl.searchParams.get('month') || today.getMonth() + 1);
    if (!Number.isInteger(year) || year < 2020 || year > 2200 || !Number.isInteger(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: 'Tháng hoặc năm không hợp lệ' }, { status: 400 });
    }

    await dbConnect();
    const config = await StaffPayroll.findOne({ staffId: auth.user._id, year, month }).lean();
    if (!config) return NextResponse.json({ year, month, configured: false });

    const liveRevenue = await getStaffMonthlyRevenue(auth.user._id, year, month);
    const calculated = calculatePayrollAmounts({
        baseSalary: config.baseSalary,
        kpiTarget: config.kpiTarget,
        commissionRate: config.commissionRate,
        revenue: liveRevenue,
    });
    const amounts = config.status !== 'draft' && config.snapshot
        ? { ...calculated, ...config.snapshot, revenue: config.snapshot.revenue }
        : calculated;

    return NextResponse.json({
        year,
        month,
        configured: true,
        status: config.status,
        notes: config.notes || '',
        amounts,
        liveRevenue,
    });
}
