'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AccountMembershipPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user) {
            // Fetch orders that are membership packages. 
            // We can filter on client side for simplicity or use specific API.
            // Let's use /api/orders and filter where items.name contains "Gói Hội Viên" or similar logic.
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        // Filter for membership orders
                        const membershipOrders = data.filter((o: any) =>
                            o.items.some((i: any) => i.name.includes('Gói Hội Viên'))
                        );
                        setOrders(membershipOrders);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || loading) return <div className="p-10 text-center">Đang tải...</div>;

    if (!user) {
        return <div className="p-10 text-center"><Link href="/login" className="text-blue-600">Vui lòng đăng nhập</Link></div>;
    }

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Tài khoản', href: '/account' }, { label: 'Gói hội viên' }]} />

            <div className="container py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar - simplied */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white p-4 rounded shadow-sm border">
                            <ul className="space-y-2">
                                <li><Link href="/account" className="block text-gray-600 hover:text-amber-600">Thông tin tài khoản</Link></li>
                                <li><Link href="/account/orders" className="block text-gray-600 hover:text-amber-600">Đơn hàng của tôi</Link></li>
                                <li><Link href="/account/vouchers" className="block text-gray-600 hover:text-amber-600">Kho Voucher</Link></li>
                                <li><Link href="/account/membership" className="block text-amber-600 font-bold">Gói hội viên</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="w-full md:w-3/4">
                        <h1 className="text-2xl font-bold mb-6">Lịch sử Gói Hội Viên</h1>

                        {orders.length === 0 ? (
                            <div className="text-center py-10 border rounded bg-gray-50">
                                <p className="text-gray-500 mb-4">Bạn chưa đăng ký gói hội viên nào.</p>
                                <Link href="/membership" className="bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700">
                                    Xem các gói ưu đãi
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order: any) => (
                                    <div key={order._id} className="bg-white p-6 rounded border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex-1">
                                            <div className="font-bold text-lg mb-1">
                                                {order.items[0]?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Mã đơn: #{order._id.slice(-6).toUpperCase()} |
                                                Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="mt-2 text-sm">
                                                Trạng thái:
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium 
                                                    ${order.status === 'completed' || order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status === 'pending' ? 'Chờ thanh toán/duyệt' :
                                                        order.status === 'completed' ? 'Đã kích hoạt' : order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-amber-600 text-xl">
                                                {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ
                                            </div>
                                            {order.status === 'pending' && (
                                                <p className="text-xs text-red-500 mt-1">Vui lòng thanh toán để kích hoạt</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
