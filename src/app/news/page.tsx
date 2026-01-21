'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    category: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    views?: number;
}

export default function NewsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs?published=true');
            if (res.ok) {
                const data = await res.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    return (
        <>
            <Header />
            <Navbar />
            <main>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức' }]} />

                <div className="container">
                    <h1 className="page-title">Tin tức & Sự kiện</h1>

                    {loading ? (
                        <div className="news-grid">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <article key={i} className="news-card">
                                    <div className="news-image">
                                        <div className="skeleton h-48 w-full" />
                                    </div>
                                    <div className="news-content">
                                        <div className="skeleton h-4 w-20 mb-2" />
                                        <div className="skeleton h-6 w-full mb-2" />
                                        <div className="skeleton h-4 w-full mb-2" />
                                        <div className="skeleton h-4 w-24" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Chưa có bài viết nào.</p>
                        </div>
                    ) : (
                        <div className="news-grid">
                            {blogs.map((item) => (
                                <article key={item._id} className="news-card">
                                    <div className="news-image">
                                        {item.coverImage ? (
                                            <img src={item.coverImage} alt={item.title} />
                                        ) : (
                                            <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="news-content">
                                        <div className="news-date">{formatDate(item.createdAt)}</div>
                                        <Link href={`/news/${item.slug}`}>
                                            <h2 className="news-title">{item.title}</h2>
                                        </Link>
                                        <p className="news-excerpt">{item.excerpt}</p>
                                        <Link href={`/news/${item.slug}`} className="read-more">Đọc tiếp →</Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
