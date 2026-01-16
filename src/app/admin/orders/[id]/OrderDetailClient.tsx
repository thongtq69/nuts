'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Package,
    CreditCard,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    Printer,
    MessageSquare
} from 'lucide-react';

interface OrderDetailProps {
    order: {
        id: string;
        orderNumber: string;
        orderType?: 'product' | 'membership';
        customer: {
            name: string;
            email: string;
            phone: string;
        };
        shippingInfo: {
            fullName: string;
            phone: string;
            address: string;
            city?: string;
            district?: string;
        };
        items: Array<{
            id: string;
            name: string;
            image: string;
            price: number;
            quantity: number;
            total: number;
        }>;
        packageInfo?: {
            name: string;
            voucherQuantity: number;
            expiresAt: string;
        };
        subtotal: number;
        shippingFee: number;
        discount: number;
        totalAmount: number;
        status: string;
        paymentMethod: string;
        paymentStatus: string;
        note: string;
        voucherCode: string;
        createdAt: string;
        updatedAt: string;
    };
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: 'Chờ xử lý', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
    shipping: { label: 'Đang giao', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Truck },
    completed: { label: 'Hoàn thành', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
    paid: { label: 'Đã thanh toán', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

export default function OrderDetailClient({ order }: OrderDetailProps) {
    const router = useRouter();
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    // Check if this is a membership order
    const isMembershipOrder = order.orderType === 'membership' || 
        order.items.some(item => item.name?.includes('Gói Hội Viên') || item.name?.includes('Gói VIP'));

    const config = statusConfig[currentStatus] || statusConfig.pending;
    const StatusIcon = config.icon;

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Xác nhận đổi trạng thái sang "${statusConfig[newStatus].label}"?`)) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setCurrentStatus(newStatus);
                alert('Cập nhật trạng thái thành công!');
                router.refresh();
            } else {
                alert('Lỗi khi cập nhật trạng thái');
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Chi tiết đơn hàng</h1>
                        <p className="text-slate-500 mt-1">Mã đơn: #{order.orderNumber}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                        <Printer size={18} />
                        In đơn
                    </button>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${config.bgColor}`}>
                            <StatusIcon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Trạng thái đơn hàng</div>
                            <div className={`text-xl font-bold ${config.color}`}>{config.label}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500">Ngày đặt</div>
                        <div className="font-semibold text-slate-800">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-3">
                    {isMembershipOrder ? (
                        // Membership Order: Only confirm payment → complete
                        <>
                            {currentStatus === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('paid')}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} />
                                        Xác nhận đã thanh toán
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('cancelled')}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-200 hover:bg-red-300 text-red-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={18} />
                                        Hủy đơn
                                    </button>
                                </>
                            )}
                            {currentStatus === 'paid' && (
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle size={18} />
                                    Hoàn thành & Kích hoạt gói
                                </button>
                            )}
                        </>
                    ) : (
                        // Product Order: Normal flow with shipping
                        <>
                            {currentStatus === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusChange('confirmed')}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} />
                                        Xác nhận đơn
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange('cancelled')}
                                        disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-200 hover:bg-red-300 text-red-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={18} />
                                        Hủy đơn
                                    </button>
                                </>
                            )}
                            {currentStatus === 'confirmed' && (
                                <button
                                    onClick={() => handleStatusChange('shipping')}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Truck size={18} />
                                    Bắt đầu giao hàng
                                </button>
                            )}
                            {currentStatus === 'shipping' && (
                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle size={18} />
                                    Hoàn thành đơn
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Membership Badge */}
                {isMembershipOrder && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-800">
                            <span className="text-lg">🎟️</span>
                            <span className="font-medium">Đơn hàng Gói Hội Viên</span>
                            {order.packageInfo && (
                                <span className="text-sm text-amber-600">
                                    - {order.packageInfo.voucherQuantity} voucher
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Products */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Package size={20} />
                                Sản phẩm ({order.items.length})
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                                        <img
                                            src={item.image || '/placeholder.png'}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800">{item.name}</h3>
                                            <div className="text-sm text-slate-500 mt-1">
                                                {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-slate-800">
                                                {item.total.toLocaleString('vi-VN')}đ
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                                <div className="flex justify-between text-slate-600">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">{order.subtotal.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-semibold">{order.shippingFee.toLocaleString('vi-VN')}đ</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá {order.voucherCode && `(${order.voucherCode})`}</span>
                                        <span className="font-semibold">-{order.discount.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-slate-200">
                                    <span>Tổng cộng</span>
                                    <span className="text-amber-600">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="text-amber-600 mt-1" size={20} />
                                <div>
                                    <div className="font-semibold text-amber-900 mb-1">Ghi chú từ khách hàng</div>
                                    <div className="text-amber-800">{order.note}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <User size={20} />
                            Thông tin khách hàng
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User size={16} className="text-slate-400" />
                                <span className="text-slate-700">{order.customer.name}</span>
                            </div>
                            {order.customer.email && (
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-slate-700">{order.customer.email}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-slate-400" />
                                <span className="text-slate-700">{order.customer.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <MapPin size={20} />
                            Địa chỉ giao hàng
                        </h2>
                        <div className="space-y-2 text-slate-700">
                            <div className="font-semibold">{order.shippingInfo.fullName}</div>
                            <div>{order.shippingInfo.phone}</div>
                            <div>{order.shippingInfo.address}</div>
                            {order.shippingInfo.district && <div>{order.shippingInfo.district}</div>}
                            {order.shippingInfo.city && <div>{order.shippingInfo.city}</div>}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CreditCard size={20} />
                            Thanh toán
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-slate-500">Phương thức</div>
                                <div className="font-semibold text-slate-800">
                                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' :
                                        order.paymentMethod === 'Banking' ? 'Chuyển khoản ngân hàng' :
                                            order.paymentMethod === 'VNPay' ? 'VNPay' : order.paymentMethod}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Trạng thái thanh toán</div>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
