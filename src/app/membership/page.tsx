'use client';

import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Package {
    _id: string;
    name: string;
    price: number;
    description: string;
    terms: string;
    voucherQuantity: number;
    discountValue: number;
    discountType: 'percent' | 'fixed';
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isActive: boolean;
}

const StarIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
);

const CrownIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
    </svg>
);

const CheckCircleIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SparklesIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
    </svg>
);

const PackageCard = ({ pkg, index, onSelect, onViewDetails }: { pkg: Package; index: number; onSelect: (pkg: Package) => void; onViewDetails: (pkg: Package) => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const tierColors = [
        { bg: 'linear-gradient(135deg, #FFF8E7 0%, #FFECB3 100%)', border: '#E6C84C', accent: '#D4A520', glow: 'rgba(230, 200, 76, 0.3)' },
        { bg: 'linear-gradient(135deg, #9C7043 0%, #7D5A36 100%)', border: '#6B4423', accent: '#D4A853', glow: 'rgba(156, 112, 67, 0.4)' },
        { bg: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)', border: '#404040', accent: '#FFD700', glow: 'rgba(255, 215, 0, 0.3)' },
        { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '#0f3460', accent: '#e94560', glow: 'rgba(233, 69, 96, 0.3)' },
    ];

    const tier = tierColors[index % tierColors.length];
    const isPremium = index >= 2;
    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    return (
        <div 
            className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${isHovered ? 'transform -translate-y-2 shadow-2xl' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: tier.bg,
                border: `2px solid ${tier.border}`,
                boxShadow: isHovered ? `0 25px 50px -12px ${tier.glow}` : '0 10px 30px -5px rgba(0,0,0,0.1)'
            }}
        >
            {/* Premium Badge */}
            {isPremium && (
                <div className="absolute top-4 left-4 z-10">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${index === 2 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black' : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'}`}>
                        <SparklesIcon className="w-3 h-3" />
                        {index === 2 ? 'PREMIUM' : 'VIP'}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${index % 2 === 0 ? 'bg-white/60 text-amber-800' : 'bg-white/20 text-white'}`}>
                        Gói {index + 1}
                    </span>
                    {index === 3 && (
                        <div className="flex items-center gap-1 text-amber-400">
                            <CrownIcon className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <h3 className={`text-2xl font-black mb-1 ${index % 2 === 0 ? 'text-gray-800' : 'text-white'}`}>
                    {pkg.name}
                </h3>
                <p className={`text-sm ${index % 2 === 0 ? 'text-gray-600' : 'text-white/80'}`}>
                    {pkg.description || 'Gói hội viên cao cấp'}
                </p>
            </div>

            {/* Price */}
            <div className={`px-6 py-4 ${index % 2 === 0 ? 'bg-white/50' : 'bg-black/20'}`}>
                <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-4xl font-black ${index % 2 === 0 ? 'text-brand' : 'text-white'}`}>
                        {formatPrice(pkg.price)}
                    </span>
                    <span className={`text-sm ${index % 2 === 0 ? 'text-gray-500' : 'text-white/70'}`}>đ</span>
                </div>
            </div>

            {/* Benefits */}
            <div className="p-6 space-y-3">
                <div className={`flex items-center gap-3 text-sm ${index % 2 === 0 ? 'text-gray-700' : 'text-white/90'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${index % 2 === 0 ? 'bg-brand/10' : 'bg-white/20'}`}>
                        <CheckCircleIcon className={`w-4 h-4 ${index % 2 === 0 ? 'text-brand' : 'text-white'}`} />
                    </div>
                    <span><strong>{pkg.voucherQuantity}</strong> voucher giảm giá</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${index % 2 === 0 ? 'text-gray-700' : 'text-white/90'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${index % 2 === 0 ? 'bg-brand/10' : 'bg-white/20'}`}>
                        <CheckCircleIcon className={`w-4 h-4 ${index % 2 === 0 ? 'text-brand' : 'text-white'}`} />
                    </div>
                    <span>Giảm <strong>{pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}</strong> mỗi đơn</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${index % 2 === 0 ? 'text-gray-700' : 'text-white/90'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${index % 2 === 0 ? 'bg-brand/10' : 'bg-white/20'}`}>
                        <CheckCircleIcon className={`w-4 h-4 ${index % 2 === 0 ? 'text-brand' : 'text-white'}`} />
                    </div>
                    <span>Hiệu lực <strong>{pkg.validityDays} ngày</strong></span>
                </div>
                {pkg.maxDiscount > 0 && (
                    <div className={`flex items-center gap-3 text-sm ${index % 2 === 0 ? 'text-gray-600' : 'text-white/70'}`}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">↳</span>
                        </div>
                        <span>Tối đa <strong>{formatPrice(pkg.maxDiscount)}đ</strong>/đơn</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
                <button
                    onClick={() => onViewDetails(pkg)}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        index % 2 === 0 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    Xem chi tiết
                </button>
                <button
                    onClick={() => onSelect(pkg)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
                        index % 2 === 0
                            ? 'bg-gradient-to-r from-brand to-brand-light text-white hover:shadow-brand/30'
                            : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:shadow-amber-400/30'
                    }`}
                >
                    Đăng ký ngay
                </button>
            </div>

            {/* Hover shine effect */}
            {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shine pointer-events-none" />
            )}
        </div>
    );
};

const PackageDetailModal = ({ pkg, isOpen, onClose, onSelect }: { pkg: Package | null; isOpen: boolean; onClose: () => void; onSelect: (pkg: Package) => void }) => {
    if (!isOpen || !pkg) return null;

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
    const maxSavings = pkg.maxDiscount > 0 
        ? pkg.maxDiscount * pkg.voucherQuantity 
        : Math.floor(pkg.minOrderValue * pkg.discountValue / 100) * pkg.voucherQuantity;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-modal-in">
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-brand to-brand-light p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{pkg.name}</h2>
                            <p className="text-white/80 text-sm mt-1">{pkg.description}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-brand-light/20 to-brand-light/5 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-brand">{pkg.voucherQuantity}</div>
                            <div className="text-xs text-gray-500 mt-1">Voucher</div>
                        </div>
                        <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-2xl p-4 text-center">
                            <div className="text-3xl font-black text-brand">
                                {pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Giảm/đơn</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-4 text-center">
                            <div className="text-xl font-bold text-gray-700">
                                {pkg.maxDiscount > 0 ? `${formatPrice(pkg.maxDiscount)}đ` : '∞'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Tối đa/đơn</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 text-center">
                            <div className="text-xl font-bold text-amber-600">{pkg.validityDays}</div>
                            <div className="text-xs text-gray-500 mt-1">Ngày hiệu lực</div>
                        </div>
                    </div>

                    {/* Savings highlight */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">💰</span>
                            <span className="font-bold text-green-700">Tiết kiệm tối đa</span>
                        </div>
                        <div className="text-2xl font-black text-green-600">{formatPrice(maxSavings)}đ</div>
                    </div>

                    {/* Terms */}
                    {pkg.terms && (
                        <div>
                            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span>📋</span> Điều khoản
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 max-h-32 overflow-y-auto">
                                {pkg.terms}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                            <span>⚠️</span> Lưu ý
                        </h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li>• Voucher có hiệu lực {pkg.validityDays} ngày từ ngày kích hoạt</li>
                            <li>• Áp dụng cho đơn từ {formatPrice(pkg.minOrderValue)}đ trở lên</li>
                            <li>• Không áp dụng cùng chương trình khuyến mãi khác</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 transition"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={() => { onClose(); onSelect(pkg); }}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand to-brand-light hover:shadow-lg hover:shadow-brand/30 transition"
                        >
                            Đăng ký - {formatPrice(pkg.price)}đ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MembershipPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        fetch('/api/packages')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPackages(data.filter((p: Package) => p.isActive));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSelectPackage = (pkg: Package) => {
        if (!user) {
            router.push(`/login?redirect=/membership`);
            return;
        }
        router.push(`/checkout/membership?packageId=${pkg._id}`);
    };

    const handleViewDetails = (pkg: Package) => {
        setSelectedPackage(pkg);
        setShowModal(true);
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Gói hội viên' }]} />

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-light to-amber-200 opacity-90" />
                <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                            <g fill="#ffffff" fillOpacity="0.08">
                                <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                            </g>
                        </g>
                    </svg>
                </div>
                
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                            <StarIcon className="w-5 h-5 text-amber-300" />
                            <span className="text-white font-medium">Chương trình Hội viên</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg">
                            Trở thành Hội viên
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                            Khám phá các ưu đãi đặc biệt dành riêng cho thành viên Go Nuts. 
                            Tiết kiệm hơn, mua sắm thông minh hơn!
                        </p>

                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-6 text-white/80">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                                <span className="text-sm">Bảo mật tuyệt đối</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                                <span className="text-sm">Kích hoạt nhanh chóng</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-300" />
                                <span className="text-sm">Hỗ trợ 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                    </svg>
                </div>
            </div>

            {/* Packages Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Chọn Gói Phù Hợp</h2>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Các gói hội viên được thiết kế để phù hợp với mọi nhu cầu mua sắm của bạn
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-brand/20 rounded-full" />
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="mt-4 text-gray-500">Đang tải các gói hội viên...</p>
                    </div>
                ) : packages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {packages.slice(0, 4).map((pkg, index) => (
                            <PackageCard
                                key={pkg._id}
                                pkg={pkg}
                                index={index}
                                onSelect={handleSelectPackage}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-4xl">📦</span>
                        </div>
                        <p className="text-gray-500 text-lg">Hiện chưa có gói hội viên nào</p>
                        <p className="text-gray-400 text-sm mt-2">Vui lòng quay lại sau!</p>
                    </div>
                )}
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-b from-white to-amber-50/30 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-3">Tại sao nên đăng ký hội viên?</h2>
                        <p className="text-gray-600">Những đặc quyền dành riêng cho bạn</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-4xl">💰</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Tiết kiệm tối đa</h3>
                            <p className="text-gray-600 text-sm">Nhận voucher giảm giá cho mỗi đơn hàng, tiết kiệm ngay từ lần mua đầu tiên</p>
                        </div>

                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-brand/10 to-brand-light/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-4xl">🎁</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Quà tặng độc quyền</h3>
                            <p className="text-gray-600 text-sm">Nhận quà sinh nhật và ưu đãi đặc biệt dành riêng cho hội viên</p>
                        </div>

                        <div className="group text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-4xl">⭐</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Ưu tiên phục vụ</h3>
                            <p className="text-gray-600 text-sm">Được hỗ trợ 24/7 và truy cập sớm các sản phẩm mới</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="bg-gradient-to-r from-brand to-brand-light rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <circle cx="20" cy="30" r="8" fill="white" />
                            <circle cx="80" cy="20" r="5" fill="white" />
                            <circle cx="50" cy="60" r="10" fill="white" />
                            <circle cx="30" cy="80" r="6" fill="white" />
                            <circle cx="90" cy="70" r="4" fill="white" />
                        </svg>
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Sẵn sàng để tiết kiệm?</h2>
                        <p className="text-white/90 mb-8 max-w-xl mx-auto">
                            Đăng ký ngay để nhận ngay những ưu đãi hấp dẫn. Không có gì để mất, chỉ có tiền để tiết kiệm!
                        </p>
                        
                        {user ? (
                            <div className="flex flex-wrap justify-center gap-4">
                                {packages.length > 0 && (
                                    <button
                                        onClick={() => handleSelectPackage(packages[0])}
                                        className="px-8 py-4 bg-white text-brand font-bold rounded-full hover:shadow-xl transition-all hover:scale-105"
                                    >
                                        Đăng ký ngay
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={() => router.push('/login?redirect=/membership')}
                                    className="px-8 py-4 bg-white text-brand font-bold rounded-full hover:shadow-xl transition-all hover:scale-105"
                                >
                                    Đăng nhập để đăng ký
                                </button>
                                <button
                                    onClick={() => router.push('/register?redirect=/membership')}
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/30 transition-all"
                                >
                                    Tạo tài khoản mới
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <PackageDetailModal 
                pkg={selectedPackage}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSelect={handleSelectPackage}
            />

            <Footer />

            {/* Styles */}
            <style jsx>{`
                @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-12deg); }
                    100% { transform: translateX(200%) skewX(-12deg); }
                }
                .animate-shine {
                    animation: shine 1.5s ease-in-out infinite;
                }
                @keyframes modal-in {
                    0% { opacity: 0; transform: scale(0.95) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in {
                    animation: modal-in 0.3s ease-out forwards;
                }
            `}</style>
        </main>
    );
}
