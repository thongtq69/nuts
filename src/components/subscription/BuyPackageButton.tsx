'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface BuyPackageButtonProps {
    packageId: string;
    price: number;
    packageName: string;
}

export default function BuyPackageButton({ packageId, price, packageName }: BuyPackageButtonProps) {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handleBuy = async () => {
        if (!user) {
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
                router.push('/account/vouchers');
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
