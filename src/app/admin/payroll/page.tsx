'use client';

import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import { Calculator, RefreshCw, Save, Target, TrendingUp, WalletCards, type LucideIcon } from 'lucide-react';

type PayrollStatus = 'draft' | 'finalized' | 'paid';

interface PayrollRow {
    staff: { _id: string; name: string; email: string; staffCode?: string };
    configured: boolean;
    config: { baseSalary: number; kpiTarget: number; commissionRate: number; status: PayrollStatus; notes: string } | null;
    amounts: null | {
        revenue: number;
        achievementPercentage: number;
        kpiShortfallPercentage: number;
        earnedBaseSalary: number;
        excessRevenue: number;
        commissionAmount: number;
        totalSalary: number;
    };
    liveRevenue: number;
}

interface PayrollEdit {
    baseSalary: string;
    kpiTarget: string;
    commissionRate: string;
    status: PayrollStatus;
    notes: string;
}

const money = (value: number) => new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';

export default function AdminPayrollPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [rows, setRows] = useState<PayrollRow[]>([]);
    const [edits, setEdits] = useState<Record<string, PayrollEdit>>({});
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadPayroll = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await fetch(`/api/admin/payroll?year=${year}&month=${month}`, { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Không thể tải bảng lương');
            setRows(data.payrolls || []);
            setEdits(Object.fromEntries((data.payrolls || []).map((row: PayrollRow) => [row.staff._id, {
                baseSalary: row.config ? String(row.config.baseSalary) : '',
                kpiTarget: row.config ? String(row.config.kpiTarget) : '',
                commissionRate: row.config ? String(row.config.commissionRate) : '',
                status: row.config?.status || 'draft',
                notes: row.config?.notes || '',
            }])));
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể tải bảng lương' });
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { loadPayroll(); }, [loadPayroll]);

    const totals = useMemo(() => rows.reduce((sum, row) => ({
        revenue: sum.revenue + (row.amounts?.revenue || row.liveRevenue || 0),
        salary: sum.salary + (row.amounts?.totalSalary || 0),
        commission: sum.commission + (row.amounts?.commissionAmount || 0),
    }), { revenue: 0, salary: 0, commission: 0 }), [rows]);

    const updateEdit = (staffId: string, field: keyof PayrollEdit, value: string) => {
        setEdits((current) => ({ ...current, [staffId]: { ...current[staffId], [field]: value } }));
    };

    const savePayroll = async (staffId: string) => {
        const edit = edits[staffId];
        if (!edit) return;
        setSavingId(staffId);
        setMessage(null);
        try {
            const response = await fetch('/api/admin/payroll', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staffId, year, month,
                    baseSalary: Number(edit.baseSalary),
                    kpiTarget: Number(edit.kpiTarget),
                    commissionRate: Number(edit.commissionRate),
                    status: edit.status,
                    notes: edit.notes,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Không thể lưu bảng lương');
            await loadPayroll();
            setMessage({ type: 'success', text: 'Đã lưu cấu hình và tính lại bảng lương chính xác.' });
        } catch (error) {
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể lưu bảng lương' });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Calculator className="text-amber-600" /> Lương & KPI nhân viên</h1>
                    <p className="text-sm text-slate-500 mt-1">Lương cứng phụ thuộc tỷ lệ hoàn thành KPI; hoa hồng chỉ tính trên doanh thu vượt KPI.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5">
                        {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>)}
                    </select>
                    <input type="number" min="2020" max="2200" value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-28 rounded-xl border border-slate-300 bg-white px-4 py-2.5" />
                    <button onClick={loadPayroll} className="rounded-xl border border-slate-300 bg-white p-2.5 hover:bg-slate-50" aria-label="Tải lại"><RefreshCw size={20} /></button>
                </div>
            </div>

            {message && <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{message.text}</div>}

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard icon={TrendingUp} label="Doanh thu hợp lệ" value={money(totals.revenue)} color="emerald" />
                <SummaryCard icon={WalletCards} label="Tổng lương tạm tính" value={money(totals.salary)} color="amber" />
                <SummaryCard icon={Target} label="Hoa hồng vượt KPI" value={money(totals.commission)} color="blue" />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong>Công thức:</strong> Lương theo KPI = Lương cứng × min(Doanh thu/KPI, 100%). Hoa hồng = max(Doanh thu − KPI, 0) × tỷ lệ hoa hồng. Tổng lương = Lương theo KPI + Hoa hồng.
            </div>

            {loading ? <div className="rounded-2xl bg-white p-16 text-center text-slate-500">Đang tính bảng lương...</div> : (
                <div className="space-y-4">
                    {rows.length === 0 && <div className="rounded-2xl bg-white p-16 text-center text-slate-500">Chưa có nhân viên.</div>}
                    {rows.map((row) => {
                        const edit = edits[row.staff._id];
                        return (
                            <section key={row.staff._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="min-w-[220px]">
                                        <h2 className="font-bold text-slate-900">{row.staff.name}</h2>
                                        <p className="text-sm text-slate-500">{row.staff.staffCode || 'Chưa có mã'} · {row.staff.email}</p>
                                        <p className="mt-3 text-sm">Doanh thu tháng: <strong className="text-emerald-700">{money(row.liveRevenue)}</strong></p>
                                    </div>
                                    {edit && <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                        <Field label="Lương cứng"><input type="number" min="0" value={edit.baseSalary} onChange={(e) => updateEdit(row.staff._id, 'baseSalary', e.target.value)} /></Field>
                                        <Field label="KPI doanh thu"><input type="number" min="1" value={edit.kpiTarget} onChange={(e) => updateEdit(row.staff._id, 'kpiTarget', e.target.value)} /></Field>
                                        <Field label="Hoa hồng vượt KPI (%)"><input type="number" min="0" max="100" step="0.01" value={edit.commissionRate} onChange={(e) => updateEdit(row.staff._id, 'commissionRate', e.target.value)} /></Field>
                                        <Field label="Trạng thái"><select value={edit.status} onChange={(e) => updateEdit(row.staff._id, 'status', e.target.value)}><option value="draft">Tạm tính</option><option value="finalized">Đã chốt</option><option value="paid">Đã thanh toán</option></select></Field>
                                        <button onClick={() => savePayroll(row.staff._id)} disabled={savingId === row.staff._id} className="mt-auto flex h-[42px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"><Save size={17} />{savingId === row.staff._id ? 'Đang lưu' : 'Lưu'}</button>
                                    </div>}
                                </div>
                                {row.amounts && <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-5">
                                    <Metric label="Hoàn thành KPI" value={`${row.amounts.achievementPercentage}%`} />
                                    <Metric label="Lương theo KPI" value={money(row.amounts.earnedBaseSalary)} />
                                    <Metric label="Doanh thu vượt KPI" value={money(row.amounts.excessRevenue)} />
                                    <Metric label="Hoa hồng" value={money(row.amounts.commissionAmount)} />
                                    <Metric label="Tổng lương" value={money(row.amounts.totalSalary)} highlight />
                                </div>}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactElement<{ className?: string }> }) {
    return <label className="text-xs font-semibold text-slate-600">{label}{cloneElement(children, { className: 'mt-1.5 h-[42px] w-full rounded-xl border border-slate-300 px-3 text-sm font-normal outline-none focus:border-amber-500' })}</label>;
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return <div className={`rounded-xl p-3 ${highlight ? 'bg-amber-100' : 'bg-slate-50'}`}><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 font-bold ${highlight ? 'text-amber-800' : 'text-slate-900'}`}>{value}</p></div>;
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: 'emerald' | 'amber' | 'blue' }) {
    const colors = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' };
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4"><div className={`rounded-xl p-3 ${colors[color]}`}><Icon size={22} /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div></div>;
}
