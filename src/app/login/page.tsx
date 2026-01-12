'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth(); // We'll assume useAuth is available from context

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
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="form-actions">
                                <label className="remember-me">
                                    <input type="checkbox" /> Ghi nhớ đăng nhập
                                </label>
                                <a href="#" className="forgot-password">Quên mật khẩu?</a>
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>Hoặc đăng nhập bằng</span>
                        </div>

                        <div className="social-login">
                            <button className="social-btn facebook">Facebook</button>
                            <button className="social-btn google">Google</button>
                        </div>

                        <div className="auth-footer">
                            Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
        .error-message {
            background: #ffe6e6;
            color: #d93025;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
        }
        .auth-wrapper {
            display: flex;
            justify-content: center;
            padding: 40px 0 80px;
        }
        .auth-card {
            width: 100%;
            max-width: 450px;
            background: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid #f0f0f0;
        }
        h1 {
            text-align: center;
            font-size: 26px;
            margin-bottom: 10px;
        }
        .auth-subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            font-size: 14px;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
        }
        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            font-size: 14px;
        }
        .forgot-password {
            color: var(--color-primary-brown);
        }
        .auth-btn {
            width: 100%;
            padding: 12px;
            background: var(--color-primary-brown);
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .auth-btn:hover {
            background: #7a5a36;
        }
        .auth-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .auth-divider {
            margin: 30px 0 20px;
            text-align: center;
            position: relative;
        }
        .auth-divider::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 100%;
            height: 1px;
            background: #eee;
            z-index: 0;
        }
        .auth-divider span {
            background: #fff;
            padding: 0 15px;
            color: #999;
            font-size: 13px;
            position: relative;
            z-index: 1;
        }

        .social-login {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
        }
        .social-btn {
            padding: 10px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            color: #555;
        }
        .social-btn:hover {
            background: #f9f9f9;
        }
        .social-btn.facebook { color: #1877f2; }
        .social-btn.google { color: #db4437; }

        .auth-footer {
            text-align: center;
            font-size: 14px;
        }
        .auth-footer a {
            color: var(--color-primary-brown);
            font-weight: 600;
        }
      `}</style>
        </main>
    );
}
