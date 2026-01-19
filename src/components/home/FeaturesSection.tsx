'use client';

import { Truck, RotateCcw, ShieldCheck, Users } from 'lucide-react';

export default function FeaturesSection() {
    return (
        <section className="features-section">
            <div className="container">
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">
                            <Truck size={32} strokeWidth={2} className="icon-delivery" />
                        </div>
                        <p className="feature-text">Giao hàng miễn phí toàn quốc</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <RotateCcw size={32} strokeWidth={2} className="icon-return" />
                        </div>
                        <p className="feature-text">Đổi trả trong 7 ngày nếu không hài lòng</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <ShieldCheck size={32} strokeWidth={2} className="icon-quality" />
                        </div>
                        <p className="feature-text">100% Sạch, Sản phẩm dinh dưỡng</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">
                            <Users size={32} strokeWidth={2} className="icon-farmers" />
                        </div>
                        <p className="feature-text">Cung cấp bởi 5000+ nông dân</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
