'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';

const newsItems = [
    {
        id: 1,
        title: '5 Lợi ích tuyệt vời của hạt Macca',
        excerpt: 'Hạt Macca được mệnh danh là hoàng hậu của các loại hạt khô bởi giá trị dinh dưỡng và hương vị thơm ngon...',
        image: '/assets/images/product1.jpg', // Placeholder
        date: '12/01/2026'
    },
    {
        id: 2,
        title: 'Cách làm sữa hạt điều tại nhà đơn giản',
        excerpt: 'Sữa hạt điều là thức uống dinh dưỡng, dễ làm và phù hợp cho cả gia đình. Cùng xem công thức nhé...',
        image: '/assets/images/product2.jpg', // Placeholder
        date: '10/01/2026'
    },
    {
        id: 3,
        title: 'Chương trình khuyến mãi Tết 2026',
        excerpt: 'Đón Tết sang - Nhận ngàn quà tặng. Khám phá ngay các combo quà Tết ý nghĩa từ Go Nuts...',
        image: '/assets/images/promotion.png', // Placeholder
        date: '05/01/2026'
    }
];

export default function NewsPage() {
    return (
        <main>
            <Header />
            <Navbar />
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

            <Footer />

            <style jsx>{`
        .page-title {
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: 700;
        }
        .news-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-bottom: 80px;
        }
        .news-card {
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
            transition: box-shadow 0.2s;
        }
        .news-card:hover {
            box-shadow: var(--shadow-md);
        }
        .news-image {
            height: 200px;
            background: #f5f5f5;
        }
        .news-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .news-content {
            padding: 20px;
        }
        .news-date {
            font-size: 13px;
            color: #999;
            margin-bottom: 10px;
        }
        .news-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.4;
            color: var(--color-text-dark);
        }
        .news-title:hover {
            color: var(--color-primary-brown);
        }
        .news-excerpt {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        .read-more {
            font-size: 14px;
            color: var(--color-primary-brown);
            font-weight: 600;
        }

        @media (max-width: 992px) {
            .news-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 576px) {
            .news-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
        </main>
    );
}
