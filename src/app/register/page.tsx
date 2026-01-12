'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.type === 'tel' ? 'phone' : e.target.type === 'email' ? 'email' : e.target.type === 'password' && e.target.placeholder.includes('Xác nhận') ? 'confirmPassword' : e.target.name || (e.target.placeholder.includes('họ tên') ? 'name' : e.target.type === 'password' ? 'password' : '')]: e.target.value });
        // NOTE: The above logic is a bit brittle due to lack of names in original code. I should add names to inputs.
    };

    // Better approach: rewrite the form with names to handle state properly
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }

            // Success: Redirect to login
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            router.push('/login');
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
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đăng ký' }]} />

            <div className="container">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <h1>Đăng ký tài khoản</h1>
                        <p className="auth-subtitle">Tạo tài khoản để nhận nhiều ưu đãi</p>

                        {error && <div className="error-message">{error}</div>}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ tên của bạn"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    placeholder="Nhập số điện thoại"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Nhập email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nhập lại mật khẩu</label>
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>

                        <div className="auth-footer mt-4">
                            Đã có tài khoản? <Link href="/login">Đăng nhập ngay</Link>
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
            margin-top: 10px;
        }
        .auth-btn:hover {
            background: #7a5a36;
        }
        .auth-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .mt-4 {
            margin-top: 25px;
        }
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
