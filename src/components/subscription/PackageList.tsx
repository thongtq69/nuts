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
        surface: 'bg-[#E3E846]',
        border: 'border-[#D7DD3E]',
        badge: 'bg-[#7B8A12] text-white',
        text: 'text-[#4A3B1E]',
        subtext: 'text-[#6B5A2E]',
        accent: 'text-[#2E7D32]',
        divider: 'border-black/10',
        button: 'bg-white/90 text-[#4A3B1E] hover:bg-white',
    },
    {
        surface: 'bg-[#E29049]',
        border: 'border-[#D68035]',
        badge: 'bg-[#C86A1D] text-white',
        text: 'text-[#4A2A12]',
        subtext: 'text-[#5A3A1E]',
        accent: 'text-[#2E7D32]',
        divider: 'border-black/10',
        button: 'bg-white/90 text-[#4A2A12] hover:bg-white',
    },
    {
        surface: 'bg-[#E14A4F]',
        border: 'border-[#C93E43]',
        badge: 'bg-[#A93136] text-white',
        text: 'text-white',
        subtext: 'text-white/80',
        accent: 'text-white',
        divider: 'border-white/30',
        button: 'bg-white/95 text-[#6B1F24] hover:bg-white',
    },
    {
        surface: 'bg-[#4A2A1D]',
        border: 'border-[#3A2016]',
        badge: 'bg-[#E29049] text-white',
        text: 'text-[#F6E7C6]',
        subtext: 'text-[#EED9A7]',
        accent: 'text-[#F6C575]',
        divider: 'border-white/20',
        button: 'bg-[#E29049] text-white hover:bg-[#D77E33]',
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
                        className={`w-full max-w-[320px] ${theme.surface} rounded-[26px] border ${theme.border} shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col`}
                    >
                        <div className="relative h-52">
                            <Image
                                src={imageSrc}
                                alt={pkg.name}
                                fill
                                className="object-contain"
                                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                                priority={index < 2}
                            />
                            {index === packages.length - 1 && (
                                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold ${theme.badge}`}>
                                    Premium
                                </span>
                            )}
                        </div>
                        <div className="flex-1 px-6 pt-4 pb-4 text-center">
                            <h3 className={`text-xl font-bold ${theme.text}`}>{pkg.name}</h3>
                            <p className={`text-sm mt-1 ${theme.subtext}`}>
                                {pkg.description || 'Gói ưu đãi dành riêng cho thành viên Go Nuts.'}
                            </p>
                            <div className={`text-xs mt-1 ${theme.subtext}`}>
                                Tiết kiệm lên đến {pkg.isUnlimitedVoucher ? 'không giới hạn' : formatPrice(pkg.voucherQuantity * pkg.maxDiscount)}
                            </div>
                            <div className={`my-4 border-t ${theme.divider}`} />
                            <div className={`text-3xl font-black ${theme.text}`}>
                                {formatPrice(pkg.price)}
                            </div>
                            <div className={`text-xs mt-1 ${theme.subtext}`}>mỗi tháng</div>
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
                        <div className="px-6 pb-5">
                            <button
                                onClick={() => onBuyPackage(pkg._id)}
                                className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${theme.button}`}
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
