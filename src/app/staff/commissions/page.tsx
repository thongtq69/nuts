'use client';

import { useState, useEffect } from 'react';
import {
    Wallet,
    TrendingUp,
    Calendar,
    Filter,
    Download,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    Loader2,
    ArrowUpRight,
    DollarSign,
    History
} from 'lucide-react';

interface Commission {
    id: string;
    orderId: string;
    orderValue: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    createdAt: string;
}

const statusConfig = {
    pending: { 
        label: 'Chờ duyệt', 
        class: 'bg-amber-100 text-amber-700 border border-amber-200',
        icon: Clock,
        bgGradient: 'from-amber-500 to-orange-500'
    },
    approved: { 
        label: 'Đã duyệt', 
        class: 'bg-brand/10 text-brand border border-brand/20',
        icon: CheckCircle,
        bgGradient: 'from-brand to-brand-light'
    },
    paid: { 
        label: 'Đã thanh toán', 
        class: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        icon: CheckCircle,
        bgGradient: 'from-emerald-500 to-teal-500'
    },
    rejected: { 
        label: 'Từ chối', 
        class: 'bg-red-100 text-red-700 border border-red-200',
        icon: XCircle,
        bgGradient: 'from-red-500 to-pink-500'
    },
};

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            // TODO: Create API endpoint
            // For now, use mock data
            setCommissions([
                { id: '1', orderId: 'ORD001', orderValue: 1500000, commissionRate: 5, commissionAmount: 75000, status: 'approved', createdAt: '2026-01-15T10:30:00' },
                { id: '2', orderId: 'ORD002', orderValue: 2200000, commissionRate: 5, commissionAmount: 110000, status: 'pending', createdAt: '2026-01-14T14:20:00' },
                { id: '3', orderId: 'ORD003', orderValue: 850000, commissionRate: 5, commissionAmount: 42500, status: 'paid', createdAt: '2026-01-13T09:15:00' },
                { id: '4', orderId: 'ORD004', orderValue: 3200000, commissionRate: 5, commissionAmount: 160000, status: 'approved', createdAt: '2026-01-12T16:45:00' },
                { id: '5', orderId: 'ORD005', orderValue: 450000, commissionRate: 5, commissionAmount: 22500, status: 'pending', createdAt: '2026-01-11T11:20:00' },
            ]);
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCommissions = commissions.filter(c =>
        filterStatus === 'all' || c.status === filterStatus
    );

    const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalApproved = commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalAll = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    const statCards = [
        {
            label: 'Tổng hoa hồng',
            value: formatPrice(totalAll) + 'đ',
            icon: DollarSign,
            color: 'from-brand to-brand-light',
            change: '+15%',
            trend: 'up'
        },
        {
            label: 'Đã thanh toán',
            value: formatPrice(totalPaid) + 'đ',
            icon: CheckCircle,
            color: 'from-emerald-500 to-teal-500',
            change: '+12%',
            trend: 'up'
        },
        {
            label: 'Chờ duyệt',
            value: formatPrice(totalPending) + 'đ',
            icon: Clock,
            color: 'from-amber-500 to-orange-500',
            change: '3 đơn',
            trend: 'neutral'
        },
        {
            label: 'Đã duyệt',
            value: formatPrice(totalApproved) + 'đ',
            icon: ArrowUpRight,
            color: 'from-violet-500 to-purple-500',
            change: '+8%',
            trend: 'up'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-gray-800 shadow-xl shadow-brand/25">
                            <Wallet className="w-6 h-6" />
                        </div>
                        Lịch sử Hoa hồng
                    </h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <History className="w-4 h-4" /> Theo dõi thu nhập từ đơn hàng giới thiệu
                        </span>
                    </p>
                </div>
                <button
                    onClick={fetchCommissions}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-600 font-semibold hover:bg-amber-50 hover:border-brand hover:text-brand transition-all"
                >
                    <RefreshCw size={18} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-7 h-7 text-gray-800" />
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

            {/* Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-100/50 border border-gray-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter size={18} />
                    <span className="font-semibold">Lọc theo trạng thái:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'pending', label: '⏳ Chờ duyệt' },
                        { value: 'approved', label: '✅ Đã duyệt' },
                        { value: 'paid', label: '💰 Đã thanh toán' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilterStatus(option.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                filterStatus === option.value
                                    ? 'bg-gradient-to-r from-brand to-brand-light text-gray-800 shadow-lg shadow-brand/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Giá trị đơn</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tỷ lệ</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hoa hồng</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                                            <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <Wallet className="w-10 h-10 text-amber-300" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 font-medium text-lg">Chưa có giao dịch nào</p>
                                                <p className="text-gray-400 text-sm mt-1">Hoa hồng sẽ hiển thị khi có đơn hàng từ CTV</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCommissions.map((commission) => {
                                    const config = statusConfig[commission.status];
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={commission.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <span className="font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                    #{commission.orderId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {new Date(commission.createdAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="font-semibold text-gray-800">
                                                    {commission.orderValue.toLocaleString('vi-VN')}đ
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center justify-center w-12 h-8 bg-brand/10 text-brand font-bold rounded-lg">
                                                    {commission.commissionRate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="font-bold text-emerald-600 text-xl">
                                                    +{commission.commissionAmount.toLocaleString('vi-VN')}đ
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${config.class}`}>
                                                    <StatusIcon size={14} />
                                                    {config.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Card */}
            {filteredCommissions.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-amber-400" />
                                Tổng kết hoa hồng
                            </h3>
                            <p className="text-gray-400">Tổng hoa hồng từ {filteredCommissions.length} giao dịch</p>
                        </div>
                        <div className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                            {formatPrice(filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0))}đ
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
