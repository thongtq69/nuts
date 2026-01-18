'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    TrendingUp,
    Users,
    Wallet,
    ShoppingBag,
    Copy,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Sparkles,
    Link as LinkIcon,
    RefreshCw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

interface StaffStats {
    totalCommission: number;
    walletBalance: number;
    totalCollaborators: number;
    totalOrders: number;
    teamRevenue: number;
    commissionData: { date: string; commission: number }[];
    collaborators: {
        id: string;
        name: string;
        code: string;
        orders: number;
        revenue: number;
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

    // Mock data for demo
    const mockStats: StaffStats = {
        totalCommission: 2500000,
        walletBalance: 1200000,
        totalCollaborators: 5,
        totalOrders: 42,
        teamRevenue: 25000000,
        commissionData: [
            { date: '10/01', commission: 150000 },
            { date: '11/01', commission: 280000 },
            { date: '12/01', commission: 420000 },
            { date: '13/01', commission: 350000 },
            { date: '14/01', commission: 580000 },
            { date: '15/01', commission: 320000 },
            { date: '16/01', commission: 400000 },
        ],
        collaborators: [
            { id: '1', name: 'Nguyễn Văn A', code: 'NV001-CTV1', orders: 12, revenue: 8500000 },
            { id: '2', name: 'Trần Thị B', code: 'NV001-CTV2', orders: 8, revenue: 5200000 },
            { id: '3', name: 'Lê Văn C', code: 'NV001-CTV3', orders: 15, revenue: 9800000 },
        ]
    };

    const displayStats = stats || mockStats;

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-brand via-brand/80 to-brand-light rounded-2xl p-6 lg:p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-200" />
                        <span className="text-white/90 font-medium text-sm">Xin chào!</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                        Chào mừng trở lại, {user?.name} 👋
                    </h1>
                    <p className="text-white/80 text-sm lg:text-base max-w-xl mb-4">
                        Đây là tổng quan hoạt động của bạn và đội ngũ cộng tác viên.
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-lg">
                        <div className="flex items-center gap-2 text-sm text-white/90 mb-2">
                            <LinkIcon size={14} />
                            <span>Link giới thiệu của bạn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${(user as any)?.referralCode || ''}`}
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none"
                            />
                            <button
                                onClick={copyReferralLink}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${copied
                                    ? 'bg-brand-light text-gray-800'
                                    : 'bg-white text-brand hover:bg-brand-light/10'
                                    }`}
                            >
                                {copied ? 'Đã sao chép!' : 'Sao chép'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                            <ArrowUpRight size={12} />
                            +12%
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                        {displayStats.walletBalance.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-slate-500">Số dư ví</div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-brand" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                        {displayStats.totalCommission.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-slate-500">Tổng hoa hồng</div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-brand" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                        {displayStats.totalCollaborators}
                    </div>
                    <div className="text-sm text-slate-500">Cộng tác viên</div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-light/30 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-700" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                        {displayStats.totalOrders}
                    </div>
                    <div className="text-sm text-slate-500">Đơn hàng team</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Commission Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Hoa hồng 7 ngày qua</h3>
                        <button
                            onClick={fetchStats}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <RefreshCw size={16} className="text-slate-500" />
                        </button>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.commissionData}>
                                <defs>
                                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9C7043" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#9C7043" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="#94a3b8"
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value) => [`${(value as number).toLocaleString('vi-VN')}đ`, 'Hoa hồng']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="#9C7043"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCommission)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Thao tác nhanh</h3>
                    <div className="space-y-3">
                        <Link
                            href="/staff/collaborators?action=create"
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand to-brand-light text-white rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all"
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-semibold">Tạo mã CTV mới</div>
                                <div className="text-white/90 text-xs">Thêm cộng tác viên</div>
                            </div>
                        </Link>

                        <Link
                            href="/staff/commissions"
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-slate-800">Xem hoa hồng</div>
                                <div className="text-slate-500 text-xs">Chi tiết thu nhập</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/staff/collaborators"
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-brand" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-slate-800">Quản lý CTV</div>
                                <div className="text-slate-500 text-xs">{displayStats.totalCollaborators} cộng tác viên</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Collaborators Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Cộng tác viên của bạn</h3>
                        <Link
                            href="/staff/collaborators"
                            className="text-sm text-brand hover:text-brand/80 font-medium flex items-center gap-1"
                        >
                            Xem tất cả <ChevronRight size={14} />
                        </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tên</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã CTV</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Đơn hàng</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayStats.collaborators.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Users className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">Chưa có cộng tác viên nào</p>
                                            <Link
                                                href="/staff/collaborators?action=create"
                                                className="text-sm text-brand hover:underline font-medium"
                                            >
                                                Tạo mã CTV đầu tiên
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayStats.collaborators.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {collab.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-800">{collab.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                                {collab.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-slate-800">{collab.orders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">
                                                {collab.revenue.toLocaleString('vi-VN')}đ
                                            </span>
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
