'use client';

import { Tag } from 'lucide-react';

interface Package {
    _id: string;
    name: string;
    price: number;
    description?: string;
    terms?: string;
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
        top: 'from-lime-200 via-lime-200 to-yellow-100',
        border: 'border-lime-200',
        badge: 'bg-lime-500 text-white',
        button: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300',
    },
    {
        top: 'from-orange-400 via-orange-400 to-amber-300',
        border: 'border-orange-300',
        badge: 'bg-orange-500 text-white',
        button: 'bg-orange-500 text-white hover:bg-orange-600',
    },
    {
        top: 'from-orange-500 via-orange-500 to-orange-400',
        border: 'border-orange-400',
        badge: 'bg-orange-600 text-white',
        button: 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300',
    },
    {
        top: 'from-amber-900 via-amber-800 to-amber-700',
        border: 'border-amber-800',
        badge: 'bg-amber-600 text-white',
        button: 'bg-orange-400 text-white hover:bg-orange-500',
    },
];

export default function PackageList({ packages, onBuyPackage }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {packages.map((pkg, index) => {
                const theme = cardThemes[index % cardThemes.length];
                const discountLabel = pkg.discountType === 'percent'
                    ? `Giảm ${pkg.discountValue}% cho mọi đơn hàng`
                    : `Giảm ${formatPrice(pkg.discountValue)} cho mọi đơn hàng`;
                const maxVoucher = pkg.isUnlimitedVoucher ? 'Không giới hạn' : `${pkg.voucherQuantity} voucher`;
                const minOrder = pkg.minOrderValue > 0
                    ? `Áp dụng đơn từ ${formatPrice(pkg.minOrderValue)}`
                    : 'Áp dụng cho mọi đơn hàng';

                return (
                    <div
                        key={pkg._id}
                        className={`bg-white rounded-[28px] border ${theme.border} shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col`}
                    >
                        <div className={`relative h-32 bg-gradient-to-br ${theme.top}`}>
                            {index === packages.length - 1 && (
                                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${theme.badge}`}>
                                    Premium
                                </span>
                            )}
                        </div>
                        <div className="flex-1 px-6 pt-6 pb-5 text-center">
                            <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">
                                {pkg.description || 'Gói ưu đãi dành riêng cho thành viên Go Nuts.'}
                            </p>
                            <div className="my-5 border-t border-slate-200" />
                            <div className="text-3xl font-black text-slate-900">
                                {formatPrice(pkg.price)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">mỗi tháng</div>
                            <div className="my-5 border-t border-slate-200" />
                            <ul className="space-y-3 text-left text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <Tag className="mt-0.5 text-emerald-500" size={16} />
                                    <span>{discountLabel}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className="mt-0.5 text-emerald-500" size={16} />
                                    <span>Tối đa {formatPrice(pkg.maxDiscount)}/đơn</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className="mt-0.5 text-emerald-500" size={16} />
                                    <span>{maxVoucher} mỗi tháng</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className="mt-0.5 text-emerald-500" size={16} />
                                    <span>Hiệu lực {pkg.validityDays} ngày</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Tag className="mt-0.5 text-emerald-500" size={16} />
                                    <span>{minOrder}</span>
                                </li>
                            </ul>
                        </div>
                        <div className="px-6 pb-6">
                            <button
                                onClick={() => onBuyPackage(pkg._id)}
                                className={`w-full py-3 rounded-xl font-semibold transition-colors ${theme.button}`}
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
