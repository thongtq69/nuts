'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import FeaturesSection from '@/components/home/FeaturesSection';
import FAQSection from '@/components/common/FAQSection';
import { Loader2, Heart, Award, Users, Sprout, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PageContent {
    title: string;
    content: string;
}

export default function AboutPage() {
    const [data, setData] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/page-content/about-us')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const stats = [
        { label: 'Nông dân liên kết', value: '5000+', icon: Users, color: 'bg-blue-50 text-blue-600' },
        { label: 'Tự nhiên & Sạch', value: '100%', icon: Sprout, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Tỉnh thành', value: '20+', icon: Award, color: 'bg-amber-50 text-amber-600' },
        { label: 'Khách hàng tin dùng', value: '50K+', icon: Heart, color: 'bg-pink-50 text-pink-600' },
    ];

    return (
        <main className="min-h-screen bg-white">
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Về chúng tôi' }]} />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <img
                    src="/assets/images/product1.jpg"
                    alt="Go Nuts Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                <div className="container relative z-10 text-center px-4">
                    <span className="inline-block px-4 py-1.5 bg-brand text-white text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Since 2024
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        VỀ <span className="text-brand">GO NUTS</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Kết nối tinh hoa nông sản Việt với trái tim người tiêu dùng toàn cầu.
                    </p>
                </div>
            </section>

            <div className="container py-20 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Content Section */}
                    <div className="lg:col-span-7 space-y-12">
                        {loading ? (
                            <div className="flex items-center gap-3 py-10">
                                <Loader2 className="animate-spin text-brand" />
                                <span className="text-slate-500">Đang tải câu chuyện thương hiệu...</span>
                            </div>
                        ) : (
                            <div className="about-rich-content">
                                <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <span className="w-12 h-1.5 bg-brand rounded-full" />
                                    Câu chuyện của chúng tôi
                                </h2>
                                <div
                                    className="prose prose-lg prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900"
                                    dangerouslySetInnerHTML={{ __html: data?.content || '' }}
                                />
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                            {stats.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="text-2xl font-black text-slate-900 mb-1">{stat.value}</div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Side Info / CTA */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="relative rounded-[40px] overflow-hidden group shadow-2xl">
                            <img
                                src="/assets/images/product1.jpg"
                                alt="Go Nuts Team"
                                className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand/80 to-transparent p-10 flex flex-col justify-end">
                                <h3 className="text-3xl font-black text-white mb-4">Mầm xanh hy vọng</h3>
                                <p className="text-white/90 text-lg leading-relaxed mb-6">
                                    Mỗi sản phẩm Go Nuts là một lời cam kết về sức khỏe và sự tử tế từ nông trại.
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                                >
                                    Khám phá sản phẩm <ChevronRight size={20} />
                                </Link>
                            </div>
                        </div>

                        <div className="p-8 rounded-[40px] bg-slate-900 text-white space-y-6">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <Award className="text-brand" /> Cam kết vàng
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    '100% Nguyên liệu tự nhiên tuyển chọn',
                                    'Không chất bảo quản - Không chất tạo màu',
                                    'Quy trình chế biến đạt chuẩn ISO & HACCP',
                                    'Đồng hành bền vững cùng nông dân Việt'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                                        <span className="text-slate-300 font-medium leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Q&A Section */}
            <div className="bg-slate-50 py-20">
                <div className="container px-4">
                    <FAQSection
                        category="about"
                        title="Bạn thắc mắc về Go Nuts?"
                        description="Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi câu hỏi của bạn về nguồn gốc sản phẩm và quy trình chế biến."
                        limit={4}
                    />
                    <div className="text-center mt-10">
                        <Link
                            href="/contact"
                            className="text-brand font-black hover:underline flex items-center justify-center gap-2"
                        >
                            Gửi câu hỏi cho chúng tôi <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>

            <FeaturesSection />
            <Footer />

            <style jsx>{`
                .about-rich-content :global(h2) {
                    font-size: 1.875rem;
                    font-weight: 900;
                    margin-top: 2rem;
                    margin-bottom: 1.5rem;
                    color: #0f172a;
                }
                .about-rich-content :global(p) {
                    margin-bottom: 1.5rem;
                }
                .about-rich-content :global(ul) {
                    margin-bottom: 2rem;
                    list-style: none;
                    padding: 0;
                }
                .about-rich-content :global(li) {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .about-rich-content :global(li::before) {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0.7rem;
                    width: 0.5rem;
                    height: 0.5rem;
                    background-color: #E3E846; /* Brand color */
                    border-radius: 999px;
                }
            `}</style>
        </main>
    );
}
