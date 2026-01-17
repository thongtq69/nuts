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
    source?: 'package' | 'manual' | 'campaign' | 'order_reward';
    // Extension fields
    extensionCount?: number;
    extensionFee?: number;
    maxExtensions?: number;
    extensionDays?: number;
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
    const [extendingVoucher, setExtendingVoucher] = useState<Voucher | null>(null);
    const [extending, setExtending] = useState(false);

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

    const canExtend = (voucher: Voucher) => {
        if (voucher.isUsed) return false;
        if (voucher.source !== 'order_reward') return false;
        if (!voucher.extensionFee || voucher.extensionFee <= 0) return false;
        const currentExtensions = voucher.extensionCount || 0;
        const maxExtensions = voucher.maxExtensions || 1;
        return currentExtensions < maxExtensions;
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

    const handleExtendClick = (voucher: Voucher) => {
        setExtendingVoucher(voucher);
    };

    const handleExtendConfirm = async () => {
        if (!extendingVoucher) return;

        setExtending(true);
        try {
            const res = await fetch('/api/user/vouchers/extend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucherId: extendingVoucher._id }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Gia hạn thành công! Voucher mới có hiệu lực đến ${new Date(data.newExpiresAt).toLocaleDateString('vi-VN')}`);
                setExtendingVoucher(null);
                fetchVouchers(); // Reload vouchers
            } else {
                const errData = await res.json();
                alert(errData.error || 'Lỗi gia hạn voucher');
            }
        } catch (error) {
            console.error('Error extending voucher:', error);
            alert('Lỗi kết nối');
        } finally {
            setExtending(false);
        }
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
                            const showExtendButton = canExtend(voucher) && status === 'expired';
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
                                        {voucher.source === 'order_reward' && (
                                            <div className="text-xs text-green-600 font-bold mb-1">
                                                🎁 Thưởng đơn hàng
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
                                        {/* Extension button for expired order_reward vouchers */}
                                        {showExtendButton && (
                                            <button
                                                onClick={() => handleExtendClick(voucher)}
                                                className="btn-extend"
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '6px 12px',
                                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ⏰ Gia hạn ({formatPrice(voucher.extensionFee || 0)})
                                            </button>
                                        )}
                                    </div>
                                    {status !== 'available' && !showExtendButton && (
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

            {/* Extension Confirmation Modal */}
            {extendingVoucher && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => !extending && setExtendingVoucher(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>
                            ⏰ Gia hạn Voucher
                        </h3>

                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px',
                        }}>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                                Mã voucher
                            </div>
                            <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '16px' }}>
                                {extendingVoucher.code}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#64748b' }}>Giá trị voucher:</span>
                                <span style={{ fontWeight: '600', color: '#16a34a' }}>
                                    {formatPrice(extendingVoucher.discountValue)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#64748b' }}>Thời gian gia hạn:</span>
                                <span style={{ fontWeight: '600' }}>
                                    + {extendingVoucher.extensionDays || 90} ngày
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '8px',
                                borderTop: '1px dashed #e2e8f0',
                            }}>
                                <span style={{ fontWeight: '600' }}>Phí gia hạn:</span>
                                <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '18px' }}>
                                    {formatPrice(extendingVoucher.extensionFee || 0)}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            background: '#fef3c7',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            color: '#92400e',
                        }}>
                            💡 Sau khi gia hạn, voucher sẽ có hiệu lực thêm {extendingVoucher.extensionDays || 90} ngày kể từ hôm nay.
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setExtendingVoucher(null)}
                                disabled={extending}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    background: 'white',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleExtendConfirm}
                                disabled={extending}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: extending ? 'wait' : 'pointer',
                                    opacity: extending ? 0.7 : 1,
                                }}
                            >
                                {extending ? 'Đang xử lý...' : `Gia hạn (${formatPrice(extendingVoucher.extensionFee || 0)})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
