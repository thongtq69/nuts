'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PackageList from './PackageList';
import { useLocale } from '@/context/LocaleContext';

interface Package {
    _id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
    imagePublicId?: string;
    voucherQuantity: number;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isUnlimitedVoucher?: boolean;
    terms?: string;
}

interface Props {
    packages: Package[];
}

export default function BuyPackageWrapper({ packages }: Props) {
    const { user, loading: authLoading, checkUser } = useAuth();
    const toast = useToast();
    const router = useRouter();
    const { href, t } = useLocale();

    const handleBuyPackage = async (packageId: string) => {
        // Check auth first
        if (authLoading) {
            await checkUser();
            return;
        }

        if (!user) {
            toast.info(t('Cần đăng nhập'), t('Vui lòng đăng nhập để mua gói'));
            router.push(href('/login?redirect=/subscriptions'));
            return;
        }

        // Redirect to checkout page for payment flow
        router.push(href(`/checkout/membership?packageId=${packageId}`));
    };

    return <PackageList packages={packages} onBuyPackage={handleBuyPackage} />;
}
