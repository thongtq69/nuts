'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Badge, Card, Modal, Table } from '@/components/admin/ui';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    Ban,
    DollarSign,
    Calendar,
    ArrowUpRight,
    User,
    ArrowRight,
    CreditCard,
    Check,
    X,
    ExternalLink,
    RefreshCw,
    XCircle,
    Info
} from 'lucide-react';



interface Transaction {
    id: string;
    userId: string;
    userName: string;
    userEmail?: string;
    userRole: string;
    userTier: string;
    orderId?: string;
    orderNumber?: string;
    orderTotal?: number;
    commissionType: string;
    commissionRate: number;
    commissionAmount: number;
    sourceUserName?: string;
    status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'rejected';
    periodYear: number;
    periodMonth: number;
    createdAt: string;
    approvedByName?: string;
    approvedAt?: string;
    paidAt?: string;
    paymentMethod?: string;
    notes?: string;
}

interface Stats {
    pending: { total: number; count: number };
    approved: { total: number; count: number };
    paid: { total: number; count: number };
    cancelled: { total: number; count: number };
}

export default function CommissionTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        pending: { total: 0, count: 0 },
        approved: { total: 0, count: 0 },
        paid: { total: 0, count: 0 },
        cancelled: { total: 0, count: 0 }
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        year: new Date().getFullYear().toString(),
        month: ''
    });

    // Bulk actions
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState({
        method: 'bank_transfer',
        reference: '',
        batch: ''
    });

    useEffect(() => {
        fetchTransactions();
    }, [filters, pagination.page]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            });

            const res = await fetch(`/api/admin/commission/transactions?${params}`);
            const data = await res.json();

            if (data.success) {
                setTransactions(data.data);
                setPagination(data.pagination);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action: string, reason?: string) => {
        if (selectedIds.length === 0) {
            alert('Vui lòng chọn ít nhất một giao dịch');
            return;
        }

        try {
            const body: any = { action, transactionIds: selectedIds };
            if (reason) body.reason = reason;
            if (action === 'pay') body.paymentInfo = paymentInfo;

            const res = await fetch('/api/admin/commission/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setSelectedIds([]);
                setIsPayModalOpen(false);
                fetchTransactions();
            } else {
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error processing bulk action:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { variant: any; icon: any; label: string; color: string }> = {
            pending: { variant: 'warning', icon: Clock, label: 'Chờ duyệt', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            approved: { variant: 'info', icon: CheckCircle2, label: 'Đã duyệt', color: 'text-blue-600 bg-blue-50 border-blue-200' },
            paid: { variant: 'success', icon: DollarSign, label: 'Đã thanh toán', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            cancelled: { variant: 'default', icon: Ban, label: 'Đã hủy', color: 'text-slate-500 bg-slate-50 border-slate-200' },
            rejected: { variant: 'danger', icon: XCircle, label: 'Từ chối', color: 'text-red-600 bg-red-50 border-red-200' }
        };
        const config = map[status] || { variant: 'default', icon: Info, label: status, color: 'text-slate-500 bg-slate-50' };
        const Icon = config.icon || Info;

        return (
            <Badge variant={config.variant} className={`flex items-center gap-1 py-1 px-2.5 rounded-lg border shadow-none font-bold ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };


    const getTypeBadge = (type: string) => {
        const map: Record<string, { color: string; label: string }> = {
            direct_sale: { color: 'text-green-600 bg-green-50', label: 'Bán hàng' },
            team_sale_l1: { color: 'text-blue-600 bg-blue-50', label: 'Team L1' },
            team_sale_l2: { color: 'text-purple-600 bg-purple-50', label: 'Team L2' },
            bonus: { color: 'text-amber-600 bg-amber-50', label: 'Thưởng' },
            kpi_bonus: { color: 'text-pink-600 bg-pink-50', label: 'KPI' },
            monthly_bonus: { color: 'text-cyan-600 bg-cyan-50', label: 'Thưởng tháng' }
        };
        const config = map[type] || { color: 'text-gray-600 bg-gray-50', label: type };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === transactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(transactions.map((t) => t.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Giao dịch Hoa hồng</h1>
                <p className="text-gray-500 mt-1">
                    Duyệt và thanh toán hoa hồng cho CTV
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-0 overflow-hidden group hover:shadow-xl transition-all border-none shadow-lg shadow-amber-100/50 bg-gradient-to-br from-white to-amber-50/30">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">Pending</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Chờ duyệt</p>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(stats.pending.total)}</h3>
                        <p className="text-xs text-slate-400 font-medium">Tổng {stats.pending.count} giao dịch</p>
                    </div>
                    <div className="h-1 bg-amber-400 opacity-50" />
                </Card>

                <Card className="p-0 overflow-hidden group hover:shadow-xl transition-all border-none shadow-lg shadow-blue-100/50 bg-gradient-to-br from-white to-blue-50/30">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Approved</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Đã duyệt</p>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(stats.approved.total)}</h3>
                        <p className="text-xs text-slate-400 font-medium">Sẵn sàng thanh toán ({stats.approved.count})</p>
                    </div>
                    <div className="h-1 bg-blue-500 opacity-50" />
                </Card>

                <Card className="p-0 overflow-hidden group hover:shadow-xl transition-all border-none shadow-lg shadow-emerald-100/50 bg-gradient-to-br from-white to-emerald-50/30">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Paid</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Đã thanh toán</p>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(stats.paid.total)}</h3>
                        <p className="text-xs text-slate-400 font-medium">Hoàn thành {stats.paid.count} đợt chi</p>
                    </div>
                    <div className="h-1 bg-emerald-500 opacity-50" />
                </Card>

                <Card className="p-0 overflow-hidden group hover:shadow-xl transition-all border-none shadow-lg shadow-slate-100/50 bg-gradient-to-br from-white to-slate-50/30">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner group-hover:scale-110 transition-transform">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">Cancelled</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Đã hủy/Từ chối</p>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(stats.cancelled.total)}</h3>
                        <p className="text-xs text-slate-400 font-medium">Gồm {stats.cancelled.count} giao dịch</p>
                    </div>
                    <div className="h-1 bg-slate-400 opacity-50" />
                </Card>
            </div>


            {/* Filters */}
            <Card className="p-6 bg-white shadow-sm border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <Filter className="w-5 h-5 text-violet-600" />
                    <h3 className="font-bold text-slate-800">Bộ lọc tìm kiếm</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Trạng thái</label>
                        <Select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="h-11 rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">Tất cả</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="cancelled">Đã hủy</option>
                            <option value="rejected">Từ chối</option>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Loại hoa hồng</label>
                        <Select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="h-11 rounded-xl bg-slate-50 border-0"
                        >
                            <option value="">Tất cả</option>
                            <option value="direct_sale">Bán hàng</option>
                            <option value="team_sale_l1">Team L1</option>
                            <option value="team_sale_l2">Team L2</option>
                            <option value="bonus">Thưởng</option>
                            <option value="kpi_bonus">KPI</option>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Thời gian (Năm)</label>
                        <Select
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            className="h-11 rounded-xl bg-slate-50 border-0"
                        >
                            {[2024, 2025, 2026].map((y) => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Tháng</label>
                        <Select
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            className="h-11 rounded-xl bg-slate-50 border-0"
                        >
                            <option value="">Tất cả các tháng</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={fetchTransactions}
                            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border-0 text-slate-600 font-bold"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <button
                            onClick={() => setFilters({ status: '', type: '', year: new Date().getFullYear().toString(), month: '' })}
                            className="px-4 h-11 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </Card>


            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="sticky top-4 z-20 mx-auto max-w-4xl animate-in slide-in-from-top-4 duration-300">
                    <Card className="p-3 bg-slate-900 border-0 shadow-2xl rounded-2xl flex items-center justify-between text-white border-t-2 border-violet-500">
                        <div className="flex items-center gap-4 pl-4 font-bold border-l-4 border-violet-500 h-10">
                            <span className="text-lg">{selectedIds.length}</span>
                            <span className="text-slate-400 text-sm uppercase tracking-widest">Giao dịch đã chọn</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkAction('approve')}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                            >
                                <Check className="w-4 h-4" /> Duyệt hàng loạt
                            </button>
                            <button
                                onClick={() => setIsPayModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-900/40"
                            >
                                <CreditCard className="w-4 h-4" /> Thanh toán
                            </button>
                            <button
                                onClick={() => {
                                    const reason = prompt('Lý do từ chối:');
                                    if (reason) handleBulkAction('reject', reason);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-900 hover:text-white text-slate-300 text-xs font-bold transition-all active:scale-95"
                            >
                                <X className="w-4 h-4" /> Từ chối
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </Card>
                </div>
            )}


            {/* Transactions Table */}
            <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 text-left w-12">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                            checked={selectedIds.length === transactions.length && transactions.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Người nhận
                                </th>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Loại HH</th>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Đơn hàng
                                </th>
                                <th className="p-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Thực nhận
                                </th>
                                <th className="p-5 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Trạng thái
                                </th>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">
                                    Thời gian
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                                            <p className="text-slate-400 font-bold text-sm tracking-wider uppercase">Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                                            <AlertCircle className="w-12 h-12" />
                                            <p className="text-slate-400 font-bold">Không tìm thấy giao dịch nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        onClick={() => toggleSelect(tx.id)}
                                        className={`transition-all cursor-pointer hover:bg-slate-50 relative group ${selectedIds.includes(tx.id) ? 'bg-violet-50/50' : ''}`}
                                    >
                                        <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                                    checked={selectedIds.includes(tx.id)}
                                                    onChange={() => toggleSelect(tx.id)}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
                                                    {tx.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm group-hover:text-violet-600 transition-colors">{tx.userName}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {tx.userTier} • {tx.userRole}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">{getTypeBadge(tx.commissionType)}</td>
                                        <td className="p-5">
                                            {tx.orderNumber ? (
                                                <div className="flex items-center gap-2 group/order">
                                                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover/order:bg-white group-hover/order:border-violet-200 transition-all">
                                                        <div className="text-xs font-black text-slate-700">#{tx.orderNumber}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">
                                                            {formatCurrency(tx.orderTotal || 0)}
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover/order:text-violet-500 transition-colors" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-300 italic text-[10px] font-bold">
                                                    <Info className="w-3 h-3" /> N/A
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="font-black text-slate-900">{formatCurrency(tx.commissionAmount)}</div>
                                            <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 inline-block px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                Rate: {tx.commissionRate}%
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center">
                                                {getStatusBadge(tx.status)}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {formatDate(tx.createdAt)}
                                            </div>
                                            {tx.paidAt && (
                                                <div className="text-[9px] font-black text-emerald-600 mt-1 uppercase flex items-center gap-1">
                                                    <Check className="w-2.5 h-2.5" />
                                                    Đã trả: {formatDate(tx.paidAt)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Trang {pagination.page} / {pagination.totalPages} • Total {pagination.total}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                className="h-9 px-4 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                <ArrowRight className="w-3 h-3 rotate-180" /> Trước
                            </button>
                            <button
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                className="h-9 px-4 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                Sau <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>


            {/* Payment Modal */}
            {isPayModalOpen && (
                <Modal
                    isOpen={isPayModalOpen}
                    onClose={() => setIsPayModalOpen(false)}
                    title="Thanh toán hoa hồng"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Tổng số giao dịch: {selectedIds.length}</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(
                                    transactions
                                        .filter((t) => selectedIds.includes(t.id))
                                        .reduce((sum, t) => sum + t.commissionAmount, 0)
                                )}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Phương thức thanh toán
                            </label>
                            <Select
                                value={paymentInfo.method}
                                onChange={(e) =>
                                    setPaymentInfo({ ...paymentInfo, method: e.target.value })
                                }
                            >
                                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                                <option value="momo">Ví MoMo</option>
                                <option value="cash">Tiền mặt</option>
                                <option value="wallet">Ví nội bộ</option>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mã giao dịch / Tham chiếu *
                            </label>
                            <Input
                                value={paymentInfo.reference}
                                onChange={(e) =>
                                    setPaymentInfo({ ...paymentInfo, reference: e.target.value })
                                }
                                placeholder="VD: CK_20260207_001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Batch ID (tùy chọn)</label>
                            <Input
                                value={paymentInfo.batch}
                                onChange={(e) =>
                                    setPaymentInfo({ ...paymentInfo, batch: e.target.value })
                                }
                                placeholder="VD: BATCH_202602"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="secondary" onClick={() => setIsPayModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={() => handleBulkAction('pay')}
                                disabled={!paymentInfo.reference}
                            >
                                💰 Xác nhận thanh toán
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
