'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    Calendar,
    User,
    MapPin,
    Package,
} from 'lucide-react';

interface Order {
    _id: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
}

const statusConfig = {
    pending: { 
        label: 'Chờ xử lý', 
        color: 'bg-amber-100 text-amber-700 border border-amber-200',
        icon: Clock 
    },
    processing: { 
        label: 'Đang xử lý', 
        color: 'bg-[#E3C88D] text-[#7d5a36] border border-[#E3C88D]',
        icon: Package 
    },
    shipped: { 
        label: 'Đã gửi', 
        color: 'bg-violet-100 text-violet-700 border border-violet-200',
        icon: Truck 
    },
    delivered: { 
        label: 'Đã giao', 
        color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        icon: CheckCircle 
    },
    cancelled: { 
        label: 'Đã hủy', 
        color: 'bg-red-100 text-red-700 border border-red-200',
        icon: XCircle 
    },
};

export default function StaffOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setLoadError('');
            const response = await fetch('/api/staff/orders', { cache: 'no-store' });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tải danh sách đơn hàng');
            }

            setOrders(Array.isArray(data.orders) ? data.orders : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
            setLoadError(error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        filterStatus === 'all' || order.status === filterStatus
    );

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    const statusCounts = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-gray-800 shadow-xl shadow-orange-500/25">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        Quản lý Đơn hàng
                    </h1>
                    <p className="text-gray-500 mt-2">Theo dõi và quản lý đơn hàng từ hệ thống</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'pending', label: 'Chờ xử lý' },
                    { key: 'processing', label: 'Đang xử lý' },
                    { key: 'shipped', label: 'Đã gửi' },
                    { key: 'delivered', label: 'Đã giao' },
                    { key: 'cancelled', label: 'Đã hủy' },
                ].map((item) => {
                    const count = statusCounts[item.key as keyof typeof statusCounts];
                    return (
                        <button
                            key={item.key}
                            onClick={() => setFilterStatus(item.key)}
                            className={`p-4 rounded-2xl text-center transition-all border-2 ${
                                filterStatus === item.key
                                    ? 'bg-brand text-white shadow-lg shadow-brand/30 border-brand'
                                    : 'bg-white hover:bg-amber-50 border-gray-200 hover:border-brand/50'
                            }`}
                        >
                            <div className={`text-2xl font-black ${filterStatus === item.key ? 'text-white' : 'text-gray-800'}`}>
                                {count}
                            </div>
                            <div className={`text-xs mt-1 ${filterStatus === item.key ? 'text-white/90' : 'text-gray-500'}`}>
                                {item.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium">Đang tải đơn hàng...</p>
                        </div>
                    </div>
                ) : loadError ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <div>
                                <p className="text-gray-700 font-medium text-lg">Không thể tải đơn hàng</p>
                                <p className="text-gray-500 text-sm mt-1">{loadError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={fetchOrders}
                                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-10 h-10 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium text-lg">Không tìm thấy đơn hàng nào</p>
                                <p className="text-gray-500 text-sm mt-1">Chưa có đơn hàng nào</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const config = statusConfig[order.status];
                        const StatusIcon = config.icon;
                        
                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="font-mono font-bold text-lg text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                #{order.orderId}
                                            </span>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${config.color}`}>
                                                <StatusIcon size={14} />
                                                {config.label}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <User size={16} className="text-gray-400" />
                                                <span className="font-medium">{order.customerName}</span>
                                                <span className="text-gray-400">|</span>
                                                <span>{order.customerPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span className="text-sm truncate">{order.shippingAddress}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex flex-col lg:items-end gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">Tổng tiền</div>
                                                <div className="text-2xl font-black text-orange-600">
                                                    {formatPrice(order.totalAmount)}đ
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Calendar size={14} />
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Preview */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {order.items.map((item, idx) => (
                                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                    {item.name} x{item.quantity}
                                                </span>
                                            ))}
                                            {order.items.length > 2 && (
                                                <span className="text-xs text-gray-400">+{order.items.length - 2} sản phẩm khác</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
