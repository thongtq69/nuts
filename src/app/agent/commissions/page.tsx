'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Clock3, Eye, Loader2, RefreshCw, Wallet, XCircle } from 'lucide-react';

type Status = 'pending' | 'approved' | 'paid' | 'rejected';
type Commission = {
    id: string;
    orderId: string;
    orderIdFull: string;
    orderValue: number;
    commissionRate: number;
    commissionAmount: number;
    status: Status;
    orderStatus: string;
    customerName: string;
    createdAt: string;
};

const statusMeta: Record<Status, { label: string; className: string }> = {
    pending: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-700' },
    paid: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
};

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

export default function AgentCommissionsPage() {
    const pathname = usePathname();
    const ordersHref = pathname.startsWith('/collaborator') ? '/collaborator/orders' : '/agent/orders';
    const [items, setItems] = useState<Commission[]>([]);
    const [filter, setFilter] = useState<'all' | Status>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/agent/commissions', { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Không thể tải hoa hồng');
            setItems(Array.isArray(data.commissions) ? data.commissions : []);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Không thể tải hoa hồng');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const visibleItems = useMemo(
        () => filter === 'all' ? items : items.filter((item) => item.status === filter),
        [filter, items],
    );
    const total = (status?: Status) => items
        .filter((item) => !status ? item.status !== 'rejected' : item.status === status)
        .reduce((sum, item) => sum + item.commissionAmount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F5EFE6] text-[#9C7044]"><Wallet /></span>
                        Lịch sử hoa hồng
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Theo dõi hoa hồng thật từ các đơn hàng được giới thiệu.</p>
                </div>
                <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> Làm mới
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Summary label="Tổng hoa hồng" value={total()} icon={<Wallet size={20} />} />
                <Summary label="Chờ duyệt" value={total('pending')} icon={<Clock3 size={20} />} />
                <Summary label="Đã duyệt" value={total('approved')} icon={<CheckCircle2 size={20} />} />
                <Summary label="Đã thanh toán" value={total('paid')} icon={<CheckCircle2 size={20} />} />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
                    {(['all', 'pending', 'approved', 'paid', 'rejected'] as const).map((status) => (
                        <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === status ? 'bg-[#9C7044] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {status === 'all' ? 'Tất cả' : statusMeta[status].label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid min-h-64 place-items-center"><Loader2 className="animate-spin text-[#9C7044]" /></div>
                ) : error ? (
                    <div className="grid min-h-64 place-items-center p-6 text-center">
                        <div><XCircle className="mx-auto mb-3 text-red-500" /><p className="font-semibold text-red-600">{error}</p><button onClick={() => void load()} className="mt-4 rounded-lg bg-[#9C7044] px-4 py-2 text-white">Thử lại</button></div>
                    </div>
                ) : visibleItems.length === 0 ? (
                    <div className="grid min-h-64 place-items-center p-6 text-center text-slate-500">
                        <div><Wallet className="mx-auto mb-3 text-slate-300" size={38} /><p className="font-semibold text-slate-700">Chưa có giao dịch hoa hồng</p><p className="mt-1 text-sm">Giao dịch hợp lệ sẽ xuất hiện khi có đơn hàng gắn mã giới thiệu.</p></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Mã đơn</th><th className="px-5 py-4">Khách hàng</th><th className="px-5 py-4">Giá trị đơn</th><th className="px-5 py-4">Tỷ lệ</th><th className="px-5 py-4">Hoa hồng</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4">Chi tiết</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {visibleItems.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-mono font-semibold">#{item.orderId}</td><td className="px-5 py-4"><div className="font-medium text-slate-800">{item.customerName}</div><div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div></td><td className="px-5 py-4">{money(item.orderValue)}</td><td className="px-5 py-4">{item.commissionRate}%</td><td className="px-5 py-4 font-bold text-emerald-600">+{money(item.commissionAmount)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[item.status].className}`}>{statusMeta[item.status].label}</span></td><td className="px-5 py-4"><Link href={`${ordersHref}?order=${item.orderIdFull}`} className="inline-flex items-center gap-1 font-semibold text-[#9C7044] hover:underline"><Eye size={16} /> Xem</Link></td></tr>)}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center justify-between text-[#9C7044]"><span className="text-sm font-medium text-slate-500">{label}</span>{icon}</div><div className="text-2xl font-bold text-slate-900">{money(value)}</div></div>;
}
