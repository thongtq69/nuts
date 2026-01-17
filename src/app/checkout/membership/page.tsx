'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Suspense } from 'react';

function MembershipCheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const packageId = searchParams.get('packageId');
    const { user } = useAuth();
    const toast = useToast();

    const [pkg, setPkg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // User info
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        note: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!packageId) {
            router.push('/membership');
            return;
        }
        fetch(`/api/packages?id=${packageId}`) // Assuming list API can filter or I just fetch all and find
            .then(res => res.json())
            .then(data => {
                // Determine if data is array or single object based on API implementation
                // Existing /api/packages returns array.
                const found = Array.isArray(data) ? data.find((p: any) => p._id === packageId) : data;
                if (found) {
                    setPkg(found);
                } else {
                    toast.error('Không tìm thấy gói', 'Gói không tồn tại hoặc đã bị xóa.');
                    router.push('/membership');
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [packageId, router]);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        // Validation
        if (!formData.name || !formData.phone || !formData.address) {
            toast.warning('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin nhận hàng/liên hệ');
            return;
        }

        try {
            setIsProcessing(true);
            const res = await fetch('/api/packages/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId,
                    shippingInfo: formData
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Lỗi đặt hàng');

            // Success
            router.push('/checkout/membership/success');
        } catch (error: any) {
            toast.error('Lỗi đặt hàng', error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="container py-20 text-center">Đang tải...</div>;
    if (!pkg) return <div className="container py-20 text-center">Không tìm thấy gói</div>;

    return (
        <div className="container py-12">
            <h1 className="text-2xl font-bold mb-8">Thanh toán Gói Hội Viên</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Thông tin mua hàng</h3>
                    <form onSubmit={handlePlaceOrder}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Họ tên *</label>
                            <input
                                type="text" required
                                className="w-full border p-2 rounded"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                                <input
                                    type="tel" required
                                    className="w-full border p-2 rounded"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email" required disabled={!!user} // Email is identifier
                                    className="w-full border p-2 rounded bg-gray-50"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Địa chỉ (để gửi thẻ hoặc quà tặng nếu có) *</label>
                            <input
                                type="text" required
                                className="w-full border p-2 rounded"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Ghi chú</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                rows={2}
                                value={formData.note}
                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="bg-blue-50 p-4 rounded mb-6 text-sm text-blue-800">
                            <strong>Phương thức thanh toán:</strong> COD / Chuyển khoản.<br />
                            Nhân viên sẽ liên hệ xác nhận và hướng dẫn thanh toán. Tài khoản sẽ được kích hoạt sau khi thanh toán thành công.
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-amber-600 text-black font-bold py-3 rounded hover:bg-amber-700 transition disabled:bg-gray-400"
                        >
                            {isProcessing ? 'Đang xử lý...' : `Xác nhận đăng ký - ${new Intl.NumberFormat('vi-VN').format(pkg.price)}đ`}
                        </button>
                    </form>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-6 rounded border h-fit">
                    <h3 className="text-lg font-semibold mb-4">Thông tin gói</h3>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <div>
                            <div className="font-bold text-lg">{pkg.name}</div>
                            <div className="text-sm text-gray-600">Thời hạn: {pkg.validityDays} ngày</div>
                        </div>
                        <div className="font-bold text-amber-600 text-xl">
                            {new Intl.NumberFormat('vi-VN').format(pkg.price)}đ
                        </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• {pkg.voucherQuantity} voucher ưu đãi</li>
                        <li>• Giảm {pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'} cho đơn hàng</li>
                        <li>• Đặc quyền thành viên VIP</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function MembershipCheckoutPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Gói hội viên', href: '/membership' }, { label: 'Thanh toán' }]} />
            <Suspense fallback={<div className="text-center py-10">Đang tải...</div>}>
                <MembershipCheckoutContent />
            </Suspense>
            <Footer />
        </main>
    );
}
