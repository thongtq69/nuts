'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setIsValid(false);
        } else {
            setIsValid(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            toast.error('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            toast.success('Thành công', 'Mật khẩu đã được đặt lại');
            router.push('/login');
        } catch (err: any) {
            toast.error('Lỗi', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isValid === null) {
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

    if (isValid === false) {
        return (
            <main>
                <Header />
                <Navbar />
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đặt lại mật khẩu' }]} />

                <div className="container">
                    <div className="auth-wrapper">
                        <div className="auth-card">
                            <div className="error-icon">
                                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1>Link không hợp lệ</h1>
                            <p className="auth-subtitle">
                                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                            </p>
                            <div className="auth-footer">
                                <Link href="/forgot-password">Yêu cầu link mới</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />

                <style jsx>{`
                    .error-icon {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                `}</style>
            </main>
        );
    }

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đặt lại mật khẩu' }]} />

            <div className="container">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="auth-logo">
                            <img src="/assets/logo.png" alt="Go Nuts" />
                        </div>
                        <h1>Đặt lại mật khẩu</h1>
                        <p className="auth-subtitle">Nhập mật khẩu mới của bạn</p>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label>Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <Link href="/login">Quay lại đăng nhập</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
