'use client';

import { useEffect, useState } from 'react';
import { Calculator, Target, TrendingUp, WalletCards, type LucideIcon } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';

interface PayrollAmounts {
    revenue: number;
    achievementPercentage: number;
    baseSalary: number;
    kpiTarget: number;
    commissionRate: number;
    earnedBaseSalary: number;
    excessRevenue: number;
    commissionAmount: number;
    totalSalary: number;
}

interface PayrollResponse {
    configured: boolean;
    amounts?: PayrollAmounts;
    error?: string;
}

export default function StaffPayrollPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [data, setData] = useState<PayrollResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        fetch(`/api/staff/payroll?year=${year}&month=${month}`, {
            cache: 'no-store',
            signal: controller.signal,
        })
            .then(async (response) => {
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || 'Không thể tải bảng lương');
                return payload as PayrollResponse;
            })
            .then((payload) => {
                if (active) setData(payload);
            })
            .catch((error: Error) => {
                if (active && error.name !== 'AbortError') {
                    setData({ configured: false, error: error.message });
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [month, year]);
    const amounts = data?.amounts;

    return <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Calculator className="text-[#9C7044]" /> Lương & KPI của tôi</h1><p className="text-sm text-slate-500 mt-1">Theo dõi doanh thu, mức hoàn thành KPI và thu nhập trong tháng.</p></div>
            <div className="flex gap-2"><select value={month} onChange={(e) => { setLoading(true); setMonth(Number(e.target.value)); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5">{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}</select><input type="number" value={year} onChange={(e) => { setLoading(true); setYear(Number(e.target.value)); }} className="w-28 rounded-xl border border-slate-300 bg-white px-4 py-2.5" /></div>
        </div>
        {loading ? <div className="rounded-2xl bg-white p-16 text-center text-slate-500">Đang tính...</div> : !data?.configured || !amounts ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Target className="mx-auto text-slate-300" size={40} /><h2 className="mt-3 font-bold text-slate-800">{data?.error || 'Chưa có KPI tháng này'}</h2><p className="text-sm text-slate-500 mt-1">Admin chưa cấu hình lương và KPI cho kỳ đã chọn.</p></div> : <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card icon={TrendingUp} label="Doanh thu hợp lệ" value={money(amounts.revenue)} />
                <Card icon={Target} label="Hoàn thành KPI" value={`${amounts.achievementPercentage}%`} />
                <Card icon={WalletCards} label="Hoa hồng vượt KPI" value={money(amounts.commissionAmount)} />
                <Card icon={Calculator} label="Tổng lương" value={money(amounts.totalSalary)} highlight />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">Chi tiết cách tính</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Line label="Lương cứng" value={money(amounts.baseSalary)} /><Line label="KPI doanh thu" value={money(amounts.kpiTarget)} /><Line label="Tỷ lệ hoa hồng" value={`${amounts.commissionRate}%`} /><Line label="Lương theo KPI" value={money(amounts.earnedBaseSalary)} /><Line label="Doanh thu vượt KPI" value={money(amounts.excessRevenue)} /><Line label="Hoa hồng" value={money(amounts.commissionAmount)} /></div>
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Lương theo KPI = Lương cứng × min(Doanh thu/KPI, 100%). Hoa hồng chỉ bắt đầu tính trên phần doanh thu vượt KPI.</p>
            </div>
        </>}
    </div>;
}

function Card({ icon: Icon, label, value, highlight = false }: { icon: LucideIcon; label: string; value: string; highlight?: boolean }) { return <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}><Icon className={highlight ? 'text-amber-700' : 'text-[#9C7044]'} size={22} /><p className="mt-3 text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>; }
function Line({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>; }
