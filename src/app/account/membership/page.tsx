'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChangePasswordModal from '@/components/account/ChangePasswordModal';

export default function AccountMembershipPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (!authLoading && user) {
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const membershipOrders = data.filter((o: any) =>
                            o.items.some((i: any) => i.name.includes('Gói Hội Viên'))
                        );
                        setOrders(membershipOrders);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <>
                <Breadcrumb items={[{ label: 'Tài khoản', href: '/account' }, { label: 'Gói hội viên' }]} />
                <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    Đang tải...
                </div>
            </>
        );
    }

    if (!user) {
        return null; // Will be redirected
    }

    return (
        <>
            <Breadcrumb items={[{ label: 'Tài khoản', href: '/account' }, { label: 'Gói hội viên' }]} />

            <div className="container">
                <div className="account-layout">
                    {/* Sidebar */}
                    <aside className="account-sidebar">
                        <div className="user-profile-summary">
                            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                            <div className="user-text">
                                <span className="welcome">Xin chào,</span>
                                <span className="username">{user.name}</span>
                            </div>
                        </div>

                        <ul className="account-menu">
                            <li onClick={() => router.push('/account')}>
                                👤 Thông tin cá nhân
                            </li>
                            <li onClick={() => router.push('/account')}>
                                📦 Đơn hàng của tôi
                            </li>
                            <li onClick={() => router.push('/account/vouchers')}>
                                🎟️ Voucher của tôi
                            </li>
                            <li className="active">
                                🎁 Gói hội viên
                            </li>
                            <li onClick={() => setIsChangePasswordOpen(true)}>
                                🔑 Đổi mật khẩu
                            </li>
                            <li className="logout-btn" onClick={() => void logout()}>
                                🚪 Đăng xuất
                            </li>
                        </ul>
                    </aside>

                    {/* Content */}
                    <div className="account-content">
                        <div className="tab-pane">
                            <h2>Lịch sử Gói Hội Viên</h2>

                            {orders.length === 0 ? (
                                <div className="empty-cart">
                                    <p>Bạn chưa đăng ký gói hội viên nào.</p>
                                    <Link href="/subscriptions" className="continue-btn">
                                        Xem các gói ưu đãi
                                    </Link>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map((order: any) => (
                                        <div key={order._id} className="order-item">
                                            <div className="order-header">
                                                <span className="order-id">{order.items[0]?.name}</span>
                                                <span className={`order-status ${order.status === 'completed' ? 'completed' : 'pending'}`}>
                                                    {order.status === 'pending' ? 'Chờ thanh toán' :
                                                        order.status === 'completed' ? 'Đã kích hoạt' : order.status}
                                                </span>
                                            </div>
                                            <div className="order-body">
                                                <div className="order-date">
                                                    Mã đơn: #{order._id.slice(-6).toUpperCase()} |
                                                    Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="order-total">
                                                    Giá: <strong>{order.totalAmount.toLocaleString()}₫</strong>
                                                </div>
                                                {order.status === 'pending' && (
                                                    <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '8px' }}>
                                                        Vui lòng thanh toán để kích hoạt gói
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </>
    );
}
