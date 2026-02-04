'use client';

import React from 'react';
import Image from 'next/image';
import { Tag, ArrowRight, CheckCircle2, Zap, ChevronLeft, ChevronRight, Star } from 'lucide-react';

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
    badgeText?: string;
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
        // Theme 1: Premium Yellow (Lúc Lắc)
        bg: 'from-[#E3E846] to-[#D5DA3E]',
        title: 'text-[#3C2A1A]',
        text: 'text-[#3C2A1A]/70',
        button: 'bg-[#3C2A1A] text-white hover:bg-black shadow-none',
        accent: 'bg-[#3C2A1A]/10 text-[#3C2A1A]',
        border: 'border-[#3C2A1A]/10',
        mascotBg: 'bg-[#3C2A1A]/5',
        dot: 'bg-[#3C2A1A]/20'
    },
    {
        // Theme 2: Premium Brown (Nghiền Hạt)
        bg: 'from-[#9C7044] to-[#855D36]',
        title: 'text-white',
        text: 'text-white/80',
        button: 'bg-[#E3E846] text-[#3C2A1A] hover:bg-white shadow-none',
        accent: 'bg-white/10 text-white',
        border: 'border-white/10',
        mascotBg: 'bg-white/5',
        dot: 'bg-white/20'
    },
    {
        // Theme 3: Elegant Soft (Nutty Pro)
        bg: 'from-[#FDFBF7] to-[#F5F0E6]',
        title: 'text-[#3C2A1A]',
        text: 'text-[#3C2A1A]/70',
        button: 'bg-[#9C7044] text-white hover:bg-[#855D36] shadow-none',
        accent: 'bg-[#9C7044]/15 text-[#9C7044]',
        border: 'border-[#9C7044]/20',
        mascotBg: 'bg-[#9C7044]/5',
        dot: 'bg-[#9C7044]/20'
    },
    {
        // Theme 4: Nut Master (Deep Luxury Black & Gold)
        bg: 'from-[#1A1A1A] via-[#0D0D0D] to-[#001010]',
        title: 'text-white',
        text: 'text-white/60',
        button: 'bg-gradient-to-r from-[#E3E846] to-[#B4BB1E] text-black hover:brightness-110 shadow-lg shadow-[#E3E846]/10',
        accent: 'bg-[#E3E846]/10 text-[#E3E846]',
        border: 'border-[#E3E846]/30',
        mascotBg: 'bg-[#E3E846]/5',
        dot: 'bg-[#E3E846]/20'
    }
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
    const [selectedTerms, setSelectedTerms] = React.useState<{ name: string; terms: string } | null>(null);

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
            container.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activeIndex]);

    const scroll = (direction: 'left' | 'right') => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const scrollAmount = container.offsetWidth * 0.8;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div className="relative group/scroll px-4">
            {/* Scroll Navigation Buttons */}
            <div className="hidden lg:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-40 bg-white/90 backdrop-blur-md shadow-2xl rounded-full p-5 border border-slate-100 text-slate-800 hover:bg-[#9C7044] hover:text-white transition-all duration-300 opacity-0 group-hover/scroll:opacity-100 hover:scale-110 active:scale-95"
                    aria-label="Previous"
                >
                    <ChevronLeft size={28} strokeWidth={3} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-40 bg-white/90 backdrop-blur-md shadow-2xl rounded-full p-5 border border-slate-100 text-slate-800 hover:bg-[#9C7044] hover:text-white transition-all duration-300 opacity-0 group-hover/scroll:opacity-100 hover:scale-110 active:scale-95"
                    aria-label="Next"
                >
                    <ChevronRight size={28} strokeWidth={3} />
                </button>
            </div>

            {/* Scroll Container */}
            <div
                ref={containerRef}
                className="flex overflow-x-auto py-32 gap-6 snap-x snap-mandatory scrollbar-hide px-[10vw] sm:px-[15vw] lg:px-12 scroll-smooth items-stretch"
            >
                {packages.map((pkg, index) => {
                    const theme = cardThemes[index % cardThemes.length];

                    const discountValue = pkg.discountType === 'percent'
                        ? `${pkg.discountValue}%`
                        : formatPrice(pkg.discountValue);

                    const maxVoucher = pkg.isUnlimitedVoucher ? 'Không giới hạn' : `${pkg.voucherQuantity} mã`;

                    const normalizedName = normalizeName(pkg.name);
                    const imageSrc = pkg.imageUrl || imageMap[normalizedName] || fallbackImages[index % fallbackImages.length];

                    let specialLabel = pkg.badgeText;
                    if (!specialLabel && pkg.price === 99000) {
                        if (normalizedName.includes('pro')) {
                            specialLabel = 'Đề xuất';
                        } else if (pkg.validityDays >= 60) {
                            specialLabel = 'Long Term';
                        }
                    }

                    return (
                        <div
                            key={pkg._id}
                            className={`snap-center shrink-0 w-[85vw] sm:w-[380px] lg:w-[calc(25%-18px)] min-w-[320px] max-w-[420px] flex flex-col transition-all duration-700`}
                        >
                            <div
                                onClick={() => setSelectedTerms({ name: pkg.name, terms: pkg.terms || pkg.description || 'Đang cập nhật...' })}
                                className={`relative w-full h-[840px] bg-gradient-to-b ${theme.bg} rounded-[48px] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-500 overflow-visible cursor-pointer`}
                            >
                                {/* Mascot INTEGRATION - FIXED HEIGHT ANCHOR */}
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 z-20 pointer-events-none transition-transform duration-700">
                                    <div className={`absolute inset-0 rounded-full ${theme.mascotBg} blur-3xl scale-90 opacity-40 animate-pulse`}></div>
                                    <div className="relative w-full h-full animate-float select-none">
                                        <Image
                                            src={imageSrc}
                                            alt={pkg.name}
                                            fill
                                            className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
                                            sizes="512px"
                                            priority={index < 4}
                                        />
                                    </div>
                                </div>

                                {/* Content Body - Standardized Vertical Sections */}
                                <div className="mt-48 px-8 flex flex-col flex-1 pb-10 justify-between relative z-10">
                                    {/* 1. Header Area (+ Badge) - Fixed Height */}
                                    <div className="flex flex-col items-center h-[120px] justify-start">
                                        <div className="h-10 flex items-center justify-center">
                                            {specialLabel && (
                                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/15 backdrop-blur-md border border-white/10 shadow-lg shadow-black/5">
                                                    <Star size={12} fill="currentColor" strokeWidth={0} className={`${theme.title}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.title}`}>
                                                        {specialLabel}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center mt-2">
                                            <h3 className={`text-4xl font-black tracking-tighter mb-1 uppercase leading-none ${theme.title}`}>
                                                {pkg.name}
                                            </h3>
                                            <div className="flex justify-center items-center gap-3 opacity-20">
                                                <div className={`h-[2px] w-6 ${theme.dot} rounded-full`}></div>
                                                <span className={`text-[9px] font-black uppercase tracking-[0.5em] ${theme.title}`}>
                                                    VIP PRIVILEGE
                                                </span>
                                                <div className={`h-[2px] w-6 ${theme.dot} rounded-full`}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Price Section - Fixed Spacing */}
                                    <div className="flex flex-col items-center py-4 h-[100px] justify-center">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-7xl font-black tracking-tighter ${theme.title}`}>
                                                {formatPrice(pkg.price).replace('đ', '')}
                                            </span>
                                            <span className={`text-2xl font-black ${theme.title}`}>đ</span>
                                        </div>
                                        <div className="px-4 py-1 rounded-lg bg-black/5 mt-1">
                                            <p className={`text-[11px] font-black uppercase tracking-widest opacity-40 ${theme.title}`}>
                                                {pkg.validityDays > 30 ? `TRỌN GÓI ${pkg.validityDays} NGÀY` : `TRỌN GÓI 30 NGÀY`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 3. Perks List - STANDARDIZED HEIGHT for Perfect Alignment */}
                                    <div className="bg-white/5 backdrop-blur-sm rounded-[32px] p-7 border border-white/10 mb-6 h-[290px] flex flex-col justify-between">
                                        <div className="flex items-start gap-4 group/perk">
                                            <div className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl ${theme.accent} transition-transform group-hover/perk:scale-110`}>
                                                <Tag size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col pt-0.5">
                                                <span className={`text-[15px] font-black leading-tight ${theme.title}`}>Giảm {discountValue} tât cả đơn</span>
                                                <span className={`text-[12px] font-bold opacity-50 mt-1 ${theme.text}`}>Tối ưu mọi đơn hàng</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group/perk">
                                            <div className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl ${theme.accent} transition-transform group-hover/perk:scale-110`}>
                                                <CheckCircle2 size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col pt-0.5">
                                                <span className={`text-[15px] font-black leading-tight ${theme.title}`}>Tối đa {formatPrice(pkg.maxDiscount)}</span>
                                                <span className={`text-[12px] font-bold opacity-50 mt-1 ${theme.text}`}>Tiết kiệm bữa ăn hằng ngày</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 group/perk">
                                            <div className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl ${theme.accent} transition-transform group-hover/perk:scale-110`}>
                                                <Zap size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col pt-0.5">
                                                <span className={`text-[15px] font-black leading-tight ${theme.title}`}>{maxVoucher} mỗi tháng</span>
                                                <span className={`text-[12px] font-bold opacity-50 mt-1 ${theme.text}`}>
                                                    {pkg.validityDays > 30 ? `Sử dụng trong ${pkg.validityDays} ngày` : `Dùng trong 30 ngày`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. CTA Button Section - Will now be perfectly aligned */}
                                    <div className="w-full">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBuyPackage(pkg._id);
                                            }}
                                            className={`w-full py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 shadow-lg group/btn ${theme.button}`}
                                        >
                                            <span className="drop-shadow-sm group-hover/btn:translate-x-1 transition-transform font-black">Đăng ký ngay</span>
                                            <ArrowRight size={20} strokeWidth={4} className="group-hover/btn:translate-x-2 transition-transform" />
                                        </button>
                                    </div>

                                    {/* 5. Legal Footer */}
                                    <div className="text-center pt-4 opacity-20 hover:opacity-100 transition-opacity">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${theme.title}`}>
                                            NHẤN ĐỂ XEM ĐIỀU KHOẢN DỊCH VỤ
                                        </span>
                                    </div>
                                </div>

                                {/* Rich Texture Accents */}
                                <div className={`absolute bottom-0 left-0 w-48 h-48 ${theme.dot} rounded-full -translate-x-1/2 translate-y-1/2 blur-[80px] pointer-events-none opacity-40`}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Terms Modal */}
            {selectedTerms && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
                    onClick={() => setSelectedTerms(null)}
                >
                    <div
                        className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-[#1A1A1A] p-10 text-white relative overflow-hidden text-center">
                            <h3 className="text-3xl font-black uppercase tracking-tight relative z-10">{selectedTerms.name}</h3>
                            <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.4em] mt-3 relative z-10">Membership Terms & Policy</p>
                            <button
                                onClick={() => setSelectedTerms(null)}
                                className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all hover:rotate-90"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="px-10 py-12 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#FDFBF7]">
                            <div
                                className="prose prose-slate max-w-none text-slate-700 font-bold leading-relaxed text-lg"
                                dangerouslySetInnerHTML={{ __html: selectedTerms.terms }}
                            />
                        </div>
                        <div className="p-10 pt-0 bg-[#FDFBF7]">
                            <button
                                onClick={() => setSelectedTerms(null)}
                                className="w-full py-6 rounded-2xl bg-[#9C7044] text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-[#855D36] transition-all shadow-xl shadow-[#9C7044]/20"
                            >
                                Tôi đã đọc và đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination / Progress */}
            {packages.length > 1 && (
                <div className="flex justify-center gap-2.5 mt-10">
                    {packages.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 transition-all duration-500 rounded-full ${activeIndex === i ? 'w-10 bg-[#9C7044]' : 'w-2 bg-[#9C7044]/15'}`}
                        />
                    ))}
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                @keyframes float {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, -15px); }
                }
                .animate-float { 
                    animation: float 6s ease-in-out infinite;
                    left: 50%;
                }
            `}</style>
        </div>
    );
}
