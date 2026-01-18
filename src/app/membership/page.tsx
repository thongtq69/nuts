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

// Mascot SVG Components
const NutMascotHappy = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <ellipse cx="100" cy="30" rx="25" ry="15" fill="#4CAF50" transform="rotate(-20 100 30)"/>
        <path d="M100 30 Q105 50 100 60" stroke="#388E3C" strokeWidth="3" fill="none"/>
        {/* Body */}
        <ellipse cx="100" cy="110" rx="55" ry="65" fill="#D2691E"/>
        <ellipse cx="100" cy="110" rx="45" ry="55" fill="#DEB887"/>
        {/* Stripes */}
        <path d="M70 80 Q100 70 130 80" stroke="#CD853F" strokeWidth="3" fill="none"/>
        <path d="M65 100 Q100 90 135 100" stroke="#CD853F" strokeWidth="3" fill="none"/>
        <path d="M70 120 Q100 110 130 120" stroke="#CD853F" strokeWidth="3" fill="none"/>
        {/* Happy closed eyes */}
        <path d="M75 95 Q80 88 90 95" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M110 95 Q120 88 125 95" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Blush */}
        <circle cx="70" cy="110" r="8" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="130" cy="110" r="8" fill="#FFB6C1" opacity="0.6"/>
        {/* Happy mouth */}
        <path d="M85 125 Q100 145 115 125" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Arms */}
        <ellipse cx="45" cy="130" rx="12" ry="8" fill="#D2691E" transform="rotate(-30 45 130)"/>
        <ellipse cx="155" cy="120" rx="12" ry="8" fill="#D2691E" transform="rotate(45 155 120)"/>
        {/* Legs */}
        <ellipse cx="80" cy="175" rx="10" ry="12" fill="#D2691E"/>
        <ellipse cx="120" cy="175" rx="10" ry="12" fill="#D2691E"/>
    </svg>
);

const NutMascotCool = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <ellipse cx="100" cy="25" rx="25" ry="15" fill="#4CAF50" transform="rotate(-15 100 25)"/>
        <path d="M100 25 Q105 45 100 55" stroke="#388E3C" strokeWidth="3" fill="none"/>
        {/* Body */}
        <ellipse cx="100" cy="110" rx="55" ry="65" fill="#D2691E"/>
        <ellipse cx="100" cy="110" rx="45" ry="55" fill="#DEB887"/>
        {/* Stripes */}
        <path d="M70 80 Q100 70 130 80" stroke="#CD853F" strokeWidth="3" fill="none"/>
        <path d="M65 100 Q100 90 135 100" stroke="#CD853F" strokeWidth="3" fill="none"/>
        {/* Sunglasses */}
        <rect x="60" y="85" width="30" height="20" rx="5" fill="#1a1a1a"/>
        <rect x="110" y="85" width="30" height="20" rx="5" fill="#1a1a1a"/>
        <path d="M90 95 L110 95" stroke="#1a1a1a" strokeWidth="3"/>
        <line x1="60" y1="92" x2="50" y2="88" stroke="#1a1a1a" strokeWidth="2"/>
        <line x1="140" y1="92" x2="150" y2="88" stroke="#1a1a1a" strokeWidth="2"/>
        {/* Smirk */}
        <path d="M90 130 Q105 140 120 130" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Thumbs up arm */}
        <ellipse cx="160" cy="115" rx="15" ry="10" fill="#D2691E" transform="rotate(30 160 115)"/>
        <circle cx="170" cy="100" r="8" fill="#D2691E"/>
        {/* Other arm */}
        <ellipse cx="40" cy="130" rx="12" ry="8" fill="#D2691E" transform="rotate(-20 40 130)"/>
        {/* Legs */}
        <ellipse cx="80" cy="175" rx="10" ry="12" fill="#D2691E"/>
        <ellipse cx="120" cy="175" rx="10" ry="12" fill="#D2691E"/>
        {/* Nut bag */}
        <ellipse cx="45" cy="150" rx="20" ry="25" fill="#8B7355"/>
        <path d="M30 135 Q45 130 60 135" stroke="#6B5344" strokeWidth="2" fill="none"/>
        <circle cx="40" cy="155" r="4" fill="#CD5C5C"/>
        <circle cx="50" cy="160" r="3" fill="#CD5C5C"/>
    </svg>
);

