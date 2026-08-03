import Link from 'next/link';
import { CreditCard, MapPin, Package, Phone, Truck } from 'lucide-react';

export interface CustomerOrderItem {
    productId?: string;
    name?: string;
    quantity?: number;
    price?: number;
    image?: string;
}

export interface CustomerOrder {
    _id: string;
    items?: CustomerOrderItem[];
    shippingInfo?: {
        fullName?: string;
        phone?: string;
        address?: string;
        ward?: string;
        district?: string;
        city?: string;
    };
    paymentMethod?: string;
    shippingFee?: number;
    totalAmount?: number;
    status?: string;
    paymentStatus?: string;
    orderType?: string;
    note?: string;
    createdAt?: string;
}

interface CustomerOrderDetailsProps {
    orders: CustomerOrder[];
    adminLinks?: boolean;
    limit?: number;
}

const orderStatus: Record<string, { label: string; className: string }> = {
    pending: { label: 'Chờ xử lý', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    processing: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    confirmed: { label: 'Đã xác nhận', className: 'bg-sky-100 text-sky-800 border-sky-200' },
    shipping: { label: 'Đang giao hàng', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    shipped: { label: 'Đang giao hàng', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    delivered: { label: 'Đã giao hàng', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    completed: { label: 'Hoàn tất', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    paid: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 border-red-200' },
};

const paymentStatus: Record<string, { label: string; className: string }> = {
    pending: { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    unpaid: { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    paid: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    completed: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    failed: { label: 'Thanh toán thất bại', className: 'bg-red-100 text-red-800 border-red-200' },
    refunded: { label: 'Đã hoàn tiền', className: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const paymentMethods: Record<string, string> = {
    banking: 'Chuyển khoản ngân hàng',
    bank_transfer: 'Chuyển khoản ngân hàng',
    cod: 'Thanh toán khi nhận hàng (COD)',
    vnpay: 'VNPay',
    acb: 'Chuyển khoản ACB',
};

function money(value: number | undefined) {
    return `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;
}

function badge(value: string | undefined, dictionary: typeof orderStatus, fallback: string) {
    return dictionary[String(value || '').toLowerCase()] || {
        label: value ? `${fallback}: ${value}` : 'Chưa cập nhật',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
    };
}

function addressText(order: CustomerOrder) {
    const shipping = order.shippingInfo;
    if (!shipping) return '';
    return [shipping.address, shipping.ward, shipping.district, shipping.city].filter(Boolean).join(', ');
}

export default function CustomerOrderDetails({ orders, adminLinks = false, limit }: CustomerOrderDetailsProps) {
    const visibleOrders = typeof limit === 'number' ? orders.slice(0, limit) : orders;

    if (visibleOrders.length === 0) {
        return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Chưa có đơn hàng.</p>;
    }

    return (
        <div className="space-y-4">
            {visibleOrders.map(order => {
                const currentOrderStatus = badge(order.status, orderStatus, 'Trạng thái');
                const currentPaymentStatus = badge(order.paymentStatus, paymentStatus, 'Thanh toán');
                const address = addressText(order);
                const orderCode = order._id.slice(-6).toUpperCase();

                return (
                    <article key={order._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                {adminLinks ? (
                                    <Link href={`/admin/orders/${order._id}`} className="font-bold text-slate-900 hover:text-brand">
                                        Đơn hàng #{orderCode}
                                    </Link>
                                ) : (
                                    <p className="font-bold text-slate-900">Đơn hàng #{orderCode}</p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Chưa có ngày tạo'}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${currentOrderStatus.className}`}>
                                    Đơn hàng: {currentOrderStatus.label}
                                </span>
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${currentPaymentStatus.className}`}>
                                    Thanh toán: {currentPaymentStatus.label}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 p-4">
                            <div>
                                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <Package size={16} className="text-brand" /> Sản phẩm trong đơn
                                </p>
                                {order.items && order.items.length > 0 ? (
                                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                                        {order.items.map((item, index) => (
                                            <div key={`${item.productId || item.name || 'item'}-${index}`} className="grid grid-cols-[1fr_auto] gap-3 p-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.name || 'Sản phẩm'}</p>
                                                    <p className="mt-0.5 text-xs text-slate-500">Số lượng: {item.quantity || 0} × {money(item.price)}</p>
                                                </div>
                                                <strong className="text-slate-800">{money((item.quantity || 0) * (item.price || 0))}</strong>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">Đơn này chưa có dữ liệu sản phẩm chi tiết.</p>
                                )}
                            </div>

                            <div className="grid gap-3 text-sm md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="flex items-center gap-2 font-semibold text-slate-700"><CreditCard size={15} /> Thanh toán</p>
                                    <p className="mt-1 text-slate-600">{paymentMethods[String(order.paymentMethod || '').toLowerCase()] || order.paymentMethod || 'Chưa cập nhật'}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="flex items-center gap-2 font-semibold text-slate-700"><Truck size={15} /> Phí vận chuyển</p>
                                    <p className="mt-1 text-slate-600">{money(order.shippingFee)}</p>
                                </div>
                                {order.shippingInfo?.fullName && (
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="font-semibold text-slate-700">Người nhận</p>
                                        <p className="mt-1 text-slate-600">{order.shippingInfo.fullName}</p>
                                        {order.shippingInfo.phone && <p className="mt-1 flex items-center gap-1 text-slate-600"><Phone size={13} /> {order.shippingInfo.phone}</p>}
                                    </div>
                                )}
                                {address && (
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <p className="flex items-center gap-2 font-semibold text-slate-700"><MapPin size={15} /> Địa chỉ giao hàng</p>
                                        <p className="mt-1 text-slate-600">{address}</p>
                                    </div>
                                )}
                            </div>

                            {order.note && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><strong>Ghi chú:</strong> {order.note}</p>}

                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-sm text-slate-500">Tổng thanh toán</span>
                                <strong className="text-lg text-brand">{money(order.totalAmount)}</strong>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
