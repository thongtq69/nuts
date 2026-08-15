'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy, Eye, EyeOff, Loader2, Plus, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

type Collaborator = { id: string; name: string; email: string; phone: string; code: string; totalCommission: number; orders: number; revenue: number };
const initialForm = { name: '', email: '', phone: '', password: '' };
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

export default function AgentCollaboratorsPage() {
    const toast = useToast();
    const confirm = useConfirm();
    const [items, setItems] = useState<Collaborator[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copiedId, setCopiedId] = useState('');
    const [form, setForm] = useState(initialForm);

    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const response = await fetch('/api/agent/collaborators', { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không thể tải cộng tác viên');
            setItems(Array.isArray(data) ? data : []);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải cộng tác viên');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);
    const filtered = useMemo(() => items.filter((item) => `${item.name} ${item.email} ${item.code}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

    async function create(event: FormEvent) {
        event.preventDefault(); setSaving(true);
        try {
            const response = await fetch('/api/agent/collaborators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không thể tạo cộng tác viên');
            toast.success('Tạo cộng tác viên thành công', data.emailSent ? `Mã ${data.collaborator.code}. Thông tin đăng nhập đã gửi qua email.` : `Mã ${data.collaborator.code}. Email chưa gửi được, vui lòng chuyển thông tin đăng nhập trực tiếp.`);
            setModal(false); setForm(initialForm); await load();
        } catch (createError) { toast.error('Tạo cộng tác viên thất bại', createError instanceof Error ? createError.message : 'Vui lòng thử lại'); }
        finally { setSaving(false); }
    }

    async function disable(item: Collaborator) {
        if (!await confirm({ title: 'Vô hiệu hóa cộng tác viên', description: `Tài khoản ${item.name} sẽ không thể tiếp tục hoạt động.`, confirmText: 'Vô hiệu hóa', cancelText: 'Hủy' })) return;
        const response = await fetch('/api/agent/collaborators', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collaboratorId: item.id }) });
        const data = await response.json();
        if (!response.ok) return toast.error('Không thể vô hiệu hóa', data.message || 'Vui lòng thử lại');
        toast.success('Đã vô hiệu hóa cộng tác viên'); await load();
    }

    async function copyLink(item: Collaborator) {
        await navigator.clipboard.writeText(`${window.location.origin}/register?ref=${encodeURIComponent(item.code)}`);
        setCopiedId(item.id); setTimeout(() => setCopiedId(''), 1800);
    }

    return <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F5EFE6] text-[#9C7044]"><Users /></span>Cộng tác viên</h1><p className="mt-1 text-sm text-slate-500">Tạo tài khoản và theo dõi cộng tác viên trực thuộc Đại lý.</p></div><button onClick={() => setModal(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#9C7044] px-5 py-3 font-bold text-white hover:bg-[#7d5a36]"><UserPlus size={19} /> Tạo cộng tác viên</button></div>
        <div className="grid gap-3 sm:grid-cols-3"><Metric label="Tổng cộng tác viên" value={String(items.length)} /><Metric label="Đơn hợp lệ" value={String(items.reduce((sum, item) => sum + item.orders, 0))} /><Metric label="Doanh thu" value={money(items.reduce((sum, item) => sum + item.revenue, 0))} /></div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-4"><label className="flex max-w-md items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5"><Search size={18} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full outline-none" placeholder="Tìm tên, email hoặc mã CTV..." /></label></div>
        {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-[#9C7044]" /></div> : error ? <div className="grid min-h-64 place-items-center text-red-600">{error}</div> : filtered.length === 0 ? <div className="grid min-h-64 place-items-center p-6 text-center text-slate-500"><div><Users className="mx-auto mb-3 text-slate-300" size={38} /><p className="font-semibold text-slate-700">Chưa có cộng tác viên</p><button onClick={() => setModal(true)} className="mt-4 font-semibold text-[#9C7044] hover:underline">Tạo cộng tác viên đầu tiên</button></div></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Cộng tác viên</th><th className="px-5 py-4">Mã / link</th><th className="px-5 py-4">Đơn</th><th className="px-5 py-4">Doanh thu</th><th className="px-5 py-4">Hoa hồng</th><th className="px-5 py-4">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{item.name}</div><div className="text-xs text-slate-500">{item.email}</div></td><td className="px-5 py-4"><button onClick={() => void copyLink(item)} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 font-mono font-semibold text-slate-700 hover:bg-slate-200">{item.code} {copiedId === item.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}</button></td><td className="px-5 py-4">{item.orders}</td><td className="px-5 py-4 font-semibold">{money(item.revenue)}</td><td className="px-5 py-4 font-semibold text-emerald-600">{money(item.totalCommission)}</td><td className="px-5 py-4"><button onClick={() => void disable(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Vô hiệu hóa ${item.name}`}><Trash2 size={18} /></button></td></tr>)}</tbody></table></div>}</section>
        {modal && <div className="fixed inset-0 z-50 grid place-items-center p-4"><button className="absolute inset-0 bg-slate-900/40" onClick={() => setModal(false)} aria-label="Đóng" /><div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><button onClick={() => setModal(false)} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-100"><X /></button><h2 className="mb-6 flex items-center gap-3 text-xl font-bold"><Plus className="text-[#9C7044]" /> Tạo cộng tác viên mới</h2><form onSubmit={create} className="space-y-4">{(['name', 'email', 'phone'] as const).map((key) => <label key={key} className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{key === 'name' ? 'Họ tên *' : key === 'email' ? 'Email *' : 'Số điện thoại'}</span><input type={key === 'email' ? 'email' : 'text'} required={key !== 'phone'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#9C7044]" /></label>)}<label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Mật khẩu *</span><div className="relative"><input type={showPassword ? 'text' : 'password'} minLength={6} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-[#9C7044]" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><span className="mt-1 block text-xs text-slate-500">Ít nhất 6 ký tự. Hệ thống sẽ gửi thông tin đăng nhập qua email.</span></label><div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold">Hủy</button><button disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#9C7044] px-4 py-3 font-bold text-white disabled:opacity-60">{saving && <Loader2 size={18} className="animate-spin" />} Tạo CTV</button></div></form></div></div>}
    </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">{label}</div><div className="mt-1 text-2xl font-bold text-slate-900">{value}</div></div>; }
