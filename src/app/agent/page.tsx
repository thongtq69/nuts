'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SaleAgentPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [applying, setApplying] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setStatus(user.saleApplicationStatus || null);
        }
    }, [user]);

    const handleApply = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setApplying(true);
        try {
            const res = await fetch('/api/auth/apply-sale', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setStatus('pending');
                alert('Đăng ký thành công! Chúng tôi sẽ xem xét và phản hồi sớm nhất.');
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setApplying(false);
        }
    };

    const benefits = [
        {
            icon: '💰',
            title: 'Chiết khấu hấp dẫn',
            description: 'Nhận chiết khấu lên đến 30% cho mỗi đơn hàng thành công'
        },
        {
            icon: '🎁',
            title: 'Voucher độc quyền',
            description: 'Nhận voucher giảm giá đặc biệt dành riêng cho đại lý'
        },
        {
            icon: '📦',
            title: 'Hỗ trợ kho hàng',
            description: 'Hỗ trợ ship hàng nhanh chóng từ kho gần nhất'
        },
        {
            icon: '📈',
            title: 'Hoa hồng theo cấp',
            description: 'Hoa hồng tăng dần theo doanh số của bạn'
        },
        {
            icon: '🎓',
            title: 'Đào tạo miễn phí',
            description: 'Được đào tạo về sản phẩm và kỹ năng bán hàng'
        },
        {
            icon: '🤝',
            title: 'Hỗ trợ 24/7',
            description: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn'
        }
    ];

    return (
        <>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đăng ký Đại lý' }]} />

            <div className="container">
                <div className="agent-page">
                    <div className="agent-hero">
                        <h1>Trở thành Đại lý Go Nuts</h1>
                        <p>Kinh doanh cùng Go Nuts - Nhận thu nhập hấp dẫn từ việc bán các sản phẩm hạt dinh dưỡng chất lượng cao</p>
                    </div>

                    <div className="benefits-grid">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="benefit-card">
                                <div className="benefit-icon">{benefit.icon}</div>
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="apply-section">
                        {!user ? (
                            <>
                                <h2>Bắt đầu ngay hôm nay</h2>
                                <p>Đăng nhập hoặc đăng ký tài khoản để trở thành đại lý Go Nuts</p>
                                <Link href="/login" className="btn-apply">Đăng nhập / Đăng ký</Link>
                            </>
                        ) : user.role === 'sale' ? (
                            <>
                                <h2>🎉 Chào mừng Đại lý!</h2>
                                <p>Bạn đã là đại lý của Go Nuts. Hãy tiếp tục bán hàng và nhận hoa hồng!</p>
                                <div className="application-status approved">Đã là đại lý</div>
                            </>
                        ) : user.role === 'admin' ? (
                            <>
                                <h2>Bạn là Admin</h2>
                                <p>Bạn đang đăng nhập với tài khoản Admin.</p>
                            </>
                        ) : status === 'pending' ? (
                            <>
                                <h2>Đơn đăng ký đang được xử lý</h2>
                                <p>Chúng tôi đã nhận được đơn đăng ký của bạn và đang xem xét. Vui lòng chờ trong 1-3 ngày làm việc.</p>
                                <div className="application-status pending">Đang chờ xét duyệt</div>
                            </>
                        ) : status === 'rejected' ? (
                            <>
                                <h2>Đơn đăng ký không được duyệt</h2>
                                <p>Rất tiếc, đơn đăng ký đại lý của bạn chưa được phê duyệt. Bạn có thể liên hệ với chúng tôi để biết thêm chi tiết.</p>
                                <div className="application-status rejected">Không được duyệt</div>
                            </>
                        ) : (
                            <>
                                <h2>Đăng ký trở thành Đại lý</h2>
                                <p>Bấm nút bên dưới để gửi đơn đăng ký. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                                <button
                                    className="btn-apply"
                                    onClick={handleApply}
                                    disabled={applying}
                                >
                                    {applying ? 'Đang gửi...' : 'Đăng ký ngay'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
