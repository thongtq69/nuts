'use client';

import { useCallback, useEffect, useState } from 'react';
import { Gift, RefreshCw, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface WheelForm { enabled: boolean; campaignName: string; campaignStartAt: string; campaignEndAt: string }
interface RecentSpin { _id: string; createdAt: string; prizeValue: number; sequence: number; userId?: { name?: string; email?: string } }
interface AdminWheelData {
    settings: WheelForm & { campaignStartAt?: string; campaignEndAt?: string };
    totals: { qualifyingRevenue: number; spinsGranted: number; spinsUsed: number; availableSpins: number; voucherWinnings: number };
    milestone: { remaining: number; completedCycles: number; drawnCycles: number };
    recentSpins: RecentSpin[];
}

export default function AdminLuckyWheelPage() {
    const toast = useToast();
    const [data, setData] = useState<AdminWheelData | null>(null);
    const [busy, setBusy] = useState('');
    const [form, setForm] = useState<WheelForm>({ enabled: true, campaignName: '', campaignStartAt: '', campaignEndAt: '' });
    const load = useCallback(async () => {
        const response = await fetch('/api/admin/lucky-wheel', { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        setData(result);
        setForm({
            enabled: Boolean(result.settings.enabled),
            campaignName: result.settings.campaignName || '',
            campaignStartAt: result.settings.campaignStartAt ? String(result.settings.campaignStartAt).slice(0, 16) : '',
            campaignEndAt: result.settings.campaignEndAt ? String(result.settings.campaignEndAt).slice(0, 16) : '',
        });
    }, []);
    // Loading is asynchronous; the state changes happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void load(); }, [load]);

    const request = async (method: 'PATCH' | 'POST', body: Record<string, unknown>, action: string) => {
        setBusy(action);
        const response = await fetch('/api/admin/lucky-wheel', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const result = await response.json();
        if (response.ok) toast.success('Thành công', result.message);
        else toast.error('Không thể thực hiện', result.message);
        if (response.ok) await load();
        setBusy('');
    };
    if (!data) return <div className="grid min-h-[50vh] place-items-center">Đang tải cấu hình...</div>;
    const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
    return <div className="mx-auto max-w-7xl space-y-6">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-amber-600">Quyền lợi cố định</p><h1 className="text-3xl font-bold text-slate-900">Quản lý vòng quà tri ân</h1><p className="mt-2 text-slate-600">Không bốc thăm, không ngẫu nhiên: quyền lợi được công bố trước và chỉ phát sinh từ đơn hàng thật đã hoàn tất.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[['Doanh thu hợp lệ', money(data.totals.qualifyingRevenue)], ['Lượt đã cấp / đã dùng', `${data.totals.spinsGranted} / ${data.totals.spinsUsed}`], ['Lượt còn lại', data.totals.availableSpins], ['Tổng voucher đã trúng', money(data.totals.voucherWinnings)]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Gift className="text-amber-500"/><h2 className="text-xl font-bold">Cấu hình chương trình</h2></div><div className="mt-5 space-y-4">
                <label className="block text-sm font-medium">Tên chương trình<input className="mt-1 w-full rounded-lg border p-3" value={form.campaignName} onChange={e => setForm({ ...form, campaignName: e.target.value })}/></label>
                <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Bắt đầu<input type="datetime-local" className="mt-1 w-full rounded-lg border p-3" value={form.campaignStartAt} onChange={e => setForm({ ...form, campaignStartAt: e.target.value })}/></label><label className="text-sm font-medium">Kết thúc<input type="datetime-local" className="mt-1 w-full rounded-lg border p-3" value={form.campaignEndAt} onChange={e => setForm({ ...form, campaignEndAt: e.target.value })}/></label></div>
                <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><input type="checkbox" className="mt-1" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })}/><span><strong>Đang kích hoạt</strong><small className="mt-1 block text-emerald-800">Chương trình là quyền lợi cố định, không có yếu tố may rủi. Admin có thể tạm dừng khi cần.</small></span></label>
                <button disabled={Boolean(busy)} onClick={() => void request('PATCH', { ...form }, 'save')} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50"><Save size={18}/> {busy === 'save' ? 'Đang lưu...' : 'Lưu cấu hình'}</button>
            </div></section>
            <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Sparkles className="text-amber-500"/><h2 className="text-xl font-bold">Mốc doanh thu 1 tỷ đồng</h2></div><div className="mt-5 rounded-xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Còn lại đến mốc tiếp theo</p><p className="mt-1 text-3xl font-black text-amber-600">{money(data.milestone.remaining)}</p><p className="mt-2 text-sm text-slate-600">Đã đạt {data.milestone.completedCycles} mốc, đã thực hiện {data.milestone.drawnCycles} đợt trao quyền lợi.</p></div><p className="mt-4 text-sm text-slate-600">Không chọn ngẫu nhiên. Mỗi mốc trao cho 15 thành viên có tổng mua hàng hợp lệ cao nhất: 10 người đầu nhận voucher 100.000đ, 5 người tiếp theo nhận voucher 50.000đ; đồng hạng ưu tiên đơn hợp lệ sớm hơn.</p><div className="mt-5 flex flex-wrap gap-3"><button disabled={Boolean(busy)} onClick={() => void request('POST', { action: 'reconcile' }, 'reconcile')} className="flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold disabled:opacity-50"><RefreshCw size={18}/> Đồng bộ đơn hợp lệ</button><button disabled={Boolean(busy) || data.milestone.remaining > 0} onClick={() => void request('POST', { action: 'award' }, 'award')} className="rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-900 disabled:opacity-50">Trao quyền lợi theo xếp hạng</button></div></section>
        </div>
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Nhật ký mở quà gần đây</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Thời gian</th><th className="p-3">Khách hàng</th><th className="p-3">Quyền lợi</th><th className="p-3">Thứ tự</th></tr></thead><tbody>{data.recentSpins.map(spin => <tr key={spin._id} className="border-b"><td className="p-3">{new Date(spin.createdAt).toLocaleString('vi-VN')}</td><td className="p-3"><strong>{spin.userId?.name || 'Thành viên'}</strong><br/><span className="text-slate-500">{spin.userId?.email || ''}</span></td><td className="p-3">{spin.prizeValue ? money(spin.prizeValue) : 'Không kèm voucher'}</td><td className="p-3">#{spin.sequence}</td></tr>)}</tbody></table></div></section>
    </div>;
}
