'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';

export default function PolicyPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách' }]} />

            <div className="container">
                <div className="policy-layout">
                    <aside className="policy-sidebar">
                        <h3>Danh mục chính sách</h3>
                        <ul>
                            <li><Link href="/policy" className="active">Chính sách đổi trả</Link></li>
                            <li><Link href="/policy/privacy">Chính sách bảo mật</Link></li>
                            <li><Link href="/policy/terms">Điều khoản sử dụng</Link></li>
                            <li><Link href="/policy/shipping">Chính sách vận chuyển</Link></li>
                        </ul>
                    </aside>

                    <div className="policy-content">
                        <h1>Chính sách đổi trả</h1>

                        <div className="content-block">
                            <h2>1. Điều kiện đổi trả</h2>
                            <p>Khách hàng có thể đổi trả sản phẩm trong vòng 07 ngày kể từ ngày nhận hàng với các điều kiện sau:</p>
                            <ul>
                                <li>Sản phẩm còn nguyên tem, mác, niêm phong.</li>
                                <li>Sản phẩm không có dấu hiệu đã qua sử dụng.</li>
                                <li>Lỗi do nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển.</li>
                            </ul>
                        </div>

                        <div className="content-block">
                            <h2>2. Phương thức hoàn tiền</h2>
                            <p>
                                Sau khi nhận được sản phẩm đổi trả và kiểm tra, chúng tôi sẽ tiến hành hoàn tiền cho quý khách qua:
                            </p>
                            <ul>
                                <li>Chuyển khoản ngân hàng (3-5 ngày làm việc).</li>
                                <li>Hoàn tiền vào ví điện tử.</li>
                            </ul>
                        </div>

                        <div className="content-block">
                            <h2>3. Liên hệ hỗ trợ</h2>
                            <p>Mọi thắc mắc xin vui lòng liên hệ Hotline: 090xxxxxxx hoặc Email: contact.gonuts@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
