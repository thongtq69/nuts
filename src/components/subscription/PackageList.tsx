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
        headerBg: 'bg-[#9C7044]',
        title: 'text-[#333]',
        headerTitle: 'text-white',
        text: 'text-[#4A4E00]',
        button: 'bg-[#9C7044] text-white hover:bg-[#855D36]',
        accent: 'bg-[#9C7044]/15 text-[#9C7044]',
        border: 'border-[#9C7044]/20',
    },
    {
        // Theme 2: Premium Brown
        bg: 'bg-[#9C7044]',
        headerBg: 'bg-[#E3E846]',
        title: 'text-white',
        headerTitle: 'text-[#9C7044]',
        text: 'text-white/90',
        button: 'bg-[#E3E846] text-[#9C7044] hover:bg-[#EEF27A]',
        accent: 'bg-white/20 text-white',
        border: 'border-white/20',
    },
    {
        // Theme 3: Elegant White
        bg: 'bg-white',
        headerBg: 'bg-[#FDFBF7]',
        title: 'text-[#1A1A1A]',
        headerTitle: 'text-[#9C7044]',
        text: 'text-slate-700',
        button: 'bg-[#9C7044] text-white hover:bg-[#855D36]',
        accent: 'bg-[#9C7044]/10 text-[#9C7044]',
        border: 'border-slate-200',
    },
    {
        // Theme 4: Deep Tech
        bg: 'bg-[#1A1A1A]',
        headerBg: 'bg-[#000000]',
        title: 'text-white font-black',
        headerTitle: 'text-[#E3E846]',
        text: 'text-white/80',
        button: 'bg-[#E3E846] text-[#000000] hover:bg-[#EEF27A]',
        accent: 'bg-white/10 text-[#E3E846]',
        border: 'border-white/10',
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
            {/* Scroll Navigation Buttons - Hidden on Mobile, Visible on Desktop */}
            <div className="hidden lg:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-40 bg-white shadow-xl rounded-full p-4 border border-slate-100 text-slate-800 hover:bg-brand hover:text-white transition-all duration-300 opacity-0 group-hover/scroll:opacity-100 hover:scale-110"
                    aria-label="Previous"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-40 bg-white shadow-xl rounded-full p-4 border border-slate-100 text-slate-800 hover:bg-brand hover:text-white transition-all duration-300 opacity-0 group-hover/scroll:opacity-100 hover:scale-110"
                    aria-label="Next"
                >
                    <ChevronRight size={24} strokeWidth={3} />
                </button>
            </div>

            {/* Scroll Container */}
            <div
                ref={containerRef}
                className="flex overflow-x-auto py-24 gap-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth items-stretch"
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

                    // Logic for custom badge or fallback
                    let specialLabel = pkg.badgeText;
                    if (!specialLabel && pkg.price === 99000) {
                        if (normalizedName.includes('pro')) {
                            specialLabel = 'Best Value';
                        } else if (pkg.validityDays >= 60) {
                            specialLabel = 'Long Term';
                        }
                    }

                    return (
                        <div
                            key={pkg._id}
                            className={`snap-center shrink-0 w-[85vw] sm:w-[340px] lg:w-[calc(25%-24px)] min-w-[300px] max-w-[360px] flex flex-col transition-all duration-500`}
                        >
                            <div
                                onClick={() => setSelectedTerms({ name: pkg.name, terms: pkg.terms || pkg.description || 'Đang cập nhật...' })}
                                className={`relative w-full h-[740px] group ${theme.bg} rounded-[64px] border ${theme.border} shadow-2xl flex flex-col transition-all duration-500 hover:-translate-y-4 overflow-hidden cursor-pointer`}
                            >
                                {/* Header Decorative Section - Balanced height */}
                                <div className={`relative h-60 w-full ${theme.headerBg} flex items-center justify-center transition-colors duration-500`}>
                                    {/* Mascot - Moved up into the header area */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-44 z-20 drop-shadow-[0_25px_45px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-4">
                                        <Image
                                            src={imageSrc}
                                            alt={pkg.name}
                                            fill
                                            className="object-contain"
                                            sizes="400px"
                                            priority={index < 4}
                                        />
                                    </div>

                                    {/* Special Medal Badge */}
                                    {specialLabel && (
                                        <div className="absolute top-8 right-10 z-30">
                                            <div className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/20 shadow-2xl">
                                                {specialLabel}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Main Body Content - Adjusted spacing for the higher mascot */}
                                <div className="mt-16 px-8 flex flex-col flex-1 pb-12 justify-between">
                                    {/* Title Section */}
                                    <div className="text-center">
                                        <h3 className={`text-2xl font-black tracking-tight mb-2 uppercase leading-none ${theme.title}`}>
                                            {pkg.name}
                                        </h3>
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="h-[1px] w-6 bg-current opacity-20"></div>
                                            <span className={`text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 ${theme.title}`}>
                                                Đặc quyền VIP
                                            </span>
                                            <div className="h-[1px] w-6 bg-current opacity-20"></div>
                                        </div>
                                    </div>

                                    {/* Price Section */}
                                    <div className="flex flex-col items-center py-4">
                                        <div className="flex items-baseline gap-1 relative">
                                            <span className={`text-6xl font-black tracking-tighter ${theme.title}`}>
                                                {formatPrice(pkg.price).replace('đ', '')}
                                            </span>
                                            <span className={`text-2xl font-black mb-1 ${theme.title}`}>đ</span>
                                        </div>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1 ${theme.title}`}>
                                            Trọn gói cho 30 ngày
                                        </p>
                                    </div>

                                    {/* CTA Section */}
                                    <div className="w-full">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onBuyPackage(pkg._id);
                                            }}
                                            className={`w-full py-5 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 ${theme.button} shadow-xl active:scale-95 flex items-center justify-center gap-3 border-b-4 border-black/10`}
                                        >
                                            Đăng ký ngay
                                            <ArrowRight size={22} strokeWidth={3} />
                                        </button>
                                    </div>

                                    {/* Features List - Balanced spacing */}
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${theme.accent}`}>
                                                <Tag size={18} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[14px] font-black leading-tight ${theme.title}`}>Giảm {discountValue}</span>
                                                <span className={`text-[11px] font-bold opacity-50 ${theme.text}`}>Tất cả đơn hàng</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${theme.accent}`}>
                                                <CheckCircle2 size={18} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[14px] font-black leading-tight ${theme.title}`}>Tối đa {formatPrice(pkg.maxDiscount)}</span>
                                                <span className={`text-[11px] font-bold opacity-50 ${theme.text}`}>Siêu tiết kiệm bữa ăn</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${theme.accent}`}>
                                                <Zap size={18} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[14px] font-black leading-tight ${theme.title}`}>{maxVoucher} / tháng</span>
                                                <span className={`text-[11px] font-bold opacity-50 ${theme.text}`}>Dùng trong {pkg.validityDays} ngày</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center pt-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${theme.title} underline`}>
                                            Chạm để xem chi tiết thể lệ
                                        </span>
                                    </div>
                                </div>

                                {/* Abstract Branding Element */}
                                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-current opacity-[0.05] rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Terms Modal */}
            {selectedTerms && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setSelectedTerms(null)}
                >
                    <div
                        className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-[#9C7044] p-8 text-white relative">
                            <h3 className="text-2xl font-black uppercase tracking-tight">{selectedTerms.name}</h3>
                            <p className="text-sm opacity-60 font-bold uppercase tracking-widest">Chi tiết thể lệ hội viên</p>
                            <button
                                onClick={() => setSelectedTerms(null)}
                                className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <div
                                className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: selectedTerms.terms }}
                            />
                        </div>
                        <div className="p-8 pt-0">
                            <button
                                onClick={() => setSelectedTerms(null)}
                                className="w-full py-4 rounded-full bg-[#9C7044] text-white font-black uppercase tracking-widest hover:bg-[#855D36] transition-colors"
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination / Progress */}
            {packages.length > 1 && (
                <div className="flex justify-center gap-4 mt-4">
                    {packages.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 transition-all duration-700 rounded-full ${activeIndex === i ? 'w-10 bg-[#9C7044]' : 'w-2.5 bg-[#9C7044]/20'}`}
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
            `}</style>
        </div>
    );
}
