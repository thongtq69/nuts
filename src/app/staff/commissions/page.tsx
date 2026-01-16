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
    Loader2
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
    pending: { label: 'Chờ duyệt', class: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Đã duyệt', class: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    paid: { label: 'Đã thanh toán', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    rejected: { label: 'Từ chối', class: 'bg-red-100 text-red-700', icon: XCircle },
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
                { id: '1', orderId: 'ABC123', orderValue: 1500000, commissionRate: 5, commissionAmount: 75000, status: 'approved', createdAt: '2026-01-15T10:30:00' },
                { id: '2', orderId: 'DEF456', orderValue: 2200000, commissionRate: 5, commissionAmount: 110000, status: 'pending', createdAt: '2026-01-14T14:20:00' },
                { id: '3', orderId: 'GHI789', orderValue: 850000, commissionRate: 5, commissionAmount: 42500, status: 'paid', createdAt: '2026-01-13T09:15:00' },
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
    const totalApproved = commissions.filter(c => c.status === 'approved' || c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                            <Wallet className="w-5 h-5" />
                        </div>
                        Lịch sử Hoa hồng
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Theo dõi thu nhập từ các đơn hàng giới thiệu
                    </p>
                </div>
                <button
                    onClick={fetchCommissions}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                        {totalApproved.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-slate-500">Đã nhận</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                        {totalPending.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-sm text-slate-500">Chờ duyệt</div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                        {commissions.length}
                    </div>
                    <div className="text-sm text-slate-500">Tổng giao dịch</div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                    <Filter size={16} />
                    <span className="text-sm font-medium">Lọc:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'pending', label: 'Chờ duyệt' },
                        { value: 'approved', label: 'Đã duyệt' },
                        { value: 'paid', label: 'Đã thanh toán' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilterStatus(option.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã đơn</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ngày</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Giá trị đơn</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Tỷ lệ</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hoa hồng</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                    </td>
                                </tr>
                            ) : filteredCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Wallet className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">Chưa có giao dịch nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCommissions.map((commission) => {
                                    const config = statusConfig[commission.status];
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={commission.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-slate-700">
                                                    #{commission.orderId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(commission.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-800">
                                                {commission.orderValue.toLocaleString('vi-VN')}đ
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                                                    {commission.commissionRate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                +{commission.commissionAmount.toLocaleString('vi-VN')}đ
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.class}`}>
                                                    <StatusIcon size={12} />
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
        </div>
    );
}
