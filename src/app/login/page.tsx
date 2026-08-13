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
import { useLocale } from '@/context/LocaleContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const toast = useToast();
    const { t, href } = useLocale();
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
                throw new Error(data.message || t('Đăng nhập thất bại'));
            }

            login(data);
            router.push(href('/'));
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
                        <h1>{t('Đăng nhập')}</h1>
                        <p className="auth-subtitle">{t('Chào mừng bạn quay trở lại!')}</p>

                        {error && <div className="error-message">{error}</div>}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder={t('Nhập email')}
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('Mật khẩu')}</label>
                                <PasswordInput
                                    value={password}
                                    onChange={setPassword}
                                    placeholder={t('Nhập mật khẩu')}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" /> {t('Ghi nhớ đăng nhập')}
                                </label>
                                <Link href={href('/forgot-password')} className="forgot-password">{t('Quên mật khẩu?')}</Link>
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? t('Đang xử lý...') : t('Đăng nhập')}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>{t('Hoặc đăng nhập bằng')}</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn facebook" onClick={() => toast.info(t('Đang phát triển'), t('Đăng nhập bằng Facebook đang được phát triển.'))}>Facebook</button>
                            <button className="social-btn google" onClick={() => toast.info(t('Đang phát triển'), t('Đăng nhập bằng Google đang được phát triển.'))}>Google</button>
                        </div>

                        <div className="auth-footer">
                            {t('Chưa có tài khoản?')} <Link href={href('/register')}>{t('Đăng ký ngay')}</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
