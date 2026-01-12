'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
        return <div>Loading...</div>; // Or a better spinner
    }

    return (
        <main>
            <Header />
            <Navbar />
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
                            <li className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>
                                Sổ địa chỉ
                            </li>
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
                                    <p>Bạn chưa có đơn hàng nào.</p>
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
                                                    <div className="order-date">Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</div>
                                                    <div className="order-total">
                                                        Tổng tiền: <strong>{order.totalAmount.toLocaleString()}₫</strong>
                                                    </div>
                                                    <div className="order-items-preview">
                                                        {orders.length > 0 && order.items.map((i: any) => i.name).join(', ')}
                                                    </div>
                                                </div>
                                                {/* <div className="order-footer">
                                                    <button className="view-detail-btn">Xem chi tiết</button>
                                                </div> */}
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
                                    <button className="update-btn" disabled>Cập nhật thông tin (Tính năng đang phát triển)</button>
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

            <Footer />

            <style jsx>{`
        .page-title {
            margin-bottom: 30px;
        }
        .account-layout {
            display: flex;
            gap: 40px;
            margin-bottom: 80px;
        }
        .account-sidebar {
            width: 280px;
            flex-shrink: 0;
            background: #f9f9f9;
            border-radius: 8px;
            overflow: hidden;
            height: fit-content;
        }
        .user-profile-summary {
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            border-bottom: 1px solid #eee;
        }
        .user-avatar {
            width: 50px;
            height: 50px;
            background: var(--color-primary-brown);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 700;
        }
        .username {
            display: block;
            font-weight: 600;
            color: #333;
        }
        .welcome {
            font-size: 13px;
            color: #666;
        }
        .account-menu {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .account-menu li {
            padding: 15px 20px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background 0.2s;
            font-size: 15px;
            color: #555;
        }
        .account-menu li:hover {
            background: #f0f0f0;
        }
        .account-menu li.active {
            background: #fff;
            color: var(--color-primary-brown);
            font-weight: 600;
            border-left: 3px solid var(--color-primary-brown);
        }
        .account-menu li.logout-btn {
            color: var(--color-sale-red);
        }

        .account-content {
            flex: 1;
            background: #fff;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 30px;
        }
        h2 {
            font-size: 20px;
            margin-bottom: 25px;
            font-weight: 600;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
        }
        
        /* Orders */
        .order-item {
            border: 1px solid #eee;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .order-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        .order-id {
            font-weight: 600;
            color: var(--color-primary-brown);
        }
        .order-status {
            font-size: 13px;
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: capitalize;
        }
        .order-status.pending { background: #fff3cd; color: #856404; }
        .order-status.completed { background: #d4edda; color: #155724; }
        
        .order-body {
            /* display: flex; */
            /* justify-content: space-between; */
            margin-bottom: 15px;
            font-size: 14px;
            color: #666;
        }
        .order-date { margin-bottom: 5px; }
        .order-total { margin-bottom: 5px; }
        
        .view-detail-btn {
            padding: 8px 15px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }

        /* Forms */
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;}
        .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .update-btn {
            background: var(--color-primary-brown);
            color: white;
            padding: 10px 25px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .update-btn:disabled { background: #ccc; cursor: not-allowed; }

        @media (max-width: 768px) {
            .account-layout { flex-direction: column; }
            .account-sidebar { width: 100%; }
        }
      `}</style>
        </main>
    );
}
