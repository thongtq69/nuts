'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

function ForgotPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            setSubmitted(true);
            toast.success('Thành công', 'Vui lòng kiểm tra email để đặt lại mật khẩu');
        } catch (err: any) {
            toast.error('Lỗi', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Quên mật khẩu' }]} />

            <div className="container">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="auth-logo">
                            <img src="/assets/logo.png" alt="Go Nuts" />
                        </div>

                        {!submitted ? (
                            <>
                                <h1>Quên mật khẩu</h1>
                                <p className="auth-subtitle">
                                    Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
                                </p>

                                <form className="auth-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="Nhập email của bạn"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <button type="submit" className="auth-btn" disabled={isLoading}>
                                        {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="success-icon">
                                    <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1>Kiểm tra email</h1>
                                <p className="auth-subtitle">
                                    Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
                                </p>
                                <p className="auth-text">
                                    Vui lòng kiểm tra hộp thư (và thư mục spam) để xem email từ chúng tôi.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="auth-btn-secondary"
                                >
                                    Gửi lại email
                                </button>
                            </>
                        )}

                        <div className="auth-footer">
                            <Link href="/login">Quay lại đăng nhập</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            <style jsx>{`
                .success-icon {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .auth-text {
                    text-align: center;
                    color: #666;
                    margin-bottom: 24px;
                    line-height: 1.6;
                }
                .auth-btn-secondary {
                    width: 100%;
                    padding: 14px 24px;
                    background: transparent;
                    border: 2px solid #9C7043;
                    color: #9C7043;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .auth-btn-secondary:hover {
                    background: #9C7043;
                    color: white;
                }
            `}</style>
        </main>
    );
}

function LoadingFallback() {
    return (
        <main>
            <Header />
            <Navbar />
            <div className="container">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordForm />
        </Suspense>
    );
}
