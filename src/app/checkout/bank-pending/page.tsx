'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BankInfoDisplay from '@/components/payment/BankInfoDisplay';

type AutoCheckStatus = 'idle' | 'checking' | 'paid' | 'error';

function BankPendingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('order') || '';
    const paymentRef = searchParams.get('ref') || '';
    const customerName = searchParams.get('name') || '';
    const customerEmail = searchParams.get('email') || '';
    const customerPhone = searchParams.get('phone') || '';
    const amount = Number(searchParams.get('amount') || 0);
    const [autoCheckStatus, setAutoCheckStatus] = useState<AutoCheckStatus>('idle');
    const hasPaymentInfo = Boolean(paymentRef && Number.isFinite(amount) && amount > 0);
    const lookupHref = customerEmail || customerPhone
        ? `/tra-cuu-don-hang?email=${encodeURIComponent(customerEmail)}&phone=${encodeURIComponent(customerPhone)}`
        : '/tra-cuu-don-hang';

    useEffect(() => {
        if (!hasPaymentInfo || !orderCode || !paymentRef) return;

        let active = true;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const scheduleNext = (delayMs: number) => {
            if (!active) return;
            timeoutId = setTimeout(checkPaymentStatus, delayMs);
        };

        const checkPaymentStatus = async () => {
            setAutoCheckStatus('checking');

            try {
                const params = new URLSearchParams({
                    order: orderCode,
                    ref: paymentRef,
                    amount: String(amount),
                });
                const response = await fetch(`/api/bank/payment-status?${params.toString()}`, {
                    cache: 'no-store',
                });
                const data = await response.json().catch(() => null);

                if (!active) return;
                if (response.ok && data?.paid) {
                    setAutoCheckStatus('paid');
                    router.push(data?.orderType === 'membership'
                        ? '/checkout/membership/success'
                        : '/checkout/success');
                    return;
                }

                setAutoCheckStatus(response.ok ? 'idle' : 'error');
                scheduleNext(response.ok ? 5_000 : 10_000);
            } catch (error) {
                console.error('Bank payment status check failed:', error);
                if (!active) return;
                setAutoCheckStatus('error');
                scheduleNext(10_000);
            }
        };

        scheduleNext(5_000);

        return () => {
            active = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [amount, hasPaymentInfo, orderCode, paymentRef, router]);

    return (
        <div className="container">
            <div className="pending-wrapper">
                <Image src="/assets/logo.png" alt="Go Nuts" width={120} height={120} className="pending-logo" />

                <div className="pending-icon" aria-hidden="true">
                    <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                    </svg>
                </div>

                <h1>Đơn hàng đã tạo, đang chờ thanh toán</h1>
                <p className="pending-message">
                    Đơn #{orderCode || 'mới'} đã được ghi nhận. Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để hệ thống tự xác nhận.
                </p>

                {hasPaymentInfo ? (
                    <div className="payment-box">
                        <BankInfoDisplay
                            amount={amount}
                            description={paymentRef}
                            customerName={customerName}
                        />
                    </div>
                ) : (
                    <div className="missing-info">
                        Không tìm thấy thông tin QR trên đường dẫn này. Anh có thể tra cứu đơn hàng bằng email và số điện thoại đã đặt.
                    </div>
                )}

                <div className={`pending-note ${autoCheckStatus === 'error' ? 'pending-note-warning' : ''}`}>
                    {autoCheckStatus === 'checking'
                        ? 'Hệ thống đang kiểm tra giao dịch khớp với nội dung chuyển khoản của đơn này.'
                        : autoCheckStatus === 'paid'
                            ? 'Đã nhận được thanh toán. Đang chuyển sang trang hoàn tất đơn hàng.'
                            : 'Giữ trang này mở sau khi chuyển khoản. Hệ thống sẽ tự kiểm tra và xác nhận đơn khi ACB trả giao dịch khớp số tiền và nội dung.'}
                </div>

                <div className="action-buttons">
                    <Link href={lookupHref} className="btn-secondary">
                        Tra cứu đơn hàng
                    </Link>
                    <Link href="/products" className="btn-primary">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .pending-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 70px 0;
                    text-align: center;
                    max-width: 820px;
                    margin: 0 auto;
                }
                .pending-logo {
                    width: 96px;
                    height: auto;
                    margin-bottom: 22px;
                }
                .pending-icon {
                    color: #9C7043;
                    margin-bottom: 26px;
                }
                h1 {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 18px;
                    color: var(--color-text-dark);
                }
                .pending-message {
                    font-size: 18px;
                    line-height: 1.7;
                    margin-bottom: 28px;
                    color: #374151;
                }
                .payment-box {
                    width: 100%;
                    margin-bottom: 24px;
                    text-align: left;
                }
                .missing-info {
                    width: 100%;
                    margin-bottom: 24px;
                    padding: 18px 20px;
                    border: 1px solid #fbbf24;
                    border-radius: 8px;
                    background: #fffbeb;
                    color: #92400e;
                    font-weight: 600;
                }
                .pending-note {
                    width: 100%;
                    margin-bottom: 34px;
                    padding: 16px 18px;
                    border: 1px solid #bfdbfe;
                    border-radius: 8px;
                    background: #eff6ff;
                    color: #1d4ed8;
                    font-weight: 600;
                    line-height: 1.6;
                }
                .pending-note-warning {
                    border-color: #fbbf24;
                    background: #fffbeb;
                    color: #92400e;
                }
                .action-buttons {
                    display: flex;
                    gap: 18px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .btn-primary, .btn-secondary {
                    padding: 12px 28px;
                    border-radius: 6px;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: var(--color-primary-brown);
                    color: white;
                }
                .btn-primary:hover {
                    background: #7a5a36;
                }
                .btn-secondary {
                    background: white;
                    color: var(--color-primary-brown);
                    border: 1px solid var(--color-primary-brown);
                }
                .btn-secondary:hover {
                    background: #f9f9f9;
                }
                @media (max-width: 640px) {
                    .pending-wrapper {
                        padding: 44px 0;
                    }
                    h1 {
                        font-size: 26px;
                    }
                    .pending-message {
                        font-size: 16px;
                    }
                    .action-buttons,
                    .btn-primary,
                    .btn-secondary {
                        width: 100%;
                    }
                    .btn-primary,
                    .btn-secondary {
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="container">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '420px',
                color: '#6b7280',
                fontWeight: 600,
            }}>
                Đang tải thông tin thanh toán...
            </div>
        </div>
    );
}

export default function BankPendingPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
                <BankPendingContent />
            </Suspense>
            <Footer />
        </main>
    );
}
