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
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

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
    pending: { label: 'Chờ xử lý', color: 'text-brand-dark', bgColor: 'bg-brand-light/30', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'text-brand', bgColor: 'bg-brand/10', icon: CheckCircle },
    shipping: { label: 'Đang giao', color: 'text-brand', bgColor: 'bg-brand/20', icon: Truck },
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
    const toast = useToast();
    const confirm = useConfirm();

    // Check if this is a membership order
    const isMembershipOrder = order.orderType === 'membership' ||
        order.items.some(item => item.name?.includes('Gói Hội Viên') || item.name?.includes('Gói VIP'));

    const config = statusConfig[currentStatus] || statusConfig.pending;
    const StatusIcon = config.icon;

    const handleStatusChange = async (newStatus: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận đổi trạng thái',
            description: `Xác nhận đổi trạng thái sang "${statusConfig[newStatus].label}"?`,
            confirmText: 'Xác nhận',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setCurrentStatus(newStatus);
                toast.success('Cập nhật trạng thái thành công');
                router.refresh();
            } else {
                toast.error('Lỗi khi cập nhật trạng thái', 'Vui lòng thử lại.');
            }
        } catch (error) {
            toast.error('Lỗi kết nối', 'Vui lòng thử lại.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrint = () => {
        // Create print-friendly version with logo
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Đơn hàng #${order.orderNumber} - Go Nuts</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #9C7044; padding-bottom: 20px; }
                    .header img { max-width: 100px; height: auto; }
                    .header h1 { color: #9C7044; margin: 10px 0 5px; font-size: 24px; }
                    .header p { color: #666; margin: 0; }
                    .order-info { margin-bottom: 20px; }
                    .order-info h2 { color: #333; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    .info-row { display: flex; margin-bottom: 8px; }
                    .info-label { width: 150px; color: #666; }
                    .info-value { flex: 1; font-weight: 500; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; font-weight: 600; }
                    .text-right { text-align: right; }
                    .total-row { font-weight: bold; font-size: 16px; color: #9C7044; }
                    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                    .footer img { max-width: 60px; opacity: 0.6; margin-bottom: 10px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/assets/logo.png" alt="Go Nuts Logo" />
                    <h1>Go Nuts</h1>
                    <p>Thực phẩm sạch, dinh dưỡng</p>
                </div>
                
                <div class="order-info">
                    <h2>Thông tin đơn hàng #${order.orderNumber}</h2>
                    <div class="info-row">
                        <span class="info-label">Ngày đặt:</span>
                        <span class="info-value">${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Trạng thái:</span>
                        <span class="info-value">${config.label}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Thanh toán:</span>
                        <span class="info-value">${order.paymentMethod === 'banking' ? 'Chuyển khoản' : order.paymentMethod}</span>
                    </div>
                </div>
                
                <div class="order-info">
                    <h2>Thông tin khách hàng</h2>
                    <div class="info-row">
                        <span class="info-label">Họ tên:</span>
                        <span class="info-value">${order.shippingInfo.fullName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Điện thoại:</span>
                        <span class="info-value">${order.shippingInfo.phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Địa chỉ:</span>
                        <span class="info-value">${order.shippingInfo.address}${order.shippingInfo.district ? ', ' + order.shippingInfo.district : ''}${order.shippingInfo.city ? ', ' + order.shippingInfo.city : ''}</span>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th class="text-right">Đơn giá</th>
                            <th class="text-right">SL</th>
                            <th class="text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="text-right">${item.price.toLocaleString('vi-VN')}đ</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">${item.total.toLocaleString('vi-VN')}đ</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="3" class="text-right">Tạm tính:</td>
                            <td class="text-right">${order.subtotal.toLocaleString('vi-VN')}đ</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-right">Phí vận chuyển:</td>
                            <td class="text-right">${order.shippingFee.toLocaleString('vi-VN')}đ</td>
                        </tr>
                        ${order.discount > 0 ? `
                        <tr>
                            <td colspan="3" class="text-right">Giảm giá:</td>
                            <td class="text-right" style="color: green;">-${order.discount.toLocaleString('vi-VN')}đ</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td colspan="3" class="text-right">TỔNG CỘNG:</td>
                            <td class="text-right">${order.totalAmount.toLocaleString('vi-VN')}đ</td>
                        </tr>
                    </tbody>
                </table>
                
                ${order.note ? `
                <div class="order-info">
                    <h2>Ghi chú</h2>
                    <p>${order.note}</p>
                </div>
                ` : ''}
                
                <div class="footer">
                    <img src="/assets/logo.png" alt="Go Nuts" />
                    <p>Cảm ơn quý khách đã mua hàng tại Go Nuts!</p>
                    <p>Hotline: 09xxxxxxxx | Email: support@gonuts.vn</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
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
                                        className="flex items-center gap-2 px-4 py-2 bg-brand/20 hover:bg-brand/30 text-brand-dark font-medium rounded-lg transition-colors disabled:opacity-50"
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
                                    className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
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
                                    <span className="text-brand">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                        <div className="bg-brand-light/20 border border-brand-light/40 rounded-xl p-6">
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
                                    {order.paymentMethod === 'Banking' || order.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' :
                                        order.paymentMethod === 'VNPay' || order.paymentMethod === 'vnpay' ? 'VNPay' : order.paymentMethod}
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
