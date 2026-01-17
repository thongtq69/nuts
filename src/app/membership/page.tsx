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

export default function MembershipPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        fetch('/api/packages')
            .then(res => res.json())
            .then(data => {
                // Filter active packages
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
        // Redirect to specialized checkout for membership
        router.push(`/checkout/membership?packageId=${pkg._id}`);
    };

    const handleViewTerms = (pkg: Package) => {
        setSelectedPackage(pkg);
        setShowTermsModal(true);
    };

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Gói hội viên' }]} />

            <div className="container py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Nâng Cấp Hội Viên - Nhận Ngàn Ưu Đãi</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Trở thành hội viên VIP để nhận ngay bộ voucher độc quyền, giảm giá sâu cho mỗi đơn hàng và cơ hội tích lũy hoa hồng hấp dẫn.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">Đang tải các gói...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {packages.map((pkg, index) => {
                            // Màu sắc cho từng gói theo thứ tự
                            const colors = [
                                { 
                                    gradient: 'from-orange-400 to-orange-500', 
                                    button: 'bg-orange-500 hover:bg-orange-600',
                                    icon: '🥉',
                                    badge: 'bg-orange-100 text-orange-700'
                                },
                                { 
                                    gradient: 'from-gray-400 to-gray-500', 
                                    button: 'bg-gray-500 hover:bg-gray-600',
                                    icon: '🥈',
                                    badge: 'bg-gray-100 text-gray-700'
                                },
                                { 
                                    gradient: 'from-yellow-400 to-yellow-500', 
                                    button: 'bg-yellow-500 hover:bg-yellow-600',
                                    icon: '🥇',
                                    badge: 'bg-yellow-100 text-yellow-700'
                                },
                                { 
                                    gradient: 'from-purple-400 to-purple-500', 
                                    button: 'bg-purple-500 hover:bg-purple-600',
                                    icon: '✨',
                                    badge: 'bg-purple-100 text-purple-700'
                                },
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div key={pkg._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden border border-gray-200">
                                    {/* Header với icon và tên */}
                                    <div className="text-center p-6 border-b border-gray-100">
                                        <div className="text-4xl mb-2">{color.icon}</div>
                                        <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                                        <div className="text-3xl font-bold text-orange-500 mt-2">
                                            {new Intl.NumberFormat('vi-VN').format(pkg.price)}đ
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                            Tiết kiệm lên đến {pkg.maxDiscount > 0 
                                ? `${new Intl.NumberFormat('vi-VN').format(pkg.maxDiscount * pkg.voucherQuantity)} VND`
                                : `${new Intl.NumberFormat('vi-VN').format(Math.floor(pkg.minOrderValue * pkg.discountValue / 100) * pkg.voucherQuantity)} VND`
                            }
                        </div>
                                    </div>

                                    {/* Thông tin chi tiết */}
                                    <div className="p-6 space-y-4">
                                        {/* Mô tả gói */}
                                        {pkg.description && (
                                            <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm text-blue-700 font-medium">{pkg.description}</p>
                                            </div>
                                        )}

                                        {/* Số lượng voucher */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                                                <span className="text-red-600 text-xs">🎟️</span>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                <strong>{pkg.voucherQuantity}</strong> mã giảm giá
                                            </span>
                                        </div>

                                        {/* Giá trị giảm */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                                                <span className="text-yellow-600 text-xs">💰</span>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                Giảm <strong>{pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}</strong>
                                            </span>
                                        </div>

                                        {/* Tối đa */}
                                        {pkg.maxDiscount > 0 && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                    <span className="text-blue-600 text-xs">📊</span>
                                                </div>
                                                <span className="text-sm text-gray-700">
                                                    Tối đa <strong>{new Intl.NumberFormat('vi-VN').format(pkg.maxDiscount)}đ</strong>/đơn
                                                </span>
                                            </div>
                                        )}

                                        {/* Đơn tối thiểu */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                                <span className="text-green-600 text-xs">🛒</span>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                Đơn từ <strong>{new Intl.NumberFormat('vi-VN').format(pkg.minOrderValue)}đ</strong>
                                            </span>
                                        </div>

                                        {/* Hiệu lực */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                                                <span className="text-purple-600 text-xs">⏰</span>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                Hiệu lực <strong>{pkg.validityDays}</strong> ngày
                                            </span>
                                        </div>

                                        {/* Tiết kiệm được */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                                            <div className="text-center">
                                                <div className="text-xs text-yellow-600 font-medium">💡 Tiết kiệm tối đa: {new Intl.NumberFormat('vi-VN').format(pkg.maxDiscount > 0 
                                                    ? (pkg.maxDiscount * pkg.voucherQuantity)
                                                    : (Math.floor(pkg.minOrderValue * pkg.discountValue / 100) * pkg.voucherQuantity)
                                                )}đ</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nút mua */}
                                    <div className="p-6 pt-0 space-y-3">
                                        <button
                                            onClick={() => handleBuy(pkg)}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                                        >
                                            Mua ngay
                                        </button>
                                        
                                        {pkg.terms && (
                                            <button
                                                onClick={() => handleViewTerms(pkg)}
                                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-all text-sm"
                                            >
                                                📋 Xem chi tiết thể lệ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {packages.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-500">
                        Hiện tại chưa có gói hội viên nào. Vui lòng quay lại sau!
                    </div>
                )}
            </div>

            {/* Modal hiển thị thể lệ - Thiết kế mới */}
            {showTermsModal && selectedPackage && (
                <div className="membership-modal fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="membership-modal-content bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">
                                        {selectedPackage.name.includes('Đồng') ? '🥉' : 
                                         selectedPackage.name.includes('Bạc') ? '🥈' : 
                                         selectedPackage.name.includes('Vàng') ? '🥇' : '✨'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedPackage.name}</h2>
                                        <p className="text-orange-100 mt-1">
                                            Tiết kiệm lên đến {selectedPackage.maxDiscount > 0 
                                                ? `${new Intl.NumberFormat('vi-VN').format(selectedPackage.maxDiscount * selectedPackage.voucherQuantity)} VND`
                                                : `${new Intl.NumberFormat('vi-VN').format(Math.floor(selectedPackage.minOrderValue * selectedPackage.discountValue / 100) * selectedPackage.voucherQuantity)} VND`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content - Layout 2 cột */}
                        <div className="flex flex-col lg:flex-row max-h-[calc(95vh-200px)]">
                            {/* Cột trái - Thông tin gói */}
                            <div className="lg:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
                                <div className="sticky top-0">
                                    {/* Giá */}
                                    <div className="text-center mb-6 p-4 bg-white rounded-xl shadow-sm package-info-card">
                                        <div className="text-3xl font-bold text-orange-500 mb-2">
                                            {new Intl.NumberFormat('vi-VN').format(selectedPackage.price)}đ
                                        </div>
                                        {selectedPackage.description && (
                                            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                                                {selectedPackage.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Thông tin chi tiết */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-800 text-lg mb-4">📋 Thông tin chi tiết</h3>
                                        
                                        {/* Grid 2x2 cho thông tin */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Số voucher */}
                                            <div className="package-info-card bg-white p-4 rounded-xl shadow-sm text-center">
                                                <div className="text-2xl mb-2">🎟️</div>
                                                <div className="text-2xl font-bold text-blue-600">{selectedPackage.voucherQuantity}</div>
                                                <div className="text-xs text-gray-500">mã giảm giá</div>
                                            </div>

                                            {/* Giá trị giảm */}
                                            <div className="package-info-card bg-white p-4 rounded-xl shadow-sm text-center">
                                                <div className="text-2xl mb-2">💰</div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {selectedPackage.discountValue}{selectedPackage.discountType === 'percent' ? '%' : 'đ'}
                                                </div>
                                                <div className="text-xs text-gray-500">giảm/mã</div>
                                            </div>

                                            {/* Tối đa */}
                                            <div className="package-info-card bg-white p-4 rounded-xl shadow-sm text-center">
                                                <div className="text-2xl mb-2">📊</div>
                                                <div className="text-lg font-bold text-purple-600">
                                                    {selectedPackage.maxDiscount > 0 
                                                        ? `${new Intl.NumberFormat('vi-VN').format(selectedPackage.maxDiscount)}đ`
                                                        : 'Không giới hạn'
                                                    }
                                                </div>
                                                <div className="text-xs text-gray-500">tối đa/đơn</div>
                                            </div>

                                            {/* Hiệu lực */}
                                            <div className="package-info-card bg-white p-4 rounded-xl shadow-sm text-center">
                                                <div className="text-2xl mb-2">⏰</div>
                                                <div className="text-2xl font-bold text-orange-600">{selectedPackage.validityDays}</div>
                                                <div className="text-xs text-gray-500">ngày hiệu lực</div>
                                            </div>
                                        </div>

                                        {/* Đơn tối thiểu */}
                                        <div className="package-info-card bg-white p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">🛒</div>
                                                <div>
                                                    <div className="font-bold text-gray-800">Đơn hàng tối thiểu</div>
                                                    <div className="text-lg font-bold text-red-600">
                                                        {new Intl.NumberFormat('vi-VN').format(selectedPackage.minOrderValue)}đ
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tiết kiệm tối đa */}
                                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-xl text-white package-info-card">
                                            <div className="text-center">
                                                <div className="text-2xl mb-2">💡</div>
                                                <div className="text-sm font-medium">Tiết kiệm tối đa lên đến</div>
                                                <div className="text-2xl font-bold">
                                                    {new Intl.NumberFormat('vi-VN').format(selectedPackage.maxDiscount > 0 
                                                        ? (selectedPackage.maxDiscount * selectedPackage.voucherQuantity)
                                                        : (Math.floor(selectedPackage.minOrderValue * selectedPackage.discountValue / 100) * selectedPackage.voucherQuantity)
                                                    )}đ
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cột phải - Thể lệ */}
                            <div className="lg:w-2/3 p-6 overflow-y-auto">
                                <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
                                    📜 Điều khoản sử dụng gói
                                </h3>
                                
                                <div className="prose prose-sm max-w-none">
                                    {selectedPackage.terms ? (
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <div className="whitespace-pre-line text-gray-700 leading-relaxed text-base">
                                                {selectedPackage.terms}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-12">
                                            <div className="text-6xl mb-4">📋</div>
                                            <h4 className="text-xl font-medium mb-2">Chưa có thông tin thể lệ</h4>
                                            <p>Thông tin chi tiết sẽ được cập nhật sớm nhất có thể.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Lưu ý quan trọng */}
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                        ⚠️ Lưu ý quan trọng
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Voucher có hiệu lực {selectedPackage.validityDays} ngày kể từ ngày kích hoạt</li>
                                        <li>• Áp dụng cho đơn hàng từ {new Intl.NumberFormat('vi-VN').format(selectedPackage.minOrderValue)}đ trở lên</li>
                                        <li>• Không áp dụng đồng thời với các chương trình khuyến mãi khác</li>
                                        <li>• Voucher không thể chuyển nhượng hoặc đổi thành tiền mặt</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTermsModal(false);
                                        handleBuy(selectedPackage);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                    🛒 Mua ngay - {new Intl.NumberFormat('vi-VN').format(selectedPackage.price)}đ
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
