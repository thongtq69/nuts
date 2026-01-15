import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ChevronLeft, Calendar, User, MapPin, CreditCard,
    Package, Truck, CheckCircle, XCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrder(id: string) {
    try {
        await dbConnect();
        const order = await Order.findById(id).populate('user', 'name email phone').lean();
        if (!order) return null;

        return {
            ...order,
            _id: order._id.toString(),
            user: order.user ? {
                ...order.user,
                _id: (order.user as any)._id.toString()
            } : null,
            createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
            items: order.items.map((item: any) => ({
                ...item,
                _id: item._id?.toString()
            }))
        };
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    const statusColors: any = {
        pending: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-blue-100 text-blue-700',
        shipping: 'bg-indigo-100 text-indigo-700',
        completed: 'bg-emerald-100 text-emerald-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/orders"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        Đơn hàng #{order._id.toString().slice(-6).toUpperCase()}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                            {order.status.toUpperCase()}
                        </span>
                    </h1>
                    <p className="text-slate-500">
                        Đặt lúc: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Package size={20} className="text-slate-400" />
                            Sản phẩm ({order.items.length})
                        </h2>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 py-4">
                                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-sm text-slate-500">Giá: {item.price.toLocaleString()}đ</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">x{item.quantity}</div>
                                        <div className="text-amber-600 font-medium">
                                            {(item.price * item.quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex justify-between text-slate-500">
                                <span>Tạm tính</span>
                                <span>{(order.totalAmount - order.shippingFee).toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Phí vận chuyển</span>
                                <span>{order.shippingFee.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-100 dark:border-slate-800">
                                <span>Tổng cộng</span>
                                <span className="text-amber-600">{order.totalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Actions (Status update placeholder) */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold mb-4">Cập nhật trạng thái</h2>
                        <div className="flex flex-wrap gap-2">
                            <form action={`/api/admin/orders/${order._id}/status`} method="POST">
                                <input type="hidden" name="status" value="confirmed" />
                                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">
                                    Xác nhận đơn
                                </button>
                            </form>
                            <form action={`/api/admin/orders/${order._id}/status`} method="POST">
                                <input type="hidden" name="status" value="shipping" />
                                <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium">
                                    Đang giao hàng
                                </button>
                            </form>
                            <form action={`/api/admin/orders/${order._id}/status`} method="POST">
                                <input type="hidden" name="status" value="completed" />
                                <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium">
                                    Hoàn thành
                                </button>
                            </form>
                            <form action={`/api/admin/orders/${order._id}/status`} method="POST">
                                <input type="hidden" name="status" value="cancelled" />
                                <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
                                    Hủy đơn
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User size={20} className="text-slate-400" />
                            Thông tin khách hàng
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <div className="text-sm text-slate-500">Họ tên</div>
                                <div className="font-medium">{order.shippingInfo.fullName}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Email</div>
                                <div className="font-medium">{(order.user as any)?.email || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">Số điện thoại</div>
                                <div className="font-medium">{order.shippingInfo.phone}</div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-slate-400" />
                            Địa chỉ giao hàng
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300">
                            {order.shippingInfo.address},<br />
                            {order.shippingInfo.district},<br />
                            {order.shippingInfo.city}
                        </p>
                        {order.note && (
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                                <strong>Ghi chú:</strong> {order.note}
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-slate-400" />
                            Thanh toán
                        </h2>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500">Phương thức</span>
                            <span className="font-medium uppercase">{order.paymentMethod}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-slate-500">Trạng thái</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium 
                                ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
