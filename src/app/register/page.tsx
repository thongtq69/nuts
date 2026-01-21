'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import PasswordInput from '@/components/common/PasswordInput';
import Link from 'next/link';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [registerAs, setRegisterAs] = useState<'user' | 'agent' | 'collaborator'>('user');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'agent') {
            setRegisterAs('agent');
        } else if (type === 'collaborator') {
            setRegisterAs('collaborator');
        }
    }, [searchParams]);

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
                    phone: formData.phone,
                    registerAs
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đăng ký thất bại');
            }

            toast.success('Đăng ký thành công!', data.message);
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
                                <label>Đăng ký với tư cách</label>
                                <div className="role-selector">
                                    <label className={`role-option ${registerAs === 'user' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="registerAs"
                                            value="user"
                                            checked={registerAs === 'user'}
                                            onChange={(e) => setRegisterAs(e.target.value as any)}
                                        />
                                        <span className="role-label">Khách hàng</span>
                                        <span className="role-desc">Mua hàng và nhận ưu đãi</span>
                                    </label>
                                    <label className={`role-option ${registerAs === 'collaborator' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="registerAs"
                                            value="collaborator"
                                            checked={registerAs === 'collaborator'}
                                            onChange={(e) => setRegisterAs(e.target.value as any)}
                                        />
                                        <span className="role-label">Cộng tác viên</span>
                                        <span className="role-desc">Nhận hoa hồng từ giới thiệu</span>
                                    </label>
                                    <label className={`role-option ${registerAs === 'agent' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="registerAs"
                                            value="agent"
                                            checked={registerAs === 'agent'}
                                            onChange={(e) => setRegisterAs(e.target.value as any)}
                                        />
                                        <span className="role-label">Đại lý</span>
                                        <span className="role-desc">Hoa hồng cao + quản lý CTV</span>
                                    </label>
                                </div>
                                {registerAs !== 'user' && (
                                    <p className="role-notice">
                                        * Tài khoản sẽ được admin duyệt trong 24-48 giờ. Bạn sẽ nhận email thông báo khi được duyệt.
                                    </p>
                                )}
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

            <style jsx>{`
                .role-selector {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-top: 8px;
                }
                .role-option {
                    position: relative;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .role-option:hover {
                    border-color: #9C7043;
                    background: #faf6f2;
                }
                .role-option.active {
                    border-color: #9C7043;
                    background: #f8f4f0;
                }
                .role-option input {
                    position: absolute;
                    opacity: 0;
                }
                .role-label {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 4px;
                }
                .role-desc {
                    font-size: 12px;
                    color: #666;
                }
                .role-option.active .role-label {
                    color: #9C7043;
                }
                .role-notice {
                    margin-top: 12px;
                    padding: 12px;
                    background: #fef3c7;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #92400e;
                }
                @media (max-width: 640px) {
                    .role-selector {
                        grid-template-columns: 1fr;
                    }
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

export default function RegisterPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <RegisterForm />
        </Suspense>
    );
}
