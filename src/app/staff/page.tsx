'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    Users,
    Wallet,
    ShoppingCart,
    Copy,
    Plus,
    TrendingUp,
    ArrowUpRight,
    ChevronRight,
    Sparkles,
    Link as LinkIcon,
    RefreshCw,
    UserPlus,
    DollarSign,
    Gift
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

interface StaffStats {
    totalCommission: number;
    walletBalance: number;
    totalCollaborators: number;
    totalOrders: number;
    teamRevenue: number;
    commissionData: { date: string; commission: number }[];
    recentCollaborators: {
        id: string;
        name: string;
        code: string;
        orders: number;
        revenue: number;
        createdAt: string;
    }[];
}

export default function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StaffStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/staff/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        if ((user as any)?.referralCode) {
            const link = `${window.location.origin}?ref=${(user as any).referralCode}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    // Mock data for demo
    const mockStats: StaffStats = {
        totalCommission: 2500000,
        walletBalance: 1200000,
        totalCollaborators: 5,
        totalOrders: 42,
        teamRevenue: 25000000,
        commissionData: [
            { date: '13/01', commission: 180000 },
            { date: '14/01', commission: 320000 },
            { date: '15/01', commission: 280000 },
            { date: '16/01', commission: 450000 },
            { date: '17/01', commission: 380000 },
            { date: '18/01', commission: 520000 },
            { date: '19/01', commission: 410000 },
        ],
        recentCollaborators: [
            { id: '1', name: 'Nguyễn Thị Hương', code: 'NV001-CTV1', orders: 15, revenue: 12500000, createdAt: '2026-01-10' },
            { id: '2', name: 'Trần Văn Minh', code: 'NV001-CTV2', orders: 8, revenue: 5200000, createdAt: '2026-01-12' },
            { id: '3', name: 'Lê Thị Lan', code: 'NV001-CTV3', orders: 12, revenue: 9800000, createdAt: '2026-01-15' },
        ]
    };

    const displayStats = stats || mockStats;

    const statCards = [
        {
            label: 'Số dư ví',
            value: formatPrice(displayStats.walletBalance) + 'đ',
            icon: Wallet,
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            change: '+12.5%',
            trend: 'up'
        },
        {
            label: 'Tổng hoa hồng',
            value: formatPrice(displayStats.totalCommission) + 'đ',
            icon: DollarSign,
            color: 'from-brand to-brand-light',
            bgColor: 'bg-amber-50',
            textColor: 'text-brand',
            change: '+8.2%',
            trend: 'up'
        },
        {
            label: 'Cộng tác viên',
            value: displayStats.totalCollaborators,
            icon: Users,
            color: 'from-violet-500 to-purple-500',
            bgColor: 'bg-violet-50',
            textColor: 'text-violet-600',
            change: '+2',
            trend: 'up',
            href: '/staff/collaborators'
        },
        {
            label: 'Đơn hàng team',
            value: displayStats.totalOrders,
            icon: ShoppingCart,
            color: 'from-orange-500 to-amber-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            change: '+5',
            trend: 'up'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-brand via-brand-light to-amber-400 rounded-3xl p-8 text-gray-800 shadow-2xl shadow-brand/20">
                {/* Decorative elements */}
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
                        <Sparkles className="w-5 h-5 text-amber-200" />
                        <span className="font-medium text-sm text-gray-800">Xin chào, {user?.name}! 👋</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-3 text-gray-800">
                        Chào mừng bạn trở lại!
                    </h1>
                    <p className="text-gray-700 text-lg max-w-2xl mb-6">
                        Đây là tổng quan hoạt động của bạn và đội ngũ cộng tác viên.
                    </p>

                    {/* Referral Link */}
                    <div className="bg-gray-800/10 backdrop-blur-sm rounded-2xl p-4 max-w-xl border border-gray-700/20">
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                            <LinkIcon size={14} />
                            <span className="font-medium">Link giới thiệu của bạn</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${((user as any)?.referralCode || (user as any)?.staffCode || '')}`}
                                onClick={copyReferralLink}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                                title="Click để sao chép"
                            />
                            <button
                                onClick={copyReferralLink}
                                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                    copied
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-brand text-white hover:bg-brand/90'
                                }`}
                            >
                                {copied ? '✓ Đã sao!' : 'Sao chép'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Chia sẻ link này để nhận hoa hồng khi có đơn hàng mới
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
                                            : 'bg-red-100 text-red-600'
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
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-600 font-semibold rounded-xl transition-all text-sm"
                                >
                                    <span>Quản lý</span>
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Charts & Quick Actions Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Commission Chart */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-brand" />
                                Doanh thu hoa hồng 7 ngày
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Tổng quan thu nhập từ đội nhóm</p>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="p-2.5 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Làm mới"
                        >
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.commissionData}>
                                <defs>
                                    <linearGradient id="colorCommissionStaff" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9C7043" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9C7043" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${(value || 0).toLocaleString('vi-VN')}đ`, 'Hoa hồng']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
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
                                    fill="url(#colorCommissionStaff)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Thao tác nhanh
                    </h3>
                    <div className="space-y-3">
                        <Link
                            href="/staff/collaborators?action=create"
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand to-brand-light rounded-2xl hover:shadow-xl hover:shadow-brand/25 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserPlus className="w-6 h-6 text-gray-800" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-800">Tạo mã CTV mới</div>
                                <div className="text-gray-700 text-sm">Thêm cộng tác viên</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/staff/commissions"
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">Xem hoa hồng</div>
                                <div className="text-white/80 text-sm">Chi tiết thu nhập</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/staff/commissions"
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:shadow-xl hover:shadow-emerald-500/25 transition-all group"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-white">Xem hoa hồng</div>
                                <div className="text-white/80 text-sm">Chi tiết thu nhập</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/staff/collaborators"
                            className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand hover:bg-amber-50/50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-brand" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-800">Quản lý CTV</div>
                                <div className="text-gray-500 text-sm">{displayStats.totalCollaborators} cộng tác viên</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Team Revenue Summary */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Tổng doanh thu đội nhóm</h3>
                        <p className="text-gray-400">Tổng doanh thu từ tất cả cộng tác viên</p>
                    </div>
                    <div className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                        {formatPrice(displayStats.teamRevenue)}đ
                    </div>
                </div>
            </div>

            {/* Recent Collaborators */}
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-brand" />
                            Cộng tác viên gần đây
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Danh sách CTV mới nhất trong đội</p>
                    </div>
                    <Link
                        href="/staff/collaborators"
                        className="text-brand hover:text-brand/80 font-semibold text-sm flex items-center gap-1"
                    >
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-amber-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CTV</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã giới thiệu</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Doanh thu</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(!displayStats.recentCollaborators || displayStats.recentCollaborators.length === 0) ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <Users className="w-10 h-10 text-amber-300" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium text-lg">Chưa có cộng tác viên nào</p>
                                                <p className="text-gray-400 text-sm mt-1">Hãy tạo CTV đầu tiên để bắt đầu!</p>
                                            </div>
                                            <Link
                                                href="/staff/collaborators?action=create"
                                                className="px-6 py-3 bg-gradient-to-r from-brand to-brand-light text-gray-800 font-bold rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Tạo CTV đầu tiên
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayStats.recentCollaborators?.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-light rounded-xl flex items-center justify-center text-white font-bold">
                                                    {collab.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-gray-800">{collab.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                                                {collab.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-800">{collab.orders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">
                                                {collab.revenue.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-500 text-sm">{collab.createdAt}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
