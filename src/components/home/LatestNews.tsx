'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    category: string;
    createdAt: string;
}

export default function LatestNews() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // Fetch only first 3 published blogs
                const res = await fetch('/api/blogs?published=true');
                if (res.ok) {
                    const data = await res.json();
                    setBlogs(data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching latest blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) return null;
    if (blogs.length === 0) return null;

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-0.5 w-12 bg-[#9C7044]"></div>
                            <span className="text-[13px] font-black uppercase tracking-[0.3em] text-[#9C7044]">Insights & Updates</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#3C2A1A] uppercase tracking-tighter leading-none">
                            Tin tức & <br className="hidden md:block" />Khuyến mãi
                        </h2>
                    </div>
                    <Link
                        href="/news"
                        className="group flex items-center gap-3 text-sm font-black text-[#3C2A1A] uppercase tracking-widest bg-slate-50 px-8 py-4 rounded-full hover:bg-[#9C7044] hover:text-white transition-all duration-300"
                    >
                        Xem tất cả bài viết
                        <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((item) => (
                        <article key={item._id} className="group flex flex-col h-full bg-white rounded-[40px] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(156,112,68,0.15)] hover:-translate-y-2">
                            <div className="relative aspect-[16/10] overflow-hidden">
                                {item.coverImage ? (
                                    <img
                                        src={item.coverImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-6 left-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${item.category === 'Khuyến mãi'
                                            ? 'bg-[#E3E846] text-[#3C2A1A]'
                                            : 'bg-white/90 backdrop-blur-md text-slate-800'
                                        }`}>
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2.5 text-slate-400 text-[12px] font-bold mb-4">
                                    <Calendar size={14} className="text-[#9C7044]" />
                                    {formatDate(item.createdAt)}
                                </div>

                                <Link href={`/news/${item.slug}`}>
                                    <h3 className="text-xl font-black text-[#3C2A1A] mb-4 line-clamp-2 leading-tight group-hover:text-[#9C7044] transition-colors">
                                        {item.title}
                                    </h3>
                                </Link>

                                <p className="text-slate-500 text-[15px] leading-relaxed mb-8 line-clamp-3">
                                    {item.excerpt}
                                </p>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <Link
                                        href={`/news/${item.slug}`}
                                        className="text-[11px] font-black text-[#3C2A1A] uppercase tracking-[0.2em] flex items-center gap-2 group/link hover:text-[#9C7044] transition-colors"
                                    >
                                        Khám phá ngay
                                        <ArrowRight size={14} strokeWidth={4} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
