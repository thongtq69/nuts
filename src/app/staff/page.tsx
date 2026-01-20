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
    Briefcase,
    ExternalLink,
    Award,
    Target,
    BarChart3
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
import { DashboardSkeleton } from '@/components/dashboard';

interface StaffStats {
    totalCommission: number;
    walletBalance: number;
    totalCollaborators: number;
    totalOrders: number;
    teamRevenue: number;
    pendingCommission: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    commissionData: { date: string; commission: number }[];
    recentCollaborators: {
        id: string;
        name: string;
        code: string;
        orders: number;
        revenue: number;
        status: 'active' | 'inactive';
        createdAt: string;
    }[];
}

export default function StaffDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StaffStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(7);

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

    const copyReferralLink = () => {
        if ((user as any)?.referralCode) {
            const link = `${window.location.origin}?ref=${(user as any).referralCode}`;
            navigator.clipboard.writeText(link);
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

    // Mock data
    const mockStats: StaffStats = {
        totalCommission: 2500000,
        walletBalance: 1200000,
        totalCollaborators: 5,
        totalOrders: 42,
        teamRevenue: 25000000,
        pendingCommission: 350000,
        thisMonthRevenue: 8500000,
        lastMonthRevenue: 7200000,
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
            { id: '1', name: 'Nguyen Thi Huong', code: 'NV001-CTV1', orders: 15, revenue: 12500000, status: 'active', createdAt: '2026-01-10' },
            { id: '2', name: 'Tran Van Minh', code: 'NV001-CTV2', orders: 8, revenue: 5200000, status: 'active', createdAt: '2026-01-12' },
            { id: '3', name: 'Le Thi Lan', code: 'NV001-CTV3', orders: 12, revenue: 9800000, status: 'inactive', createdAt: '2026-01-15' },
        ]
    };

    const displayStats = stats || mockStats;

    // Calculate growth percentage
    const growthPercent = displayStats.lastMonthRevenue > 0 
        ? Math.round(((displayStats.thisMonthRevenue - displayStats.lastMonthRevenue) / displayStats.lastMonthRevenue) * 100)
        : 0;

    const referralCode = (user as any)?.referralCode || (user as any)?.staffCode || 'STAFF001';

    if (loading) {
        return (
            <div className="w-full max-w-[1400px] mx-auto">
                <DashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Welcome Card */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#9C7043] via-[#B8956F] to-[#E3C88D] rounded-2xl p-6 lg:p-8 shadow-xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E3C88D]/30 rounded-full blur-2xl" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium">Xin chao</p>
                                <h1 className="text-xl lg:text-2xl font-bold text-white">{user?.name || 'Nhan vien'}</h1>
                            </div>
                        </div>
                        
                        <p className="text-white/90 mb-6 max-w-md">
                            Quan ly doi ngu cong tac vien va theo doi doanh thu cua ban
                        </p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-white/70 text-xs mb-1">So du vi</p>
                                <p className="text-white text-xl font-bold">{formatPrice(displayStats.walletBalance)}d</p>
                            </div>
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-white/70 text-xs mb-1">Hoa hong cho duyet</p>
                                <p className="text-white text-xl font-bold">{formatPrice(displayStats.pendingCommission)}d</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral Link Card */}
                <div className="lg:w-[400px] bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-[#9C7043]/10 rounded-xl flex items-center justify-center">
                            <LinkIcon className="w-5 h-5 text-[#9C7043]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Link tiep thi</h3>
                            <p className="text-xs text-gray-500">Chia se de nhan hoa hong</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#9C7043]/5 to-[#E3C88D]/10 rounded-xl p-4 mb-4 border border-[#9C7043]/10">
                        <p className="text-xs text-gray-500 mb-1">Ma nhan vien</p>
                        <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xl text-[#9C7043]">{referralCode}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(referralCode)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                            >
                                <Copy size={16} className="text-[#9C7043]" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors truncate"
                            onClick={copyReferralLink}
                        />
                        <button
                            onClick={copyReferralLink}
                            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                copied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[#9C7043] text-white hover:bg-[#7d5a36]'
                            }`}
                        >
                            {copied ? 'Da sao!' : 'Sao chep'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} />+12%
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">{formatPrice(displayStats.walletBalance)}d</p>
                    <p className="text-gray-500 text-sm mt-1">So du vi</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#9C7043] to-[#E3C88D] rounded-xl flex items-center justify-center shadow-lg shadow-[#9C7043]/25">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} />+8%
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">{formatPrice(displayStats.totalCommission)}d</p>
                    <p className="text-gray-500 text-sm mt-1">Tong hoa hong</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} />+2
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">{displayStats.totalCollaborators}</p>
                    <p className="text-gray-500 text-sm mt-1">Cong tac vien</p>
                    <Link href="/staff/collaborators" className="mt-3 flex items-center gap-1 text-sm text-violet-600 font-medium hover:text-violet-700">
                        Quan ly <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} />+5
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-800">{displayStats.totalOrders}</p>
                    <p className="text-gray-500 text-sm mt-1">Don hang team</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[#9C7043]" />
                                Doanh thu hoa hong
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">Bieu do thu nhap theo ngay</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {[7, 14, 30].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            selectedPeriod === period
                                                ? 'bg-[#9C7043] text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        {period}D
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={fetchStats}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <RefreshCw size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.commissionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCommissionNew" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9C7043" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9C7043" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${(value || 0).toLocaleString('vi-VN')}d`, 'Hoa hong']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="#9C7043"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCommissionNew)"
                                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#9C7043' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Comparison */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Doanh thu thang nay</p>
                                <p className="text-2xl font-bold text-gray-800">{formatPrice(displayStats.thisMonthRevenue)}d</p>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                                growthPercent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                                <TrendingUp size={20} />
                                <span className="font-bold">{growthPercent >= 0 ? '+' : ''}{growthPercent}%</span>
                                <span className="text-sm">so voi thang truoc</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#E3C88D]" />
                        Thao tac nhanh
                    </h3>
                    
                    <div className="space-y-3">
                        <Link
                            href="/staff/collaborators?action=create"
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#9C7043] to-[#B8956F] rounded-xl hover:shadow-lg transition-all group"
                        >
                            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserPlus className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white">Tao ma CTV moi</p>
                                <p className="text-white/70 text-sm">Them cong tac vien</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/60" />
                        </Link>

                        <Link
                            href="/staff/commissions"
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:shadow-lg transition-all group"
                        >
                            <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white">Xem hoa hong</p>
                                <p className="text-white/70 text-sm">Chi tiet thu nhap</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/60" />
                        </Link>

                        <Link
                            href="/staff/collaborators"
                            className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
                        >
                            <div className="w-11 h-11 bg-violet-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">Quan ly CTV</p>
                                <p className="text-gray-500 text-sm">{displayStats.totalCollaborators} thanh vien</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>

                        <Link
                            href="/staff/orders"
                            className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                        >
                            <div className="w-11 h-11 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingCart className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">Don hang</p>
                                <p className="text-gray-500 text-sm">{displayStats.totalOrders} don tu team</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>

                        <Link
                            href="/"
                            className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-100/50 transition-all group"
                        >
                            <div className="w-11 h-11 bg-gray-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ExternalLink className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800">Website</p>
                                <p className="text-gray-500 text-sm">Xem trang chu</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Team Revenue Summary */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#E3C88D] to-[#9C7043] rounded-xl flex items-center justify-center shadow-lg">
                            <Target className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Tong doanh thu doi nhom</h3>
                            <p className="text-gray-400 text-sm">Tu tat ca cong tac vien</p>
                        </div>
                    </div>
                    <div className="text-4xl font-black bg-gradient-to-r from-[#E3C88D] to-amber-400 bg-clip-text text-transparent">
                        {formatPrice(displayStats.teamRevenue)}d
                    </div>
                </div>
            </div>

            {/* Collaborators Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#9C7043]" />
                            Cong tac vien gan day
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Danh sach CTV trong doi</p>
                    </div>
                    <Link
                        href="/staff/collaborators"
                        className="flex items-center gap-2 px-4 py-2 bg-[#9C7043]/10 text-[#9C7043] rounded-xl font-medium hover:bg-[#9C7043]/20 transition-colors"
                    >
                        Xem tat ca <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">CTV</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ma gioi thieu</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Don hang</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Doanh thu</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Trang thai</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Ngay tham gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(!displayStats.recentCollaborators || displayStats.recentCollaborators.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-[#9C7043]/10 rounded-full flex items-center justify-center">
                                                <Users className="w-10 h-10 text-[#9C7043]" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium text-lg">Chua co cong tac vien nao</p>
                                                <p className="text-gray-500 text-sm mt-1">Tao CTV dau tien de bat dau!</p>
                                            </div>
                                            <Link
                                                href="/staff/collaborators?action=create"
                                                className="px-6 py-3 bg-[#9C7043] text-white font-bold rounded-xl hover:bg-[#7d5a36] transition-colors flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Tao CTV dau tien
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayStats.recentCollaborators.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#9C7043] to-[#E3C88D] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                                                    {collab.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-800">{collab.name}</span>
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
                                            <span className="font-bold text-emerald-600">{formatPrice(collab.revenue)}d</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                collab.status === 'active' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {collab.status === 'active' ? 'Hoat dong' : 'Tam dung'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-gray-500 text-sm">{formatDate(collab.createdAt)}</span>
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
