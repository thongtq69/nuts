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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {packages.map((pkg, index) => {
                            // Màu sắc cho từng gói
                            const colors = [
                                { gradient: 'from-blue-500 to-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
                                { gradient: 'from-amber-500 to-amber-600', button: 'bg-amber-600 hover:bg-amber-700' },
                                { gradient: 'from-purple-500 to-purple-600', button: 'bg-purple-600 hover:bg-purple-700' },
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div key={pkg._id} className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 bg-white flex flex-col h-full">
                                    <div className={`bg-gradient-to-r ${color.gradient} p-6 text-white text-center`}>
                                        <h3 className="text-2xl font-bold">{pkg.name}</h3>
                                        <div className="mt-3 text-4xl font-extrabold">
                                            {new Intl.NumberFormat('vi-VN').format(pkg.price)}đ
                                        </div>
                                        <div className="text-sm opacity-90 mt-2">Hiệu lực {pkg.validityDays} ngày</div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <ul className="space-y-4 mb-6 flex-1">
                                            <li className="flex items-start">
                                                <span className="text-green-500 mr-3 text-xl">✓</span>
                                                <span className="font-semibold text-slate-800">Nhận {pkg.voucherQuantity} mã giảm giá</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-500 mr-3 text-xl">✓</span>
                                                <span className="text-slate-700">
                                                    Giảm {pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}
                                                    {pkg.maxDiscount > 0 && ` (tối đa ${new Intl.NumberFormat('vi-VN').format(pkg.maxDiscount)}đ)`}
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="text-green-500 mr-3 text-xl">✓</span>
                                                <span className="text-slate-700">Áp dụng cho đơn từ {new Intl.NumberFormat('vi-VN').format(pkg.minOrderValue)}đ</span>
                                            </li>
                                            {pkg.description && (
                                                <li className="flex items-start text-slate-500 text-sm italic mt-4 pt-4 border-t border-slate-200">
                                                    <span className="mr-2">ℹ️</span>
                                                    {pkg.description}
                                                </li>
                                            )}
                                        </ul>

                                        <button
                                            onClick={() => handleBuy(pkg)}
                                            className={`w-full ${color.button} text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg mt-auto`}
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
