'use client';

import { useState } from 'react';
import { X, Tag, Clock, ShoppingBag, Star, Sparkles, ChevronRight, Percent, Gift } from 'lucide-react';

interface Package {
    _id: string;
    name: string;
    price: number;
    description?: string;
    terms?: string; // HTML content for terms
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

const packageIcons = ['🥉', '🥈', '🥇', '✨', '💎', '👑'];
const cardGradients = [
    'from-stone-100 to-stone-50',
    'from-stone-100 to-stone-50',
    'from-stone-100 to-stone-50',
    'from-stone-100 to-stone-50',
    'from-stone-100 to-stone-50',
    'from-stone-100 to-stone-50',
];

export default function PackageList({ packages, onBuyPackage }: Props) {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    const handleBuy = () => {
        if (selectedPackage) {
            onBuyPackage(selectedPackage._id);
            setSelectedPackage(null);
        }
    };

    return (
        <>
            {/* Compact Package Cards Grid */}
            <div className="flex flex-wrap justify-center gap-4">
                {packages.map((pkg, index) => {
                    const maxSavings = pkg.isUnlimitedVoucher
                        ? '∞'
                        : formatPrice(pkg.voucherQuantity * pkg.maxDiscount);

                    return (
                        <div
                            key={pkg._id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`
                                relative group cursor-pointer
                                w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.7rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]
                                bg-gradient-to-br ${cardGradients[index % cardGradients.length]}
                                rounded-2xl p-4 
                                border-2 border-transparent
                                hover:border-[#9C7044] hover:shadow-xl hover:scale-[1.02]
                                transition-all duration-300 ease-out
                            `}
                        >
                            {/* Badge for featured/last package */}
                            {index === packages.length - 1 && (
                                <div className="absolute -top-2 -right-2 bg-[#9C7044] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                    HOT
                                </div>
                            )}

                            {/* Icon */}
                            <div className="text-3xl mb-2">{packageIcons[index] || '✨'}</div>

                            {/* Name */}
                            <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">
                                {pkg.name}
                            </h3>

                            {/* Price */}
                            <div className="text-lg font-extrabold text-amber-600 mb-2">
                                {formatPrice(pkg.price)}
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-1 text-xs text-slate-600 mb-3">
                                <Tag size={12} className="text-[#9C7044]" />
                                <span className="font-semibold">
                                    {pkg.isUnlimitedVoucher ? '∞' : pkg.voucherQuantity}
                                </span>
                                <span>mã</span>
                            </div>

                            {/* Savings Badge */}
                            <div className="bg-amber-500/10 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full text-center mb-2">
                                Tiết kiệm: {maxSavings}
                            </div>

                            {/* View Details Link */}
                            <div className="flex items-center justify-center gap-1 text-xs text-amber-600 font-semibold group-hover:text-amber-700">
                                Xem chi tiết
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {selectedPackage && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setSelectedPackage(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className="bg-[#9C7044] p-6 text-white relative">
                            <button
                                onClick={() => setSelectedPackage(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-4xl mb-3">
                                {packageIcons[packages.findIndex(p => p._id === selectedPackage._id)] || '✨'}
                            </div>
                            <h2 className="text-2xl font-bold mb-1">{selectedPackage.name}</h2>
                            <p className="text-white/80 text-sm">{selectedPackage.description || 'Gói ưu đãi đặc biệt'}</p>

                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-black">{formatPrice(selectedPackage.price)}</span>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {/* Voucher Count */}
                                <div className="bg-stone-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#9C7044] rounded-lg flex items-center justify-center">
                                        <Tag className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-800">
                                            {selectedPackage.isUnlimitedVoucher ? '∞' : selectedPackage.voucherQuantity}
                                        </div>
                                        <div className="text-xs text-slate-500">mã giảm giá</div>
                                    </div>
                                </div>

                                {/* Discount */}
                                <div className="bg-stone-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#9C7044] rounded-lg flex items-center justify-center">
                                        <Percent className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-800">
                                            {selectedPackage.discountType === 'percent'
                                                ? selectedPackage.discountValue + '%'
                                                : formatPrice(selectedPackage.discountValue)
                                            }
                                        </div>
                                        <div className="text-xs text-slate-500">giảm/mã</div>
                                    </div>
                                </div>

                                {/* Max Discount */}
                                <div className="bg-stone-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#9C7044] rounded-lg flex items-center justify-center">
                                        <Gift className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-800">
                                            {formatPrice(selectedPackage.maxDiscount)}
                                        </div>
                                        <div className="text-xs text-slate-500">tối đa/đơn</div>
                                    </div>
                                </div>

                                {/* Validity */}
                                <div className="bg-stone-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#9C7044] rounded-lg flex items-center justify-center">
                                        <Clock className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-800">
                                            {selectedPackage.validityDays}
                                        </div>
                                        <div className="text-xs text-slate-500">ngày hiệu lực</div>
                                    </div>
                                </div>
                            </div>

                            {/* Min Order */}
                            {selectedPackage.minOrderValue > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">
                                    <ShoppingBag size={16} className="text-slate-400" />
                                    <span>Đơn tối thiểu: <strong>{formatPrice(selectedPackage.minOrderValue)}</strong></span>
                                </div>
                            )}

                            {/* Unlimited Badge */}
                            {selectedPackage.isUnlimitedVoucher && (
                                <div className="flex items-center gap-2 text-[#9C7044] bg-[#E3E846]/20 rounded-xl px-4 py-3 text-sm font-semibold">
                                    <Sparkles size={16} />
                                    Sử dụng không giới hạn trong thời hạn gói
                                </div>
                            )}

                            {/* Total Savings */}
                            <div className="bg-[#E3E846]/20 rounded-xl p-4 text-center">
                                <div className="text-sm text-[#9C7044] mb-1">💡 Tiết kiệm tối đa lên đến</div>
                                <div className="text-2xl font-black text-[#9C7044]">
                                    {selectedPackage.isUnlimitedVoucher
                                        ? '∞ Không giới hạn'
                                        : formatPrice(selectedPackage.voucherQuantity * selectedPackage.maxDiscount)
                                    }
                                </div>
                            </div>

                            {/* Terms & Conditions Section */}
                            <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                                <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2">
                                    📋 Điều khoản sử dụng gói
                                </h4>

                                {selectedPackage.terms ? (
                                    // Render HTML terms from database
                                    <div
                                        className="text-xs text-slate-600 prose prose-xs prose-slate max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedPackage.terms }}
                                    />
                                ) : (
                                    // Fallback to auto-generated terms
                                    <div className="text-xs text-slate-600 space-y-2">
                                        <p className="font-semibold text-slate-700">Quyền lợi chính:</p>
                                        <ul className="space-y-1.5 ml-1">
                                            <li>- Giảm {selectedPackage.discountType === 'percent'
                                                ? selectedPackage.discountValue + '%'
                                                : formatPrice(selectedPackage.discountValue)
                                            }: Tối đa {formatPrice(selectedPackage.maxDiscount)}/đơn, áp dụng với {selectedPackage.isUnlimitedVoucher ? '∞' : selectedPackage.voucherQuantity} mã.</li>
                                            <li>- Thời hạn sử dụng: {selectedPackage.validityDays} ngày kể từ ngày mua.</li>
                                            {selectedPackage.minOrderValue > 0 && (
                                                <li>- Áp dụng cho đơn hàng từ {formatPrice(selectedPackage.minOrderValue)} trở lên.</li>
                                            )}
                                        </ul>

                                        <p className="font-semibold text-slate-700 pt-2">Lưu ý:</p>
                                        <ul className="space-y-1.5 ml-1">
                                            <li>- Ưu đãi chưa sử dụng không được cộng dồn sang tháng tiếp theo.</li>
                                            <li>- Khuyến mãi không áp dụng đồng thời với các chương trình khác.</li>
                                            <li>- Khuyến mãi không được hoàn lại và không thể chuyển nhượng.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Buy Button */}
                            <button
                                onClick={handleBuy}
                                className="w-full bg-[#E3E846] hover:bg-[#d4d942] text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Star size={20} className="text-black" />
                                Mua ngay - {formatPrice(selectedPackage.price)}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    );
}
