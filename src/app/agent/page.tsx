'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { generateReferralLink } from '@/lib/affiliate';
import BankInfoDisplay from '@/components/payment/BankInfoDisplay';
import {
    Wallet,
    DollarSign,
    ShoppingCart,
    Copy,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Sparkles,
    Link as LinkIcon,
    RefreshCw,
    Clock,
    ExternalLink,
    BarChart3,
    Package
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
    recentOrders: Array<{
        _id: string;
        orderId: string;
        customerName: string;
        totalAmount: number;
        commissionAmount: number;
        status: string;
        createdAt: string;
    }>;
    commissionData: { date: string; commission: number }[];
}

export default function AgentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(7);

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

    // Safe format price function to prevent NaN
    const formatPrice = (price: number | null | undefined) => {
        if (price === null || price === undefined || isNaN(price)) {
            return '0';
        }
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const formatDate = (date: string) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return '';
        }
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; class: string }> = {
            pending: { label: 'Chờ xử lý', class: 'bg-amber-100 text-amber-700' },
            processing: { label: 'Đang xử lý', class: 'bg-[#E3C88D] text-[#7d5a36]' },
            shipping: { label: 'Đang giao', class: 'bg-purple-100 text-purple-700' },
            completed: { label: 'Hoàn thành', class: 'bg-green-100 text-green-700' },
            cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-700' }
        };
        return configs[status] || { label: status, class: 'bg-slate-100 text-slate-700' };
    };

    if (authLoading || loading) {
        return (
            <div className="w-full">
                <DashboardSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Welcome Banner */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Welcome Card */}
                <div className="flex-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#E3C88D] rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-[#9C7044]" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Xin chào</p>
                                <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Đại lý'}</h1>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-slate-600 mt-4 mb-6">
                        Theo dõi doanh thu và hoa hồng từ khách hàng bạn giới thiệu
                    </p>

                    {/* Referral Link */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-700 mb-3">
                            <LinkIcon size={16} className="text-[#9C7044]" />
                            <span className="font-semibold text-slate-900">Link tiếp thị của bạn</span>
                        </div>
                        
                        <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 flex items-center gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Mã giới thiệu</div>
                                <div className="font-mono font-semibold text-slate-700 truncate">{displayStats.referralCode}</div>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(displayStats.referralCode);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                                title="Sao chép mã"
                            >
                                <Copy size={16} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                onClick={copyReferralLink}
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600 font-mono cursor-pointer hover:bg-slate-50 transition-colors truncate"
                                title="Click để sao chép link tiếp thị đầy đủ"
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
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <span className="text-amber-500">*</span>
                            Chia sẻ link tiếp thị để nhận hoa hồng 10% từ đơn hàng của khách
                        </p>
                    </div>
                </div>

                {/* Stats Summary Card */}
                <div className="lg:w-[420px] bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Tổng doanh thu giới thiệu</h3>
                            <p className="text-xs text-slate-500">Tổng giá trị đơn hàng từ khách bạn giới thiệu</p>
                        </div>
                    </div>
                    
                    <div className="text-3xl font-bold text-slate-900 mb-4">
                        {formatPrice(displayStats.totalRevenue)}đ
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Tổng hoa hồng</p>
                            <p className="text-lg font-bold text-slate-900">{formatPrice(displayStats.totalCommission)}đ</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Số dư ví</p>
                            <p className="text-lg font-bold text-green-600">{formatPrice(displayStats.walletBalance)}đ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Wallet}
                    label="Số dư ví"
                    value={`${formatPrice(displayStats.walletBalance)}đ`}
                    trend="+12.5%"
                    trendUp={true}
                    color="green"
                />
                <StatCard
                    icon={DollarSign}
                    label="Tổng hoa hồng"
                    value={`${formatPrice(displayStats.totalCommission)}đ`}
                    trend="+8.2%"
                    trendUp={true}
                    color="blue"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Đơn hàng giới thiệu"
                    value={displayStats.totalReferrals?.toString() || '0'}
                    trend="+5"
                    trendUp={true}
                    color="purple"
                    href="/agent/orders"
                />
                <StatCard
                    icon={Clock}
                    label="Chờ xử lý"
                    value={displayStats.pendingOrders?.toString() || '0'}
                    subtitle="đơn hàng"
                    trend=""
                    trendUp={true}
                    color="orange"
                />
            </div>

            {/* Charts & Quick Actions Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Commission Chart */}
                <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-[#9C7044]" />
                                Hoa hồng 7 ngày qua
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Tổng quan thu nhập từ giới thiệu</p>
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
                                onClick={fetchAgentStats}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Làm mới"
                            >
                                <RefreshCw size={18} className="text-slate-400" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayStats.commissionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCommissionAgent" x1="0" y1="0" x2="0" y2="1">
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
                                    formatter={(value: number | undefined) => [`${formatPrice(value)}đ`, 'Hoa hồng']}
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
                                    fill="url(#colorCommissionAgent)"
                                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#2563EB' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
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
                            href="/agent/orders"
                            icon={ShoppingCart}
                            title="Xem đơn hàng"
                            subtitle={`${displayStats.totalReferrals || 0} đơn đã giới thiệu`}
                            color="blue"
                        />

                        <QuickAction
                            href="/agent/commissions"
                            icon={Wallet}
                            title="Số dư ví"
                            subtitle={`${formatPrice(displayStats.walletBalance)}đ`}
                            color="green"
                        />

                        {/* Bank Info for Withdrawal */}
                        <div className="mt-2">
                            <BankInfoDisplay compact />
                        </div>

                        <QuickAction
                            href="/products"
                            icon={Package}
                            title="Sản phẩm"
                            subtitle="Xem danh sách sản phẩm"
                            color="purple"
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

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-[#9C7044]" />
                            Đơn hàng gần đây
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Danh sách đơn hàng mới nhất</p>
                    </div>
                    <Link
                        href="/agent/orders"
                        className="flex items-center gap-2 px-4 py-2 bg-[#F5EFE6] text-[#7d5a36] rounded-lg font-medium hover:bg-[#E3C88D] transition-colors"
                    >
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá trị</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoa hồng</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(!displayStats.recentOrders || displayStats.recentOrders.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <ShoppingCart className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-medium text-lg">Chưa có đơn hàng nào</p>
                                                <p className="text-slate-500 text-sm mt-1">Đơn hàng sẽ hiển thị khi có khách đặt hàng qua mã giới thiệu của bạn</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayStats.recentOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                                                    #{order.orderId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-900">{order.customerName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-slate-900">{formatPrice(order.totalAmount)}đ</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-green-600">+{formatPrice(order.commissionAmount)}đ</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-slate-500 text-sm">{formatDate(order.createdAt)}</span>
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

// Stat Card Component
function StatCard({ 
    icon: Icon, 
    label, 
    value, 
    subtitle,
    trend, 
    trendUp,
    color,
    href 
}: { 
    icon: any; 
    label: string; 
    value: string;
    subtitle?: string;
    trend: string;
    trendUp: boolean;
    color: 'blue' | 'green' | 'purple' | 'orange';
    href?: string;
}) {
    const colorClasses = {
        blue: 'bg-[#E3C88D] text-[#9C7044]',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    const content = (
        <div className={`bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${href ? 'cursor-pointer' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-slate-500 text-sm mt-1">
                {label}
                {subtitle && <span className="text-slate-400 ml-1">({subtitle})</span>}
            </p>
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
