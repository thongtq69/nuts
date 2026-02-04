'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

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
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const categories = ['Tất cả', 'Tin tức', 'Hướng dẫn', 'Review', 'Khuyến mãi'];

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        if (activeCategory === 'Tất cả') {
            setFilteredBlogs(blogs);
        } else {
            setFilteredBlogs(blogs.filter(blog => blog.category === activeCategory));
        }
    }, [activeCategory, blogs]);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs?published=true');
            if (res.ok) {
                const data = await res.json();
                setBlogs(data);
                setFilteredBlogs(data);
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
            <main className="bg-slate-50 min-h-screen pb-20">
                <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức' }]} />

                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-[#3C2A1A] uppercase tracking-tight">Tin tức & Khuyến mãi</h1>
                            <p className="text-slate-500 mt-2">Cập nhật những tin tức mới nhất về GoNuts và các chương trình ưu đãi hấp dẫn</p>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat
                                        ? 'bg-[#9C7044] text-white shadow-lg shadow-[#9C7044]/20 scale-105'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
                                    <div className="aspect-[16/10] bg-slate-100 animate-pulse" />
                                    <div className="p-8 space-y-4">
                                        <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
                                        <div className="h-8 bg-slate-100 rounded w-full animate-pulse" />
                                        <div className="h-20 bg-slate-100 rounded w-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-300 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Tag className="text-slate-300" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Chưa có bài viết nào</h3>
                            <p className="text-slate-500 mt-2">Vui lòng quay lại sau hoặc chọn danh mục khác.</p>
                            <button
                                onClick={() => setActiveCategory('Tất cả')}
                                className="mt-8 px-6 py-3 bg-[#9C7044]/10 text-[#9C7044] font-bold rounded-xl hover:bg-[#9C7044]/20 transition-all"
                            >
                                Xem tất cả bài viết
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredBlogs.map((item) => (
                                <article key={item._id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col h-full">
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        {item.coverImage ? (
                                            <img
                                                src={item.coverImage}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${item.category === 'Khuyến mãi' ? 'bg-[#E3E846] text-[#3C2A1A]' : 'bg-white/90 backdrop-blur-md text-slate-800'
                                                }`}>
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-slate-400 text-[13px] font-bold mb-4">
                                            <Calendar size={14} className="text-[#9C7044]" />
                                            {formatDate(item.createdAt)}
                                        </div>

                                        <Link href={`/news/${item.slug}`}>
                                            <h2 className="text-xl font-black text-[#3C2A1A] mb-4 line-clamp-2 transition-colors group-hover:text-[#9C7044]">
                                                {item.title}
                                            </h2>
                                        </Link>

                                        <p className="text-slate-500 text-[15px] leading-relaxed mb-6 line-clamp-3 flex-1">
                                            {item.excerpt}
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-slate-50">
                                            <Link
                                                href={`/news/${item.slug}`}
                                                className="inline-flex items-center gap-2 text-sm font-black text-[#3C2A1A] uppercase tracking-widest transition-all hover:gap-4 hover:text-[#9C7044]"
                                            >
                                                Đọc chi tiết
                                                <ArrowRight size={16} strokeWidth={3} />
                                            </Link>
                                        </div>
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
