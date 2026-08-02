'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Search, ShoppingBag, UserRound, Users, Wallet } from 'lucide-react';

interface CustomerSummary {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
    referrer?: { name: string; code?: string } | null;
}

export default function StaffCustomersPage() {
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/staff/customers?search=${encodeURIComponent(search)}`, {
                    signal: controller.signal,
                });
                if (response.ok) {
                    const data = await response.json();
                    setCustomers(data.customers || []);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [search]);

    const formatMoney = (value: number) => new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl bg-[#F5EFE6] text-[#9C7044] flex items-center justify-center">
                        <Users size={22} />
                    </span>
                    Khách hàng của tôi
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Chỉ hiển thị khách hàng được gắn với mã nhân viên của bạn hoặc cộng tác viên thuộc team của bạn.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Tìm theo tên, email hoặc số điện thoại..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-[#9C7044] focus:ring-2 focus:ring-[#9C7044]/10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#9C7044]" /></div>
            ) : customers.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center">
                    <UserRound className="mx-auto text-slate-300 mb-3" size={42} />
                    <p className="font-semibold text-slate-700">Chưa có khách hàng phù hợp</p>
                    <p className="text-sm text-slate-500 mt-1">Khách đăng ký qua link giới thiệu sẽ xuất hiện tại đây.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {customers.map(customer => (
                        <Link
                            href={`/staff/customers/${customer._id}`}
                            key={customer._id}
                            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-[#C7A879] hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] text-[#7d5a36] flex items-center justify-center font-bold text-lg shrink-0">
                                    {customer.name?.charAt(0)?.toUpperCase() || 'K'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-bold text-slate-900 truncate">{customer.name}</h2>
                                            <p className="text-sm text-slate-500 truncate">{customer.email}</p>
                                            <p className="text-sm text-slate-500">{customer.phone || 'Chưa có số điện thoại'}</p>
                                        </div>
                                        <ChevronRight className="text-slate-300 group-hover:text-[#9C7044]" size={20} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="rounded-xl bg-blue-50 p-3">
                                            <div className="text-xs text-blue-600 flex items-center gap-1"><ShoppingBag size={13} /> Đơn hàng</div>
                                            <div className="font-bold text-blue-800 mt-1">{customer.totalOrders}</div>
                                        </div>
                                        <div className="rounded-xl bg-emerald-50 p-3">
                                            <div className="text-xs text-emerald-600 flex items-center gap-1"><Wallet size={13} /> Chi tiêu</div>
                                            <div className="font-bold text-emerald-800 mt-1">{formatMoney(customer.totalSpent)}</div>
                                        </div>
                                    </div>
                                    {customer.referrer && (
                                        <p className="mt-3 text-xs text-slate-500">
                                            Nguồn giới thiệu: <strong>{customer.referrer.name}</strong>
                                            {customer.referrer.code ? ` (${customer.referrer.code})` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

