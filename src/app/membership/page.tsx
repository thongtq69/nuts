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
                                    <div className="p-6 pt-0">
                                        <button
                                            onClick={() => handleBuy(pkg)}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                                        >
                                            Mua ngay
                                        </button>
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

            <Footer />
        </main>
    );
}
