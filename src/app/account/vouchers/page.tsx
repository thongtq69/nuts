'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Voucher {
    _id: string;
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    expiresAt: string;
    isUsed: boolean;
    usedAt?: string;
    source?: 'package' | 'manual' | 'campaign';
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function UserVouchersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user) {
            fetchVouchers();
        }
    }, [user, authLoading]);

    const fetchVouchers = async () => {
        try {
            const res = await fetch('/api/user/vouchers');
            if (res.ok) {
                const data = await res.json();
                setVouchers(data);
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVoucherStatus = (voucher: Voucher) => {
        if (voucher.isUsed) return 'used';
        if (new Date(voucher.expiresAt) < new Date()) return 'expired';
        return 'available';
    };

    const filteredVouchers = vouchers.filter(voucher => {
        const status = getVoucherStatus(voucher);
        if (filter === 'all') return true;
        return status === filter;
    });

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        alert('Đã sao chép mã: ' + code);
    };

    if (authLoading || loading) {
        return (
            <>
                <Breadcrumb items={[
                    { label: 'Trang chủ', href: '/' },
                    { label: 'Tài khoản', href: '/account' },
                    { label: 'Voucher của tôi' }
                ]} />
                <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    Đang tải...
                </div>
            </>
        );
    }

    return (
        <>
            <Breadcrumb items={[
                { label: 'Trang chủ', href: '/' },
                { label: 'Tài khoản', href: '/account' },
                { label: 'Voucher của tôi' }
            ]} />

            <div className="container">
                <div className="vouchers-page">
                    <h1>Voucher của tôi</h1>

                    <div className="voucher-filters">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Tất cả ({vouchers.length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
                            onClick={() => setFilter('available')}
                        >
                            Còn hiệu lực ({vouchers.filter(v => getVoucherStatus(v) === 'available').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'used' ? 'active' : ''}`}
                            onClick={() => setFilter('used')}
                        >
                            Đã dùng ({vouchers.filter(v => getVoucherStatus(v) === 'used').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'expired' ? 'active' : ''}`}
                            onClick={() => setFilter('expired')}
                        >
                            Hết hạn ({vouchers.filter(v => getVoucherStatus(v) === 'expired').length})
                        </button>
                    </div>

                    <div className="vouchers-list">
                        {filteredVouchers.map((voucher) => {
                            const status = getVoucherStatus(voucher);
                            return (
                                <div key={voucher._id} className={`voucher-card ${status}`}>
                                    <div className="voucher-left">
                                        <div className="voucher-discount">
                                            {voucher.discountType === 'percent'
                                                ? `${voucher.discountValue}%`
                                                : formatPrice(voucher.discountValue)}
                                        </div>
                                        <div className="voucher-max">
                                            Tối đa {formatPrice(voucher.maxDiscount)}
                                        </div>
                                    </div>
                                    <div className="voucher-right">
                                        <div className="voucher-code-row">
                                            <span className="voucher-code">{voucher.code}</span>
                                            {status === 'available' && (
                                                <button
                                                    className="btn-copy"
                                                    onClick={() => copyToClipboard(voucher.code)}
                                                >
                                                    Sao chép
                                                </button>
                                            )}
                                        </div>
                                        {voucher.source === 'package' && (
                                            <div className="text-xs text-amber-600 font-bold mb-1">
                                                ★ Từ Gói Hội Viên
                                            </div>
                                        )}
                                        <div className="voucher-condition">
                                            Đơn từ {formatPrice(voucher.minOrderValue)}
                                        </div>
                                        <div className="voucher-expiry">
                                            {status === 'used'
                                                ? `Đã dùng: ${new Date(voucher.usedAt!).toLocaleDateString('vi-VN')}`
                                                : status === 'expired'
                                                    ? 'Đã hết hạn'
                                                    : `HSD: ${new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}`
                                            }
                                        </div>
                                    </div>
                                    {status !== 'available' && (
                                        <div className="voucher-overlay">
                                            {status === 'used' ? 'ĐÃ SỬ DỤNG' : 'HẾT HẠN'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredVouchers.length === 0 && (
                        <div className="empty-vouchers">
                            <div className="empty-icon">🎟️</div>
                            <h3>Chưa có voucher nào</h3>
                            <p>Mua gói VIP để nhận voucher giảm giá hấp dẫn!</p>
                            <a href="/subscriptions" className="btn-get-vouchers">Xem các gói VIP</a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
