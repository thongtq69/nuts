'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Gift, Minus, Plus, Save, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface WheelSegment { label: string; value: number; color: string }
interface MilestoneReward { value: number; count: number }
interface WheelForm {
    enabled: boolean;
    campaignName: string;
    memberBadgeText: string;
    introText: string;
    inactiveMessage: string;
    spinButtonText: string;
    totalWinningsLabel: string;
    balanceLabel: string;
    topUpTitle: string;
    withdrawalTitle: string;
    termsTitle: string;
    historyTitle: string;
    campaignStartAt: string;
    campaignEndAt: string;
    minimumTopUp: number;
    spinsPerTopUpUnit: number;
    minimumWithdrawal: number;
    milestoneTopUps: number;
    topUpOptions: number[];
    regularSpinPrizes: number[];
    wheelSegments: WheelSegment[];
    terms: string[];
    milestoneRewards: MilestoneReward[];
}
interface RecentSpin { _id: string; createdAt: string; prizeValue: number; sequence: number; isTest?: boolean; userId?: { name?: string; email?: string } }
interface Withdrawal { _id: string; amount: number; status: 'pending' | 'paid' | 'rejected'; bankName: string; accountNumber: string; accountName: string; payoutReference?: string; bankTransactionId?: string; bankVerifiedAt?: string; createdAt?: string; note?: string; userId?: { name?: string; email?: string } }
interface MemberAccount { _id: string; availableSpins: number; prizeBalance: number; pendingWithdrawal: number; lifetimeWinnings: number; userId?: { _id?: string; name?: string; email?: string } }
interface AdminWheelData {
    settings: Omit<WheelForm, 'campaignStartAt' | 'campaignEndAt'> & { campaignStartAt?: string; campaignEndAt?: string };
    totals: { topUpRevenue: number; paidTopUps: number; spinsGranted: number; spinsUsed: number; availableSpins: number; voucherWinnings: number };
    milestone: { remaining: number; completedCycles: number; drawnCycles: number };
    recentSpins: RecentSpin[];
    withdrawals: Withdrawal[];
    memberAccounts: MemberAccount[];
}

const emptyForm: WheelForm = {
    enabled: true,
    campaignName: '', memberBadgeText: '', introText: '', inactiveMessage: '', spinButtonText: '',
    totalWinningsLabel: '', balanceLabel: '', topUpTitle: '', withdrawalTitle: '', termsTitle: '', historyTitle: '',
    campaignStartAt: '', campaignEndAt: '', minimumTopUp: 10_000, spinsPerTopUpUnit: 5,
    minimumWithdrawal: 100_000, milestoneTopUps: 1_000_000, topUpOptions: [], regularSpinPrizes: [],
    wheelSegments: [], terms: [], milestoneRewards: [],
};

const fieldClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100';
const labelClass = 'block text-sm font-semibold text-slate-700';

