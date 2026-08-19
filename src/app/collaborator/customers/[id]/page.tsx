'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Loader2,
    Mail,
    Package,
    Phone,
    PiggyBank,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react';
import CustomerOrderDetails, { type CustomerOrder } from '@/components/customers/CustomerOrderDetails';

type StatKey = 'orders' | 'spent' | 'savings' | 'membership';

interface MembershipSummary {
    _id: string;
    packageId?: { name?: string } | null;
    packageInfo?: { name?: string } | null;
    endDate?: string | null;
    totalAmount?: number;
}

interface CustomerDetail {
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
    totalVipSavings: number;
    vipSavingsOrderCount: number;
    recentOrders: CustomerOrder[];
    membershipPackages: MembershipSummary[];
}

export default function CollaboratorCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeStat, setActiveStat] = useState<StatKey>('orders');

    useEffect(() => {
        const controller = new AbortController();
        params.then(async ({ id }) => {
            try {
                const response = await fetch(`/api/collaborator/customers/${id}`, {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                const data = await response.json().catch(() => null);
                if (!response.ok) throw new Error(data?.error || 'Không thể tải thông tin khách hàng');
                setCustomer(data);
            } catch (fetchError) {
                if (!controller.signal.aborted) {
                    setError(fetchError instanceof Error ? fetchError.message : 'Không thể tải thông tin khách hàng');
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        });
        return () => controller.abort();
    }, [params]);

    const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

    if (loading) {
        return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#9C7044]" /></div>;
    }

    if (!customer) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="font-semibold text-slate-800">{error || 'Không tìm thấy khách hàng hoặc bạn không có quyền xem.'}</p>
                <Link href="/collaborator/customers" className="mt-4 inline-block font-semibold text-[#9C7044]">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const statButtons = [
        { key: 'orders' as const, label: 'Đơn hàng', value: customer.totalOrders, icon: ShoppingBag, style: 'bg-blue-50 text-blue-700' },
        { key: 'spent' as const, label: 'Tổng chi tiêu', value: money(customer.totalSpent), icon: CreditCard, style: 'bg-emerald-50 text-emerald-700' },
        { key: 'savings' as const, label: 'Tiết kiệm nhờ VIP', value: money(customer.totalVipSavings), icon: PiggyBank, style: 'bg-teal-50 text-teal-700' },
        { key: 'membership' as const, label: 'Gói hội viên', value: customer.membershipPackages.length, icon: Package, style: 'bg-purple-50 text-purple-700' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/collaborator/customers" className="rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chi tiết khách hàng</h1>
                    <p className="text-sm text-slate-500">Theo dõi thông tin và lịch sử mua hàng của khách do bạn giới thiệu.</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-4 bg-gradient-to-r from-[#9C7044] to-[#7d5a36] p-6 text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{customer.name}</h2>
                        <p className="text-white/80">{customer.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
                    <div className="flex gap-3"><Mail className="text-slate-400" size={18} /><div><p className="text-xs text-slate-500">Email</p><p className="break-all font-medium">{customer.email}</p></div></div>
                    <div className="flex gap-3"><Phone className="text-slate-400" size={18} /><div><p className="text-xs text-slate-500">Số điện thoại</p><p className="font-medium">{customer.phone || '-'}</p></div></div>
                    <div className="flex gap-3"><Calendar className="text-slate-400" size={18} /><div><p className="text-xs text-slate-500">Ngày tham gia</p><p className="font-medium">{new Date(customer.createdAt).toLocaleDateString('vi-VN')}</p></div></div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                    <TrendingUp size={19} className="text-emerald-600" /> Thống kê — bấm để xem chi tiết
                </h3>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {statButtons.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveStat(item.key)}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${item.style} ${activeStat === item.key ? 'border-current shadow-sm' : 'border-transparent'}`}
                        >
                            <item.icon size={18} />
                            <p className="mt-2 text-xs">{item.label}</p>
                            <p className="mt-1 text-lg font-bold">{item.value}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                    {activeStat === 'orders' && (
                        <div className="space-y-3">
                            <h4 className="font-semibold">Chi tiết đơn hàng gần đây</h4>
                            <CustomerOrderDetails orders={customer.recentOrders} />
                        </div>
                    )}
                    {activeStat === 'spent' && (
                        <div><h4 className="font-semibold">Tổng chi tiêu đã thanh toán</h4><p className="mt-2 text-2xl font-bold text-emerald-700">{money(customer.totalSpent)}</p></div>
                    )}
                    {activeStat === 'savings' && (
                        <div><h4 className="font-semibold">Tiền đã tiết kiệm nhờ gói VIP</h4><p className="mt-2 text-2xl font-bold text-teal-700">{money(customer.totalVipSavings)}</p><p className="mt-1 text-sm text-slate-500">Từ {customer.vipSavingsOrderCount || 0} đơn đã thanh toán có sử dụng voucher VIP.</p></div>
                    )}
                    {activeStat === 'membership' && (
                        <div className="space-y-2">
                            <h4 className="font-semibold">Gói hội viên</h4>
                            {customer.membershipPackages.length === 0
                                ? <p className="text-sm text-slate-500">Chưa có gói đã kích hoạt.</p>
                                : customer.membershipPackages.map(item => (
                                    <div key={item._id} className="rounded-lg bg-purple-50 p-3 text-sm">
                                        {item.packageId?.name || item.packageInfo?.name || 'Gói hội viên'} · {item.endDate ? `Hết hạn ${new Date(item.endDate).toLocaleDateString('vi-VN')}` : money(item.totalAmount)}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
