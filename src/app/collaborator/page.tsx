'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    TrendingUp, DollarSign, ShoppingCart, Users, Copy,
    RefreshCw, ArrowUpRight, Calendar, Wallet, ExternalLink, Clock
} from 'lucide-react';

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    pendingOrders: number;
    walletBalance: number;
    recentOrders: any[];
}

export default function CollaboratorDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/collaborator/orders');
            if (res.ok) {
                const data = await res.json();
                setStats({
                    ...data.stats,
                    walletBalance: data.stats.totalCommission,
                    recentOrders: data.orders.slice(0, 5)
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = () => {
        if (stats) {
            navigator.clipboard.writeText('');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const statCards = [
        {
            label: 'Tổng đơn hàng',
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: 'from-blue-500 to-blue-600',
            change: '+12%',
            trend: 'up'
        },
        {
            label: 'Tổng doanh thu',
            value: `${formatPrice(stats?.totalRevenue || 0)}đ`,
            icon: TrendingUp,
            color: 'from-emerald-500 to-emerald-600',
            change: '+8%',
            trend: 'up'
        },
        {
            label: 'Hoa hồng',
            value: `${formatPrice(stats?.totalCommission || 0)}đ`,
            icon: DollarSign,
            color: 'from-amber-500 to-orange-500',
            change: '+15%',
            trend: 'up'
        },
        {
            label: 'Chờ xử lý',
            value: stats?.pendingOrders || 0,
            icon: Clock,
            color: 'from-violet-500 to-purple-500',
            change: `${stats?.pendingOrders || 0} đơn`,
            trend: 'neutral'
        }
    ];

    return (
        <div className="space-y-8 w-full">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-brand via-brand-light to-amber-200 rounded-3xl p-8 text-gray-800 shadow-xl shadow-brand/20 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-gray-800/10 rounded-full" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gray-800/10 rounded-full" />
                
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Chào mừng, Cộng tác viên! 👋</h1>
                    <p className="text-gray-700 text-lg max-w-xl">
                        Theo dõi đơn hàng và hoa hồng từ khách hàng bạn giới thiệu
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                {stat.change && (
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        stat.trend === 'up' 
                                            ? 'bg-emerald-100 text-emerald-600' 
                                            : stat.trend === 'down'
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        {stat.trend === 'up' && <ArrowUpRight size={12} />}
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                            <div className="text-3xl font-black text-gray-800 mb-1">{stat.value}</div>
                            <div className="text-gray-500 font-medium">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link 
                        href="/collaborator/orders"
                        className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-brand/10 to-brand-light/10 rounded-xl hover:from-brand/20 hover:to-brand-light/20 transition-all"
                    >
                        <ShoppingCart className="w-8 h-8 text-brand" />
                        <span className="text-sm font-semibold text-gray-700">Xem đơn hàng</span>
                    </Link>
                    <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-emerald-10 to-emerald-50 rounded-xl">
                        <Wallet className="w-8 h-8 text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-700">Ví: {formatPrice(stats?.walletBalance || 0)}đ</span>
                    </div>
                    <Link 
                        href="/products"
                        className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-blue-10 to-blue-50 rounded-xl hover:from-blue-20 hover:to-blue-50 transition-all"
                    >
                        <Users className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Sản phẩm</span>
                    </Link>
                    <Link 
                        href="/"
                        className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all"
                    >
                        <ExternalLink className="w-8 h-8 text-slate-600" />
                        <span className="text-sm font-semibold text-gray-700">Website</span>
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-brand" />
                        Đơn hàng gần đây
                    </h3>
                    <Link href="/collaborator/orders" className="text-brand font-medium text-sm hover:underline">
                        Xem tất cả →
                    </Link>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500 mt-2">Đang tải...</p>
                    </div>
                ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {stats.recentOrders.map((order: any) => (
                            <div key={order._id} className="p-4 hover:bg-amber-50/30 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 text-brand" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">#{order.orderId}</p>
                                        <p className="text-sm text-gray-500">{order.customerName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">{formatPrice(order.totalAmount)}đ</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}
