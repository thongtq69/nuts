'use client';

import React from 'react';
import Image from 'next/image';
import { Tag } from 'lucide-react';

interface Package {
    _id: string;
    name: string;
    price: number;
    description?: string;
    terms?: string;
    imageUrl?: string;
    imagePublicId?: string;
    voucherQuantity: number;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isUnlimitedVoucher?: boolean;
}

interface Props {
    packages: Package[];
    onBuyPackage: (packageId: string) => void;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

const cardThemes = [
    {
        // Starter - Muted Brown/Tan
        surface: 'bg-gradient-to-br from-[#FDFBF7] via-[#F3E9D6] to-[#E6D0B0]',
        border: 'border-[#D8B487]/30',
        badge: 'bg-[#9C7044] text-[#FDFBF7]',
        text: 'text-[#3A2A1B]',
        subtext: 'text-[#5B4630]',
        accent: 'text-[#9C7044]',
        divider: 'border-black/5',
        button: 'bg-[#9C7044] text-[#FDFBF7] hover:bg-[#855D36]',
    },
    {
        // Pro - Highlighted Brand Yellow
        surface: 'bg-gradient-to-br from-[#FEFFD2] via-[#E3E846] to-[#CBD100]',
        border: 'border-[#A8AD00]',
        badge: 'bg-[#333] text-white',
        text: 'text-[#1A1C00]',
        subtext: 'text-[#4A4E00]',
        accent: 'text-[#1A1C00]',
        divider: 'border-black/10',
        button: 'bg-[#1A1C00] text-white hover:bg-black',
        highlight: true,
    },
    {
        // Special - Deep Red
        surface: 'bg-gradient-to-br from-[#5B131A] via-[#7E1B28] to-[#9E2B3B]',
        border: 'border-[#6D1A24]',
        badge: 'bg-[#F3D6B3] text-[#5B131A]',
        text: 'text-[#FCE7D1]',
        subtext: 'text-[#F3D6B3]',
        accent: 'text-[#FCE7D1]',
        divider: 'border-white/20',
        button: 'bg-[#F3D6B3] text-[#5B131A] hover:bg-[#E9C6A2]',
    },
    {
        // Premium - Dark Charcoal
        surface: 'bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#333]',
        border: 'border-[#444]',
        badge: 'bg-[#E3E846] text-[#1A1A1A]',
        text: 'text-white',
        subtext: 'text-slate-400',
        accent: 'text-[#E3E846]',
        divider: 'border-white/10',
        button: 'bg-[#E3E846] text-[#1A1A1A] hover:bg-[#CBD100]',
    },
];

const imageMap: Record<string, string> = {
    'goi nut master': '/assets/images/goi-nut-master.png',
    'goi nutty pro': '/assets/images/goi-nutty-pro.png',
    'goi nghien hat': '/assets/images/goi-nghien-hat.png',
    'goi luc lac': '/assets/images/goi-luc-lac.png',
};

const fallbackImages = [
    '/assets/images/goi-luc-lac.png',
    '/assets/images/goi-nghien-hat.png',
    '/assets/images/goi-nutty-pro.png',
    '/assets/images/goi-nut-master.png',
];

const normalizeName = (name: string) => name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

export default function PackageList({ packages, onBuyPackage }: Props) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleScroll = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const center = scrollLeft + containerWidth / 2;

        const children = Array.from(container.children) as HTMLElement[];
        let closestIndex = 0;
        let minDistance = Infinity;

