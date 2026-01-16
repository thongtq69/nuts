'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProfileFormData {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
}

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('orders');
    const { user, logout, loading: authLoading, checkUser } = useAuth();
    const router = useRouter();

    // Orders state
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Vouchers state
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);

    // Membership packages state
    const [membershipPackages, setMembershipPackages] = useState<any[]>([]);
    const [loadingMembership, setLoadingMembership] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState<ProfileFormData>({
        name: '',
        phone: '',
        address: '',
        city: '',
        district: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Agent application state
    const [applyingAgent, setApplyingAgent] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    // Initialize profile form when user loads
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                city: '',
                district: ''
            });
        }
    }, [user]);

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

    // Fetch vouchers when tab is active
    useEffect(() => {
        if (user && activeTab === 'vouchers') {
            const fetchVouchers = async () => {
                setLoadingVouchers(true);
                try {
                    const res = await fetch('/api/user/vouchers');
                    if (res.ok) {
                        const data = await res.json();
                        setVouchers(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch vouchers', error);
                } finally {
                    setLoadingVouchers(false);
                }
            };
            fetchVouchers();
        }
    }, [user, activeTab]);

    // Fetch membership packages when tab is active
    useEffect(() => {
        if (user && activeTab === 'membership') {
            const fetchMembership = async () => {
                setLoadingMembership(true);
                try {
                    const res = await fetch('/api/user/membership');
                    if (res.ok) {
                        const data = await res.json();
                        setMembershipPackages(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch membership', error);
                } finally {
                    setLoadingMembership(false);
                }
            };
            fetchMembership();
        }
    }, [user, activeTab]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage(null);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });

            const data = await res.json();

            if (res.ok) {
                setProfileMessage({ type: 'success', text: data.message || 'Cập nhật thành công!' });
                await checkUser(); // Refresh user data from context
            } else {
                setProfileMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' });
            }
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'Không thể kết nối server' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleApplyAgent = async () => {
        if (!confirm('Bạn muốn đăng ký trở thành Đại lý? Yêu cầu của bạn sẽ được xem xét bởi Admin.')) {
            return;
        }

        setApplyingAgent(true);
        try {
            const res = await fetch('/api/auth/apply-sale', {
                method: 'POST'
            });

            if (res.ok) {
                alert('Đã gửi yêu cầu! Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.');
                await checkUser();
            } else {
                const data = await res.json();
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Không thể kết nối server');
        } finally {
            setApplyingAgent(false);
        }
    };

    if (authLoading || !user) {
        return (
            <main>
                <Header />
                <Navbar />
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]} />
                <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    Đang tải...
                </div>
                <Footer />
            </main>
        );
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
                                {user.role !== 'user' && (
                                    <span className="user-role-badge">
                                        {user.role === 'admin' ? '👑 Admin' : '🏪 Đại lý'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <ul className="account-menu">
                            <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                                👤 Thông tin cá nhân
                            </li>
                            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                                📦 Đơn hàng của tôi
                            </li>
                            <li className={activeTab === 'vouchers' ? 'active' : ''} onClick={() => setActiveTab('vouchers')}>
                                🎟️ Voucher của tôi
                            </li>
                            <li className={activeTab === 'membership' ? 'active' : ''} onClick={() => setActiveTab('membership')}>
                                👑 Gói hội viên của tôi
                            </li>
                            <li className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>
                                📍 Sổ địa chỉ
                            </li>
                            {user.role === 'user' && !user.saleApplicationStatus && (
                                <li className={activeTab === 'agent' ? 'active' : ''} onClick={() => setActiveTab('agent')}>
                                    🚀 Trở thành Đại lý
                                </li>
                            )}
                            {user.role === 'sale' && (
                                <li onClick={() => router.push('/agent')}>
                                    📊 Bảng điều khiển Đại lý
                                </li>
                            )}
                            {user.role === 'admin' && (
                                <li onClick={() => router.push('/admin')}>
                                    🔒 Trang Admin
                                </li>
                            )}
                            <li className="logout-btn" onClick={logout}>
                                🚪 Đăng xuất
                            </li>
                        </ul>
                    </aside>

                    {/* Content Area */}
                    <div className="account-content">
                        {/* Orders Tab */}
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
                                                            order.status === 'confirmed' ? 'Đã xác nhận' :
                                                                order.status === 'shipping' ? 'Đang giao' :
                                                                    order.status === 'completed' ? 'Hoàn thành' :
                                                                        order.status === 'cancelled' ? 'Đã hủy' : order.status}
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

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="tab-pane">
                                <h2>Thông tin cá nhân</h2>

                                {profileMessage && (
                                    <div className={`profile-message ${profileMessage.type}`}>
                                        {profileMessage.text}
                                    </div>
                                )}

                                <form className="profile-form" onSubmit={handleProfileSubmit}>
                                    <div className="form-group">
                                        <label>Họ tên *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input type="email" value={user.email} disabled title="Email không thể thay đổi" />
                                        <small>Email không thể thay đổi</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileForm.phone}
                                            onChange={handleProfileChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={profileForm.address}
                                            onChange={handleProfileChange}
                                            placeholder="Số nhà, tên đường..."
                                        />
                                    </div>
                                    <button type="submit" className="update-btn" disabled={savingProfile}>
                                        {savingProfile ? 'Đang lưu...' : 'Cập nhật thông tin'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Address Tab */}
                        {activeTab === 'address' && (
                            <div className="tab-pane">
                                <h2>Sổ địa chỉ</h2>
                                <div className="address-card">
                                    <span className="tag-default">Mặc định</span>
                                    <p className="add-name">{user.name}</p>
                                    <p className="add-phone">{user.phone || 'Chưa có SĐT'}</p>
                                    <p className="add-detail">{user.address || 'Chưa cập nhật địa chỉ'}</p>
                                    <button className="edit-btn" onClick={() => setActiveTab('profile')}>
                                        Chỉnh sửa
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Vouchers Tab */}
                        {activeTab === 'vouchers' && (
                            <div className="tab-pane">
                                <h2>Voucher của tôi</h2>
                                {loadingVouchers ? (
                                    <p>Đang tải voucher...</p>
                                ) : vouchers.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>Bạn chưa có voucher nào.</p>
                                        <Link href="/membership" className="continue-btn">Mua gói VIP để nhận voucher</Link>
                                    </div>
                                ) : (
                                    <div className="vouchers-grid">
                                        {vouchers.map((voucher: any) => {
                                            const isExpired = new Date(voucher.expiresAt) < new Date();
                                            const status = voucher.isUsed ? 'used' : isExpired ? 'expired' : 'available';
                                            return (
                                                <div key={voucher._id} className={`voucher-card-inline ${status}`}>
                                                    <div className="voucher-left-inline">
                                                        <div className="voucher-discount-inline">
                                                            {voucher.discountType === 'percent'
                                                                ? `${voucher.discountValue}%`
                                                                : `${voucher.discountValue.toLocaleString()}đ`}
                                                        </div>
                                                        <div className="voucher-max-inline">
                                                            Tối đa {voucher.maxDiscount?.toLocaleString() || 0}đ
                                                        </div>
                                                    </div>
                                                    <div className="voucher-right-inline">
                                                        <div className="voucher-code-inline">{voucher.code}</div>
                                                        <div className="voucher-condition-inline">
                                                            Đơn từ {voucher.minOrderValue?.toLocaleString() || 0}đ
                                                        </div>
                                                        <div className="voucher-expiry-inline">
                                                            {status === 'used' ? 'Đã sử dụng' :
                                                                status === 'expired' ? 'Đã hết hạn' :
                                                                    `HSD: ${new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}`}
                                                        </div>
                                                        {status === 'available' && (
                                                            <button
                                                                className="copy-btn-inline"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(voucher.code);
                                                                    alert('Đã sao chép mã: ' + voucher.code);
                                                                }}
                                                            >
                                                                Sao chép
                                                            </button>
                                                        )}
                                                    </div>
                                                    {status !== 'available' && (
                                                        <div className="voucher-overlay-inline">
                                                            {status === 'used' ? 'ĐÃ DÙNG' : 'HẾT HẠN'}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Membership Tab */}
                        {activeTab === 'membership' && (
                            <div className="tab-pane">
                                <h2>Gói hội viên của tôi</h2>
                                {loadingMembership ? (
                                    <p>Đang tải thông tin gói...</p>
                                ) : membershipPackages.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>Bạn chưa mua gói hội viên nào.</p>
                                        <Link href="/membership" className="continue-btn">Xem các gói VIP</Link>
                                    </div>
                                ) : (
                                    <div className="membership-list">
                                        {membershipPackages.map((pkg: any) => {
                                            const isActive = new Date(pkg.expiresAt) > new Date();
                                            return (
                                                <div key={pkg._id} className={`membership-card ${isActive ? 'active' : 'expired'}`}>
                                                    <div className="membership-header">
                                                        <h3>{pkg.packageName}</h3>
                                                        <span className={`membership-status ${isActive ? 'active' : 'expired'}`}>
                                                            {isActive ? '✓ Đang hoạt động' : '✗ Đã hết hạn'}
                                                        </span>
                                                    </div>
                                                    <div className="membership-body">
                                                        <div className="membership-info">
                                                            <span>Ngày mua:</span>
                                                            <strong>{new Date(pkg.purchasedAt).toLocaleDateString('vi-VN')}</strong>
                                                        </div>
                                                        <div className="membership-info">
                                                            <span>Ngày hết hạn:</span>
                                                            <strong>{new Date(pkg.expiresAt).toLocaleDateString('vi-VN')}</strong>
                                                        </div>
                                                        <div className="membership-info">
                                                            <span>Voucher đã nhận:</span>
                                                            <strong>{pkg.vouchersReceived || 0} mã</strong>
                                                        </div>
                                                        <div className="membership-info">
                                                            <span>Giá trị:</span>
                                                            <strong>{pkg.price?.toLocaleString() || 0}đ</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Agent Application Tab */}
                        {activeTab === 'agent' && (
                            <div className="tab-pane">
                                <h2>Trở thành Đại lý</h2>

                                {user.saleApplicationStatus === 'pending' ? (
                                    <div className="agent-status pending">
                                        <div className="status-icon">⏳</div>
                                        <h3>Đang chờ duyệt</h3>
                                        <p>Yêu cầu của bạn đang được xem xét. Chúng tôi sẽ liên hệ trong 1-2 ngày làm việc.</p>
                                    </div>
                                ) : user.saleApplicationStatus === 'rejected' ? (
                                    <div className="agent-status rejected">
                                        <div className="status-icon">❌</div>
                                        <h3>Yêu cầu bị từ chối</h3>
                                        <p>Rất tiếc, yêu cầu của bạn đã bị từ chối. Vui lòng liên hệ chúng tôi để biết thêm chi tiết.</p>
                                    </div>
                                ) : (
                                    <div className="agent-apply-section">
                                        <div className="agent-benefits">
                                            <h3>Lợi ích khi trở thành Đại lý</h3>
                                            <ul>
                                                <li>✓ Hoa hồng 10% cho mỗi đơn hàng giới thiệu</li>
                                                <li>✓ Nhận mã giới thiệu riêng</li>
                                                <li>✓ Dashboard theo dõi doanh thu</li>
                                                <li>✓ Rút tiền hoa hồng dễ dàng</li>
                                            </ul>
                                        </div>
                                        <button
                                            className="apply-agent-btn"
                                            onClick={handleApplyAgent}
                                            disabled={applyingAgent}
                                        >
                                            {applyingAgent ? 'Đang gửi...' : 'Đăng ký ngay'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
