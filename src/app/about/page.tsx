'use client';

import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import FeaturesSection from '@/components/home/FeaturesSection';

export default function AboutPage() {
    return (
        <>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Về chúng tôi' }]} />

            <div className="container">
                <h1 className="page-title center">Về Go Nuts</h1>

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
        </>
    );
}
