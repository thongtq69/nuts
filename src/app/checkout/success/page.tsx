'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function OrderSuccessPage() {
    return (
        <main>
            <Header />
            <Navbar />

            <div className="container">
                <div className="success-wrapper">
                    <img src="/assets/logo.png" alt="Go Nuts" className="success-logo" />
                    
                    <div className="success-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>

                    <h1>Đặt hàng thành công!</h1>
                    <p className="success-message">
                        Cảm ơn bạn đã mua hàng tại Go Nuts. Đơn hàng của bạn đã được tiếp nhận.
                    </p>
                    <p className="success-note">
                        Chúng tôi đã gửi email xác nhận đến hộp thư của bạn. Vui lòng kiểm tra để biết thêm chi tiết.
                    </p>

                    <div className="action-buttons">
                        <Link href="/account" className="btn-secondary">
                            Quản lý đơn hàng
                        </Link>
                        <Link href="/products" className="btn-primary">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
        .success-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 0;
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }
        .success-logo {
            width: 100px;
            height: auto;
            margin-bottom: 20px;
        }
        .success-icon {
            color: var(--color-success-green);
            margin-bottom: 30px;
        }
        h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--color-text-dark);
        }
        .success-message {
            font-size: 18px;
            margin-bottom: 10px;
            color: #333;
        }
        .success-note {
            color: #666;
            margin-bottom: 40px;
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
