'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { VNPayResponseCode } from '@/lib/vnpay-client';

export default function VNPayReturnPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const txnRef = searchParams.get('vnp_TxnRef');
        
        if (txnRef) {
            setOrderId(txnRef);
        }

        if (responseCode === '00') {
            setStatus('success');
            setMessage('Thanh toán thành công!');
            clearCart();
        } else {
            setStatus('failed');
            const errorMsg = responseCode ? (VNPayResponseCode as Record<string, string>)[responseCode] || 'Thanh toán thất bại' : 'Thanh toán thất bại';
            setMessage(errorMsg);
        }
    }, [searchParams, clearCart]);

    if (status === 'loading') {
        return (
            <main>
                <Header />
                <Navbar />
                <div className="container">
                    <div className="loading-wrapper">
                        <div className="spinner"></div>
                        <p>Đang xử lý kết quả thanh toán...</p>
                    </div>
                </div>
                <Footer />
                <style jsx>{`
                    .loading-wrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 100px 0;
                    }
                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid var(--color-primary-brown);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </main>
        );
    }

    return (
        <main>
            <Header />
            <Navbar />

            <div className="container">
                <div className="result-wrapper">
                    <div className={`result-icon ${status}`}>
                        {status === 'success' ? (
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        ) : (
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        )}
                    </div>

                    <h1>{status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}</h1>
                    
                    {orderId && (
                        <p className="order-id">Mã đơn hàng: <strong>#{orderId.slice(-8).toUpperCase()}</strong></p>
                    )}
                    
                    <p className="result-message">{message}</p>

                    <div className="action-buttons">
                        {status === 'success' ? (
                            <>
                                <Link href="/account" className="btn-secondary">
                                    Quản lý đơn hàng
                                </Link>
                                <Link href="/products" className="btn-primary">
                                    Tiếp tục mua sắm
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/cart" className="btn-secondary">
                                    Quay lại giỏ hàng
                                </Link>
                                <Link href="/checkout" className="btn-primary">
                                    Thử lại
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .result-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 0;
                    text-align: center;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .result-icon {
                    margin-bottom: 30px;
                }
                .result-icon.success {
                    color: var(--color-success-green, #22c55e);
                }
                .result-icon.failed {
                    color: #ef4444;
                }
                h1 {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: var(--color-text-dark);
                }
                .order-id {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 10px;
                }
                .result-message {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 40px;
                    max-width: 400px;
                }
                .action-buttons {
                    display: flex;
                    gap: 20px;
                }
                .btn-primary, .btn-secondary {
                    padding: 12px 30px;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: all 0.2s;
                    text-decoration: none;
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
            `}</style>
        </main>
    );
}
