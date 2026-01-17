'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import PasswordInput from '@/components/common/PasswordInput';
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
    const toast = useToast();

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

            toast.success('Đăng ký thành công!', 'Vui lòng đăng nhập để tiếp tục.');
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
                        <div className="auth-logo">
                            <img src="/assets/logo.png" alt="Go Nuts" />
                        </div>
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
                                <PasswordInput
                                    value={formData.password}
                                    onChange={(value) => setFormData({ ...formData, password: value })}
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nhập lại mật khẩu</label>
                                <PasswordInput
                                    value={formData.confirmPassword}
                                    onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                                    placeholder="Xác nhận mật khẩu"
                                    required
                                />
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Đã có tài khoản? <Link href="/login">Đăng nhập ngay</Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
