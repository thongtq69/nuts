'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCart, Filter, CheckCircle, Clock, XCircle,
    RefreshCw, Loader2, Eye, MapPin, Package, User, Phone,
    DollarSign, Calendar, Search, X, TrendingUp
} from 'lucide-react';

interface Order {
    _id: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: any[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    commissionAmount: number;
    commissionRate: number;
    commissionStatus: string;
    createdAt: string;
}

const statusConfig: Record<string, { label: string; class: string; color: string }> = {
    pending: { label: 'Chờ xử lý', class: 'bg-amber-100 text-amber-700', color: '#f59e0b' },
    processing: { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    confirmed: { label: 'Đã xác nhận', class: 'bg-indigo-100 text-indigo-700', color: '#6366f1' },
    shipping: { label: 'Đang giao', class: 'bg-purple-100 text-purple-700', color: '#8b5cf6' },
    delivered: { label: 'Đã giao', class: 'bg-emerald-100 text-emerald-700', color: '#10b981' },
    completed: { label: 'Hoàn thành', class: 'bg-green-100 text-green-700', color: '#22c55e' },
    cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-700', color: '#ef4444' },
};

const commissionStatusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Chờ duyệt', class: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Đã duyệt', class: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-700' },
    paid: { label: 'Đã thanh toán', class: 'bg-blue-100 text-blue-700' },
};

export default function AgentOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState<any>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pendingOrders: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/agent/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewOrderDetail = async (order: Order) => {
        setSelectedOrder(order);
        setDetailLoading(true);
        setOrderDetail(null);
        
        try {
            const res = await fetch(`/api/agent/orders/${order._id}`);
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

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerPhone.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-gray-800 shadow-xl shadow-brand/25">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        Đơn hàng Đại lý
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Theo dõi đơn hàng từ khách hàng bạn giới thiệu
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-600 font-semibold hover:bg-amber-50 hover:border-brand hover:text-brand transition-all"
                >
                    <RefreshCw size={18} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 font-medium text-sm">Tổng đơn hàng</div>
                            <div className="text-3xl font-bold text-gray-800 mt-1">{stats.totalOrders}</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 font-medium text-sm">Tổng doanh thu</div>
                            <div className="text-3xl font-bold text-gray-800 mt-1">{formatPrice(stats.totalRevenue)}đ</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 font-medium text-sm">Hoa hồng</div>
                            <div className="text-3xl font-bold text-emerald-600 mt-1">{formatPrice(stats.totalCommission)}đ</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 font-medium text-sm">Chờ xử lý</div>
                            <div className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingOrders}</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-100/50 border border-gray-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Search size={18} />
                    <span className="font-semibold">Tìm kiếm:</span>
                </div>
                <input
                    type="text"
                    placeholder="Mã đơn, tên, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand"
                />
                <div className="flex items-center gap-2 text-gray-600">
                    <Filter size={18} />
                    <span className="font-semibold">Trạng thái:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'pending', label: '⏳ Chờ xử lý' },
                        { value: 'processing', label: '🔄 Đang xử lý' },
                        { value: 'shipping', label: '🚚 Đang giao' },
                        { value: 'completed', label: '✅ Hoàn thành' },
                        { value: 'cancelled', label: '❌ Đã hủy' },
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
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Giá trị</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hoa hồng</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái ĐH</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Hoa hồng</th>
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
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <ShoppingCart className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium text-lg">Chưa có đơn hàng nào</p>
                                                <p className="text-gray-500 text-sm mt-1">Đơn hàng sẽ hiển thị khi có khách hàng đặt hàng qua mã giới thiệu của bạn</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const orderStatus = statusConfig[order.status] || { label: order.status, class: 'bg-gray-100 text-gray-700', color: '#6b7280' };
                                    const commissionStatus = commissionStatusConfig[order.commissionStatus] || { label: order.commissionStatus, class: 'bg-gray-100 text-gray-700' };
                                    return (
                                        <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <span className="font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                                                    #{order.orderId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-brand" />
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-700 font-medium block">{order.customerName}</span>
                                                        <span className="text-gray-500 text-xs">{order.customerPhone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="font-semibold text-gray-800">
                                                    {formatPrice(order.totalAmount)}đ
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="font-bold text-emerald-600">
                                                    +{formatPrice(order.commissionAmount)}đ
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${orderStatus.class}`}>
                                                    {orderStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${commissionStatus.class}`}>
                                                    {commissionStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button
                                                    onClick={() => viewOrderDetail(order)}
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setSelectedOrder(null); setOrderDetail(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
                        <button
                            onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center text-white">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{selectedOrder.orderId}</h2>
                                <p className="text-sm text-gray-500">Trạng thái: {statusConfig[selectedOrder.status]?.label || selectedOrder.status}</p>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Tên khách hàng:</p>
                                            <p className="font-medium">{orderDetail.customer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Số điện thoại:</p>
                                            <p className="font-medium">{orderDetail.customer.phone}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-500">Địa chỉ giao hàng:</p>
                                            <p className="font-medium">{orderDetail.customer.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Package size={16} className="text-brand" />
                                        Sản phẩm ({orderDetail.items.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {orderDetail.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                                                <div className="flex items-start gap-3">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <p className="text-sm text-gray-500">Số lượng: {item.quantity} × {formatPrice(item.price)}đ</p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}đ</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <DollarSign size={16} className="text-brand" />
                                        Thông tin thanh toán
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tạm tính:</span>
                                            <span>{formatPrice(orderDetail.subtotal)}đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phí vận chuyển:</span>
                                            <span>{orderDetail.shippingFee > 0 ? formatPrice(orderDetail.shippingFee) + 'đ' : 'Miễn phí'}</span>
                                        </div>
                                        {orderDetail.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Giảm giá:</span>
                                                <span>-{formatPrice(orderDetail.discount)}đ</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                                            <span>Tổng cộng:</span>
                                            <span className="text-brand">{formatPrice(orderDetail.totalAmount)}đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2">
                                            <span className="text-gray-500">Phương thức thanh toán:</span>
                                            <span className="capitalize font-medium">{orderDetail.paymentMethod?.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Commission Info */}
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        <DollarSign size={16} />
                                        Hoa hồng của bạn
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Tỷ lệ hoa hồng</p>
                                            <p className="font-bold text-lg text-emerald-700">{selectedOrder.commissionRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Giá trị đơn hàng</p>
                                            <p className="font-bold text-lg text-gray-800">{formatPrice(selectedOrder.totalAmount)}đ</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Hoa hồng nhận được</p>
                                            <p className="font-bold text-xl text-emerald-600">+{formatPrice(selectedOrder.commissionAmount)}đ</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-emerald-200">
                                        <p className="text-sm">
                                            <span className="text-gray-600">Trạng thái hoa hồng: </span>
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${commissionStatusConfig[orderDetail.commissionStatus]?.class || 'bg-gray-100 text-gray-700'}`}>
                                                {commissionStatusConfig[orderDetail.commissionStatus]?.label || orderDetail.commissionStatus}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Order Timeline */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Lịch sử đơn hàng</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                            <div>
                                                <p className="font-medium text-gray-800">Đơn hàng được tạo</p>
                                                <p className="text-sm text-gray-500">{formatDate(orderDetail.createdAt)}</p>
                                            </div>
                                        </div>
                                        {orderDetail.status !== 'pending' && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Đã xác nhận</p>
                                                    <p className="text-sm text-gray-500">Đơn hàng đang được xử lý</p>
                                                </div>
                                            </div>
                                        )}
                                        {['shipping', 'delivered', 'completed'].includes(orderDetail.status) && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Đang giao hàng</p>
                                                    <p className="text-sm text-gray-500">Đơn hàng đang được vận chuyển</p>
                                                </div>
                                            </div>
                                        )}
                                        {['delivered', 'completed'].includes(orderDetail.status) && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Giao hàng thành công</p>
                                                    <p className="text-sm text-gray-500">Hoa hồng đã được cập nhật vào ví</p>
                                                </div>
                                            </div>
                                        )}
                                        {orderDetail.status === 'cancelled' && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Đơn hàng đã bị hủy</p>
                                                    <p className="text-sm text-gray-500">Hoa hồng sẽ không được tính</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Không thể tải thông tin chi tiết đơn hàng
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
