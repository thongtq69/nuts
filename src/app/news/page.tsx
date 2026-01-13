'use client';

import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';

const newsItems = [
    {
        id: 1,
        title: '5 Lợi ích tuyệt vời của hạt Macca',
        excerpt: 'Hạt Macca được mệnh danh là hoàng hậu của các loại hạt khô bởi giá trị dinh dưỡng và hương vị thơm ngon...',
        image: '/assets/images/product1.jpg',
        date: '12/01/2026'
    },
    {
        id: 2,
        title: 'Cách làm sữa hạt điều tại nhà đơn giản',
        excerpt: 'Sữa hạt điều là thức uống dinh dưỡng, dễ làm và phù hợp cho cả gia đình. Cùng xem công thức nhé...',
        image: '/assets/images/product2.jpg',
        date: '10/01/2026'
    },
    {
        id: 3,
        title: 'Chương trình khuyến mãi Tết 2026',
        excerpt: 'Đón Tết sang - Nhận ngàn quà tặng. Khám phá ngay các combo quà Tết ý nghĩa từ Go Nuts...',
        image: '/assets/images/promotion.png',
        date: '05/01/2026'
    },
    {
        id: 4,
        title: 'Bí quyết bảo quản hạt dinh dưỡng đúng cách',
        excerpt: 'Để giữ được hương vị và dinh dưỡng của hạt, bạn cần biết cách bảo quản đúng. Hãy cùng tìm hiểu...',
        image: '/assets/images/product3.jpg',
        date: '03/01/2026'
    },
    {
        id: 5,
        title: 'Tại sao nên ăn hạt mỗi ngày?',
        excerpt: 'Hạt dinh dưỡng chứa nhiều vitamin, khoáng chất và chất chống oxy hóa tốt cho sức khỏe...',
        image: '/assets/images/product4.jpg',
        date: '28/12/2025'
    },
    {
        id: 6,
        title: 'Công thức granola homemade',
        excerpt: 'Tự làm granola tại nhà vừa ngon vừa sạch với nguyên liệu từ Go Nuts. Xem ngay công thức...',
        image: '/assets/images/product5.jpg',
        date: '25/12/2025'
    }
];

export default function NewsPage() {
    return (
        <>
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức' }]} />

            <div className="container">
                <h1 className="page-title">Tin tức & Sự kiện</h1>

                <div className="news-grid">
                    {newsItems.map((item) => (
                        <article key={item.id} className="news-card">
                            <div className="news-image">
                                <img src={item.image} alt={item.title} />
                            </div>
                            <div className="news-content">
                                <div className="news-date">{item.date}</div>
                                <Link href="#">
                                    <h2 className="news-title">{item.title}</h2>
                                </Link>
                                <p className="news-excerpt">{item.excerpt}</p>
                                <Link href="#" className="read-more">Đọc tiếp →</Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </>
    );
}