        children.forEach((child, index) => {
            const childCenter = child.offsetLeft + child.offsetWidth / 2;
            const distance = Math.abs(center - childCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== activeIndex) {
            setActiveIndex(closestIndex);
        }
    };

    React.useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            // Initial check for active index
            handleScroll();
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activeIndex]);

    return (
        <div className="relative group/scroll px-4">
            {/* Scroll Container - Tall & Narrow */}
            <div
                ref={containerRef}
                className="flex overflow-x-auto py-24 gap-12 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth overflow-visible"
            >
                {packages.map((pkg, index) => {
                    const theme = cardThemes[index % cardThemes.length];
                    const isHighlighted = theme.highlight;
                    const isActive = activeIndex === index;

                    const discountLabel = pkg.discountType === 'percent'
                        ? `Giảm ${pkg.discountValue}%`
                        : `Giảm ${formatPrice(pkg.discountValue)}`;
                    const maxVoucher = pkg.isUnlimitedVoucher ? '∞' : `${pkg.voucherQuantity}`;

                    const normalizedName = normalizeName(pkg.name);
                    const imageSrc = pkg.imageUrl || imageMap[normalizedName] || fallbackImages[index % fallbackImages.length];

                    return (
                        <div
                            key={pkg._id}
                            className={`snap-center shrink-0 w-[280px] sm:w-[320px] lg:w-[calc(25%-36px)] min-w-[280px] max-w-[360px] flex flex-col items-center transition-all duration-700 ease-out py-10 ${isActive ? 'scale-110 z-30' : 'scale-95 opacity-80 z-10'}`}
                        >
                            <div
                                onMouseMove={handleMouseMove}
                                className={`relative w-full h-[600px] group ${theme.surface} rounded-[50px] border-2 ${isActive ? (isHighlighted ? 'border-[#A8AD00]' : 'border-white/40') : theme.border} shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex flex-col transition-all duration-500 hover:shadow-[0_45px_100px_rgba(0,0,0,0.25)]`}
                            >
                                {/* Shimmer Effect for Highlighted Card */}
                                {isHighlighted && (
                                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[50px]">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                                    </div>
                                )}

                                {/* "Most Popular" Badge - Floating Higher */}
                                {isHighlighted && (
                                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 z-40 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                                        <div className="bg-[#1A1C00] text-[#E3E846] text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-2xl flex items-center gap-2 whitespace-nowrap border-2 border-[#E3E846]/20">
                                            <span className="w-2 h-2 rounded-full bg-[#E3E846] animate-pulse" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                {/* Floating Image - Breaking Borders */}
                                <div className={`absolute -top-16 -left-10 w-48 h-48 sm:w-56 sm:h-56 z-50 transition-all duration-700 pointer-events-none drop-shadow-[0_35px_45px_rgba(0,0,0,0.4)] ${isActive ? 'translate-x-4 -translate-y-4 rotate-6 scale-110' : 'translate-x-0 translate-y-0 rotate-0 scale-100'}`}>
                                    <Image
                                        src={imageSrc}
                                        alt={pkg.name}
                                        fill
                                        className="object-contain transition-transform duration-500"
                                        sizes="400px"
                                        priority={index < 4}
                                    />
                                </div>

                                {/* Animated Light Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[50px]">
                                    <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.25)_0%,transparent_50%)]" />
                                </div>

                                {/* Top Section - Vertical Spacing */}
                                <div className="pt-24 px-8 text-center flex flex-col">
                                    <h3 className={`text-2xl font-black tracking-tight mb-3 ${theme.text}`}>
                                        {pkg.name}
                                    </h3>
                                    <p className={`text-[12px] leading-relaxed ${theme.subtext} font-bold opacity-60 uppercase tracking-widest`}>
                                        Membership Plan
                                    </p>
                                </div>

                                {/* CENTER SECTION - Price & Main CTA */}
                                <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 my-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-5xl font-black ${theme.text} tracking-tighter`}>
                                                {formatPrice(pkg.price).replace('đ', '')}
                                            </span>
                                            <span className={`text-xl font-black ${theme.text}`}>đ</span>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold tracking-[0.2em] ${theme.subtext} opacity-50`}>per 30 days</span>
                                    </div>

                                    <button
                                        onClick={() => onBuyPackage(pkg._id)}
                                        className={`group/btn relative w-[180px] h-[64px] rounded-full overflow-hidden transition-all duration-500 ${theme.button} shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:w-[200px] active:scale-95`}
                                    >
                                        {/* Internal Glassmorphism for Button */}
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        <span className="relative z-10 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider">
                                            {index === packages.length - 1 ? 'Sở hữu' : 'Bắt đầu'}
                                            <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>

                                {/* BOTTOM SECTION - Feature Highlights */}
                                <div className="pb-10 px-8">
                                    <div className={`space-y-4 p-6 rounded-[32px] ${isHighlighted ? 'bg-black/10' : 'bg-white/10'} backdrop-blur-md border border-white/10`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl bg-white/20 ${theme.accent}`}>
                                                <Tag size={16} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[13px] font-black ${theme.text}`}>{discountLabel}</span>
                                                <span className={`text-[10px] ${theme.subtext} font-bold opacity-60`}>Max {formatPrice(pkg.maxDiscount)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl bg-white/20 ${theme.accent}`}>
                                                <Tag size={16} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[13px] font-black ${theme.text}`}>{maxVoucher} per month</span>
                                                <span className={`text-[10px] ${theme.subtext} font-bold opacity-60`}>Valid {pkg.validityDays} days</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subtle Abstract Glow at bottom */}
                                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-b-[50px]" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination / Progress */}
            {packages.length > 0 && (
                <div className="flex justify-center gap-3 mt-4">
                    {packages.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 transition-all duration-500 rounded-full border border-black/5 ${activeIndex === i ? 'w-12 bg-[#9C7044] shadow-lg' : 'w-2 bg-slate-200 opacity-50'}`}
                        />
                    ))}
                </div>
            )}

            {/* Custom Styles */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
