'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Wallet, TrendingUp, Calendar, Filter, CheckCircle,
    Clock, XCircle, RefreshCw, Loader2, ArrowUpRight,
    DollarSign, History, Eye, MapPin, Package, User, Phone
} from 'lucide-react';

interface Commission {
    id: string;
    orderId: string;
    orderValue: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    note: string;
    orderStatus: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    orderItems: any[];
    paymentMethod: string;
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

const orderStatusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
};

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState<any>(null);

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/staff/commissions');
            if (res.ok) {
                const data = await res.json();
                setCommissions(data.commissions);
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewOrderDetail = async (commission: Commission) => {
        setSelectedCommission(commission);
        setDetailLoading(true);
        setOrderDetail(null);
        
        try {
            const res = await fetch(`/api/staff/orders/${commission.orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrderDetail(data);
            }
        } catch (error) {
            console.error('Error fetching order detail:', error);
        } finally {
            setDetailLoading(false);
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
            change: `${commissions.filter(c => c.status === 'pending').length} đơn`,
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
        <div className="space-y-8 w-full">
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
                                    ? 'bg-brand text-white shadow-lg shadow-brand/30 border-2 border-brand'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
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
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Giá trị đơn</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tỷ lệ</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hoa hồng</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                                            <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <Wallet className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium text-lg">Chưa có giao dịch nào</p>
                                                <p className="text-gray-500 text-sm mt-1">Hoa hồng sẽ hiển thị khi có đơn hàng từ CTV</p>
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
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-brand" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium">{commission.customerName}</span>
                                                </div>
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
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => viewOrderDetail(commission)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-xl text-sm font-semibold hover:bg-brand/20 transition-colors"
                                                >
                                                    <Eye size={16} />
                                                    Xem
                                                </button>
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

            {/* Order Detail Modal */}
            {selectedCommission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setSelectedCommission(null); setOrderDetail(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
                        <button
                            onClick={() => { setSelectedCommission(null); setOrderDetail(null); }}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XCircle size={24} className="text-gray-400" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center text-white">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{selectedCommission.orderId}</h2>
                                <p className="text-sm text-gray-500">Trạng thái đơn: {orderStatusLabels[selectedCommission.orderStatus] || selectedCommission.orderStatus}</p>
                            </div>
                        </div>

                        {detailLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : orderDetail ? (
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <User size={16} className="text-brand" />
                                        Thông tin khách hàng
                                    </h3>
                                    <div className="grid gap-2 text-sm">
                                        <p><span className="text-gray-500">Tên:</span> {orderDetail.customer.name}</p>
                                        <p><span className="text-gray-500">Điện thoại:</span> {orderDetail.customer.phone}</p>
                                        <p><span className="text-gray-500">Địa chỉ:</span> {orderDetail.customer.address || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Package size={16} className="text-brand" />
                                        Sản phẩm ({orderDetail.items.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {orderDetail.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.name}</p>
                                                    <p className="text-sm text-gray-500">SL: {item.quantity} × {item.price.toLocaleString('vi-VN')}đ</p>
                                                </div>
                                                <p className="font-semibold text-gray-800">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <DollarSign size={16} className="text-brand" />
                                        Thanh toán
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tạm tính:</span>
                                            <span>{orderDetail.subtotal.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phí vận chuyển:</span>
                                            <span>{orderDetail.shippingFee > 0 ? orderDetail.shippingFee.toLocaleString('vi-VN') + 'đ' : 'Miễn phí'}</span>
                                        </div>
                                        {orderDetail.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá:</span>
                                                <span>-{orderDetail.discount.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                                            <span>Tổng cộng:</span>
                                            <span className="text-brand">{orderDetail.totalAmount.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Thanh toán:</span>
                                            <span className="capitalize">{orderDetail.paymentMethod.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Commission */}
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        <DollarSign size={16} />
                                        Hoa hồng của bạn
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tỷ lệ:</span>
                                            <span className="font-medium">{selectedCommission.commissionRate}%</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-emerald-600">
                                            <span>Hoa hồng:</span>
                                            <span>+{selectedCommission.commissionAmount.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Trạng thái:</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[selectedCommission.status]?.class || ''}`}>
                                                {statusConfig[selectedCommission.status]?.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Không thể tải thông tin chi tiết
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
