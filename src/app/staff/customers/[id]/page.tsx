'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CreditCard, Loader2, Mail, Package, Phone, PiggyBank, ShoppingBag, Ticket, TrendingUp } from 'lucide-react';

type StatKey = 'orders' | 'spent' | 'savings' | 'membership' | 'vouchers';

export default function StaffCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeStat, setActiveStat] = useState<StatKey>('orders');

    useEffect(() => {
        params.then(async ({ id }) => {
            const response = await fetch(`/api/staff/customers/${id}`);
            if (response.ok) setCustomer(await response.json());
            setLoading(false);
        });
    }, [params]);

    const money = (value: number) => new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';

    if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-[#9C7044]" /></div>;
    if (!customer) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                <p className="font-semibold text-slate-800">Không tìm thấy khách hàng hoặc bạn không có quyền xem.</p>
                <Link href="/staff/customers" className="inline-block mt-4 text-[#9C7044] font-semibold">Quay lại danh sách</Link>
            </div>
        );
    }

    const statButtons = [
        { key: 'orders' as const, label: 'Đơn hàng', value: customer.totalOrders, icon: ShoppingBag, style: 'bg-blue-50 text-blue-700' },
        { key: 'spent' as const, label: 'Tổng chi tiêu', value: money(customer.totalSpent), icon: CreditCard, style: 'bg-emerald-50 text-emerald-700' },
        { key: 'savings' as const, label: 'Tiết kiệm nhờ VIP', value: money(customer.totalVipSavings), icon: PiggyBank, style: 'bg-teal-50 text-teal-700' },
        { key: 'membership' as const, label: 'Gói hội viên', value: customer.membershipPackages.length, icon: Package, style: 'bg-purple-50 text-purple-700' },
        { key: 'vouchers' as const, label: 'Voucher', value: customer.vouchers.length, icon: Ticket, style: 'bg-amber-50 text-amber-700' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/staff/customers" className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"><ArrowLeft size={20} /></Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chi tiết khách hàng</h1>
                    <p className="text-sm text-slate-500">Theo dõi thông tin và lịch sử chăm sóc khách hàng của bạn.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#9C7044] to-[#7d5a36] text-white p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{customer.name.charAt(0).toUpperCase()}</div>
                    <div><h2 className="text-xl font-bold">{customer.name}</h2><p className="text-white/80">{customer.email}</p></div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex gap-3"><Mail className="text-slate-400" size={18} /><div><p className="text-xs text-slate-500">Email</p><p className="font-medium break-all">{customer.email}</p></div></div>
                    <div className="flex gap-3"><Phone className="text-slate-400" size={18} /><div><p className="text-xs text-slate-500">Số điện thoại</p><p className="font-medium">{customer.phone || '-'}</p></div></div>
                    <div className="flex gap-3"><Calendar className="text-slate-400" size={18} /><div><p className="text-xs text-slate-500">Ngày tham gia</p><p className="font-medium">{new Date(customer.createdAt).toLocaleDateString('vi-VN')}</p></div></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><TrendingUp size={19} className="text-emerald-600" /> Thống kê — bấm để xem chi tiết</h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {statButtons.map(item => (
                        <button key={item.key} onClick={() => setActiveStat(item.key)} className={`rounded-xl p-4 text-left border-2 transition-all ${item.style} ${activeStat === item.key ? 'border-current shadow-sm' : 'border-transparent'}`}>
                            <item.icon size={18} /><p className="text-xs mt-2">{item.label}</p><p className="font-bold text-lg mt-1">{item.value}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                    {activeStat === 'orders' && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Đơn hàng gần đây</h4>
                            {customer.recentOrders.length === 0 ? <p className="text-sm text-slate-500">Chưa có đơn hàng.</p> : customer.recentOrders.map((order: any) => (
                                <div key={order._id} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span>#{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span><strong>{money(order.totalAmount)}</strong></div>
                            ))}
                        </div>
                    )}
                    {activeStat === 'spent' && <div><h4 className="font-semibold">Tổng chi tiêu đã thanh toán</h4><p className="text-2xl font-bold text-emerald-700 mt-2">{money(customer.totalSpent)}</p></div>}
                    {activeStat === 'savings' && <div><h4 className="font-semibold">Tiền đã tiết kiệm nhờ gói VIP</h4><p className="text-2xl font-bold text-teal-700 mt-2">{money(customer.totalVipSavings)}</p><p className="text-sm text-slate-500 mt-1">Từ {customer.vipSavingsOrderCount || 0} đơn đã thanh toán có sử dụng voucher VIP.</p></div>}
                    {activeStat === 'membership' && (
                        <div className="space-y-2"><h4 className="font-semibold">Gói hội viên</h4>{customer.membershipPackages.length === 0 ? <p className="text-sm text-slate-500">Chưa có gói đã kích hoạt.</p> : customer.membershipPackages.map((item: any) => <div key={item._id} className="rounded-lg bg-purple-50 p-3 text-sm">{item.packageId?.name || item.packageInfo?.name || 'Gói hội viên'} · {item.endDate ? `Hết hạn ${new Date(item.endDate).toLocaleDateString('vi-VN')}` : money(item.totalAmount)}</div>)}</div>
                    )}
                    {activeStat === 'vouchers' && (
                        <div className="space-y-2"><h4 className="font-semibold">Voucher</h4>{customer.vouchers.length === 0 ? <p className="text-sm text-slate-500">Chưa có voucher.</p> : customer.vouchers.map((voucher: any) => <div key={voucher._id} className="flex justify-between rounded-lg bg-amber-50 p-3 text-sm"><span className="font-mono font-semibold">{voucher.code}</span><span>{voucher.isUsed ? 'Đã dùng' : 'Còn hiệu lực'}</span></div>)}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
