import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Link from 'next/link';
import { ShoppingCart, Eye, Calendar, User as UserIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getOrders() {
    await dbConnect();
    // Populate user to get name/email if referenced
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });

    return orders.map(order => ({
        id: order._id.toString(),
        customer: (order.user as any)?.name || order.shippingInfo?.fullName || 'Khách vãng lai',
        total: order.totalAmount,
        status: order.status,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        itemCount: order.items.length
    }));
}

export default async function AdminOrdersPage() {
    const orders = await getOrders();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    Quản lý Đơn hàng
                </h1>
                <p className="text-slate-500 mt-1">Theo dõi và xử lý đơn hàng từ khách hàng.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Mã đơn</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Ngày đặt</th>
                                <th className="px-6 py-4 text-center">Số lượng</th>
                                <th className="px-6 py-4 text-right">Tổng tiền</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                                        Chưa có đơn hàng nào.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-600">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <UserIcon size={12} />
                                                </div>
                                                <span className="font-medium text-slate-700">{order.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {order.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                                            {order.itemCount}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-amber-600">
                                            {order.total.toLocaleString()}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium inline-flex items-center gap-1">
                                                <Eye size={14} />
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
