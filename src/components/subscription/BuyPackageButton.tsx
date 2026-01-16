'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface BuyPackageButtonProps {
    packageId: string;
    price: number;
    packageName: string;
}

export default function BuyPackageButton({ packageId, price, packageName }: BuyPackageButtonProps) {
    const [loading, setLoading] = useState(false);
    const { user, loading: authLoading, checkUser } = useAuth();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    // Wait for auth to be ready
    useEffect(() => {
        if (!authLoading) {
            setIsReady(true);
        }
    }, [authLoading]);

    const handleBuy = async () => {
        // If still loading auth, wait
        if (authLoading || !isReady) {
            // Try to refresh auth state
            await checkUser();
            return;
        }

        if (!user) {
            alert('Vui lòng đăng nhập để mua gói');
            router.push('/login?redirect=/subscriptions');
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn mua gói VIP "${packageName}" với giá ${price.toLocaleString()}đ?`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/packages/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Mua gói thành công! Bạn đã nhận được ${data.vouchersCount} voucher.`);
                router.push('/account');
            } else if (res.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                router.push('/login?redirect=/subscriptions');
            } else {
                alert(data.message || 'Có lỗi xảy ra khi mua gói.');
            }
        } catch (error) {
            console.error('Buy package error', error);
            alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while auth is being checked
    if (!isReady) {
        return (
            <button className="btn-purchase" disabled>
                Đang tải...
            </button>
        );
    }

    return (
        <button
            className="btn-purchase"
            onClick={handleBuy}
            disabled={loading}
        >
            {loading ? 'Đang xử lý...' : 'Mua ngay'}
        </button>
    );
}
