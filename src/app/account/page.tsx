'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('orders');
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user && activeTab === 'orders') {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const res = await fetch('/api/orders');
                    if (res.ok) {
                        const data = await res.json();
                        setOrders(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch orders', error);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [user, activeTab]);

    if (authLoading || !user) {
        return (
            <>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]} />
                <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    Đang tải...
                </div>
            </>
        );
    }

    return (
        <>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]} />

            <div className="container">
                <h1 className="page-title">Quản lý tài khoản</h1>

                <div className="account-layout">
                    {/* Account Sidebar */}
                    <aside className="account-sidebar">
                        <div className="user-profile-summary">
                            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                            <div className="user-text">
                                <span className="welcome">Xin chào,</span>
                                <span className="username">{user.name}</span>
                            </div>
                        </div>

                        <ul className="account-menu">
                            <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                                Thông tin cá nhân
                            </li>
                            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                                Đơn hàng của tôi
                            </li>
                            <li className={activeTab === 'vouchers' ? 'active' : ''} onClick={() => router.push('/account/vouchers')}>
                                Voucher của tôi
                            </li>
                            <li className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>
                                Sổ địa chỉ
                            </li>
                            {user.role === 'admin' && (
                                <li onClick={() => router.push('/admin')}>
                                    🔒 Trang Admin
                                </li>
                            )}
                            <li className="logout-btn" onClick={logout}>
                                Đăng xuất
                            </li>
                        </ul>
                    </aside>

                    {/* Content Area */}
                    <div className="account-content">
                        {activeTab === 'orders' && (
                            <div className="tab-pane">
                                <h2>Đơn hàng gần đây</h2>
                                {loadingOrders ? (
                                    <p>Đang tải đơn hàng...</p>
                                ) : orders.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>Bạn chưa có đơn hàng nào.</p>
                                        <Link href="/products" className="continue-btn">Mua sắm ngay</Link>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {orders.map((order: any) => (
                                            <div key={order._id} className="order-item">
                                                <div className="order-header">
                                                    <span className="order-id">Đơn hàng #{order._id.slice(-6).toUpperCase()}</span>
                                                    <span className={`order-status ${order.status}`}>
                                                        {order.status === 'pending' ? 'Đang xử lý' :
                                                            order.status === 'completed' ? 'Hoàn thành' : order.status}
                                                    </span>
                                                </div>
                                                <div className="order-body">
                                                    <div className="order-date">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                                    <div className="order-total">
                                                        Tổng tiền: <strong>{order.totalAmount.toLocaleString()}₫</strong>
                                                    </div>
                                                    <div className="order-items-preview">
                                                        {order.items.map((i: any) => i.name).join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="tab-pane">
                                <h2>Thông tin cá nhân</h2>
                                <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                                    <div className="form-group">
                                        <label>Họ tên</label>
                                        <input type="text" defaultValue={user.name} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" defaultValue={user.email} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input type="tel" defaultValue={user.phone || ''} disabled />
                                    </div>
                                    <button className="update-btn" disabled>Cập nhật thông tin (Đang phát triển)</button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="tab-pane">
                                <h2>Sổ địa chỉ</h2>
                                <div className="address-card">
                                    <span className="tag-default">Mặc định</span>
                                    <p className="add-name">{user.name}</p>
                                    <p className="add-phone">{user.phone}</p>
                                    <p className="add-detail">{user.address || 'Chưa cập nhật địa chỉ'}</p>
                                    <button className="edit-btn">Chỉnh sửa</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
