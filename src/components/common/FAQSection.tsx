'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Loader2 } from 'lucide-react';

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
}

interface FAQSectionProps {
    category?: string;
    title?: string;
    description?: string;
    limit?: number;
    className?: string;
}

export default function FAQSection({
    category,
    title = "Câu hỏi thường gặp",
    description,
    limit,
    className = ""
}: FAQSectionProps) {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                let url = '/api/faqs';
                if (category) url += `?category=${category}`;

                const res = await fetch(url);
                if (res.ok) {
                    let data = await res.json();
                    if (limit) data = data.slice(0, limit);
                    setFaqs(data);
                }
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, [category, limit]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
                <p className="text-slate-500 text-sm">Đang tải câu hỏi...</p>
            </div>
        );
    }

    if (faqs.length === 0) return null;

    return (
        <section className={`faq-component py-12 ${className}`}>
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{title}</h2>
                {description && <p className="text-slate-500 max-w-2xl mx-auto">{description}</p>}
            </div>

            <div className="max-w-3xl mx-auto space-y-4 px-4">
                {faqs.map((faq, index) => (
                    <div
                        key={faq._id}
                        className={`faq-item-wrapper rounded-2xl border-2 transition-all duration-300 overflow-hidden ${openIndex === index
                            ? 'border-brand bg-white shadow-xl shadow-brand/5'
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                            }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                        >
                            <span className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-brand' : 'text-slate-800'}`}>
                                {faq.question}
                            </span>
                            <div className={`p-2 rounded-full transition-transform duration-300 ${openIndex === index ? 'bg-brand text-white rotate-180' : 'bg-slate-200 text-slate-500'}`}>
                                <ChevronDown size={20} />
                            </div>
                        </button>

                        <div
                            className={`faq-answer-container transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                                }`}
                        >
                            <div
                                className="p-5 md:p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50 mt-1"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .faq-answer-container {
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
}