const NutMascotLove = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <ellipse cx="100" cy="30" rx="25" ry="15" fill="#4CAF50" transform="rotate(-20 100 30)"/>
        <path d="M100 30 Q105 50 100 60" stroke="#388E3C" strokeWidth="3" fill="none"/>
        {/* Body */}
        <ellipse cx="100" cy="110" rx="55" ry="65" fill="#D2691E"/>
        <ellipse cx="100" cy="110" rx="45" ry="55" fill="#DEB887"/>
        {/* Stripes */}
        <path d="M70 80 Q100 70 130 80" stroke="#CD853F" strokeWidth="3" fill="none"/>
        <path d="M65 100 Q100 90 135 100" stroke="#CD853F" strokeWidth="3" fill="none"/>
        {/* Heart eyes */}
        <path d="M70 90 L75 85 L80 90 L75 100 Z M80 90 L85 85 L90 90 L85 100 Z" fill="#FF1744"/>
        <path d="M110 90 L115 85 L120 90 L115 100 Z M120 90 L125 85 L130 90 L125 100 Z" fill="#FF1744"/>
        {/* Big happy mouth */}
        <path d="M80 125 Q100 155 120 125" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M85 125 Q100 145 115 125" fill="#FF8A80"/>
        {/* Blush */}
        <circle cx="65" cy="110" r="10" fill="#FFB6C1" opacity="0.7"/>
        <circle cx="135" cy="110" r="10" fill="#FFB6C1" opacity="0.7"/>
        {/* Arms raised */}
        <ellipse cx="40" cy="100" rx="12" ry="8" fill="#D2691E" transform="rotate(-60 40 100)"/>
        <ellipse cx="160" cy="100" rx="12" ry="8" fill="#D2691E" transform="rotate(60 160 100)"/>
        {/* Legs */}
        <ellipse cx="80" cy="175" rx="10" ry="12" fill="#D2691E"/>
        <ellipse cx="120" cy="175" rx="10" ry="12" fill="#D2691E"/>
    </svg>
);

const NutMascotKing = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Crown */}
        <path d="M60 45 L70 25 L85 40 L100 15 L115 40 L130 25 L140 45 L140 55 L60 55 Z" fill="#FFD700"/>
        <circle cx="70" cy="30" r="5" fill="#FF1744"/>
        <circle cx="100" cy="20" r="5" fill="#4FC3F7"/>
        <circle cx="130" cy="30" r="5" fill="#FF1744"/>
        {/* Leaf behind crown */}
        <ellipse cx="100" cy="50" rx="20" ry="12" fill="#4CAF50" transform="rotate(-10 100 50)"/>
        {/* Body */}
        <ellipse cx="100" cy="120" rx="55" ry="65" fill="#D2691E"/>
        <ellipse cx="100" cy="120" rx="45" ry="55" fill="#DEB887"/>
        {/* Stripes */}
        <path d="M70 90 Q100 80 130 90" stroke="#CD853F" strokeWidth="3" fill="none"/>
        <path d="M65 110 Q100 100 135 110" stroke="#CD853F" strokeWidth="3" fill="none"/>
        {/* Cool sunglasses */}
        <rect x="60" y="95" width="30" height="20" rx="5" fill="#1a1a1a"/>
        <rect x="110" y="95" width="30" height="20" rx="5" fill="#1a1a1a"/>
        <path d="M90 105 L110 105" stroke="#1a1a1a" strokeWidth="3"/>
        {/* Confident smile */}
        <path d="M85 140 Q100 155 115 140" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Cape */}
        <path d="M50 100 Q30 150 50 200 L80 180 Q70 140 75 110 Z" fill="#C62828"/>
        <path d="M150 100 Q170 150 150 200 L120 180 Q130 140 125 110 Z" fill="#C62828"/>
        {/* Cape inner */}
        <path d="M55 105 Q40 150 55 190 L75 175 Q68 140 72 115 Z" fill="#FF5252"/>
        <path d="M145 105 Q160 150 145 190 L125 175 Q132 140 128 115 Z" fill="#FF5252"/>
        {/* Scepter */}
        <rect x="165" y="100" width="8" height="80" rx="3" fill="#8D6E63"/>
        <circle cx="169" cy="95" r="12" fill="#FFD700"/>
        <circle cx="169" cy="95" r="6" fill="#4FC3F7"/>
        {/* Legs */}
        <ellipse cx="80" cy="185" rx="10" ry="12" fill="#D2691E"/>
        <ellipse cx="120" cy="185" rx="10" ry="12" fill="#D2691E"/>
    </svg>
);

