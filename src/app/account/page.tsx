'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AffiliateTermsModal from '@/components/affiliate/AffiliateTermsModal';
import OrderDetailModal, { type AccountOrder } from '@/components/account/OrderDetailModal';
import {
    buildResumePaymentUrl,
    canCustomerCancelOrder,
    orderStatusLabel,
    paymentStatusLabel,
} from '@/lib/order-status';
import ChangePasswordModal from '@/components/account/ChangePasswordModal';

// Helper functions for vouchers
function maskVoucherCode(code: string): string {
    if (code.length <= 4) return '****';
    return '****' + code.slice(-4);
}

function getDaysRemaining(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

interface VoucherGroup {
    key: string;
    label: string;
    icon: string;
    vouchers: any[];
}

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
    const toast = useToast();
    const confirm = useConfirm();
    const router = useRouter();

    // Orders state
    const [orders, setOrders] = useState<AccountOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<AccountOrder | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [showCancelledOrders, setShowCancelledOrders] = useState(false);

    // Vouchers state
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [revealedVoucherId, setRevealedVoucherId] = useState<string | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [voucherFilter, setVoucherFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');

    // Membership packages state
    const [membershipPackages, setMembershipPackages] = useState<any[]>([]);
    const [loadingMembership, setLoadingMembership] = useState(false);
    const [financialSummary, setFinancialSummary] = useState({
        totalSpent: 0,
        totalVipSavings: 0,
        vipSavingsOrderCount: 0,
    });
    const [loadingFinancialSummary, setLoadingFinancialSummary] = useState(true);

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

    // Terms modal state
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [affiliateType, setAffiliateType] = useState<'agent' | 'collaborator'>('collaborator');
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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

    const fetchOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const res = await fetch('/api/orders', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        if (user && activeTab === 'orders') {
            fetchOrders();
        }
    }, [user, activeTab, fetchOrders]);

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

    useEffect(() => {
        if (!user) return;
        const fetchFinancialSummary = async () => {
            setLoadingFinancialSummary(true);
            try {
                const response = await fetch('/api/user/financial-summary', { cache: 'no-store' });
                if (response.ok) setFinancialSummary(await response.json());
            } catch (error) {
                console.error('Failed to fetch financial summary', error);
            } finally {
                setLoadingFinancialSummary(false);
            }
        };
        fetchFinancialSummary();
    }, [user]);

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
        const confirmed = await confirm({
            title: 'Xác nhận đăng ký đại lý',
            description: 'Bạn muốn đăng ký trở thành Đại lý? Yêu cầu của bạn sẽ được xem xét bởi Admin.',
            confirmText: 'Gửi yêu cầu',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        setApplyingAgent(true);
        try {
            const res = await fetch('/api/auth/apply-sale', {
                method: 'POST'
            });

            if (res.ok) {
                toast.success('Đã gửi yêu cầu!', 'Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.');
                await checkUser();
            } else {
                const data = await res.json();
                toast.error('Có lỗi xảy ra', data.message || 'Vui lòng thử lại sau.');
            }
        } catch (error) {
            toast.error('Lỗi kết nối', 'Không thể kết nối server');
        } finally {
            setApplyingAgent(false);
        }
    };

    const handleCancelOrder = async (order: AccountOrder) => {
        const confirmed = await confirm({
            title: 'Xóa đơn hàng',
            description: `Đơn #${order._id.slice(-6).toUpperCase()} sẽ được hủy và ẩn khỏi danh sách. Voucher đã dùng cho đơn này (nếu có) sẽ được hoàn lại để tiếp tục sử dụng.`,
            confirmText: 'Xóa đơn',
            cancelText: 'Giữ đơn',
        });
        if (!confirmed) return;

        setCancellingOrderId(order._id);
        try {
            const res = await fetch(`/api/orders/${order._id}/cancel`, { method: 'POST' });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                toast.error('Không thể hủy đơn', data?.message || 'Vui lòng thử lại sau.');
                return;
            }

            toast.success('Đã xóa đơn khỏi danh sách', data?.message);
            setSelectedOrder(null);
            await fetchOrders();
        } catch (error) {
            toast.error('Lỗi kết nối', 'Không thể kết nối server');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const openTermsModal = (type: 'agent' | 'collaborator') => {
        setAffiliateType(type);
        setShowTermsModal(true);
    };

    // Voucher helper functions
    const getVoucherStatus = (voucher: any): 'available' | 'expiring' | 'used' | 'expired' => {
        if (voucher.isUsed) return 'used';
        const daysRemaining = getDaysRemaining(voucher.expiresAt);
        if (daysRemaining < 0) return 'expired';
        if (daysRemaining <= 3) return 'expiring';
        return 'available';
    };

    const toggleVoucherReveal = (voucherId: string) => {
        setRevealedVoucherId(prev => prev === voucherId ? null : voucherId);
    };

    const toggleVoucherGroup = (groupKey: string) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    };

    // Group vouchers by source
    const groupedVouchers = useMemo((): VoucherGroup[] => {
        const groups: Record<string, any[]> = {
            package: [],
            order_reward: [],
            campaign: [],
            other: [],
        };

        vouchers.forEach(v => {
            const status = getVoucherStatus(v);
            // Apply filter
            if (voucherFilter !== 'all') {
                if (voucherFilter === 'available' && status !== 'available' && status !== 'expiring') return;
                if (voucherFilter === 'used' && status !== 'used') return;
                if (voucherFilter === 'expired' && status !== 'expired') return;
            }

            if (v.source === 'package') {
                groups.package.push(v);
            } else if (v.source === 'order_reward') {
                groups.order_reward.push(v);
            } else if (v.source === 'campaign') {
                groups.campaign.push(v);
            } else {
                groups.other.push(v);
            }
        });

        // Sort each group: available -> expiring -> used -> expired
        const sortOrder = { available: 0, expiring: 1, expired: 2, used: 3 };
        Object.keys(groups).forEach(key => {
            groups[key].sort((a: any, b: any) => {
                const statusA = getVoucherStatus(a);
                const statusB = getVoucherStatus(b);
                return sortOrder[statusA] - sortOrder[statusB];
            });
        });

        const result: VoucherGroup[] = [];

        if (groups.package.length > 0) {
            result.push({
                key: 'package',
                label: 'Goi Hoi Vien',
                icon: '📦',
                vouchers: groups.package,
            });
        }

        if (groups.order_reward.length > 0) {
            result.push({
                key: 'order_reward',
                label: 'Thuong Don Hang',
                icon: '🎁',
                vouchers: groups.order_reward,
            });
        }

        if (groups.campaign.length > 0) {
            result.push({
                key: 'campaign',
                label: 'Khuyen Mai',
                icon: '🎉',
                vouchers: groups.campaign,
            });
        }

        if (groups.other.length > 0) {
            result.push({
                key: 'other',
                label: 'Khac',
                icon: '🎟️',
                vouchers: groups.other,
            });
        }

        return result;
    }, [vouchers, voucherFilter]);

    // A cancelled order should read as "gone" to the customer, but stays on file
    // for accounting, so it is hidden behind a toggle instead of deleted.
    const cancelledOrderCount = useMemo(
        () => orders.filter(order => String(order.status).toLowerCase() === 'cancelled').length,
        [orders],
    );

    const visibleOrders = useMemo(
        () => (showCancelledOrders
            ? orders
            : orders.filter(order => String(order.status).toLowerCase() !== 'cancelled')),
        [orders, showCancelledOrders],
    );

    // Voucher stats
    const voucherStats = useMemo(() => {
        const available = vouchers.filter(v => {
            const s = getVoucherStatus(v);
            return s === 'available' || s === 'expiring';
        }).length;
        const used = vouchers.filter(v => getVoucherStatus(v) === 'used').length;
        const expired = vouchers.filter(v => getVoucherStatus(v) === 'expired').length;
        return { total: vouchers.length, available, used, expired };
    }, [vouchers]);

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

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Tổng tiền đã chi tiêu</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{loadingFinancialSummary ? 'Đang tính...' : `${financialSummary.totalSpent.toLocaleString('vi-VN')}đ`}</p>
                        <p className="mt-2 text-xs text-slate-400">Chỉ tính các đơn đã thanh toán hoặc hoàn thành.</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                        <p className="text-sm text-emerald-700">Đã tiết kiệm nhờ gói VIP</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-800">{loadingFinancialSummary ? 'Đang tính...' : `${financialSummary.totalVipSavings.toLocaleString('vi-VN')}đ`}</p>
                        <p className="mt-2 text-xs text-emerald-600">Từ {financialSummary.vipSavingsOrderCount} đơn đã sử dụng voucher VIP.</p>
                    </div>
                </div>

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
                                        {user.role === 'admin' ? '👑 Admin' : 
                                         user.role === 'staff' ? '👨‍💼 Nhân viên' : '🏪 Đại lý'}
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
                            {user.role === 'staff' && (
                                <li onClick={() => router.push('/staff')}>
                                    👨‍💼 Trang quản lý Nhân viên
                                </li>
                            )}
                            {user.role === 'admin' && (
                                <li onClick={() => router.push('/admin')}>
                                    🔒 Trang Admin
                                </li>
                            )}
                            <li onClick={() => setIsChangePasswordOpen(true)}>
                                🔑 Đổi mật khẩu
                            </li>
                            <li className="logout-btn" onClick={() => void logout()}>
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
                                    <>
                                        {cancelledOrderCount > 0 && (
                                            <label className="cancelled-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={showCancelledOrders}
                                                    onChange={e => setShowCancelledOrders(e.target.checked)}
                                                />
                                                Hiện {cancelledOrderCount} đơn đã hủy
                                            </label>
                                        )}
                                        {visibleOrders.length === 0 && (
                                            <p className="orders-empty-note">
                                                Tất cả đơn hàng của bạn đã bị hủy. Bật tùy chọn phía trên để xem lại.
                                            </p>
                                        )}
                                        <div className="orders-list">
                                            {visibleOrders.map(order => {
                                                const resumeUrl = buildResumePaymentUrl(order);
                                                const cancellable = canCustomerCancelOrder(order);
                                                const isCancelled = String(order.status).toLowerCase() === 'cancelled';

                                                return (
                                                    <div
                                                        key={order._id}
                                                        className={`order-item order-item-clickable${isCancelled ? ' order-item-cancelled' : ''}`}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => setSelectedOrder(order)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                setSelectedOrder(order);
                                                            }
                                                        }}
                                                    >
                                                        <div className="order-header">
                                                            <span className="order-id">Đơn hàng #{order._id.slice(-6).toUpperCase()}</span>
                                                            <span className="order-badges">
                                                                <span className={`order-status ${order.status}`}>
                                                                    {orderStatusLabel(order.status)}
                                                                </span>
                                                                {!isCancelled && (
                                                                    <span className={`payment-status payment-${String(order.paymentStatus || 'pending').toLowerCase()}`}>
                                                                        {paymentStatusLabel(order.paymentStatus)}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="order-body">
                                                            <div className="order-date">
                                                                Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                                                            </div>
                                                            <div className="order-total">
                                                                Tổng tiền: <strong>{(order.totalAmount || 0).toLocaleString('vi-VN')}₫</strong>
                                                            </div>
                                                            <div className="order-items-preview">
                                                                {(order.items || []).map(i => i.name).join(', ')}
                                                            </div>
                                                        </div>
                                                        <div className="order-actions" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                className="order-action order-action-ghost"
                                                                onClick={() => setSelectedOrder(order)}
                                                            >
                                                                Xem chi tiết
                                                            </button>
                                                            {resumeUrl && (
                                                                <Link href={resumeUrl} className="order-action order-action-primary">
                                                                    Thanh toán tiếp
                                                                </Link>
                                                            )}
                                                            {cancellable && (
                                                                <button
                                                                    type="button"
                                                                    className="order-action order-action-danger"
                                                                    onClick={() => handleCancelOrder(order)}
                                                                    disabled={cancellingOrderId === order._id}
                                                                >
                                                                    {cancellingOrderId === order._id ? 'Đang xóa...' : 'Xóa đơn'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
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
                                <h2>Voucher cua toi</h2>
                                
                                {loadingVouchers ? (
                                    <p>Dang tai voucher...</p>
                                ) : vouchers.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>Ban chua co voucher nao.</p>
                                        <Link href="/subscriptions" className="continue-btn">Mua goi VIP de nhan voucher</Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Stats */}
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(4, 1fr)', 
                                            gap: '12px', 
                                            marginBottom: '20px' 
                                        }}>
                                            <div style={{ 
                                                background: '#fff', 
                                                padding: '16px', 
                                                borderRadius: '12px', 
                                                textAlign: 'center',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>{voucherStats.total}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Tong</div>
                                            </div>
                                            <div style={{
                                                background: '#fff',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                textAlign: 'center',
                                                border: '1px solid #E3E846/30'
                                            }}>
                                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#E3E846' }}>{voucherStats.available}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Con hieu luc</div>
                                            </div>
                                            <div style={{ 
                                                background: '#fff', 
                                                padding: '16px', 
                                                borderRadius: '12px', 
                                                textAlign: 'center',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#9ca3af' }}>{voucherStats.used}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Da dung</div>
                                            </div>
                                            <div style={{ 
                                                background: '#fff', 
                                                padding: '16px', 
                                                borderRadius: '12px', 
                                                textAlign: 'center',
                                                border: '1px solid #fee2e2'
                                            }}>
                                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{voucherStats.expired}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>Het han</div>
                                            </div>
                                        </div>

                                        {/* Filter Tabs */}
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                            {[
                                                { key: 'all', label: 'Tat ca' },
                                                { key: 'available', label: 'Con hieu luc' },
                                                { key: 'used', label: 'Da dung' },
                                                { key: 'expired', label: 'Het han' },
                                            ].map(f => (
                                                <button
                                                    key={f.key}
                                                    onClick={() => setVoucherFilter(f.key as typeof voucherFilter)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: voucherFilter === f.key ? '#9C7043' : '#fff',
                                                        color: voucherFilter === f.key ? '#fff' : '#374151',
                                                        boxShadow: voucherFilter === f.key ? '0 2px 8px rgba(156,112,68,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                                                    }}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Grouped Vouchers */}
                                        {groupedVouchers.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {groupedVouchers.map(group => {
                                                    const isCollapsed = collapsedGroups.has(group.key);
                                                    return (
                                                        <div 
                                                            key={group.key} 
                                                            style={{ 
                                                                background: '#fff', 
                                                                borderRadius: '16px', 
                                                                overflow: 'hidden',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                        >
                                                            {/* Group Header */}
                                                            <button
                                                                onClick={() => toggleVoucherGroup(group.key)}
                                                                style={{
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    padding: '16px',
                                                                    background: group.key === 'package' ? '#fefce8' :
                                                                               group.key === 'order_reward' ? '#fefce8' :
                                                                               group.key === 'campaign' ? '#f3f4f6' : '#f3f4f6',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                    <span style={{ fontSize: '24px' }}>{group.icon}</span>
                                                                    <div>
                                                                        <div style={{
                                                                            fontWeight: '600',
                                                                            color: group.key === 'package' ? '#9C7043' :
                                                                                   group.key === 'order_reward' ? '#854d0e' :
                                                                                   group.key === 'campaign' ? '#374151' : '#374151'
                                                                        }}>
                                                                            {group.label}
                                                                        </div>
                                                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                                            {group.vouchers.length} voucher
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <svg
                                                                    style={{ 
                                                                        width: '20px', 
                                                                        height: '20px', 
                                                                        color: '#9ca3af',
                                                                        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                                                                        transition: 'transform 0.2s'
                                                                    }}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>

                                                            {/* Group Content */}
                                                            {!isCollapsed && (
                                                                <div style={{ 
                                                                    padding: '16px', 
                                                                    display: 'grid', 
                                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                                                                    gap: '12px' 
                                                                }}>
                                                                    {group.vouchers.map((voucher: any) => {
                                                                        const status = getVoucherStatus(voucher);
                                                                        const isRevealed = revealedVoucherId === voucher._id;
                                                                        const isDisabled = status === 'used' || status === 'expired';
                                                                        const daysRemaining = getDaysRemaining(voucher.expiresAt);

                                                                        return (
                                                                            <div
                                                                                key={voucher._id}
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    borderRadius: '12px',
                                                                                    overflow: 'hidden',
                                                                                    border: status === 'expiring' ? '2px solid #E3E846' : '2px solid #e5e7eb',
                                                                                    background: isDisabled ? '#f9fafb' : '#fff',
                                                                                    opacity: isDisabled ? 0.6 : 1,
                                                                                    position: 'relative',
                                                                                }}
                                                                            >
                                                                                 {/* Left - Discount */}
                                                                                 <div style={{
                                                                                     width: '90px',
                                                                                     flexShrink: 0,
                                                                                     display: 'flex',
                                                                                     flexDirection: 'column',
                                                                                     alignItems: 'center',
                                                                                     justifyContent: 'center',
                                                                                     padding: '16px 8px',
                                                                                     background: isDisabled ? '#d1d5db' : 'linear-gradient(135deg, #9C7043, #7d5a36)',
                                                                                     color: isDisabled ? '#6b7280' : '#fff',
                                                                                 }}>
                                                                                     <div style={{ fontSize: '20px', fontWeight: '700' }}>
                                                                                         {voucher.discountType === 'percent'
                                                                                             ? `${voucher.discountValue}%`
                                                                                             : `${(voucher.discountValue / 1000).toFixed(0)}K`}
                                                                                     </div>
                                                                                     <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                                                                         Toi da {(voucher.maxDiscount / 1000).toFixed(0)}K
                                                                                     </div>
                                                                                 </div>

                                                                                {/* Right - Details */}
                                                                                <div style={{ flex: 1, padding: '12px' }}>
                                                                                     {/* Status Badge */}
                                                                                     <div style={{ marginBottom: '8px' }}>
                                                                                         <span style={{
                                                                                             display: 'inline-block',
                                                                                             padding: '2px 8px',
                                                                                             borderRadius: '10px',
                                                                                             fontSize: '11px',
                                                                                             fontWeight: '500',
                                                                                             background: status === 'available' ? '#fefce8' :
                                                                                                        status === 'expiring' ? '#fefce8' :
                                                                                                        status === 'used' ? '#e5e7eb' : '#fee2e2',
                                                                                             color: status === 'available' ? '#854d0e' :
                                                                                                   status === 'expiring' ? '#854d0e' :
                                                                                                   status === 'used' ? '#6b7280' : '#dc2626',
                                                                                         }}>
                                                                                             {voucher.isUnlimited ? 'Không giới hạn lượt dùng' :
                                                                                              status === 'available' ? 'Con hieu luc' :
                                                                                              status === 'expiring' ? `Con ${daysRemaining} ngay` :
                                                                                              status === 'used' ? 'Da dung' : 'Het han'}
                                                                                         </span>
                                                                                     </div>

                                                                                    {/* Code */}
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                                                        <code style={{
                                                                                            fontFamily: 'var(--font-family)',
                                                                                            fontWeight: '700',
                                                                                            fontSize: '14px',
                                                                                            color: isDisabled ? '#9ca3af' : '#1f2937',
                                                                                        }}>
                                                                                            {isRevealed ? voucher.code : maskVoucherCode(voucher.code)}
                                                                                        </code>
                                                                                        {!isDisabled && (
                                                                                            <button
                                                                                                onClick={() => toggleVoucherReveal(voucher._id)}
                                                                                                style={{
                                                                                                    background: 'none',
                                                                                                    border: 'none',
                                                                                                    color: '#9C7043',
                                                                                                    fontSize: '12px',
                                                                                                    textDecoration: 'underline',
                                                                                                    cursor: 'pointer',
                                                                                                    padding: 0,
                                                                                                }}
                                                                                            >
                                                                                                {isRevealed ? 'An' : 'Xem'}
                                                                                            </button>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Conditions */}
                                                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                                                        Don tu {(voucher.minOrderValue || 0).toLocaleString()}d
                                                                                    </div>

                                                                                    {/* Copy Button */}
                                                                                    {!isDisabled && isRevealed && (
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                navigator.clipboard.writeText(voucher.code);
                                                                                                toast.success('Da sao chep!', `Ma: ${voucher.code}`);
                                                                                            }}
                                                                                            style={{
                                                                                                marginTop: '8px',
                                                                                                width: '100%',
                                                                                                padding: '8px',
                                                                                                background: '#9C7043',
                                                                                                color: '#fff',
                                                                                                border: 'none',
                                                                                                borderRadius: '8px',
                                                                                                fontSize: '12px',
                                                                                                fontWeight: '600',
                                                                                                cursor: 'pointer',
                                                                                            }}
                                                                                        >
                                                                                            Sao chep ma
                                                                                        </button>
                                                                                    )}
                                                                                </div>

                                                                                 {/* Expiring Warning */}
                                                                                 {status === 'expiring' && (
                                                                                     <div style={{
                                                                                         position: 'absolute',
                                                                                         bottom: 0,
                                                                                         left: 0,
                                                                                         right: 0,
                                                                                         background: '#E3E846',
                                                                                         color: '#854d0e',
                                                                                         fontSize: '10px',
                                                                                         fontWeight: '600',
                                                                                         textAlign: 'center',
                                                                                         padding: '2px',
                                                                                     }}>
                                                                                         Sap het han!
                                                                                     </div>
                                                                                 )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                                Khong tim thay voucher nao phu hop
                                            </div>
                                        )}
                                    </>
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
                                        <Link href="/subscriptions" className="continue-btn">Xem các gói VIP</Link>
                                    </div>
                                ) : (
                                    <div className="membership-list">
                                        {membershipPackages.map((pkg: any) => {
                                            const state = pkg.state || (pkg.status === 'active' ? 'active' : 'expired');
                                            const stateLabel = state === 'active' ? '✓ Đang hoạt động'
                                                : state === 'expired' ? '✗ Đã hết hạn'
                                                    : state === 'awaiting_activation' ? '⏳ Chờ kích hoạt'
                                                        : '⏳ Chờ thanh toán';
                                            const resumeUrl = buildResumePaymentUrl({
                                                _id: pkg._id,
                                                paymentRef: pkg.paymentRef,
                                                paymentMethod: pkg.paymentMethod,
                                                paymentStatus: pkg.paymentStatus,
                                                totalAmount: pkg.price,
                                            });

                                            return (
                                                <div key={pkg._id} className={`membership-card ${state === 'active' ? 'active' : 'expired'}`}>
                                                    <div className="membership-header">
                                                        <h3>{pkg.packageName}</h3>
                                                        <span className={`membership-status ${state === 'active' ? 'active' : 'expired'}`}>
                                                            {stateLabel}
                                                        </span>
                                                    </div>
                                                    <div className="membership-body">
                                                        <div className="membership-info">
                                                            <span>Mã đơn:</span>
                                                            <strong>#{pkg.orderCode || pkg._id.slice(-6).toUpperCase()}</strong>
                                                        </div>
                                                        <div className="membership-info">
                                                            <span>Ngày mua:</span>
                                                            <strong>{new Date(pkg.purchasedAt).toLocaleDateString('vi-VN')}</strong>
                                                        </div>
                                                        {pkg.expiresAt && (
                                                            <div className="membership-info">
                                                                <span>Ngày hết hạn:</span>
                                                                <strong>{new Date(pkg.expiresAt).toLocaleDateString('vi-VN')}</strong>
                                                            </div>
                                                        )}
                                                        <div className="membership-info">
                                                            <span>Voucher đã nhận:</span>
                                                            <strong>
                                                                {pkg.isUnlimitedVoucher
                                                                    ? `${pkg.vouchersReceived || 0} mã dùng không giới hạn`
                                                                    : `${pkg.vouchersReceived || 0} mã${pkg.vouchersReceived > 0 ? ` (còn ${pkg.vouchersAvailable || 0} dùng được)` : ''}`}
                                                            </strong>
                                                        </div>
                                                        <div className="membership-info">
                                                            <span>Giá trị:</span>
                                                            <strong>{pkg.price?.toLocaleString('vi-VN') || 0}đ</strong>
                                                        </div>
                                                    </div>

                                                    {state === 'pending_payment' && (
                                                        <div className="membership-pending">
                                                            <p>
                                                                {pkg.isUnlimitedVoucher
                                                                    ? 'Gói này chưa được thanh toán nên mã VIP dùng không giới hạn chưa được phát hành.'
                                                                    : `Gói này chưa được thanh toán nên ${pkg.vouchersExpected || 0} voucher chưa được phát hành.`}
                                                            </p>
                                                            {resumeUrl && (
                                                                <Link href={resumeUrl} className="order-action order-action-primary">
                                                                    Thanh toán tiếp
                                                                </Link>
                                                            )}
                                                        </div>
                                                    )}

                                                    {state === 'awaiting_activation' && (
                                                        <div className="membership-pending">
                                                            <p>
                                                                {pkg.isUnlimitedVoucher
                                                                    ? 'Đã nhận thanh toán. Cửa hàng sẽ kích hoạt gói và mã VIP dùng không giới hạn trong thời gian sớm nhất.'
                                                                    : `Đã nhận thanh toán. Cửa hàng sẽ kích hoạt gói và phát ${pkg.vouchersExpected || 0} voucher trong thời gian sớm nhất.`}
                                                            </p>
                                                        </div>
                                                    )}
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
                                            <h3>Chọn loại tham gia</h3>
                                            <p className="benefits-desc">Bạn muốn tham gia với tư cách nào?</p>
                                            
                                            <div className="affiliate-options">
                                                <div className="affiliate-option" onClick={() => openTermsModal('collaborator')}>
                                                    <div className="option-icon">🤝</div>
                                                    <h4>Cộng tác viên</h4>
                                                    <ul>
                                                        <li>✓ Hoa hồng 8%</li>
                                                        <li>✓ Không yêu cầu doanh thu</li>
                                                        <li>✓ Dễ dàng tham gia</li>
                                                    </ul>
                                                </div>
                                                
                                                <div className="affiliate-option featured" onClick={() => openTermsModal('agent')}>
                                                    <div className="option-badge">PHỔ BIẾN</div>
                                                    <div className="option-icon">🏆</div>
                                                    <h4>Đại lý</h4>
                                                    <ul>
                                                        <li>✓ Hoa hồng 10%</li>
                                                        <li>✓ Quản lý đội ngũ CTV</li>
                                                        <li>✓ Hoa hồng từ CTV: 2%</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Affiliate Terms Modal */}
                    <AffiliateTermsModal
                        isOpen={showTermsModal}
                        onClose={() => setShowTermsModal(false)}
                        affiliateType={affiliateType}
                    />

                    {selectedOrder && (
                        <OrderDetailModal
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                            onCancelOrder={handleCancelOrder}
                            cancelling={cancellingOrderId === selectedOrder._id}
                        />
                    )}
                </div>
            </div>
            <Footer />

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />

            <style jsx>{`
                .cancelled-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #6b7280;
                    margin-bottom: 16px;
                    cursor: pointer;
                }
                .orders-empty-note {
                    font-size: 14px;
                    color: #6b7280;
                    padding: 20px 0;
                }
                .order-item-clickable {
                    cursor: pointer;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .order-item-clickable:hover,
                .order-item-clickable:focus-visible {
                    border-color: var(--color-primary-brown, #9C7043);
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.07);
                    outline: none;
                }
                .order-item-cancelled {
                    opacity: 0.65;
                }
                .order-badges {
                    display: inline-flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                .payment-status {
                    font-size: 13px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    background: #fef3c7;
                    color: #92400e;
                    white-space: nowrap;
                }
                .payment-status.payment-paid,
                .payment-status.payment-completed {
                    background: #d1fae5;
                    color: #065f46;
                }
                .payment-status.payment-failed {
                    background: #fee2e2;
                    color: #b91c1c;
                }
                .order-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding-top: 14px;
                    border-top: 1px solid #f3f3f3;
                }
                .order-action {
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid transparent;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                }
                .order-action:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .order-action-primary {
                    background: var(--color-primary-brown, #9C7043);
                    color: #fff;
                }
                .order-action-ghost {
                    background: #f3f4f6;
                    color: #374151;
                }
                .order-action-danger {
                    background: #fff;
                    color: #dc2626;
                    border-color: #fecaca;
                }
                .membership-pending {
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1px solid #f3f3f3;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }
                .membership-pending p {
                    margin: 0;
                    font-size: 13px;
                    color: #92400e;
                    flex: 1;
                    min-width: 200px;
                }
                .benefits-desc {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .affiliate-options {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-top: 16px;
                }
                .affiliate-option {
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    background: white;
                }
                .affiliate-option:hover {
                    border-color: #9C7043;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .affiliate-option.featured {
                    border-color: #9C7043;
                    background: linear-gradient(to bottom, #f8f4f0, white);
                }
                .affiliate-option.featured:hover {
                    border-color: #7d5a36;
                }
                .option-badge {
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #9C7043;
                    color: white;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 12px;
                    white-space: nowrap;
                }
                .option-icon {
                    font-size: 32px;
                    text-align: center;
                    margin-bottom: 12px;
                }
                .affiliate-option h4 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #333;
                    text-align: center;
                    margin: 0 0 12px 0;
                }
                .affiliate-option ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .affiliate-option li {
                    font-size: 13px;
                    color: #666;
                    margin-bottom: 6px;
                    padding-left: 0;
                }
                @media (max-width: 640px) {
                    .affiliate-options {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </main>
    );
}
