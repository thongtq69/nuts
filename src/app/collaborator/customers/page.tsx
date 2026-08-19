'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    Loader2,
    Search,
    ShoppingBag,
    UserRound,
    Users,
    Wallet,
} from 'lucide-react';

interface CustomerSummary {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderAt?: string | null;
}

export default function CollaboratorCustomersPage() {
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(
                    `/api/collaborator/customers?search=${encodeURIComponent(search)}`,
                    { signal: controller.signal, cache: 'no-store' },
                );
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(data?.error || 'Không thể tải danh sách khách hàng');
                }
                setCustomers(data?.customers || []);
            } catch (fetchError) {
                if (!controller.signal.aborted) {
                    setCustomers([]);
                    setError(fetchError instanceof Error ? fetchError.message : 'Không thể tải danh sách khách hàng');
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

    const formatMoney = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value || 0)}đ`;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EFE6] text-[#9C7044]">
                        <Users size={22} />
                    </span>
                    Khách hàng của tôi
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Danh sách chỉ gồm khách hàng đăng ký qua mã giới thiệu của chính bạn.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#9C7044]" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center text-red-700">
                    <p className="font-semibold">{error}</p>
                </div>
            ) : customers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
                    <UserRound className="mx-auto mb-3 text-slate-300" size={42} />
                    <p className="font-semibold text-slate-700">Chưa có khách hàng phù hợp</p>
                    <p className="mt-1 text-sm text-slate-500">
                        Khách đăng ký qua link giới thiệu của bạn sẽ xuất hiện tại đây.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {customers.map(customer => (
                        <Link
                            href={`/collaborator/customers/${customer._id}`}
                            key={customer._id}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#C7A879] hover:shadow-md"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE6] text-lg font-bold text-[#7d5a36]">
                                    {customer.name?.charAt(0)?.toUpperCase() || 'K'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="truncate font-bold text-slate-900">{customer.name}</h2>
                                            <p className="truncate text-sm text-slate-500">{customer.email}</p>
                                            <p className="text-sm text-slate-500">{customer.phone || 'Chưa có số điện thoại'}</p>
                                        </div>
                                        <ChevronRight className="shrink-0 text-slate-300 group-hover:text-[#9C7044]" size={20} />
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-blue-50 p-3">
                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                <ShoppingBag size={13} /> Đơn hàng
                                            </div>
                                            <div className="mt-1 font-bold text-blue-800">{customer.totalOrders}</div>
                                        </div>
                                        <div className="rounded-xl bg-emerald-50 p-3">
                                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                                                <Wallet size={13} /> Chi tiêu
                                            </div>
                                            <div className="mt-1 font-bold text-emerald-800">{formatMoney(customer.totalSpent)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
