'use client';

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
        surface: 'bg-gradient-to-br from-[#F3E9D6] via-[#E6D0B0] to-[#D8B487]',
        border: 'border-[#C9A978]',
        badge: 'bg-[#6B4A2B] text-[#F6E9D8]',
        text: 'text-[#3A2A1B]',
        subtext: 'text-[#5B4630]',
        accent: 'text-[#8C5A2B]',
        divider: 'border-black/15',
        button: 'bg-[#3A2A1B] text-[#F6E9D8] hover:bg-[#2B1F15]',
    },
    {
        surface: 'bg-gradient-to-br from-[#F4E7DA] via-[#E2C6A8] to-[#CFA782]',
        border: 'border-[#C19A73]',
        badge: 'bg-[#8B4F2B] text-[#FBEFE3]',
        text: 'text-[#3E2717]',
        subtext: 'text-[#5F3F2A]',
        accent: 'text-[#9C7044]',
        divider: 'border-black/15',
        button: 'bg-[#3E2717] text-[#FBEFE3] hover:bg-[#2E1C10]',
    },
    {
        surface: 'bg-gradient-to-br from-[#5B131A] via-[#7E1B28] to-[#9E2B3B]',
        border: 'border-[#6D1A24]',
        badge: 'bg-[#F3D6B3] text-[#5B131A]',
        text: 'text-[#FCE7D1]',
        subtext: 'text-[#F3D6B3]',
        accent: 'text-[#FCE7D1]',
        divider: 'border-white/30',
        button: 'bg-[#F3D6B3] text-[#5B131A] hover:bg-[#E9C6A2]',
    },
    {
        surface: 'bg-gradient-to-br from-[#2A1A14] via-[#3A251D] to-[#4B2F24]',
        border: 'border-[#20140F]',
        badge: 'bg-[#C78C52] text-[#1B0F0A]',
        text: 'text-[#F6E7C6]',
        subtext: 'text-[#E8D4B0]',
        accent: 'text-[#F1C57D]',
        divider: 'border-white/20',
        button: 'bg-[#C78C52] text-[#1B0F0A] hover:bg-[#B57C44]',
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
    return (
        <div className="flex flex-wrap justify-center gap-6">
            {packages.map((pkg, index) => {
                const theme = cardThemes[index % cardThemes.length];
                const discountLabel = pkg.discountType === 'percent'
                    ? `Giảm ${pkg.discountValue}% cho mọi đơn hàng`
                    : `Giảm ${formatPrice(pkg.discountValue)} cho mọi đơn hàng`;
                const maxVoucher = pkg.isUnlimitedVoucher ? 'Không giới hạn' : `${pkg.voucherQuantity} voucher`;
                const minOrder = pkg.minOrderValue > 0
                    ? `Áp dụng đơn từ ${formatPrice(pkg.minOrderValue)}`
                    : 'Áp dụng cho mọi đơn hàng';

                const normalizedName = normalizeName(pkg.name);
                const imageSrc = pkg.imageUrl || imageMap[normalizedName] || fallbackImages[index % fallbackImages.length];

                return (
                    <div
                        key={pkg._id}
                        className={`group w-full max-w-[320px] ${theme.surface} rounded-[28px] border ${theme.border} shadow-[0_16px_40px_rgba(20,14,10,0.18)] overflow-hidden flex flex-col relative transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(20,14,10,0.28)]`}
                    >
                        <div className="absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50">
                            <div className="absolute -top-14 -left-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
                            <div className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full bg-black/15 blur-2xl" />
                        </div>
                        <div className="relative h-52 px-6 pt-6">
                            <div className="absolute inset-x-6 top-6 bottom-2 rounded-[22px] bg-white/15 border border-white/20 backdrop-blur-sm" />
                            <Image
                                src={imageSrc}
                                alt={pkg.name}
                                fill
                                className="object-contain drop-shadow-[0_18px_25px_rgba(20,10,5,0.35)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03]"
                                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                                priority={index < 2}
                            />
                            {index === packages.length - 1 && (
                                <span className={`absolute top-7 right-8 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${theme.badge}`}>
                                    Premium
                                </span>
                            )}
                        </div>
                        <div className="relative flex-1 px-6 pt-4 pb-4 text-center">
                            <h3 className={`text-xl font-bold tracking-wide ${theme.text}`}>{pkg.name}</h3>
                            <p className={`text-sm mt-1 ${theme.subtext}`}>
                                {pkg.description || 'Gói ưu đãi dành riêng cho thành viên Go Nuts.'}
                            </p>
                            <div className={`text-[11px] mt-2 uppercase tracking-[0.18em] ${theme.subtext}`}>
                                Tiết kiệm lên đến {pkg.isUnlimitedVoucher ? 'không giới hạn' : formatPrice(pkg.voucherQuantity * pkg.maxDiscount)}
                            </div>
                            <div className={`my-4 border-t ${theme.divider}`} />
                            <div className={`text-3xl font-black ${theme.text}`}>
                                {formatPrice(pkg.price)}
                            </div>
                            <div className={`text-[11px] mt-1 uppercase tracking-[0.2em] ${theme.subtext}`}>mỗi tháng</div>
                            <div className={`my-4 border-t ${theme.divider}`} />
                            <ul className={`space-y-2.5 text-left text-sm ${theme.text}`}>
                                <li className="flex items-start gap-2">
                                    <Tag className={`mt-0.5 ${theme.accent}`} size={16} />
                                    <span>{discountLabel}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className={`mt-0.5 ${theme.accent}`} size={16} />
                                    <span>Tối đa {formatPrice(pkg.maxDiscount)}/đơn</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className={`mt-0.5 ${theme.accent}`} size={16} />
                                    <span>{maxVoucher} mỗi tháng</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className={`mt-0.5 ${theme.accent}`} size={16} />
                                    <span>Hiệu lực {pkg.validityDays} ngày</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className={`mt-0.5 ${theme.accent}`} size={16} />
                                    <span>{minOrder}</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative px-6 pb-5">
                            <button
                                onClick={() => onBuyPackage(pkg._id)}
                                className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${theme.button} shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_16px_26px_rgba(0,0,0,0.25)]`}
                            >
                                {index === packages.length - 1 ? 'Đăng ký ngay' : 'Bắt đầu'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
