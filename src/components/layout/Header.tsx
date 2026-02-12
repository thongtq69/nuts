'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AffiliateTermsModal from '@/components/affiliate/AffiliateTermsModal';

interface SiteSettings {
    hotline: string;
    zaloLink: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    tiktokUrl?: string;
    promoText: string;
    promoEnabled: boolean;
    agentRegistrationUrl: string;
    ctvRegistrationUrl: string;
}

export default function Header() {
    const router = useRouter();
    const { cartCount, cartTotal } = useCart();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [settings, setSettings] = useState<SiteSettings>({
        hotline: '090xxxxxxx',
        zaloLink: '',
        facebookUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        tiktokUrl: '',
        promoText: 'Giảm giá 8% khi mua hàng từ 899 trở lên với mã "SAVE8P"',
        promoEnabled: true,
        agentRegistrationUrl: '/agent/register',
        ctvRegistrationUrl: '/agent/register',
    });
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [affiliateType, setAffiliateType] = useState<'agent' | 'collaborator'>('agent');

    useEffect(() => {
        // Fetch site settings
        fetch('/api/settings', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data && !data.message) {
                    setSettings(data);
                }
            })
            .catch(err => console.error('Error fetching settings:', err));
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAffiliateClick = (type: 'agent' | 'collaborator') => {
        if (user && (user.role === 'user' || user.role === 'sale')) {
            setAffiliateType(type);
            setShowTermsModal(true);
        } else {
            router.push(`/register?type=${type}`);
        }
    };

    return (
        <>
            {/* Unified Top Bar - Spacious and Premium */}
            <div className="bg-[#E3E846] border-b border-black/5 relative z-50">
                <div className="container mx-auto px-4">
                    {/* Row 1: Hotline & Socials */}
                    <div className="flex items-center justify-between py-2 md:py-3 text-[11px] md:text-xs font-medium text-[#3C2A1A]">
                        {/* Left: Hotline & Zalo */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <span className="opacity-90 whitespace-nowrap">Hotline: {settings.hotline}</span>
                            {settings.zaloLink && (
                                <a href={settings.zaloLink} target="_blank" rel="noopener noreferrer" className="w-5 h-5 hover:scale-110 transition-transform flex-shrink-0" title="Chat qua Zalo">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                        <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0Z" fill="#0068FF" />
                                        <path d="M17 16H7V15.5L13.5 8.5H7V7H17V7.5L10.5 14.5H17V16Z" fill="white" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        {/* Center: Affiliate Links (Mobile Only) */}
                        <div className="flex lg:hidden items-center gap-2 font-medium text-[9px] opacity-80">
                            <button onClick={() => handleAffiliateClick('agent')} className="hover:text-[#9C7044] whitespace-nowrap">Đại lý</button>
                            <span>|</span>
                            <button onClick={() => handleAffiliateClick('collaborator')} className="hover:text-[#9C7044] whitespace-nowrap">CTV</button>
                        </div>

                        {/* Right Side: Links & Social Icons */}
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden lg:flex items-center gap-3 mr-2 font-medium">
                                <button
                                    onClick={() => handleAffiliateClick('agent')}
                                    className="hover:text-[#9C7044] transition-colors whitespace-nowrap bg-transparent border-0 cursor-pointer"
                                >
                                    Đăng ký Đại lý
                                </button>
                                <span className="opacity-20 font-bold">|</span>
                                <button
                                    onClick={() => handleAffiliateClick('collaborator')}
                                    className="hover:text-[#9C7044] transition-colors whitespace-nowrap bg-transparent border-0 cursor-pointer"
                                >
                                    Cộng tác viên
                                </button>
                            </div>

                            {/* Social Icons Group */}
                            <div className="flex items-center gap-1.5 md:gap-2">
                                {settings.facebookUrl && (
                                    <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#9C7044] flex items-center justify-center text-white hover:bg-[#855D36] transition-all shadow-sm flex-shrink-0">
                                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                    </a>
                                )}
                                {settings.instagramUrl && (
                                    <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#9C7044] flex items-center justify-center text-white hover:bg-[#855D36] transition-all shadow-sm flex-shrink-0">
                                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.056.413 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.419.419-.818.679-1.381.896-.422.164-1.056.36-2.227.413-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.056-.413-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.419-.419.818-.679 1.381-.896.422-.164 1.056-.36 2.227-.413 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.28.057-2.155.26-2.922.559-.793.308-1.465.72-2.132 1.388s-1.08 1.339-1.388 2.132c-.299.767-.502 1.642-.559 2.922-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.28.26 2.155.559 2.922.308.793.72 1.465 1.388 2.132s1.339 1.08 2.132 1.388c.767.299 1.642.502 2.922.559 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.28-.057 2.155-.26 2.922-.559.793-.308 1.465-.72 2.132-1.388s1.08-1.339 1.388-2.132c.299-.767.502-1.642.559-2.922.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.28-.26-2.155-.559-2.922-.308-.793-.72-1.465-1.388-2.132s-1.339-1.08-2.132-1.388c-.767-.299-1.642-.502-2.922-.559-1.28-.058-1.688-.072-4.947-.072zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c0 .796-.646 1.442-1.442 1.442-.795 0-1.442-.646-1.442-1.442 0-.795.647-1.442 1.442-1.442.796 0 1.442.647 1.442 1.442z" /></svg>
                                    </a>
                                )}
                                {settings.youtubeUrl && (
                                    <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#9C7044] flex items-center justify-center text-white hover:bg-[#855D36] transition-all shadow-sm flex-shrink-0">
                                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                                    </a>
                                )}
                                {settings.tiktokUrl && (
                                    <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#9C7044] flex items-center justify-center text-white hover:bg-[#855D36] transition-all shadow-sm flex-shrink-0">
                                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Promo Banner - Now visible on all screens by default or specifically tuned */}
                    {settings.promoEnabled && settings.promoText && (
                        <div className="border-t border-black/5 py-1.5 overflow-hidden">
                            <div className="flex justify-center items-center">
                                <span className="uppercase text-[10px] md:text-[11px] font-bold text-[#3C2A1A] tracking-wider animate-pulse text-center whitespace-normal md:whitespace-nowrap px-4">
                                    {settings.promoText}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Header - White with subtle shadow */}
            <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100">
                <div className="container mx-auto px-4 py-2 md:py-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-8">
                        {/* Mobile Row: Logo & Actions */}
                        <div className="w-full flex items-center justify-between lg:w-auto">
                            <Link href="/" className="shrink-0 flex items-center gap-3 md:gap-4 group">
                                <img src="/assets/logo.png" alt="Go Nuts Logo" className="h-10 md:h-16 lg:h-20 w-auto transition-transform duration-300 group-hover:scale-105" />
                                <div className="flex flex-col justify-center border-l-2 border-[#9C7044]/20 pl-3 md:pl-4">
                                    <span className="text-[10px] md:text-[13px] font-black text-[#3C2A1A] leading-tight uppercase tracking-[0.1em]">
                                        Nuts for our nuts
                                    </span>
                                    <span className="text-[8px] md:text-[11px] font-bold text-[#9C7044] leading-tight mt-0.5 md:mt-1 italic opacity-80">
                                        Nuts for your health
                                    </span>
                                </div>
                            </Link>

                            {/* Mobile Icons - Right side */}
                            <div className="flex items-center gap-4 lg:hidden">
                                <Link href={user ? "/account" : "/login"} className="p-2 text-[#3C2A1A] hover:bg-slate-50 rounded-full transition-colors">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </Link>
                                <Link href="/cart" className="p-2 text-[#3C2A1A] hover:bg-slate-50 rounded-full transition-colors relative">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute top-0 right-0 w-4 h-4 bg-[#9C7044] text-[10px] text-white font-bold rounded-full flex items-center justify-center border-2 border-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>

                        {/* Search Bar - Premium Floating Glass Design */}
                        <div className="w-full lg:flex-1 max-w-2xl relative group px-2 lg:px-0">
                            <div className="relative flex items-center bg-white/80 backdrop-blur-md rounded-[22px] border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(156,112,68,0.1)] focus-within:shadow-[0_0_25px_rgba(227,232,70,0.35)] focus-within:border-[#E3E846]/50 transition-all duration-500 overflow-hidden group/search-box">
                                {/* Search Icon with Animation */}
                                <div className="pl-5 text-slate-400 group-focus-within/search-box:text-[#9C7044] group-focus-within/search-box:scale-110 transition-all duration-300">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    className="w-full py-2.5 md:py-4 px-4 bg-transparent text-sm md:text-base outline-none font-semibold placeholder:text-slate-400 placeholder:font-medium text-slate-800 z-10"
                                    placeholder="Bạn đang tìm loại hạt nào hôm nay?..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />

                                {/* Premium Gradient Button */}
                                <div className="pr-1.5 py-1.5 h-full">
                                    <button
                                        onClick={handleSearch}
                                        className="h-full bg-gradient-to-br from-[#9C7044] via-[#855D36] to-[#7d5a36] text-white px-4 md:px-8 py-2.5 rounded-[18px] font-bold text-sm tracking-wider hover:shadow-[0_4px_15px_rgba(156,112,68,0.4)] active:scale-95 transition-all duration-300 flex items-center gap-2"
                                    >
                                        <span className="hidden md:inline">Tìm</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:hidden">
                                            <path d="M5 12h14m-7-7l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Interactive Shine Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/search-box:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Desktop Actions - Hidden on Mobile */}
                        <div className="hidden lg:flex items-center gap-8 shrink-0">
                            <Link href={user ? "/account" : "/login"} className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-[#9C7044] group-hover:bg-[#9C7044] group-hover:text-white transition-all duration-300">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-semibold tracking-wide">Tài khoản</span>
                                    <span className="text-sm font-bold text-slate-800">
                                        {user ? user.name.split(' ').pop() : 'Đăng nhập'}
                                    </span>
                                </div>
                            </Link>

                            <Link href="/cart" className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-[#9C7044] group-hover:bg-[#9C7044] group-hover:text-white transition-all duration-300 relative">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                                    </svg>
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#9C7044] text-[10px] text-white font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-semibold tracking-wide">Giỏ hàng</span>
                                    <span className="text-sm font-bold text-slate-800">{cartTotal.toLocaleString()}đ</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Affiliate Terms Modal */}
            <AffiliateTermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                affiliateType={affiliateType}
            />
        </>
    );
}
