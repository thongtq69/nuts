'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import FAQSection from '@/components/common/FAQSection';
import { Loader2, Heart, Award, Users, Sprout, ChevronRight, Leaf, Sparkles, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PageImage {
    url: string;
    alt: string;
}

interface PageStat {
    label: string;
    value: string;
    icon: string;
    color: string;
}

interface PageCommitment {
    text: string;
}

interface PageContent {
    title: string;
    subtitle: string;
    content: string;
    heroImage?: PageImage;
    sideImage?: PageImage;
    stats?: PageStat[];
    commitments?: PageCommitment[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Users,
    Sprout,
    Award,
    Heart,
    Leaf,
    Sparkles,
    Shield,
    TrendingUp,
};

const colorClasses: Record<string, string> = {
    'bg-blue-50 text-blue-600': 'from-blue-500/20 to-blue-600/10 text-blue-600',
    'bg-emerald-50 text-emerald-600': 'from-emerald-500/20 to-emerald-600/10 text-emerald-600',
    'bg-amber-50 text-amber-600': 'from-amber-500/20 to-amber-600/10 text-amber-600',
    'bg-pink-50 text-pink-600': 'from-rose-500/20 to-rose-600/10 text-rose-600',
    'bg-purple-50 text-purple-600': 'from-purple-500/20 to-purple-600/10 text-purple-600',
    'bg-orange-50 text-orange-600': 'from-orange-500/20 to-orange-600/10 text-orange-600',
};

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

    const stats = data?.stats || [
        { label: 'Nông dân liên kết', value: '5000+', icon: 'Users', color: 'bg-blue-50 text-blue-600' },
        { label: 'Tự nhiên & Sạch', value: '100%', icon: 'Sprout', color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Tỉnh thành', value: '20+', icon: 'Award', color: 'bg-amber-50 text-amber-600' },
        { label: 'Khách hàng tin dùng', value: '50K+', icon: 'Heart', color: 'bg-pink-50 text-pink-600' },
    ];

    const commitments = data?.commitments || [
        { text: '100% Nguyên liệu tự nhiên tuyển chọn' },
        { text: 'Không chất bảo quản - Không chất tạo màu' },
        { text: 'Quy trình chế biến đạt chuẩn ISO & HACCP' },
        { text: 'Đồng hành bền vững cùng nông dân Việt' },
    ];

    return (
        <main className="min-h-screen bg-white">
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Về chúng tôi' }]} />

            {/* Hero Section - Modern Organic Design */}
            <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <Image
                        src={data?.heroImage?.url || '/assets/images/product1.jpg'}
                        alt={data?.heroImage?.alt || 'Go Nuts Background'}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-10 w-64 h-64 bg-brand/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Sparkles className="w-4 h-4 text-brand" />
                            <span className="text-white/90 text-sm font-medium tracking-wide">Since 2024</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            VỀ{' '}
                            <span className="relative">
                                <span className="text-brand relative z-10">GO NUTS</span>
                                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-brand/30 -skew-x-6" />
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {data?.subtitle || 'Kết nối tinh hoa nông sản Việt với trái tim ngườI tiêu dùng toàn cầu.'}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 mt-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-slate-900 font-black rounded-2xl hover:bg-brand-light transition-all shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-1"
                            >
                                Khám phá sản phẩm
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                            >
                                Liên hệ với chúng tôi
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                        <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
                    </div>
                </div>
            </section>

            {/* Stats Section - Floating Cards */}
            <section className="relative -mt-20 z-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {stats.map((stat, i) => {
                            const Icon = iconMap[stat.icon] || Award;
                            const colorClass = colorClasses[stat.color] || 'from-slate-500/20 to-slate-600/10 text-slate-600';
                            return (
                                <div
                                    key={i}
                                    className="group bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                                    </div>
                                    <div className="text-2xl lg:text-4xl font-black text-slate-900 mb-1 lg:mb-2">{stat.value}</div>
                                    <div className="text-xs lg:text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                        {/* Content Side */}
                        <div className="lg:col-span-7 space-y-10">
                            {loading ? (
                                <div className="flex items-center gap-3 py-10">
                                    <Loader2 className="animate-spin text-brand w-6 h-6" />
                                    <span className="text-slate-500 font-medium">Đang tải câu chuyện thương hiệu...</span>
                                </div>
                            ) : (
                                <div className="about-rich-content">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-1.5 bg-brand rounded-full" />
                                        <span className="text-sm font-bold text-brand uppercase tracking-widest">Câu chuyện của chúng tôi</span>
                                    </div>
                                    <div
                                        className="prose prose-lg prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-h2:text-2xl prose-h2:font-black prose-h2:text-slate-900 prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-800"
                                        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
                                    />
                                </div>
                            )}

                            {/* Values Grid - Mobile Only */}
                            <div className="lg:hidden grid grid-cols-2 gap-4 pt-6">
                                {[
                                    { icon: Leaf, label: 'Tự nhiên', desc: '100% Organic' },
                                    { icon: Shield, label: 'An toàn', desc: 'Chứng nhận ISO' },
                                    { icon: TrendingUp, label: 'Phát triển', desc: 'Bền vững' },
                                    { icon: Heart, label: 'Tận tâm', desc: 'Vì khách hàng' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <item.icon className="w-8 h-8 text-brand mb-2" />
                                        <div className="font-bold text-slate-900">{item.label}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Side Panel */}
                        <div className="lg:col-span-5 space-y-8">
                            {/* Featured Image Card */}
                            <div className="relative rounded-3xl overflow-hidden group shadow-2xl shadow-slate-200/50">
                                <div className="aspect-[4/5] relative">
                                    <Image
                                        src={data?.sideImage?.url || '/assets/images/product1.jpg'}
                                        alt={data?.sideImage?.alt || 'Go Nuts Team'}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/20 to-transparent" />
                                <div className="absolute inset-0 p-6 lg:p-10 flex flex-col justify-end">
                                    <div className="transform group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">Mầm xanh hy vọng</h3>
                                        <p className="text-white/90 text-base lg:text-lg leading-relaxed mb-6">
                                            Mỗi sản phẩm Go Nuts là một lời cam kết về sức khỏe và sự tử tế từ nông trại.
                                        </p>
                                        <Link
                                            href="/products"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                                        >
                                            Khám phá ngay <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Commitments Card */}
                            <div className="p-6 lg:p-8 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center">
                                        <Award className="w-6 h-6 text-brand" />
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-black">Cam kết vàng</h3>
                                </div>
                                <ul className="space-y-4">
                                    {commitments.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <div className="mt-2 w-2 h-2 rounded-full bg-brand flex-shrink-0 group-hover:scale-150 transition-transform" />
                                            <span className="text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Desktop Values Grid */}
                            <div className="hidden lg:grid grid-cols-2 gap-4">
                                {[
                                    { icon: Leaf, label: 'Tự nhiên', desc: '100% Organic' },
                                    { icon: Shield, label: 'An toàn', desc: 'Chứng nhận ISO' },
                                    { icon: TrendingUp, label: 'Phát triển', desc: 'Bền vững' },
                                    { icon: Heart, label: 'Tận tâm', desc: 'Vì khách hàng' },
                                ].map((item, i) => (
                                    <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-brand/5 hover:border-brand/20 transition-all group">
                                        <item.icon className="w-8 h-8 text-brand mb-3 group-hover:scale-110 transition-transform" />
                                        <div className="font-bold text-slate-900">{item.label}</div>
                                        <div className="text-sm text-slate-500">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-slate-50 py-20 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-1.5 bg-brand/10 text-brand text-sm font-bold rounded-full mb-4">Hỏi đáp</span>
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Bạn thắc mắc về Go Nuts?</h2>
                            <p className="text-slate-600 text-lg">Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi câu hỏi của bạn.</p>
                        </div>
                        <FAQSection
                            category="about"
                            limit={4}
                            className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-6 lg:p-10"
                        />
                        <div className="text-center mt-10">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 text-brand font-bold hover:underline"
                            >
                                Gửi câu hỏi cho chúng tôi <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900">
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-purple-500/20" />
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                        </div>
                        <div className="relative px-8 py-16 lg:px-20 lg:py-24 text-center">
                            <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                                Bắt đầu hành trình <span className="text-brand">sức khỏe</span> của bạn
                            </h2>
                            <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10">
                                Khám phá bộ sưu tập hạt dinh dưỡng tự nhiên, được chọn lọc kỹ càng từ những vùng đất tốt nhất Việt Nam.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-slate-900 font-black rounded-2xl hover:bg-brand-light transition-all shadow-lg shadow-brand/25"
                                >
                                    Mua sắm ngay <ChevronRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                                >
                                    Liên hệ tư vấn
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
                .about-rich-content :global(h2) {
                    font-size: 1.875rem;
                    font-weight: 900;
                    margin-top: 2rem;
                    margin-bottom: 1.5rem;
                    color: #0f172a;
                }
                .about-rich-content :global(h3) {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                    color: #1e293b;
                }
                .about-rich-content :global(p) {
                    margin-bottom: 1.5rem;
                    line-height: 1.8;
                }
                .about-rich-content :global(ul) {
                    margin-bottom: 2rem;
                    list-style: none;
                    padding: 0;
                }
                .about-rich-content :global(li) {
                    position: relative;
                    padding-left: 1.75rem;
                    margin-bottom: 1rem;
                    color: #475569;
                }
                .about-rich-content :global(li::before) {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0.6rem;
                    width: 0.5rem;
                    height: 0.5rem;
                    background-color: #E3E846;
                    border-radius: 999px;
                }
                .about-rich-content :global(strong) {
                    color: #0f172a;
                    font-weight: 700;
                }
                .about-rich-content :global(a) {
                    color: #9C7043;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .about-rich-content :global(a:hover) {
                    color: #7d5a36;
                }
                .about-rich-content :global(img) {
                    border-radius: 1rem;
                    margin: 1.5rem 0;
                }
                @keyframes animate-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-in {
                    animation: animate-in 0.7s ease-out forwards;
                }
                .fade-in {
                    opacity: 0;
                }
                .slide-in-from-bottom-4 {
                    --tw-enter-translate-y: 1rem;
                }
                .slide-in-from-bottom-6 {
                    --tw-enter-translate-y: 1.5rem;
                }
                .slide-in-from-bottom-8 {
                    --tw-enter-translate-y: 2rem;
                }
                .slide-in-from-bottom-10 {
                    --tw-enter-translate-y: 2.5rem;
                }
                .duration-700 {
                    animation-duration: 0.7s;
                }
                .duration-1000 {
                    animation-duration: 1s;
                }
            `}</style>
        </main>
    );
}
