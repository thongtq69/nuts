'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
    };

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]} />

            <div className="container">
                <h1 className="page-title">Liên hệ với chúng tôi</h1>

                <div className="contact-layout">
                    <div className="contact-form-section">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <h3>Gửi tin nhắn cho chúng tôi</h3>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input type="text" placeholder="Nhập họ và tên" required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Nhập email" required />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input type="tel" placeholder="Nhập số điện thoại" />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea rows={5} placeholder="Nhập nội dung tin nhắn" required></textarea>
                            </div>
                            <button type="submit" className="submit-btn">Gửi tin nhắn</button>
                        </form>
                    </div>

                    <div className="contact-info-section">
                        <h3>Thông tin liên hệ</h3>
                        <div className="info-item">
                            <span className="label">Địa chỉ:</span>
                            <p>998 Cầu giấy, Hà Nội</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Hotline:</span>
                            <p>090xxxxxxx</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Email:</span>
                            <p>contact.gonuts@gmail.com</p>
                        </div>
                        <div className="info-item">
                            <span className="label">Giờ làm việc:</span>
                            <p>Thứ 2 - Thứ 7: 8:00 - 17:30</p>
                        </div>

                        <div className="map-placeholder">
                            <p>Bản đồ sẽ hiển thị ở đây</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
