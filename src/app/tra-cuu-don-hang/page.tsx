'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useToast } from '@/context/ToastContext';
import { Search, Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image?: string;
}

interface Order {
    id: string;
    orderId: string;
    status: string;
    paymentMethod: string;
    totalAmount: number;
    shippingFee: number;
    createdAt: string;
    shippingInfo: {
        fullName: string;
        phone: string;
        email: string;
        address: string;
        ward?: string;
        district?: string;
        city?: string;
    };
    items: OrderItem[];
    note?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    processing: { label: 'Đang xử lý', color: 'bg-[#E3C88D] text-[#7d5a36]', icon: Package },
    shipping: { label: 'Đang giao', color: 'bg-violet-100 text-violet-700', icon: Truck },
    shipped: { label: 'Đã gửi', color: 'bg-violet-100 text-violet-700', icon: Truck },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    delivered: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function TraCuuDonHangPage() {
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim() || !phone.trim()) {
            toast.warning('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và số điện thoại');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.warning('Email không hợp lệ', 'Vui lòng kiểm tra lại định dạng email');
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const res = await fetch('/api/orders/guest-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Tra cứu thất bại');
            }

            setOrders(data.orders || []);
            if (data.orders?.length > 0) {
                toast.success('Tìm thấy đơn hàng', `Có ${data.orders.length} đơn hàng phù hợp`);
            } else {
                toast.info('Không tìm thấy', 'Không có đơn hàng nào với thông tin này');
            }
        } catch (error: any) {
            console.error('Search error:', error);
            toast.error('Lỗi tra cứu', error.message || 'Vui lòng thử lại sau');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOrderDetails = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tra cứu đơn hàng' }]} />

            <div className="container">
                <div className="max-w-3xl mx-auto py-8">
                    <h1 className="text-3xl font-bold text-center mb-2">Tra cứu đơn hàng</h1>
                    <p className="text-gray-500 text-center mb-8">
                        Nhập email và số điện thoại đã đặt hàng để tra cứu thông tin đơn hàng
                    </p>

                    {/* Search Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="09xxxxxxxx"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-brand text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang tra cứu...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Tra cứu đơn hàng
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    {hasSearched && (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="bg-gray-50 rounded-2xl p-12 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Không tìm thấy đơn hàng
                                    </h3>
                                    <p className="text-gray-500">
                                        Vui lòng kiểm tra lại email và số điện thoại đã nhập
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-4">
                                        Tìm thấy <strong>{orders.length}</strong> đơn hàng
                                    </p>
                                    {orders.map((order) => {
                                        const status = statusConfig[order.status] || statusConfig.pending;
                                        const StatusIcon = status.icon;
                                        const isExpanded = expandedOrder === order.id;

                                        return (
                                            <div
                                                key={order.id}
                                                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                                            >
                                                {/* Order Header */}
                                                <div
                                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => toggleOrderDetails(order.id)}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="font-mono font-bold text-lg text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                                                                    #{order.orderId}
                                                                </span>
                                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${status.color}`}>
                                                                    <StatusIcon size={14} />
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                Đặt ngày: {formatDate(order.createdAt)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-500">Tổng tiền</p>
                                                                <p className="text-xl font-bold text-brand">
                                                                    {formatPrice(order.totalAmount)}đ
                                                                </p>
                                                            </div>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Details */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                                                        {/* Shipping Info */}
                                                        <div className="mb-6">
                                                            <h4 className="font-semibold text-gray-800 mb-3">Thông tin giao hàng</h4>
                                                            <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                                                                <p><strong>Người nhận:</strong> {order.shippingInfo.fullName}</p>
                                                                <p><strong>Số điện thoại:</strong> {order.shippingInfo.phone}</p>
                                                                <p><strong>Email:</strong> {order.shippingInfo.email}</p>
                                                                <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}, {order.shippingInfo.ward}, {order.shippingInfo.district}, {order.shippingInfo.city}</p>
                                                                {order.note && (
                                                                    <p><strong>Ghi chú:</strong> {order.note}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Items */}
                                                        <div className="mb-6">
                                                            <h4 className="font-semibold text-gray-800 mb-3">Sản phẩm</h4>
                                                            <div className="bg-white rounded-lg overflow-hidden">
                                                                {order.items.map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {item.image && (
                                                                                <img
                                                                                    src={item.image}
                                                                                    alt={item.name}
                                                                                    className="w-12 h-12 object-cover rounded-lg"
                                                                                />
                                                                            )}
                                                                            <div>
                                                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                                            </div>
                                                                        </div>
                                                                        <p className="font-medium text-gray-800">
                                                                            {formatPrice(item.price * item.quantity)}đ
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Payment Summary */}
                                                        <div className="bg-white rounded-lg p-4">
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Tạm tính:</span>
                                                                    <span>{formatPrice(order.totalAmount - order.shippingFee)}đ</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Phí vận chuyển:</span>
                                                                    <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee) + 'đ'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Phương thức thanh toán:</span>
                                                                    <span>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</span>
                                                                </div>
                                                                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-lg font-bold">
                                                                    <span>Tổng cộng:</span>
                                                                    <span className="text-brand">{formatPrice(order.totalAmount)}đ</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .bg-brand {
                    background-color: #9C7044;
                }
                .hover\\:bg-brand-dark:hover {
                    background-color: #7d5a36;
                }
                .text-brand {
                    color: #9C7044;
                }
                .focus\\:ring-brand:focus {
                    --tw-ring-color: #9C7044;
                }
                .focus\\:border-brand:focus {
                    border-color: #9C7044;
                }
            `}</style>
        </main>
    );
}
