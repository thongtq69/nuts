'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PackageList from './PackageList';

interface Package {
    _id: string;
    name: string;
    price: number;
    description?: string;
    voucherQuantity: number;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isUnlimitedVoucher?: boolean;
}

interface Props {
    packages: Package[];
}

export default function BuyPackageWrapper({ packages }: Props) {
    const [loading, setLoading] = useState(false);
    const { user, loading: authLoading, checkUser } = useAuth();
    const router = useRouter();

    const handleBuyPackage = async (packageId: string) => {
        // Find the package
        const pkg = packages.find(p => p._id === packageId);
        if (!pkg) return;

        // Check auth
        if (authLoading) {
            await checkUser();
            return;
        }

        if (!user) {
            alert('Vui lòng đăng nhập để mua gói');
            router.push('/login?redirect=/subscriptions');
            return;
        }

        if (!confirm(`Bạn có chắc chắn muốn mua gói VIP "${pkg.name}" với giá ${pkg.price.toLocaleString()}đ?`)) {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-600">Đang xử lý...</span>
            </div>
        );
    }

    return <PackageList packages={packages} onBuyPackage={handleBuyPackage} />;
}
