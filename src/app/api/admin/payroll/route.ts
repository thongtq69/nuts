import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { calculatePayrollAmounts } from '@/lib/payroll-formula';
import { getStaffMonthlyRevenue } from '@/lib/staff-payroll';
import StaffPayroll from '@/models/StaffPayroll';
import User from '@/models/User';

function parsePeriod(request: NextRequest) {
    const today = new Date();
    const year = Number(request.nextUrl.searchParams.get('year') || today.getFullYear());
    const month = Number(request.nextUrl.searchParams.get('month') || today.getMonth() + 1);
    if (!Number.isInteger(year) || year < 2020 || year > 2200 || !Number.isInteger(month) || month < 1 || month > 12) {
        return null;
    }
    return { year, month };
}

export async function GET(request: NextRequest) {
    const auth = await requireAdminAuth();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
    const period = parsePeriod(request);
    if (!period) return NextResponse.json({ error: 'Tháng hoặc năm không hợp lệ' }, { status: 400 });

    await dbConnect();
    const [staffList, configs] = await Promise.all([
        User.find({ role: 'staff' }).select('name email staffCode').sort({ name: 1 }).lean(),
        StaffPayroll.find(period).lean(),
    ]);
    const configByStaff = new Map(configs.map((config) => [String(config.staffId), config]));

    const payrolls = await Promise.all(staffList.map(async (staff) => {
        const config = configByStaff.get(String(staff._id));
        const liveRevenue = await getStaffMonthlyRevenue(String(staff._id), period.year, period.month);
        const calculated = config
            ? calculatePayrollAmounts({
                baseSalary: config.baseSalary,
                kpiTarget: config.kpiTarget,
                commissionRate: config.commissionRate,
                revenue: liveRevenue,
            })
            : null;
        const amounts = config?.status !== 'draft' && config?.snapshot
            ? { ...calculated, ...config.snapshot, revenue: config.snapshot.revenue }
            : calculated;

        return {
            staff: {
                _id: String(staff._id),
                name: staff.name,
                email: staff.email,
                staffCode: staff.staffCode,
            },
            configured: Boolean(config),
            config: config ? {
                baseSalary: config.baseSalary,
                kpiTarget: config.kpiTarget,
                commissionRate: config.commissionRate,
                status: config.status,
                notes: config.notes || '',
            } : null,
            amounts,
            liveRevenue,
        };
    }));

    return NextResponse.json({ ...period, payrolls });
}

export async function PUT(request: NextRequest) {
    const auth = await requireAdminAuth();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
    await dbConnect();

    const body = await request.json();
    const staffId = String(body.staffId || '');
    const year = Number(body.year);
    const month = Number(body.month);
    const baseSalary = Number(body.baseSalary);
    const kpiTarget = Number(body.kpiTarget);
    const commissionRate = Number(body.commissionRate);
    const status = ['draft', 'finalized', 'paid'].includes(body.status) ? body.status : 'draft';

    if (!staffId || !Number.isInteger(year) || year < 2020 || year > 2200
        || !Number.isInteger(month) || month < 1 || month > 12
        || !Number.isFinite(baseSalary) || baseSalary < 0
        || !Number.isFinite(kpiTarget) || kpiTarget <= 0
        || !Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
        return NextResponse.json({ error: 'Dữ liệu lương, KPI hoặc hoa hồng không hợp lệ' }, { status: 400 });
    }

    const staff = await User.findOne({ _id: staffId, role: 'staff' }).select('_id');
    if (!staff) return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 });

    const revenue = await getStaffMonthlyRevenue(staffId, year, month);
    const amounts = calculatePayrollAmounts({ baseSalary, kpiTarget, commissionRate, revenue });
    const snapshot = status === 'draft' ? undefined : {
        revenue: amounts.revenue,
        achievementPercentage: amounts.achievementPercentage,
        kpiShortfallPercentage: amounts.kpiShortfallPercentage,
        earnedBaseSalary: amounts.earnedBaseSalary,
        excessRevenue: amounts.excessRevenue,
        commissionAmount: amounts.commissionAmount,
        totalSalary: amounts.totalSalary,
        calculatedAt: new Date(),
    };

    const payroll = await StaffPayroll.findOneAndUpdate(
        { staffId, year, month },
        {
            $set: {
                baseSalary,
                kpiTarget,
                commissionRate,
                status,
                notes: String(body.notes || '').trim(),
                createdBy: auth.user._id,
                ...(snapshot ? { snapshot } : {}),
            },
            ...(status === 'draft' ? { $unset: { snapshot: 1 } } : {}),
        },
        { upsert: true, new: true, runValidators: true },
    );

    return NextResponse.json({ success: true, payroll, amounts });
}
