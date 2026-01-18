'use client';

import { useState, useEffect, useMemo } from 'react';
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

interface VoucherGroup {
    key: string;
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    vouchers: Voucher[];
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'd';
}

// Mask voucher code - only show last 4 characters
function maskCode(code: string): string {
    if (code.length <= 4) return '****';
    return '****' + code.slice(-4);
}

// Calculate days remaining
function getDaysRemaining(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function UserVouchersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');
    const [extendingVoucher, setExtendingVoucher] = useState<Voucher | null>(null);
    const [extending, setExtending] = useState(false);
    
    // State for revealed voucher code - only one at a time
    const [revealedVoucherId, setRevealedVoucherId] = useState<string | null>(null);
    
    // State for collapsed groups
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

    const getVoucherStatus = (voucher: Voucher): 'available' | 'expiring' | 'used' | 'expired' => {
        if (voucher.isUsed) return 'used';
        const daysRemaining = getDaysRemaining(voucher.expiresAt);
        if (daysRemaining < 0) return 'expired';
        if (daysRemaining <= 3) return 'expiring';
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

    // Group vouchers by source
    const groupedVouchers = useMemo((): VoucherGroup[] => {
        const groups: Record<string, Voucher[]> = {
            package: [],
            order_reward: [],
            campaign: [],
            other: [],
        };

        vouchers.forEach(v => {
            const status = getVoucherStatus(v);
            // Apply filter
            if (filter !== 'all') {
                if (filter === 'available' && status !== 'available' && status !== 'expiring') return;
                if (filter === 'used' && status !== 'used') return;
                if (filter === 'expired' && status !== 'expired') return;
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
            groups[key].sort((a, b) => {
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
                color: 'text-brand',
                bgColor: 'bg-brand-light/20',
                vouchers: groups.package,
            });
        }

        if (groups.order_reward.length > 0) {
            result.push({
                key: 'order_reward',
                label: 'Thuong Don Hang',
                icon: '🎁',
                color: 'text-brand-light',
                bgColor: 'bg-brand-light/10',
                vouchers: groups.order_reward,
            });
        }

        if (groups.campaign.length > 0) {
            result.push({
                key: 'campaign',
                label: 'Khuyen Mai',
                icon: '🎉',
                color: 'text-gray-700',
                bgColor: 'bg-gray-50',
                vouchers: groups.campaign,
            });
        }

        if (groups.other.length > 0) {
            result.push({
                key: 'other',
                label: 'Khac',
                icon: '🎟️',
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                vouchers: groups.other,
            });
        }

        return result;
    }, [vouchers, filter]);

    const totalFilteredVouchers = groupedVouchers.reduce((sum, g) => sum + g.vouchers.length, 0);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        // Show toast or alert
        alert('Da sao chep ma: ' + code);
    };

    const toggleReveal = (voucherId: string) => {
        if (revealedVoucherId === voucherId) {
            setRevealedVoucherId(null);
        } else {
            setRevealedVoucherId(voucherId);
        }
    };

    const toggleGroup = (groupKey: string) => {
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
                alert(`Gia han thanh cong! Voucher moi co hieu luc den ${new Date(data.newExpiresAt).toLocaleDateString('vi-VN')}`);
                setExtendingVoucher(null);
                fetchVouchers();
            } else {
                const errData = await res.json();
                alert(errData.error || 'Loi gia han voucher');
            }
        } catch (error) {
            console.error('Error extending voucher:', error);
            alert('Loi ket noi');
        } finally {
            setExtending(false);
        }
    };

    const getStatusBadge = (voucher: Voucher) => {
        const status = getVoucherStatus(voucher);
        const daysRemaining = getDaysRemaining(voucher.expiresAt);

        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Con hieu luc
                    </span>
                );
            case 'expiring':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 animate-pulse">
                        Con {daysRemaining} ngay
                    </span>
                );
            case 'used':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Da su dung
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        Het han
                    </span>
                );
        }
    };

    // Stats
    const stats = useMemo(() => {
        const available = vouchers.filter(v => {
            const s = getVoucherStatus(v);
            return s === 'available' || s === 'expiring';
        }).length;
        const used = vouchers.filter(v => getVoucherStatus(v) === 'used').length;
        const expired = vouchers.filter(v => getVoucherStatus(v) === 'expired').length;
        return { total: vouchers.length, available, used, expired };
    }, [vouchers]);

    if (authLoading || loading) {
        return (
            <>
                <Breadcrumb items={[
                    { label: 'Trang chu', href: '/' },
                    { label: 'Tai khoan', href: '/account' },
                    { label: 'Voucher cua toi' }
                ]} />
                <div className="container py-16 text-center">
                    <div className="inline-block w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500">Dang tai...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Breadcrumb items={[
                { label: 'Trang chu', href: '/' },
                { label: 'Tai khoan', href: '/account' },
                { label: 'Voucher cua toi' }
            ]} />

            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Voucher cua toi</h1>
                    <p className="text-gray-500">Quan ly va su dung cac ma giam gia cua ban</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
                        <div className="text-sm text-gray-500">Tong voucher</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-brand-light/30">
                        <div className="text-3xl font-bold text-brand-light">{stats.available}</div>
                        <div className="text-sm text-gray-500">Con hieu luc</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-gray-400">{stats.used}</div>
                        <div className="text-sm text-gray-500">Da su dung</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
                        <div className="text-3xl font-bold text-red-500">{stats.expired}</div>
                        <div className="text-sm text-gray-500">Het han</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { key: 'all', label: 'Tat ca' },
                        { key: 'available', label: 'Con hieu luc' },
                        { key: 'used', label: 'Da dung' },
                        { key: 'expired', label: 'Het han' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as typeof filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === f.key
                                    ? 'bg-brand text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Grouped Vouchers */}
                {groupedVouchers.length > 0 ? (
                    <div className="space-y-6">
                        {groupedVouchers.map(group => {
                            const isCollapsed = collapsedGroups.has(group.key);
                            return (
                                <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Group Header */}
                                    <button
                                        onClick={() => toggleGroup(group.key)}
                                        className={`w-full flex items-center justify-between p-4 ${group.bgColor} hover:opacity-90 transition-all`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{group.icon}</span>
                                            <div className="text-left">
                                                <h3 className={`font-bold ${group.color}`}>{group.label}</h3>
                                                <p className="text-sm text-gray-500">{group.vouchers.length} voucher</p>
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Group Content */}
                                    {!isCollapsed && (
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {group.vouchers.map(voucher => {
                                                const status = getVoucherStatus(voucher);
                                                const isRevealed = revealedVoucherId === voucher._id;
                                                const isDisabled = status === 'used' || status === 'expired';
                                                const showExtendButton = canExtend(voucher) && status === 'expired';
                                                const daysRemaining = getDaysRemaining(voucher.expiresAt);

                                                return (
                                                    <div
                                                        key={voucher._id}
                                                        className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                                                            isDisabled && !showExtendButton
                                                                ? 'border-gray-200 bg-gray-50 opacity-60'
                                                                : status === 'expiring'
                                                                    ? 'border-brand-light/50 bg-brand-light/10'
                                                                    : 'border-brand/30 bg-white hover:border-brand hover:shadow-md'
                                                        }`}
                                                    >
                                                        {/* Voucher Content */}
                                                        <div className="flex">
                                                            {/* Left - Discount Value */}
                                                            <div className={`w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 ${
                                                                isDisabled ? 'bg-gray-200' : 'bg-gradient-to-br from-brand to-brand/80'
                                                            }`}>
                                                                <div className={`text-2xl font-bold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
                                                                    {voucher.discountType === 'percent'
                                                                        ? `${voucher.discountValue}%`
                                                                        : formatPrice(voucher.discountValue)}
                                                                </div>
                                                                <div className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-white/90'}`}>
                                                                    Toi da {formatPrice(voucher.maxDiscount)}
                                                                </div>
                                                            </div>

                                                            {/* Right - Details */}
                                                            <div className="flex-1 p-4">
                                                                {/* Status Badge */}
                                                                <div className="mb-2">
                                                                    {getStatusBadge(voucher)}
                                                                </div>

                                                                {/* Code Section */}
                                                                <div className="mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <code className={`font-mono font-bold text-lg ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
                                                                            {isRevealed ? voucher.code : maskCode(voucher.code)}
                                                                        </code>
                                                                        {!isDisabled && (
                                                                            <button
                                                                                onClick={() => toggleReveal(voucher._id)}
                                                                                className="text-xs text-brand hover:text-brand/80 font-medium underline"
                                                                            >
                                                                                {isRevealed ? 'An ma' : 'Xem ma'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Conditions */}
                                                                <div className="text-xs text-gray-500 space-y-1">
                                                                    <div>Don tu {formatPrice(voucher.minOrderValue)}</div>
                                                                    <div>
                                                                        {status === 'used'
                                                                            ? `Da dung: ${new Date(voucher.usedAt!).toLocaleDateString('vi-VN')}`
                                                                            : status === 'expired'
                                                                                ? 'Da het han'
                                                                                : `HSD: ${new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}`
                                                                        }
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                {!isDisabled && isRevealed && (
                                                                    <button
                                                                        onClick={() => copyToClipboard(voucher.code)}
                                                                        className="mt-3 w-full bg-brand hover:bg-brand/90 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all"
                                                                    >
                                                                        Sao chep ma
                                                                    </button>
                                                                )}

                                                                {/* Extend Button */}
                                                                {showExtendButton && (
                                                                    <button
                                                                        onClick={() => handleExtendClick(voucher)}
                                                                        className="mt-3 w-full bg-gradient-to-r from-brand to-brand-light hover:from-brand/90 hover:to-brand-light/90 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all"
                                                                    >
                                                                        Gia han ({formatPrice(voucher.extensionFee || 0)})
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Expiring Warning */}
                                                        {status === 'expiring' && (
                                                            <div className="bg-yellow-400 text-yellow-900 text-xs font-medium text-center py-1">
                                                                Sap het han trong {daysRemaining} ngay!
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
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <div className="text-6xl mb-4">🎟️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chua co voucher nao</h3>
                        <p className="text-gray-500 mb-6">Mua goi hoi vien de nhan voucher giam gia hap dan!</p>
                        <a
                            href="/membership"
                            className="inline-block bg-brand hover:bg-brand/90 text-white font-medium py-3 px-6 rounded-xl transition-all"
                        >
                            Xem cac goi hoi vien
                        </a>
                    </div>
                )}
            </div>

            {/* Extension Confirmation Modal */}
            {extendingVoucher && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => !extending && setExtendingVoucher(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-brand to-brand-light p-6 text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span>⏰</span> Gia han Voucher
                            </h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <div className="text-sm text-gray-500 mb-1">Ma voucher</div>
                                <div className="font-mono font-bold text-lg">{extendingVoucher.code}</div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Gia tri voucher:</span>
                                    <span className="font-semibold text-green-600">
                                        {extendingVoucher.discountType === 'percent'
                                            ? `${extendingVoucher.discountValue}%`
                                            : formatPrice(extendingVoucher.discountValue)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Thoi gian gia han:</span>
                                    <span className="font-semibold">+{extendingVoucher.extensionDays || 90} ngay</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-dashed border-gray-200">
                                    <span className="font-semibold">Phi gia han:</span>
                                    <span className="font-bold text-xl text-brand">
                                        {formatPrice(extendingVoucher.extensionFee || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-brand-light/10 border border-brand-light/30 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-700">
                                    Sau khi gia han, voucher se co hieu luc them {extendingVoucher.extensionDays || 90} ngay ke tu hom nay.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setExtendingVoucher(null)}
                                    disabled={extending}
                                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Huy
                                </button>
                                <button
                                    onClick={handleExtendConfirm}
                                    disabled={extending}
                                    className="flex-1 py-3 bg-gradient-to-r from-brand to-brand-light hover:from-brand/90 hover:to-brand-light/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {extending ? 'Dang xu ly...' : `Gia han`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-pulse {
                    animation: pulse 2s infinite;
                }
            `}</style>
        </>
    );
}
