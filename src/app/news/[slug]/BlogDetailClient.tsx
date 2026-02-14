'use client';

import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    viewCount: number;
}

interface Props {
    blog: Blog | null;
}

export default function BlogDetailClient({ blog }: Props) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (!blog) {
        return (
            <>
                <Header />
                <Navbar />
                <main>
                    <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức', href: '/news' }]} />
                    <div className="container py-20 text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Bài viết không tồn tại</h1>
                        <p className="text-gray-500">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Navbar />
            <main>
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức', href: '/news' }, { label: blog.title }]} />

                <div className="container">
                    <article className="blog-detail">
                        <header className="blog-header">
                            <span className="blog-category">{blog.category}</span>
                            <h1 className="blog-title">{blog.title}</h1>
                            <div className="blog-meta">
                                <span>{formatDate(blog.createdAt)}</span>
                                <span>{blog.viewCount || 0} lượt xem</span>
                            </div>
                        </header>

                        {blog.coverImage && (
                            <div className="blog-cover">
                                <img src={blog.coverImage} alt={blog.title} />
                            </div>
                        )}

                        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
                    </article>
                </div>
            </main>
            <Footer />
        </>
    );
}
