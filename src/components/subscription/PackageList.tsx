'use client';

import React from 'react';
import Image from 'next/image';
import { Tag, ArrowRight, CheckCircle2, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

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
        // Theme 1: Premium Yellow
        bg: 'bg-[#E3E846]',
        gradient: 'from-[#E3E846] to-[#D5DA3E]',
        headerBg: 'bg-gradient-to-br from-[#9C7044] to-[#7D5A36]',
        title: 'text-[#3C2A1A]',
        headerTitle: 'text-white',
        text: 'text-[#3C2A1A]/80',
        button: 'bg-[#9C7044] text-white hover:bg-[#855D36] shadow-[0_10px_0_#6A4C2E] active:shadow-none active:translate-y-[10px]',
        accent: 'bg-[#9C7044]/15 text-[#9C7044]',
        border: 'border-[#9C7044]/10',
    },
    {
        // Theme 2: Premium Brown
        bg: 'bg-[#9C7044]',
        gradient: 'from-[#9C7044] to-[#855D36]',
        headerBg: 'bg-gradient-to-br from-[#E3E846] to-[#C8CF2D]',
        title: 'text-white',
        headerTitle: 'text-[#9C7044]',
        text: 'text-white/90',
        button: 'bg-[#E3E846] text-[#3C2A1A] hover:bg-[#D5DA3E] shadow-[0_10px_0_#B4BB1E] active:shadow-none active:translate-y-[10px]',
        accent: 'bg-white/20 text-white',
        border: 'border-white/10',
    },
    {
        // Theme 3: Elegant White
        bg: 'bg-white',
        gradient: 'from-white to-[#F9F9F9]',
        headerBg: 'bg-gradient-to-br from-[#FDFBF7] to-[#F5F0E6]',
        title: 'text-[#1A1A1A]',
        headerTitle: 'text-[#9C7044]',
        text: 'text-slate-600',
        button: 'bg-[#9C7044] text-white hover:bg-[#855D36] shadow-[0_10px_0_#6A4C2E] active:shadow-none active:translate-y-[10px]',
        accent: 'bg-[#9C7044]/10 text-[#9C7044]',
        border: 'border-slate-100',
    },
    {
        // Theme 4: Deep Tech
        bg: 'bg-[#1A1A1A]',
        gradient: 'from-[#1A1A1A] to-[#0A0A0A]',
        headerBg: 'bg-gradient-to-br from-[#000000] to-[#1A1A1A]',
        title: 'text-white',
        headerTitle: 'text-[#E3E846]',
        text: 'text-white/70',
        button: 'bg-[#E3E846] text-[#000000] hover:bg-[#D5DA3E] shadow-[0_10px_0_#B4BB1E] active:shadow-none active:translate-y-[10px]',
        accent: 'bg-white/10 text-[#E3E846]',
        border: 'border-white/5',
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
                className="flex overflow-x-auto py-24 gap-10 snap-x snap-mandatory scrollbar-hide px-[10vw] sm:px-[15vw] lg:px-12 scroll-smooth items-stretch"
            >
                {packages.map((pkg, index) => {
                    const theme = cardThemes[index % cardThemes.length];
                    const isActive = activeIndex === index;

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
                            className={`snap-center shrink-0 w-[80vw] sm:w-[360px] lg:w-[calc(25%-30px)] min-w-[320px] max-w-[400px] flex flex-col transition-all duration-700`}
                        >
                            <div
                                onClick={() => setSelectedTerms({ name: pkg.name, terms: pkg.terms || pkg.description || 'Đang cập nhật...' })}
                                className={`relative w-full h-[780px] group bg-gradient-to-b ${theme.gradient} rounded-[48px] border-4 ${theme.border} shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-500 overflow-visible cursor-pointer`}
                            >
                                {/* Header Decorative Section */}
                                <div className={`relative h-64 w-full ${theme.headerBg} flex items-center justify-center transition-all duration-700 rounded-t-[44px]`}>
                                    {/* Mesh Gradient Overlay */}
                                    <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)]"></div>

                                    {/* Mascot Section */}
                                    <div className="absolute inset-0 flex items-end justify-center pb-8 overflow-visible">
                                        {/* Floating Wrapper */}
                                        <div className="relative w-56 h-56 z-20 animate-float">
                                            {/* Hover Scale Wrapper */}
                                            <div className="w-full h-full transition-all duration-700 group-hover:scale-110 drop-shadow-[0_25px_50px_rgba(0,0,0,0.3)]">
                                                <Image
                                                    src={imageSrc}
                                                    alt={pkg.name}
                                                    fill
                                                    className="object-contain"
                                                    sizes="500px"
                                                    priority={index < 4}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Label Badge */}
                                    {specialLabel && (
                                        <div className="absolute top-8 right-8 z-30 transform rotate-3 scale-110">
                                            <div className="bg-black text-[#E3E846] text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl border-2 border-white/20 shadow-2xl">
                                                {specialLabel}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Main Body Content */}
                                <div className="mt-14 px-10 flex flex-col flex-1 pb-14 justify-between relative z-10">
                                    {/* Title Section */}
                                    <div className="text-center">
                                        <h3 className={`text-3xl font-black tracking-tight mb-3 uppercase leading-none ${theme.title}`}>
                                            {pkg.name}
                                        </h3>
                                        <div className="flex justify-center items-center gap-4">
                                            <div className="h-[2px] w-8 bg-current opacity-10 rounded-full"></div>
                                            <span className={`text-[11px] font-black uppercase tracking-[0.4em] opacity-40 ${theme.title}`}>
                                                Đặc quyền VIP
                                            </span>
                                            <div className="h-[2px] w-8 bg-current opacity-10 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Price Section */}
                                    <div className="flex flex-col items-center py-6">
                                        <div className="flex items-baseline gap-1 relative group/price">
                                            <span className={`text-7xl font-black tracking-tighter transition-transform duration-500 group-hover/price:scale-110 ${theme.title}`}>
                                                {formatPrice(pkg.price).replace('đ', '')}
                                            </span>
                                            <span className={`text-2xl font-black mb-2 ${theme.title}`}>đ</span>
                                        </div>
                                        <div className={`px-5 py-1.5 rounded-full bg-current/10 mt-3 border border-current/10`}>
                                            <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.title} opacity-60`}>
                                                Trọn gói cho {pkg.validityDays} ngày
                                            </p>
                                        </div>
                                    </div>

                                    {/* CTA Section */}
                                    <div className="w-full mb-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBuyPackage(pkg._id);
                                            }}
                                            className={`w-full py-7 rounded-[32px] font-black text-xl uppercase tracking-[0.2em] transition-all duration-300 ${theme.button} flex items-center justify-center gap-4 border-t-2 border-white/30 group/btn`}
                                        >
                                            <span className="relative z-10 drop-shadow-sm">Đăng ký ngay</span>
                                            <ArrowRight size={28} strokeWidth={4} className="transition-transform duration-300 group-hover/btn:translate-x-2" />
                                        </button>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5 group/feature">
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover/feature:scale-110 ${theme.accent}`}>
                                                <Tag size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[15px] font-black leading-tight ${theme.title}`}>Giảm {discountValue}</span>
                                                <span className={`text-[12px] font-bold opacity-60 ${theme.text}`}>Tất cả đơn hàng</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 group/feature">
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover/feature:scale-110 ${theme.accent}`}>
                                                <CheckCircle2 size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[15px] font-black leading-tight ${theme.title}`}>Tối đa {formatPrice(pkg.maxDiscount)}</span>
                                                <span className={`text-[12px] font-bold opacity-60 ${theme.text}`}>Siêu tiết kiệm bữa ăn</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 group/feature">
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover/feature:scale-110 ${theme.accent}`}>
                                                <Zap size={20} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[15px] font-black leading-tight ${theme.title}`}>{maxVoucher} / tháng</span>
                                                <span className={`text-[12px] font-bold opacity-60 ${theme.text}`}>Dùng trong {pkg.validityDays} ngày</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center pt-6">
                                        <span className={`text-[10px] font-black uppercase tracking-widest opacity-20 ${theme.title} hover:opacity-60 transition-opacity`}>
                                            Chạm để xem chi tiết thể lệ
                                        </span>
                                    </div>
                                </div>

                                {/* Abstract Branding Element */}
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-current opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
                            </div>
                        </div>
                    );
                })}
                {/* End Spacer for balanced snapping and shadow visibility */}
                <div className="shrink-0 w-4 lg:hidden"></div>
            </div>

            {/* Terms Modal */}
            {selectedTerms && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"
                    onClick={() => setSelectedTerms(null)}
                >
                    <div
                        className="bg-white rounded-[48px] w-full max-w-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 scale-100 flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-[#9C7044] p-12 text-white relative overflow-hidden flex flex-col items-center justify-center text-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight relative z-10 w-full break-words">{selectedTerms.name}</h3>
                            <p className="text-sm md:text-base opacity-60 font-black uppercase tracking-[0.2em] mt-3 relative z-10 w-full">Chi tiết thể lệ hội viên</p>
                            <button
                                onClick={() => setSelectedTerms(null)}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110 active:scale-90 z-20"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="p-8 md:p-12 max-h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50/30">
                            <div
                                className="prose prose-slate max-w-none text-slate-600 font-bold leading-relaxed text-[15px] terms-content"
                                dangerouslySetInnerHTML={{ __html: selectedTerms.terms }}
                            />
                        </div>
                        <div className="p-10 pt-0">
                            <button
                                onClick={() => setSelectedTerms(null)}
                                className="w-full py-5 rounded-[24px] bg-[#9C7044] text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-[#855D36] shadow-[0_8px_0_#6A4C2E] active:shadow-none active:translate-y-[8px] transition-all"
                            >
                                Tôi đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination / Progress */}
            {packages.length > 1 && (
                <div className="flex justify-center gap-3 mt-8">
                    {packages.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 transition-all duration-700 rounded-full ${activeIndex === i ? 'w-12 bg-[#9C7044]' : 'w-2 bg-[#9C7044]/20'}`}
                        />
                    ))}
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
                
                .terms-content {
                    width: 100% !important;
                    overflow-wrap: break-word !important;
                    word-break: normal !important;
                    line-break: relaxed !important;
                }
                
                .terms-content img {
                    max-width: 100% !important;
                    height: auto !important;
                    display: block;
                    margin: 1.5rem auto;
                    border-radius: 1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .terms-content table {
                    width: 100% !important;
                    overflow-x: auto;
                    display: block;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
