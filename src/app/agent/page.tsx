'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { encodeAffiliateId, generateReferralLink } from '@/lib/affiliate';
import {
    Wallet,
    DollarSign,
    ShoppingCart,
    Copy,
    TrendingUp,
    ArrowUpRight,
    ChevronRight,
    Sparkles,
    Link as LinkIcon,
    RefreshCw,
    Clock,
    ExternalLink,
    Users
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { DashboardSkeleton } from '@/components/dashboard';

interface AgentStats {
    referralCode: string;
    encodedAffiliateCode: string;
    walletBalance: number;
    totalCommission: number;
    totalReferrals: number;
    pendingOrders: number;
    totalRevenue: number;
    recentOrders: any[];
    commissionData: { date: string; commission: number }[];
}

export default function AgentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (!authLoading && user && user.role !== 'sale') {
            router.push('/');
            return;
        }

        if (user) {
            fetchAgentStats();
        }
    }, [user, authLoading, router]);

    const fetchAgentStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/agent/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                setStats(mockStats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(mockStats);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for demo
    const mockStats: AgentStats = {
        referralCode: (user as any)?.referralCode || 'AGENT001',
        encodedAffiliateCode: (user as any)?.encodedAffiliateCode || '',
        walletBalance: 1500000,
        totalCommission: 3200000,
        totalReferrals: 28,
        pendingOrders: 5,
        totalRevenue: 32000000,
        commissionData: [
            { date: '13/01', commission: 120000 },
            { date: '14/01', commission: 250000 },
            { date: '15/01', commission: 180000 },
            { date: '16/01', commission: 320000 },
            { date: '17/01', commission: 280000 },
            { date: '18/01', commission: 450000 },
            { date: '19/01', commission: 380000 },
        ],
        recentOrders: [
            { _id: '1', orderId: 'ORD001', customerName: 'Nguyen Van A', totalAmount: 500000, commissionAmount: 50000, status: 'completed', createdAt: '2026-01-19T10:00:00' },
            { _id: '2', orderId: 'ORD002', customerName: 'Tran Thi B', totalAmount: 750000, commissionAmount: 75000, status: 'shipping', createdAt: '2026-01-18T14:30:00' },
            { _id: '3', orderId: 'ORD003', customerName: 'Le Van C', totalAmount: 320000, commissionAmount: 32000, status: 'pending', createdAt: '2026-01-17T09:15:00' },
        ]
    };

    const displayStats = stats || mockStats;
    
    // Generate encoded referral link
    const referralLink = displayStats.encodedAffiliateCode 
        ? generateReferralLink(displayStats.encodedAffiliateCode)
        : `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${displayStats.referralCode}`;

    const copyReferralLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
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
            label: 'So du vi',
            value: formatPrice(displayStats.walletBalance) + 'd',
            icon: Wallet,
            color: 'from-emerald-500 to-teal-500',
            change: '+12.5%',
            trend: 'up' as const
        },
        {
            label: 'Tong hoa hong',
            value: formatPrice(displayStats.totalCommission) + 'd',
            icon: DollarSign,
            color: 'from-brand to-brand-light',
            change: '+8.2%',
            trend: 'up' as const
        },
        {
            label: 'Don hang gioi thieu',
            value: displayStats.totalReferrals,
            icon: ShoppingCart,
            color: 'from-blue-500 to-indigo-500',
            change: '+5',
            trend: 'up' as const,
            href: '/agent/orders'
        },
        {
            label: 'Cho xu ly',
            value: displayStats.pendingOrders,
            icon: Clock,
            color: 'from-amber-500 to-orange-500',
            change: `${displayStats.pendingOrders} don`,
            trend: 'neutral' as const
        }
    ];

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; class: string }> = {
            pending: { label: 'Cho xu ly', class: 'bg-amber-100 text-amber-700' },
            processing: { label: 'Dang xu ly', class: 'bg-blue-100 text-blue-700' },
            shipping: { label: 'Dang giao', class: 'bg-purple-100 text-purple-700' },
            completed: { label: 'Hoan thanh', class: 'bg-emerald-100 text-emerald-700' },
            cancelled: { label: 'Da huy', class: 'bg-red-100 text-red-700' }
        };
        return configs[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    };

    if (authLoading || loading) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                <DashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-[1200px]">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-brand via-brand-light to-amber-400 rounded-3xl p-6 sm:p-8 text-gray-800 shadow-2xl shadow-brand/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-300/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                            <g fill="#ffffff" fillOpacity="0.08">
                                <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                            </g>
                        </g>
                    </svg>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-900" />
                        <span className="font-semibold text-sm text-gray-900">Xin chao, {user?.name}!</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 text-gray-900">
                        Dashboard Dai ly
                    </h1>
                    <p className="text-gray-900 text-base sm:text-lg max-w-2xl mb-6 leading-relaxed opacity-90">
                        Theo doi doanh thu va hoa hong tu khach hang ban gioi thieu
                    </p>

                    {/* Referral Link */}
                    <div className="bg-white rounded-2xl p-5 max-w-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                            <LinkIcon size={16} className="text-brand" />
                            <span className="font-semibold text-gray-800">Link tiep thi cua ban</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-gradient-to-r from-brand/10 to-amber-100 rounded-xl px-4 py-3 border border-brand/20">
                                <div className="text-xs text-gray-500 mb-1">Ma gioi thieu</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-lg text-brand">
                                        {displayStats.referralCode}
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(displayStats.referralCode);
                                        }}
                                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                        title="Sao chep ma"
                                    >
                                        <Copy size={14} className="text-brand" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                onClick={copyReferralLink}
                                className="w-full lg:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-mono placeholder-gray-400 focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                                title="Click de sao chep link tiep thi day du"
                            />
                            <button
                                onClick={copyReferralLink}
                                className={`w-full lg:w-auto px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg border-2 ${
                                    copied
                                        ? 'bg-emerald-500 text-gray-900 border-black hover:bg-emerald-600 shadow-emerald-500/25'
                                        : 'bg-brand text-gray-900 border-black hover:bg-brand-dark shadow-brand/30'
                                }`}
                            >
                                {copied ? 'Da sao link!' : 'Sao chep link'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                            <span className="text-amber-500">*</span>
                            Chia se link tiep thi de nhan hoa hong 10% tu don hang cua khach
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="group bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                {stat.change && (
                                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        stat.trend === 'up' 
                                            ? 'bg-emerald-100 text-emerald-600' 
                                            : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        {stat.trend === 'up' ? <ArrowUpRight size={12} /> : null}
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                            <div className="text-3xl font-black text-gray-800 mb-1 group-hover:text-brand transition-colors">
                                {stat.value}
                            </div>
                            <div className="text-gray-500 font-medium">{stat.label}</div>
                            {stat.href && (
                                <Link
                                    href={stat.href}
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-brand/10 text-gray-600 hover:text-brand font-semibold rounded-xl transition-all text-sm"
                                >
                                    <span>Xem chi tiet</span>
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Charts & Quick Actions Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Commission Chart */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-brand" />
                                Hoa hong 7 ngay qua
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Tong quan thu nhap tu gioi thieu</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer">
                                <option value="7">7 ngay gan nhat</option>
                                <option value="14">14 ngay gan nhat</option>
                                <option value="30">30 ngay gan nhat</option>
                            </select>
                            <button
                                onClick={fetchAgentStats}
                                className="p-2.5 hover:bg-amber-50 rounded-xl transition-colors"
                                title="Lam moi"
                            >
                                <RefreshCw size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.commissionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorCommissionAgent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9C7043" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9C7043" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={true} horizontal={true} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={false}
                                    dy={10}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                    width={50}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${(value || 0).toLocaleString('vi-VN')}d`, 'Hoa hong']}
                                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="#9C7043"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCommissionAgent)"
                                    animationDuration={1000}
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Thao tac nhanh
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/agent/orders"
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand to-brand-light rounded-2xl hover:shadow-xl hover:shadow-brand/30 transition-all group border-2 border-transparent hover:border-brand/30"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <ShoppingCart className="w-6 h-6 text-brand" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">Xem don hang</div>
                                <div className="text-gray-600 text-sm">{displayStats.totalReferrals} don da gioi thieu</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                        </Link>

                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl border-2 border-emerald-400">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">So du vi</div>
                                <div className="text-white/90 text-lg font-bold">{formatPrice(displayStats.walletBalance)}d</div>
                            </div>
                        </div>

                        <Link
                            href="/products"
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">San pham</div>
                                <div className="text-gray-500 text-sm">Xem danh sach san pham</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            href="/"
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ExternalLink className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">Website</div>
                                <div className="text-gray-500 text-sm">Xem trang chu</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Total Revenue Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Tong doanh thu gioi thieu</h3>
                            <p className="text-gray-500 text-sm mt-1">Tong gia tri don hang tu khach ban gioi thieu</p>
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-gray-800">
                        {formatPrice(displayStats.totalRevenue)}<span className="text-lg font-bold text-gray-500">d</span>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-brand" />
                            Don hang gan day
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Danh sach don hang moi nhat</p>
                    </div>
                    <Link
                        href="/agent/orders"
                        className="text-brand hover:text-brand/80 font-semibold text-sm flex items-center gap-1"
                    >
                        Xem tat ca <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-amber-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ma don</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khach hang</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Gia tri</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hoa hong</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trang thai</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(!displayStats.recentOrders || displayStats.recentOrders.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <ShoppingCart className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium text-lg">Chua co don hang nao</p>
                                                <p className="text-gray-500 text-sm mt-1">Don hang se hien thi khi co khach dat hang qua ma gioi thieu cua ban</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayStats.recentOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                                                    #{order.orderId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-800">{order.customerName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-gray-800">{formatPrice(order.totalAmount)}d</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-emerald-600">+{formatPrice(order.commissionAmount)}d</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.class}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-gray-500 text-sm">{formatDate(order.createdAt)}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
