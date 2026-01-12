'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import FeaturesSection from '@/components/home/FeaturesSection';

export default function AboutPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Về chúng tôi' }]} />

            <div className="container">
                <h1 className="page-title">Về Go Nuts</h1>

                <div className="about-content">
                    <div className="about-section">
                        <p className="lead-text">
                            Go Nuts tự hào là thương hiệu hàng đầu cung cấp các sản phẩm hạt dinh dưỡng, trái cây sấy và thực phẩm tốt cho sức khỏe tại Việt Nam.
                        </p>

                        <p>
                            Được thành lập vào năm 2024, chúng tôi mang trong mình sứ mệnh kết nối hơn 5000+ nông dân Việt Nam với người tiêu dùng, mang đến những sản phẩm nông sản sạch, chất lượng cao nhất. Chúng tôi cam kết 100% nguyên liệu tự nhiên, không chất bảo quản, quy trình chế biến khép kín đảm bảo vệ sinh an toàn thực phẩm.
                        </p>

                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number">5000+</span>
                                <span className="stat-label">Nông dân liên kết</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Tự nhiên & Sạch</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">20+</span>
                                <span className="stat-label">Tỉnh thành</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Khách hàng tin dùng</span>
                            </div>
                        </div>

                        <h2>Giá trị cốt lõi</h2>
                        <ul className="values-list">
                            <li><strong>Chất lượng:</strong> Luôn đặt chất lượng sản phẩm lên hàng đầu.</li>
                            <li><strong>Sức khỏe:</strong> Vì sức khỏe cộng đồng là mục tiêu tôn chỉ.</li>
                            <li><strong>Bền vững:</strong> Hỗ trợ nông dân và phát triển nông nghiệp bền vững.</li>
                            <li><strong>Tận tâm:</strong> Phục vụ khách hàng bằng cả trái tim.</li>
                        </ul>
                    </div>

                    <div className="about-image">
                        <img src="/assets/images/product1.jpg" alt="Go Nuts Team" />
                    </div>
                </div>

                <FeaturesSection />
            </div>

            <Footer />

            <style jsx>{`
        .page-title {
            margin-bottom: 30px;
            font-size: 32px;
            font-weight: 700;
            text-align: center;
        }
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            margin-bottom: 80px;
            align-items: center;
        }
        .lead-text {
            font-size: 18px;
            font-weight: 500;
            color: var(--color-primary-brown);
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .about-section p {
            margin-bottom: 20px;
            color: #555;
            line-height: 1.6;
        }
        .about-image img {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 40px 0;
            background: #f9f9f9;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            display: block;
            font-size: 28px;
            font-weight: 700;
            color: var(--color-primary-brown);
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
        }

        h2 {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .values-list {
            list-style: none;
        }
        .values-list li {
            position: relative;
            padding-left: 25px;
            margin-bottom: 12px;
            color: #555;
        }
        .values-list li::before {
            content: '•';
            color: var(--color-primary-brown);
            font-size: 24px;
            position: absolute;
            left: 0;
            top: -5px;
        }

        @media (max-width: 992px) {
            .about-content {
                grid-template-columns: 1fr;
                gap: 40px;
            }
            .about-image {
                order: -1;
            }
        }
        @media (max-width: 576px) {
            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
      `}</style>
        </main>
    );
}
