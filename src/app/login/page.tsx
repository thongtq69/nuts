'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import PasswordInput from '@/components/common/PasswordInput';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            login(data);
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đăng nhập' }]} />

            <div className="container">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="auth-logo">
                            <img src="/assets/logo.png" alt="Go Nuts" />
                        </div>
                        <h1>Đăng nhập</h1>
                        <p className="auth-subtitle">Chào mừng bạn quay trở lại!</p>

                        {error && <div className="error-message">{error}</div>}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Nhập email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <PasswordInput
                                    value={password}
                                    onChange={setPassword}
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" /> Ghi nhớ đăng nhập
                                </label>
                                <a href="/forgot-password" className="forgot-password">Quên mật khẩu?</a>
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>Hoặc đăng nhập bằng</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn facebook" onClick={() => toast.info('Đang phát triển', 'Đăng nhập bằng Facebook đang được phát triển.')}>Facebook</button>
                            <button className="social-btn google" onClick={() => toast.info('Đang phát triển', 'Đăng nhập bằng Google đang được phát triển.')}>Google</button>
                        </div>

                        <div className="auth-footer">
                            Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
