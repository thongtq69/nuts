'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Search,
    Filter,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    Eye,
    Calendar,
    User,
    MapPin,
    Package,
    Loader2
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
        color: 'bg-blue-100 text-blue-700 border border-blue-200',
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // TODO: Create API endpoint for staff to view orders
            setOrders([
                {
                    _id: '1',
                    orderId: 'ORD001',
                    customerName: 'Nguyễn Văn Khách',
                    customerPhone: '0912345678',
                    shippingAddress: '123 Lê Lợi, Quận 1, TP.HCM',
                    items: [
                        { name: 'Hạt điều rang', quantity: 2, price: 150000 },
                        { name: 'Hạt óc chó', quantity: 1, price: 200000 },
                    ],
                    totalAmount: 500000,
                    status: 'pending',
                    createdAt: '2026-01-19T10:30:00'
                },
                {
                    _id: '2',
                    orderId: 'ORD002',
                    customerName: 'Trần Thị Khách Hàng',
                    customerPhone: '0987654321',
                    shippingAddress: '456 Nguyễn Huệ, Quận 1, TP.HCM',
                    items: [
                        { name: 'Hạt macca', quantity: 3, price: 180000 },
                    ],
                    totalAmount: 540000,
                    status: 'shipped',
                    createdAt: '2026-01-18T14:20:00'
                },
                {
                    _id: '3',
                    orderId: 'ORD003',
                    customerName: 'Lê Văn B',
                    customerPhone: '0934567890',
                    shippingAddress: '789 Hai Bà Trưng, Quận 3, TP.HCM',
                    items: [
                        { name: 'Hạt hướng dương', quantity: 5, price: 80000 },
                    ],
                    totalAmount: 400000,
                    status: 'delivered',
                    createdAt: '2026-01-17T09:15:00'
                },
            ]);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        (filterStatus === 'all' || order.status === filterStatus) &&
        (order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.customerPhone.includes(searchTerm))
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
        <div className="space-y-8">
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
                            </div>
                            <div className={`text-xs mt-1 ${filterStatus === item.key ? 'text-white/90' : 'text-gray-500'}`}>
                                {item.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all text-lg"
                />
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
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-10 h-10 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium text-lg">Không tìm thấy đơn hàng nào</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    {searchTerm ? 'Thử từ khóa khác' : 'Chưa có đơn hàng nào'}
                                </p>
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
