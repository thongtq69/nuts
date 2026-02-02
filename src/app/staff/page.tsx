'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    Users,
    Wallet,
    ShoppingCart,
    Copy,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Sparkles,
    Link as LinkIcon,
    RefreshCw,
    UserPlus,
    DollarSign,
    ExternalLink,
    Award,
    Target,
    BarChart3,
    Plus
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
            <div className="w-full">
                <DashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Welcome Card */}
                <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#E3C88D] rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-[#9C7044]" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Xin chào</p>
                                <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Nhân viên'}</h1>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-slate-600 mt-4 mb-6">
                        Quản lý đội ngũ cộng tác viên và theo dõi doanh thu của bạn
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <p className="text-slate-500 text-xs font-medium mb-1">Số dư ví</p>
                            <p className="text-slate-900 text-lg font-bold">{formatPrice(displayStats.walletBalance)}đ</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <p className="text-slate-500 text-xs font-medium mb-1">Hoa hồng chờ duyệt</p>
                            <p className="text-slate-900 text-lg font-bold">{formatPrice(displayStats.pendingCommission)}đ</p>
                        </div>
                    </div>
                </div>

                {/* Referral Link Card */}
                <div className="lg:w-[420px] bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#E3C88D] rounded-lg flex items-center justify-center">
                            <LinkIcon className="w-5 h-5 text-[#9C7044]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Link tiếp thị</h3>
                            <p className="text-xs text-slate-500">Chia sẻ để nhận hoa hồng</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Mã nhân viên</p>
                        <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-lg text-slate-900">{referralCode}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(referralCode)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                            >
                                <Copy size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors truncate"
                            onClick={copyReferralLink}
                        />
                        <button
                            onClick={copyReferralLink}
                            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                copied
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-[#9C7044] text-white hover:bg-[#7d5a36]'
                            }`}
                        >
                            {copied ? 'Đã sao chép!' : 'Sao chép'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Wallet}
                    label="Số dư ví"
                    value={`${formatPrice(displayStats.walletBalance)}đ`}
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                />
                <StatCard
                    icon={DollarSign}
                    label="Tổng hoa hồng"
                    value={`${formatPrice(displayStats.totalCommission)}đ`}
                    trend="+8%"
                    trendUp={true}
                    color="green"
                />
                <StatCard
                    icon={Users}
                    label="Cộng tác viên"
                    value={displayStats.totalCollaborators.toString()}
                    trend="+2"
                    trendUp={true}
                    color="purple"
                    href="/staff/collaborators"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Đơn hàng team"
                    value={displayStats.totalOrders.toString()}
                    trend="+5"
                    trendUp={true}
                    color="orange"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[#9C7044]" />
                                Doanh thu hoa hồng
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Biểu đồ thu nhập theo ngày</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                {[7, 14, 30].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            selectedPeriod === period
                                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {period}D
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={fetchStats}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <RefreshCw size={18} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.commissionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#64748B' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#64748B' }}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                />
                                <Tooltip
                                    formatter={(value: number | undefined) => [`${(value || 0).toLocaleString('vi-VN')}đ`, 'Hoa hồng']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCommission)"
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#2563EB' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Comparison */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Doanh thu tháng này</p>
                                <p className="text-xl font-bold text-slate-900">{formatPrice(displayStats.thisMonthRevenue)}đ</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                                growthPercent >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                                {growthPercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                <span className="font-semibold text-sm">{growthPercent >= 0 ? '+' : ''}{growthPercent}%</span>
                                <span className="text-sm opacity-80">so với tháng trước</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#9C7044]" />
                        Thao tác nhanh
                    </h3>
                    
                    <div className="space-y-3">
                        <QuickAction
                            href="/staff/collaborators?action=create"
                            icon={UserPlus}
                            title="Tạo mã CTV mới"
                            subtitle="Thêm cộng tác viên"
                            color="blue"
                        />

                        <QuickAction
                            href="/staff/commissions"
                            icon={Wallet}
                            title="Xem hoa hồng"
                            subtitle="Chi tiết thu nhập"
                            color="green"
                        />

                        <QuickAction
                            href="/staff/collaborators"
                            icon={Users}
                            title="Quản lý CTV"
                            subtitle={`${displayStats.totalCollaborators} thành viên`}
                            color="purple"
                            variant="outline"
                        />

                        <QuickAction
                            href="/staff/orders"
                            icon={ShoppingCart}
                            title="Đơn hàng"
                            subtitle={`${displayStats.totalOrders} đơn từ team`}
                            color="orange"
                            variant="outline"
                        />

                        <QuickAction
                            href="/"
                            icon={ExternalLink}
                            title="Website"
                            subtitle="Xem trang chủ"
                            color="gray"
                            variant="outline"
                        />
                    </div>
                </div>
            </div>

            {/* Team Revenue Summary */}
            <div className="bg-slate-900 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#9C7044] rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Tổng doanh thu đội nhóm</h3>
                            <p className="text-slate-400 text-sm">Từ tất cả cộng tác viên</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {formatPrice(displayStats.teamRevenue)}đ
                    </div>
                </div>
            </div>

            {/* Collaborators Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#9C7044]" />
                            Cộng tác viên gần đây
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Danh sách CTV trong đội</p>
                    </div>
                    <Link
                        href="/staff/collaborators"
                        className="flex items-center gap-2 px-4 py-2 bg-[#F5EFE6] text-[#7d5a36] rounded-lg font-medium hover:bg-[#E3C88D] transition-colors"
                    >
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CTV</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã giới thiệu</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Đơn hàng</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh thu</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tham gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!displayStats.recentCollaborators || displayStats.recentCollaborators.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Users className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-medium text-lg">Chưa có cộng tác viên nào</p>
                                                <p className="text-slate-500 text-sm mt-1">Tạo CTV đầu tiên để bắt đầu!</p>
                                            </div>
                                            <Link
                                                href="/staff/collaborators?action=create"
                                                className="px-5 py-2.5 bg-[#9C7044] text-white font-medium rounded-lg hover:bg-[#7d5a36] transition-colors flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Tạo CTV đầu tiên
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayStats.recentCollaborators.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-[#E3C88D] rounded-lg flex items-center justify-center text-[#7d5a36] font-semibold text-sm">
                                                    {collab.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900">{collab.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                                                {collab.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-slate-900">{collab.orders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-green-600">{formatPrice(collab.revenue)}đ</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                collab.status === 'active' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {collab.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-slate-500 text-sm">{formatDate(collab.createdAt)}</span>
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

// Stat Card Component
function StatCard({ 
    icon: Icon, 
    label, 
    value, 
    trend, 
    trendUp,
    color,
    href 
}: { 
    icon: any; 
    label: string; 
    value: string; 
    trend: string;
    trendUp: boolean;
    color: 'blue' | 'green' | 'purple' | 'orange';
    href?: string;
}) {
    const colorClasses = {
        blue: 'bg-[#F5EFE6] text-[#9C7044]',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    const iconBgClasses = {
        blue: 'bg-[#E3C88D] text-[#9C7044]',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    const content = (
        <div className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${href ? 'hover:border-[#9C7044]' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${iconBgClasses[color]} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {trend}
                </span>
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

// Quick Action Component
function QuickAction({ 
    href, 
    icon: Icon, 
    title, 
    subtitle, 
    color,
    variant = 'solid'
}: { 
    href: string; 
    icon: any; 
    title: string; 
    subtitle: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
    variant?: 'solid' | 'outline';
}) {
    const solidClasses = {
        blue: 'bg-[#9C7044] text-white hover:bg-[#7d5a36]',
        green: 'bg-green-600 text-white hover:bg-green-700',
        purple: 'bg-purple-600 text-white hover:bg-purple-700',
        orange: 'bg-orange-600 text-white hover:bg-orange-700',
        gray: 'bg-slate-700 text-white hover:bg-slate-800',
    };

    const outlineClasses = {
        blue: 'bg-white border-2 border-slate-200 hover:border-[#9C7044] hover:bg-[#F5EFE6]',
        green: 'bg-white border-2 border-slate-200 hover:border-green-300 hover:bg-green-50',
        purple: 'bg-white border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50',
        orange: 'bg-white border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50',
        gray: 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    };

    const iconClasses = {
        blue: variant === 'solid' ? 'bg-white/20 text-white' : 'bg-[#E3C88D] text-[#9C7044]',
        green: variant === 'solid' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600',
        purple: variant === 'solid' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600',
        orange: variant === 'solid' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600',
        gray: variant === 'solid' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600',
    };

    const textClasses = variant === 'solid' ? 'text-white' : 'text-slate-900';
    const subtitleClasses = variant === 'solid' ? 'text-white/70' : 'text-slate-500';
    const chevronClasses = variant === 'solid' ? 'text-white/60' : 'text-slate-400';

    return (
        <Link
            href={href}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${
                variant === 'solid' ? solidClasses[color] : outlineClasses[color]
            }`}
        >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <p className={`font-semibold ${textClasses}`}>{title}</p>
                <p className={`text-sm ${subtitleClasses}`}>{subtitle}</p>
            </div>
            <ChevronRight className={`w-5 h-5 ${chevronClasses}`} />
        </Link>
    );
}
