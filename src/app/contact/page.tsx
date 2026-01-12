'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function ContactPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Liên hệ' }]} />

            <div className="container">
                <h1 className="page-title">Liên hệ với chúng tôi</h1>

                <div className="contact-layout">
                    <div className="contact-form-section">
                        <h3>Gửi tin nhắn cho chúng tôi</h3>
                        <form className="contact-form">
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

            <style jsx>{`
        .page-title {
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: 700;
        }
        .contact-layout {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 50px;
            margin-bottom: 80px;
        }
        h3 {
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
        }
        .contact-form {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 8px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        .form-group input, 
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
        }
        .submit-btn {
            background: var(--color-primary-brown);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .submit-btn:hover {
            background: #7a5a36;
        }

        .contact-info-section {
            padding: 20px 0;
        }
        .info-item {
            margin-bottom: 20px;
        }
        .info-item .label {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            display: block;
        }
        .info-item p {
            color: #666;
        }
        .map-placeholder {
            width: 100%;
            height: 200px;
            background: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            margin-top: 30px;
            border-radius: 8px;
        }

        @media (max-width: 768px) {
            .contact-layout {
                grid-template-columns: 1fr;
                gap: 30px;
            }
        }
      `}</style>
        </main>
    );
}