export default function AdminLuckyWheelPage() {
    const toast = useToast();
    const [data, setData] = useState<AdminWheelData | null>(null);
    const [busy, setBusy] = useState('');
    const [form, setForm] = useState<WheelForm>(emptyForm);
    const [settlingWithdrawal, setSettlingWithdrawal] = useState<Withdrawal | null>(null);
    const [settlementForm, setSettlementForm] = useState({ bankTransactionId: '', note: '' });
    const load = useCallback(async () => {
        const response = await fetch('/api/admin/lucky-wheel', { cache: 'no-store' });
        if (!response.ok) return;
        const result: AdminWheelData = await response.json();
        setData(result);
        setForm({
            ...result.settings,
            campaignStartAt: result.settings.campaignStartAt ? String(result.settings.campaignStartAt).slice(0, 16) : '',
            campaignEndAt: result.settings.campaignEndAt ? String(result.settings.campaignEndAt).slice(0, 16) : '',
            topUpOptions: [...(result.settings.topUpOptions || [])],
            regularSpinPrizes: [...(result.settings.regularSpinPrizes || [])],
            wheelSegments: (result.settings.wheelSegments || []).map(segment => ({ label: segment.label, value: segment.value, color: segment.color })),
            terms: [...(result.settings.terms || [])],
            milestoneRewards: (result.settings.milestoneRewards || []).map(reward => ({ value: reward.value, count: reward.count })),
        });
    }, []);
    useEffect(() => { void load(); }, [load]);

    const request = async (method: 'PATCH' | 'POST', body: Record<string, unknown>, action: string): Promise<boolean> => {
        setBusy(action);
        try {
            const response = await fetch('/api/admin/lucky-wheel', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const result = await response.json().catch(() => ({ message: 'Máy chủ trả về dữ liệu không hợp lệ.' }));
            if (response.ok) {
                toast.success('Thành công', result.message);
                await load();
                return true;
            }
            toast.error('Không thể thực hiện', result.message);
        } catch {
            toast.error('Không thể thực hiện', 'Không thể kết nối máy chủ, vui lòng thử lại.');
        } finally {
            setBusy('');
        }
        return false;
    };

    const verifyWithdrawal = async () => {
        if (!settlingWithdrawal) return;
        const succeeded = await request('POST', {
            action: 'withdrawal-verify-paid',
            withdrawalId: settlingWithdrawal._id,
            bankTransactionId: settlementForm.bankTransactionId,
            note: settlementForm.note,
        }, `paid-${settlingWithdrawal._id}`);
        if (succeeded) {
            setSettlingWithdrawal(null);
            setSettlementForm({ bankTransactionId: '', note: '' });
        }
    };

    const updateText = (field: keyof WheelForm, value: string | number | boolean) => setForm(current => ({ ...current, [field]: value }));
    const updateSegment = (index: number, patch: Partial<WheelSegment>) => setForm(current => {
        const previousValue = current.wheelSegments[index]?.value;
        return {
            ...current,
            wheelSegments: current.wheelSegments.map((segment, itemIndex) => itemIndex === index ? { ...segment, ...patch } : segment),
            regularSpinPrizes: patch.value !== undefined && patch.value !== previousValue
                ? current.regularSpinPrizes.map(value => value === previousValue ? patch.value as number : value)
                : current.regularSpinPrizes,
        };
    });
    const updateReward = (index: number, patch: Partial<MilestoneReward>) => setForm(current => ({ ...current, milestoneRewards: current.milestoneRewards.map((reward, itemIndex) => itemIndex === index ? { ...reward, ...patch } : reward) }));
    const updateMember = (id: string, field: 'availableSpins' | 'prizeBalance' | 'lifetimeWinnings', value: number) => setData(current => current ? ({ ...current, memberAccounts: current.memberAccounts.map(account => account._id === id ? { ...account, [field]: value } : account) }) : current);
    const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;
    const withdrawalStatus = (status: Withdrawal['status']) => status === 'paid'
        ? { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-700' }
        : status === 'rejected'
            ? { label: 'Đã từ chối', className: 'bg-red-100 text-red-700' }
            : { label: 'Chờ chuyển khoản', className: 'bg-amber-100 text-amber-700' };
    if (!data) return <div className="grid min-h-[50vh] place-items-center">Đang tải cấu hình...</div>;

    const milestoneDescription = form.milestoneRewards.map(reward => `${reward.count} người nhận ${money(reward.value)}`).join(' và ');
    const totalMilestoneWinners = form.milestoneRewards.reduce((sum, reward) => sum + Number(reward.count || 0), 0);

    return <div className="mx-auto max-w-7xl space-y-6 pb-10">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-amber-600">Vòng quay thành viên</p><h1 className="text-3xl font-bold text-slate-900">Quản lý vòng quay may mắn</h1><p className="mt-2 text-slate-600">Mọi nội dung bên dưới được đồng bộ trực tiếp ra trang vòng quay sau khi lưu. Lượt quay vẫn tách biệt hoàn toàn với đơn hàng.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[["Tiền nạp vòng quay", money(data.totals.topUpRevenue)], ['Lượt đã cấp / đã dùng', `${data.totals.spinsGranted} / ${data.totals.spinsUsed}`], ['Số lần nạp thành công', data.totals.paidTopUps], ['Tổng tiền đã trúng', money(data.totals.voucherWinnings)]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}
        </div>

        <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><Gift className="text-amber-500"/><div><h2 className="text-xl font-bold">Nội dung hiển thị trên website</h2><p className="text-sm text-slate-500">Tên, mô tả và toàn bộ nhãn trên trang thành viên.</p></div></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className={labelClass}>Tên chương trình<input className={fieldClass} value={form.campaignName} onChange={e => updateText('campaignName', e.target.value)}/></label>
                <label className={labelClass}>Nhãn thành viên<input className={fieldClass} value={form.memberBadgeText} onChange={e => updateText('memberBadgeText', e.target.value)}/></label>
                <label className={`${labelClass} md:col-span-2`}>Mô tả giới thiệu<textarea rows={3} className={fieldClass} value={form.introText} onChange={e => updateText('introText', e.target.value)}/></label>
                <label className={`${labelClass} md:col-span-2`}>Thông báo khi tạm dừng<input className={fieldClass} value={form.inactiveMessage} onChange={e => updateText('inactiveMessage', e.target.value)}/></label>
                {([
                    ['spinButtonText', 'Chữ trên nút quay'], ['totalWinningsLabel', 'Nhãn tổng tiền đã trúng'],
                    ['balanceLabel', 'Nhãn số dư thưởng'], ['topUpTitle', 'Tiêu đề nạp lượt'],
                    ['withdrawalTitle', 'Tiêu đề rút tiền'], ['termsTitle', 'Tiêu đề thể lệ'],
                    ['historyTitle', 'Tiêu đề lịch sử'],
                ] as [keyof WheelForm, string][]).map(([field, label]) => <label key={field} className={labelClass}>{label}<input className={fieldClass} value={String(form[field])} onChange={e => updateText(field, e.target.value)}/></label>)}
            </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
            <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-xl font-bold">Quy đổi, thời gian và trạng thái</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>Bắt đầu<input type="datetime-local" className={fieldClass} value={form.campaignStartAt} onChange={e => updateText('campaignStartAt', e.target.value)}/></label>
                    <label className={labelClass}>Kết thúc<input type="datetime-local" className={fieldClass} value={form.campaignEndAt} onChange={e => updateText('campaignEndAt', e.target.value)}/></label>
                    <label className={labelClass}>Mức nạp cơ sở (đ)<input type="number" min={1000} step={1000} className={fieldClass} value={form.minimumTopUp} onChange={e => updateText('minimumTopUp', Number(e.target.value))}/><small className="mt-1 block font-normal text-slate-500">Mọi mức nạp nhanh phải là bội số của số này.</small></label>
                    <label className={labelClass}>Số lượt / mức nạp cơ sở<input type="number" min={1} max={100} className={fieldClass} value={form.spinsPerTopUpUnit} onChange={e => updateText('spinsPerTopUpUnit', Number(e.target.value))}/></label>
                    <label className={labelClass}>Số tiền rút tối thiểu (đ)<input type="number" min={1000} step={1000} className={fieldClass} value={form.minimumWithdrawal} onChange={e => updateText('minimumWithdrawal', Number(e.target.value))}/></label>
                    <label className={labelClass}>Mốc số lần nạp thành công<input type="number" min={1} className={fieldClass} value={form.milestoneTopUps} onChange={e => updateText('milestoneTopUps', Number(e.target.value))}/></label>
                </div>
                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><input type="checkbox" className="mt-1 h-4 w-4" checked={form.enabled} onChange={e => updateText('enabled', e.target.checked)}/><span><strong>Đang kích hoạt</strong><small className="mt-1 block text-emerald-800">Bỏ chọn để tạm dừng nhận nạp và quay thưởng.</small></span></label>
            </section>

            <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Các nút nạp nhanh</h2><p className="text-sm text-slate-500">Tối đa 8 mức tiền.</p></div><button type="button" disabled={form.topUpOptions.length >= 8} onClick={() => setForm(current => ({ ...current, topUpOptions: [...current.topUpOptions, current.minimumTopUp] }))} className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-40"><Plus size={16} className="inline"/> Thêm</button></div>
                <div className="mt-5 space-y-3">{form.topUpOptions.map((amount, index) => <div key={index} className="flex items-center gap-2"><input aria-label={`Mức nạp ${index + 1}`} type="number" min={form.minimumTopUp} step={form.minimumTopUp} className={`${fieldClass} mt-0`} value={amount} onChange={e => setForm(current => ({ ...current, topUpOptions: current.topUpOptions.map((item, itemIndex) => itemIndex === index ? Number(e.target.value) : item) }))}/><button type="button" aria-label="Xóa mức nạp" disabled={form.topUpOptions.length <= 1} onClick={() => setForm(current => ({ ...current, topUpOptions: current.topUpOptions.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-xl border border-red-200 p-3 text-red-600 disabled:opacity-30"><Minus size={18}/></button></div>)}</div>
                <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Ví dụ: nạp <strong>{money(form.minimumTopUp)}</strong> nhận <strong>{form.spinsPerTopUpUnit} lượt</strong>. Mua hàng không làm phát sinh lượt quay.</div>
            </section>
        </div>

        <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
            <div><h2 className="text-xl font-bold">6 ô giải thưởng trên vòng quay</h2><p className="mt-1 text-sm text-slate-500">Sửa tên hiển thị, giá trị tiền và màu từng ô. Giá trị 0 là “chúc may mắn”.</p></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{form.wheelSegments.map((segment, index) => <div key={index} className="rounded-2xl border p-4"><div className="mb-3 flex items-center gap-2"><span className="h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: segment.color }}/><strong>Ô {index + 1}</strong></div><label className={labelClass}>Tên giải<input className={fieldClass} value={segment.label} onChange={e => updateSegment(index, { label: e.target.value })}/></label><div className="mt-3 grid grid-cols-[1fr_64px] gap-3"><label className={labelClass}>Giá trị (đ)<input type="number" min={0} step={1000} className={fieldClass} value={segment.value} onChange={e => updateSegment(index, { value: Number(e.target.value) })}/></label><label className={labelClass}>Màu<input aria-label={`Màu ô ${index + 1}`} type="color" className="mt-1 h-[46px] w-full rounded-lg border bg-white p-1" value={segment.color} onChange={e => updateSegment(index, { color: e.target.value })}/></label></div></div>)}</div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Cơ cấu quay thông thường</h2><p className="text-sm text-slate-500">Hệ thống lặp lại tuần tự danh sách này cho từng người chơi.</p></div><button type="button" disabled={form.regularSpinPrizes.length >= 100} onClick={() => setForm(current => ({ ...current, regularSpinPrizes: [...current.regularSpinPrizes, current.wheelSegments[0]?.value || 0] }))} className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-40"><Plus size={16} className="inline"/> Thêm lượt</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{form.regularSpinPrizes.map((prize, index) => <div key={index} className="flex items-center gap-2"><span className="w-16 text-sm font-bold text-slate-500">Lượt {index + 1}</span><select aria-label={`Giải lượt ${index + 1}`} className={`${fieldClass} mt-0`} value={prize} onChange={e => setForm(current => ({ ...current, regularSpinPrizes: current.regularSpinPrizes.map((item, itemIndex) => itemIndex === index ? Number(e.target.value) : item) }))}>{form.wheelSegments.map((segment, segmentIndex) => <option key={`${segment.value}-${segmentIndex}`} value={segment.value}>{segment.label} ({money(segment.value)})</option>)}</select><button type="button" aria-label="Xóa lượt" disabled={form.regularSpinPrizes.length <= 1} onClick={() => setForm(current => ({ ...current, regularSpinPrizes: current.regularSpinPrizes.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-xl border border-red-200 p-3 text-red-600 disabled:opacity-30"><Minus size={18}/></button></div>)}</div></section>

            <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Thể lệ hiển thị</h2><p className="mt-1 text-sm text-slate-500">Mỗi dòng sẽ là một gạch đầu dòng trên website (tối đa 10 dòng).</p><textarea rows={11} className={`${fieldClass} mt-5`} value={form.terms.join('\n')} onChange={e => setForm(current => ({ ...current, terms: e.target.value.split('\n') }))}/></section>
        </div>

        <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><Sparkles className="text-amber-500"/><div><h2 className="text-xl font-bold">Thưởng khi đạt mốc</h2><p className="text-sm text-slate-500">Chọn ngẫu nhiên trong các thành viên đã nạp thành công.</p></div></div><button type="button" disabled={form.milestoneRewards.length >= 5} onClick={() => setForm(current => ({ ...current, milestoneRewards: [...current.milestoneRewards, { value: 10_000, count: 1 }] }))} className="rounded-xl border px-3 py-2 text-sm font-bold disabled:opacity-40"><Plus size={16} className="inline"/> Thêm nhóm giải</button></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">{form.milestoneRewards.map((reward, index) => <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3 rounded-2xl border p-4"><label className={labelClass}>Tiền thưởng / người<input type="number" min={0} step={1000} className={fieldClass} value={reward.value} onChange={e => updateReward(index, { value: Number(e.target.value) })}/></label><label className={labelClass}>Số người trúng<input type="number" min={1} max={100} className={fieldClass} value={reward.count} onChange={e => updateReward(index, { count: Number(e.target.value) })}/></label><button type="button" aria-label="Xóa nhóm giải" disabled={form.milestoneRewards.length <= 1} onClick={() => setForm(current => ({ ...current, milestoneRewards: current.milestoneRewards.filter((_, itemIndex) => itemIndex !== index) }))} className="mb-0.5 rounded-xl border border-red-200 p-3 text-red-600 disabled:opacity-30"><Minus size={18}/></button></div>)}</div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Còn lại đến mốc tiếp theo</p><p className="mt-1 text-3xl font-black text-amber-600">{Number(data.milestone.remaining).toLocaleString('vi-VN')} lượt nạp</p><p className="mt-2 text-sm text-slate-600">Đã đạt {data.milestone.completedCycles} mốc, đã thực hiện {data.milestone.drawnCycles} đợt. Cơ cấu hiện tại: {milestoneDescription || 'chưa cấu hình'}.</p></div>
            <button disabled={Boolean(busy) || data.milestone.remaining > 0} onClick={() => void request('POST', { action: 'award' }, 'award')} className="mt-5 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-900 disabled:opacity-50">{busy === 'award' ? 'Đang chọn...' : `Chọn ${totalMilestoneWinners} người trúng và cộng tiền`}</button>
        </section>

        <div className="sticky bottom-4 z-20 flex justify-end"><button disabled={Boolean(busy)} onClick={() => void request('PATCH', { ...form }, 'save')} className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-xl disabled:opacity-50"><Save size={18}/> {busy === 'save' ? 'Đang lưu và đồng bộ...' : 'Lưu và đồng bộ ra website'}</button></div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm"><div><h2 className="text-xl font-bold">Tài khoản vòng quay của thành viên</h2><p className="mt-1 text-sm text-slate-500">Điều chỉnh số lượt còn lại, tổng tiền đã trúng và số dư thưởng đang hiển thị trên tài khoản khách hàng.</p></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Thành viên</th><th className="p-3">Lượt còn lại</th><th className="p-3">Tổng tiền đã trúng</th><th className="p-3">Số dư thưởng</th><th className="p-3">Đang chờ rút</th><th className="p-3">Thao tác</th></tr></thead><tbody>{data.memberAccounts?.length ? data.memberAccounts.map(account => <tr key={account._id} className="border-b"><td className="p-3"><strong>{account.userId?.name || 'Thành viên'}</strong><br/><span className="text-slate-500">{account.userId?.email || ''}</span></td><td className="p-3"><input aria-label={`Lượt còn lại của ${account.userId?.email || account._id}`} type="number" min={0} className="w-28 rounded-lg border px-3 py-2" value={account.availableSpins} onChange={e => updateMember(account._id, 'availableSpins', Number(e.target.value))}/></td><td className="p-3"><input aria-label={`Tổng tiền đã trúng của ${account.userId?.email || account._id}`} type="number" min={0} step={1000} className="w-40 rounded-lg border px-3 py-2" value={account.lifetimeWinnings} onChange={e => updateMember(account._id, 'lifetimeWinnings', Number(e.target.value))}/></td><td className="p-3"><input aria-label={`Số dư thưởng của ${account.userId?.email || account._id}`} type="number" min={0} step={1000} className="w-40 rounded-lg border px-3 py-2" value={account.prizeBalance} onChange={e => updateMember(account._id, 'prizeBalance', Number(e.target.value))}/></td><td className="p-3 font-semibold text-slate-600">{money(account.pendingWithdrawal)}</td><td className="p-3"><button disabled={Boolean(busy)} onClick={() => void request('POST', { action: 'account-update', userId: account.userId?._id, availableSpins: account.availableSpins, prizeBalance: account.prizeBalance, lifetimeWinnings: account.lifetimeWinnings }, `account-${account._id}`)} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white disabled:opacity-50">{busy === `account-${account._id}` ? 'Đang lưu...' : 'Lưu tài khoản'}</button></td></tr>) : <tr><td colSpan={6} className="p-6 text-center text-slate-500">Chưa có thành viên sử dụng vòng quay.</td></tr>}</tbody></table></div></section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">Yêu cầu rút tiền</h2><p className="mt-1 text-sm text-slate-500">Chỉ hoàn tất yêu cầu sau khi ACB xác nhận giao dịch chuyển khoản thực.</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">{data.withdrawals.filter(item => item.status === 'pending').length} đang chờ</span></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Khách hàng</th><th className="p-3">Số tiền</th><th className="p-3">Tài khoản nhận</th><th className="p-3">Mã chi</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr></thead><tbody>{data.withdrawals?.length ? data.withdrawals.map(item => {
                const status = withdrawalStatus(item.status);
                return <tr key={item._id} className="border-b align-top"><td className="p-3"><strong>{item.userId?.name || 'Thành viên'}</strong><br/><span className="text-slate-500">{item.userId?.email}</span>{item.createdAt && <><br/><span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></>}</td><td className="p-3 text-base font-bold">{money(item.amount)}</td><td className="p-3"><strong>{item.bankName}</strong> · {item.accountNumber}<br/><span>{item.accountName}</span></td><td className="p-3"><code className="rounded bg-slate-100 px-2 py-1 font-bold text-slate-800">{item.payoutReference || 'Đang tạo...'}</code>{item.bankTransactionId && <><br/><span className="mt-2 inline-block text-xs text-slate-500">GD: {item.bankTransactionId}</span></>}</td><td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>{item.bankVerifiedAt && <p className="mt-2 text-xs text-slate-500">ACB xác nhận {new Date(item.bankVerifiedAt).toLocaleString('vi-VN')}</p>}</td><td className="p-3">{item.status === 'pending' && <div className="flex flex-wrap gap-2"><button disabled={Boolean(busy) || !item.payoutReference} onClick={() => { setSettlingWithdrawal(item); setSettlementForm({ bankTransactionId: '', note: '' }); }} className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white disabled:opacity-50">Chuyển &amp; xác minh</button><button disabled={Boolean(busy)} onClick={() => void request('POST', { action: 'withdrawal-rejected', withdrawalId: item._id }, `reject-${item._id}`)} className="rounded-lg border border-red-200 px-3 py-2 font-bold text-red-600 disabled:opacity-50">Từ chối</button></div>}</td></tr>;
            }) : <tr><td colSpan={6} className="p-6 text-center text-slate-500">Chưa có yêu cầu rút tiền.</td></tr>}</tbody></table></div>
        </section>
        <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Nhật ký quay gần đây</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-3">Thời gian</th><th className="p-3">Khách hàng</th><th className="p-3">Giải thưởng</th><th className="p-3">Thứ tự</th></tr></thead><tbody>{data.recentSpins.map(spin => <tr key={spin._id} className="border-b"><td className="p-3">{new Date(spin.createdAt).toLocaleString('vi-VN')}</td><td className="p-3"><strong>{spin.userId?.name || 'Thành viên'}</strong><br/><span className="text-slate-500">{spin.userId?.email || ''}</span></td><td className="p-3">{spin.prizeValue ? money(spin.prizeValue) : 'Chúc may mắn'}</td><td className="p-3">{spin.isTest ? <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">TEST ADMIN</span> : `#${spin.sequence}`}</td></tr>)}</tbody></table></div></section>
        {settlingWithdrawal && <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/65 p-4"><div className="my-6 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Đối soát ACB bắt buộc</p><h2 className="mt-1 text-2xl font-black text-slate-900">Chuyển tiền cho khách hàng</h2></div><button aria-label="Đóng" onClick={() => setSettlingWithdrawal(null)} className="rounded-full bg-slate-100 p-2 text-slate-600"><X/></button></div>
            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2"><div><p className="text-xs text-slate-500">Số tiền</p><p className="mt-1 text-xl font-black text-emerald-700">{money(settlingWithdrawal.amount)}</p></div><div><p className="text-xs text-slate-500">Người nhận</p><p className="mt-1 font-bold">{settlingWithdrawal.accountName}</p></div><div><p className="text-xs text-slate-500">Ngân hàng · Số tài khoản</p><p className="mt-1 font-bold">{settlingWithdrawal.bankName} · {settlingWithdrawal.accountNumber}</p></div><div><p className="text-xs text-slate-500">Nội dung chuyển khoản bắt buộc</p><p className="mt-1 font-mono text-lg font-black text-amber-700">{settlingWithdrawal.payoutReference}</p></div></div>
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0"/><div><strong>Quy trình an toàn</strong><ol className="mt-1 list-decimal space-y-1 pl-5"><li>Chuyển khoản tại ACB đúng số tiền, đúng tài khoản nhận và đúng nội dung ở trên.</li><li>Sau khi ACB báo thành công, nhập mã giao dịch ngân hàng bên dưới.</li><li>Hệ thống sẽ đọc lịch sử ACB và chỉ đánh dấu hoàn tất khi toàn bộ thông tin khớp.</li></ol></div></div></div>
            <div className="mt-5 space-y-4"><label className={labelClass}>Mã giao dịch ACB<input autoFocus value={settlementForm.bankTransactionId} onChange={event => setSettlementForm(current => ({ ...current, bankTransactionId: event.target.value.toUpperCase() }))} className={fieldClass} placeholder="Nhập mã giao dịch/trace number trên biên lai ACB"/></label><label className={labelClass}>Ghi chú nội bộ (không bắt buộc)<textarea rows={2} value={settlementForm.note} onChange={event => setSettlementForm(current => ({ ...current, note: event.target.value }))} className={fieldClass} maxLength={500}/></label></div>
            <button disabled={Boolean(busy) || settlementForm.bankTransactionId.trim().length < 4} onClick={() => void verifyWithdrawal()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white disabled:opacity-50"><CheckCircle2 size={19}/>{busy === `paid-${settlingWithdrawal._id}` ? 'Đang đối soát ACB...' : 'Xác minh ACB và hoàn tất yêu cầu'}</button><p className="mt-3 text-center text-xs text-slate-500">Không thể hoàn tất thủ công nếu ACB chưa ghi nhận giao dịch chuyển tiền.</p>
        </div></div>}
    </div>;
}
