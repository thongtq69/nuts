'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function NotFound() {
    return (
        <main>
            <Header />
            <Navbar />

            <div className="container">
                <div className="not-found-wrapper">
                    <div className="error-code">404</div>
                    <h1>Trang không tìm thấy</h1>
                    <p>Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>

                    <Link href="/" className="back-home-btn">
                        Quay về trang chủ
                    </Link>
                </div>
            </div>

            <Footer />

            <style jsx>{`
        .not-found-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 100px 0;
            text-align: center;
        }
        .error-code {
            font-size: 120px;
            font-weight: 900;
            line-height: 1;
            color: #eee;
            margin-bottom: 20px;
        }
        h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 15px;
            color: var(--color-text-dark);
        }
        p {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .back-home-btn {
            padding: 12px 30px;
            background: var(--color-primary-brown);
            color: white;
            border-radius: 4px;
            font-weight: 600;
            transition: background 0.2s;
        }
        .back-home-btn:hover {
            background: #7a5a36;
        }
      `}</style>
        </main>
    );
}
