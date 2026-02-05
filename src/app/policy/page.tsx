'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import FAQSection from '@/components/common/FAQSection';
import { Loader2, ShieldCheck, Truck, RefreshCw, FileText, ChevronRight, Scale } from 'lucide-react';

const POLICY_MENU = [
    { slug: 'return-policy', label: 'Chính sách đổi trả', icon: RefreshCw },
    { slug: 'privacy-policy', label: 'Chính sách bảo mật', icon: ShieldCheck },
    { slug: 'terms', label: 'Điều khoản sử dụng', icon: Scale },
    { slug: 'shipping-policy', label: 'Chính sách vận chuyển', icon: Truck },
];

interface PolicyData {
    title: string;
    content: string;
    updatedAt?: string;
}

export default function PolicyPage() {
    const [activeSlug, setActiveSlug] = useState('return-policy');
    const [data, setData] = useState<PolicyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/page-content/${activeSlug}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeSlug]);

    return (
        <main className="min-h-screen bg-slate-50">
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách & Điều khoản' }]} />

            <div className="container py-12 px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-80 flex-shrink-0">
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-50">
                                    <h3 className="text-lg font-black text-slate-900 border-l-4 border-brand pl-3">
                                        Trung tâm chính sách
                                    </h3>
                                </div>
                                <div className="p-2">
                                    {POLICY_MENU.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeSlug === item.slug;
                                        return (
                                            <button
                                                key={item.slug}
                                                onClick={() => setActiveSlug(item.slug)}
                                                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${isActive
                                                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-brand'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className="flex-1 text-left">{item.label}</span>
                                                <ChevronRight size={14} className={isActive ? 'text-white/50' : 'text-slate-300'} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Need Help Card */}
                            <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                                <FileText className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 rotate-12" />
                                <h4 className="text-xl font-black mb-2">Cần hỗ trợ?</h4>
                                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                    Nếu bạn có thắc mắc về các điều khoản, hãy liên hệ trực tiếp với chúng tôi.
                                </p>
                                <a
                                    href="tel:0901185753"
                                    className="block text-center py-3 bg-brand text-white font-black rounded-xl hover:bg-white hover:text-brand transition-all text-sm"
                                >
                                    090 118 5753
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12 min-h-[600px] relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />

                            {loading ? (
                                <div className="relative z-10 h-full flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-12 h-12 animate-spin text-brand mb-4" />
                                    <p className="text-slate-500 font-bold">Đang tải nội dung...</p>
                                </div>
                            ) : (
                                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="mb-10">
                                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                                            {data?.title}
                                        </h1>
                                        {data?.updatedAt && (
                                            <p className="text-slate-400 text-sm font-medium">
                                                Cập nhật lần cuối: {new Date(data.updatedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                        <div className="h-2 w-20 bg-brand rounded-full mt-6" />
                                    </div>

                                    <div
                                        className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900"
                                        dangerouslySetInnerHTML={{ __html: data?.content || '' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Q&A Integration */}
                        <div className="mt-12">
                            <FAQSection
                                category="shipping"
                                title="Giải đáp nhanh về chính sách"
                                description="Các câu hỏi thường gặp nhất liên quan đến quy trình vận chuyển và đổi trả sản phẩm."
                                limit={3}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                :global(.prose h2) {
                    font-size: 1.5rem;
                    margin-top: 2.5rem !important;
                    margin-bottom: 1.25rem !important;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                :global(.prose h2::before) {
                    content: "";
                    display: inline-block;
                    width: 0.25rem;
                    height: 1.5rem;
                    background: #E3E846;
                    border-radius: 999px;
                }
            `}</style>
        </main>
    );
}
