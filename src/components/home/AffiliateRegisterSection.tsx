'use client';

import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';

export default function AffiliateRegisterSection() {
    const { t, href } = useLocale();
    return (
        <section className="affiliate-register-section">
            <div className="container">
                <div className="affiliate-register-content">
                    <div className="affiliate-text">
                        <h2>{t('Trở thành Đối tác của Go Nuts')}</h2>
                        <p className="affiliate-subtitle">
                            {t('Kiếm thu nhập thụ động bằng cách giới thiệu sản phẩm dinh dưỡng chất lượng cao')}
                        </p>
                        
                        <div className="affiliate-benefits">
                            <div className="benefit-item">
                                <span className="benefit-icon">💰</span>
                                <div className="benefit-info">
                                    <h4>{t('Hoa hồng hấp dẫn')}</h4>
                                    <p>{t('Nhận đến 10% hoa hồng cho mỗi đơn hàng giới thiệu thành công')}</p>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">📊</span>
                                <div className="benefit-info">
                                    <h4>{t('Theo dõi dễ dàng')}</h4>
                                    <p>{t('Dashboard trực tuyến để theo dõi doanh thu và hoa hồng')}</p>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">🎁</span>
                                <div className="benefit-info">
                                    <h4>{t('Mã giới thiệu riêng')}</h4>
                                    <p>{t('Mã giới thiệu cá nhân để chia sẻ với khách hàng')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="affiliate-cta">
                            <Link href={href('/register?type=agent')} className="btn-agent">
                                {t('Đăng ký Đại lý')}
                            </Link>
                            <span className="coming-soon-ctv">{t('Cộng tác viên - Đang cập nhật')}</span>
                        </div>
                    </div>

                    <div className="affiliate-image">
                        <div className="image-wrapper">
                            <div className="stats-card">
                                <div className="stat-item">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">{t('Đại lý')}</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <span className="stat-number">50M+</span>
                                    <span className="stat-label">{t('Hoa hồng đã trả')}</span>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <span className="stat-number">10K+</span>
                                    <span className="stat-label">{t('Khách hàng mới')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .affiliate-register-section {
                    padding: 60px 0 80px;
                    background: linear-gradient(to bottom, #faf6f2, white);
                }

                .affiliate-register-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    align-items: center;
                }

                .affiliate-text h2 {
                    font-size: 36px;
                    font-weight: 700;
                    color: #333;
                    margin: 0 0 12px 0;
                    line-height: 1.2;
                }

                .affiliate-subtitle {
                    font-size: 16px;
                    color: #666;
                    margin: 0 0 32px 0;
                    line-height: 1.6;
                }

                .affiliate-benefits {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .benefit-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }

                .benefit-icon {
                    font-size: 28px;
                    flex-shrink: 0;
                }

                .benefit-info h4 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 4px 0;
                }

                .benefit-info p {
                    font-size: 14px;
                    color: #666;
                    margin: 0;
                    line-height: 1.5;
                }

                .affiliate-cta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .btn-agent {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 14px 32px;
                    background: #9C7043;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .btn-agent:hover {
                    background: #7d5a36;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(156, 112, 67, 0.3);
                }

                .coming-soon-ctv {
                    padding: 10px 20px;
                    background: #f0f0f0;
                    color: #999;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                }

                .affiliate-image {
                    display: flex;
                    justify-content: center;
                }

                .image-wrapper {
                    width: 100%;
                    max-width: 400px;
                }

                .stats-card {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-number {
                    display: block;
                    font-size: 28px;
                    font-weight: 700;
                    color: #9C7043;
                    line-height: 1;
                    margin-bottom: 8px;
                }

                .stat-label {
                    font-size: 13px;
                    color: #666;
                }

                .stat-divider {
                    width: 1px;
                    height: 60px;
                    background: #eee;
                }

                @media (max-width: 992px) {
                    .affiliate-register-content {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }

                    .affiliate-text {
                        text-align: center;
                    }

                    .affiliate-text h2 {
                        font-size: 28px;
                    }

                    .affiliate-benefits {
                        align-items: center;
                    }

                    .benefit-item {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .affiliate-cta {
                        flex-direction: column;
                        justify-content: center;
                    }
                }

                @media (max-width: 576px) {
                    .affiliate-register-section {
                        padding: 32px 0;
                    }

                    .affiliate-text h2 {
                        font-size: 24px;
                    }

                    .affiliate-subtitle {
                        margin-bottom: 22px;
                        font-size: 14px;
                    }

                    .affiliate-benefits {
                        align-items: stretch;
                        gap: 12px;
                        margin-bottom: 22px;
                    }

                    .benefit-item {
                        flex-direction: row;
                        align-items: flex-start;
                        gap: 12px;
                        padding: 14px;
                        border: 1px solid #eee8e2;
                        border-radius: 14px;
                        background: white;
                        text-align: left;
                    }

                    .benefit-icon {
                        font-size: 23px;
                    }

                    .affiliate-cta,
                    .btn-agent,
                    .coming-soon-ctv {
                        width: 100%;
                    }

                    .coming-soon-ctv {
                        text-align: center;
                    }

                    .stats-card {
                        flex-direction: row;
                        gap: 8px;
                        padding: 20px 12px;
                    }

                    .stat-divider {
                        width: 1px;
                        height: 48px;
                    }

                    .stat-number {
                        font-size: 22px;
                    }

                    .stat-label {
                        font-size: 10px;
                    }
                }
            `}</style>
        </section>
    );
}