// Package tier configurations matching the image
const packageTiers = [
    {
        key: 'luc-lac',
        displayName: 'GOI LUC LAC',
        tagline: 'Khoi dau vui ve, nhe hang.',
        bgColor: 'bg-brand-light',
        textColor: 'text-gray-800',
        mascot: NutMascotHappy,
    },
    {
        key: 'nghien-hat',
        displayName: 'GOI NGHIEN HAT',
        tagline: 'Da "dinh" va khong the dung lai.',
        bgColor: 'bg-brand',
        textColor: 'text-white',
        mascot: NutMascotCool,
    },
    {
        key: 'nutty-pro',
        displayName: 'GOI NUTTY PRO',
        tagline: 'Dang cap nguoi choi hat chuyen nghiep',
        bgColor: 'bg-[#5a4232]',
        textColor: 'text-white',
        mascot: NutMascotLove,
    },
    {
        key: 'nut-master',
        displayName: 'GOI NUT MASTER',
        tagline: '"Trum" hat de, vi the dan dau',
        bgColor: 'bg-slate-800',
        textColor: 'text-white',
        mascot: NutMascotKing,
    },
];

export default function MembershipPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [selectedTierIndex, setSelectedTierIndex] = useState(0);
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

    const handleBuy = (pkg: Package) => {
        if (!user) {
            router.push(`/login?redirect=/membership`);
            return;
        }
        router.push(`/checkout/membership?packageId=${pkg._id}`);
    };

    const handleViewTerms = (pkg: Package, tierIndex: number) => {
        setSelectedPackage(pkg);
        setSelectedTierIndex(tierIndex);
        setShowTermsModal(true);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chu', href: '/' }, { label: 'Goi hoi vien' }]} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-brand via-brand-light/80 to-brand py-12 px-4">
                <div className="container mx-auto text-center">
                    <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
                        <span className="text-white font-medium">GO NUTS - Chuong Trinh Hoi Vien</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        Nang Cap Hoi Vien
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        Nhan Ngan Uu Dai Hap Dan
                    </p>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="container mx-auto py-12 px-4">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Dang tai cac goi...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
                        {packages.slice(0, 4).map((pkg, index) => {
                            const tier = packageTiers[index % packageTiers.length];
                            const MascotComponent = tier.mascot;

                            return (
                                <div
                                    key={pkg._id}
                                    className={`${tier.bgColor} ${tier.textColor} p-8 relative group transition-all duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-2xl cursor-pointer`}
                                    onClick={() => handleViewTerms(pkg, index)}
                                >
                                    {/* Logo badge */}
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                                        <span className="font-bold text-sm">GO NUTS</span>
                                    </div>

                                    {/* Mascot */}
                                    <div className="flex justify-center mb-6">
                                        <div className="w-40 h-40 transform group-hover:scale-110 transition-transform duration-300">
                                            <MascotComponent className="w-full h-full drop-shadow-lg" />
                                        </div>
                                    </div>

                                    {/* Package Name */}
                                    <h3 className="text-2xl md:text-3xl font-black text-center mb-2 tracking-wide" style={{ fontFamily: 'system-ui' }}>
                                        {tier.displayName}
                                    </h3>

                                    {/* Tagline */}
                                    <p className={`text-center text-sm mb-4 ${tier.textColor === 'text-white' ? 'text-white/80' : 'text-gray-600'}`}>
                                        {tier.tagline}
                                    </p>

                                    {/* Benefits */}
                                    <div className={`text-center text-sm ${tier.textColor === 'text-white' ? 'text-white/90' : 'text-gray-700'}`}>
                                        <p className="font-medium">
                                            Giam {pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'd'} moi don hang
                                            {pkg.maxDiscount > 0 && ` (toi da ${formatPrice(pkg.maxDiscount)}d)`}
                                        </p>
                                        <p className="mt-1">
                                            + {pkg.voucherQuantity} ma giam gia
                                            {pkg.validityDays > 0 && ` | Hieu luc ${pkg.validityDays} ngay`}
                                        </p>
                                    </div>

                                    {/* Price Tag */}
                                    <div className="mt-6 text-center">
                                        <div className={`inline-block ${tier.textColor === 'text-white' ? 'bg-white/20' : 'bg-black/10'} rounded-full px-6 py-2`}>
                                            <span className="font-bold text-lg">{formatPrice(pkg.price)}d</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuy(pkg);
                                            }}
                                            className={`${tier.textColor === 'text-white' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} font-bold py-3 px-8 rounded-full transition-all hover:scale-105 hover:shadow-lg`}
                                        >
                                            Mua Ngay
                                        </button>
                                    </div>

                                    {/* Decorative sparkle for premium tiers */}
                                    {index >= 2 && (
                                        <div className="absolute bottom-4 right-4">
                                            <svg className="w-8 h-8 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {packages.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <div className="w-32 h-32 mx-auto mb-6">
                            <NutMascotHappy className="w-full h-full opacity-50" />
                        </div>
                        <p className="text-gray-500 text-lg">
                            Hien tai chua co goi hoi vien nao. Vui long quay lai sau!
                        </p>
                    </div>
                )}

                {/* Benefits Section */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                        Tai Sao Nen Tro Thanh Hoi Vien?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                            <div className="w-16 h-16 bg-brand-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">💰</span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Tiet Kiem Toi Da</h3>
                            <p className="text-gray-600 text-sm">Nhan voucher giam gia sau cho moi don hang</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎁</span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Qua Tang Doc Quyen</h3>
                            <p className="text-gray-600 text-sm">Nhan qua sinh nhat va uu dai dac biet</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⭐</span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Uu Tien Phuc Vu</h3>
                            <p className="text-gray-600 text-sm">Duoc ho tro 24/7 va truy cap som san pham moi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && selectedPackage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className={`${packageTiers[selectedTierIndex].bgColor} ${packageTiers[selectedTierIndex].textColor} p-6`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20">
                                        {(() => {
                                            const MascotComponent = packageTiers[selectedTierIndex].mascot;
                                            return <MascotComponent className="w-full h-full" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{packageTiers[selectedTierIndex].displayName}</h2>
                                        <p className="opacity-80">{packageTiers[selectedTierIndex].tagline}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* Package Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-2xl mb-1">🎟️</div>
                                    <div className="text-2xl font-bold text-brand">{selectedPackage.voucherQuantity}</div>
                                    <div className="text-xs text-gray-500">ma giam gia</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-2xl mb-1">💰</div>
                                    <div className="text-2xl font-bold text-brand-light">
                                        {selectedPackage.discountValue}{selectedPackage.discountType === 'percent' ? '%' : 'd'}
                                    </div>
                                    <div className="text-xs text-gray-500">giam/ma</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-2xl mb-1">📊</div>
                                    <div className="text-xl font-bold text-gray-700">
                                        {selectedPackage.maxDiscount > 0 ? `${formatPrice(selectedPackage.maxDiscount)}d` : 'Khong gioi han'}
                                    </div>
                                    <div className="text-xs text-gray-500">toi da/don</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-2xl mb-1">⏰</div>
                                    <div className="text-2xl font-bold text-brand">{selectedPackage.validityDays}</div>
                                    <div className="text-xs text-gray-500">ngay hieu luc</div>
                                </div>
                            </div>

                            {/* Price & Savings */}
                            <div className="bg-gradient-to-r from-brand to-brand-light rounded-xl p-4 mb-6 text-white text-center">
                                <div className="text-lg">Gia goi</div>
                                <div className="text-3xl font-bold">{formatPrice(selectedPackage.price)}d</div>
                                <div className="text-sm opacity-90 mt-1">
                                    Tiet kiem toi da: {formatPrice(selectedPackage.maxDiscount > 0
                                        ? (selectedPackage.maxDiscount * selectedPackage.voucherQuantity)
                                        : (Math.floor(selectedPackage.minOrderValue * selectedPackage.discountValue / 100) * selectedPackage.voucherQuantity)
                                    )}d
                                </div>
                            </div>

                            {/* Terms */}
                            {selectedPackage.terms && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        📜 Dieu Khoan Su Dung
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
                                            {selectedPackage.terms}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Important Notes */}
                            <div className="bg-brand-light/10 border border-brand-light/30 rounded-xl p-4">
                                <h4 className="font-bold text-brand mb-2">⚠️ Luu Y Quan Trong</h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Voucher co hieu luc {selectedPackage.validityDays} ngay ke tu ngay kich hoat</li>
                                    <li>• Ap dung cho don hang tu {formatPrice(selectedPackage.minOrderValue)}d tro len</li>
                                    <li>• Khong ap dung dong thoi voi cac chuong trinh khuyen mai khac</li>
                                    <li>• Voucher khong chuyen nhuong hoac doi thanh tien mat</li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all"
                                >
                                    Dong
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTermsModal(false);
                                        handleBuy(selectedPackage);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-brand to-brand-light hover:from-brand/90 hover:to-brand-light/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                                >
                                    Mua Ngay - {formatPrice(selectedPackage.price)}d
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
