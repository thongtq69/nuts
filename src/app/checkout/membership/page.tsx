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
import BankInfoDisplay from '@/components/payment/BankInfoDisplay';

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

const CheckIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ShieldIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
);

function MembershipCheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const packageId = searchParams.get('packageId');
    const { user } = useAuth();
    const toast = useToast();

    const [pkg, setPkg] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderInfo, setOrderInfo] = useState<{orderId: string, vouchersCount: number} | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('banking');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!packageId) {
            router.push('/subscriptions');
            return;
        }
        fetch(`/api/packages?id=${packageId}`)
            .then(res => res.json())
            .then(data => {
                const found = Array.isArray(data) ? data.find((p: any) => p._id === packageId) : data;
                if (found) {
                    setPkg(found);
                } else {
                    toast.error('Không tìm thấy gói', 'Gói không tồn tại hoặc đã bị xóa.');
                    router.push('/subscriptions');
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [packageId, router, toast]);

    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    const handlePlaceOrder = async () => {
        if (isProcessing) return;

        // For banking, require payment confirmation first
        if (paymentMethod === 'banking' && !paymentConfirmed) {
            toast.info('Xác nhận thanh toán', 'Vui lòng quét mã QR và xác nhận đã chuyển khoản');
            return;
        }

        try {
            setIsProcessing(true);
            const res = await fetch('/api/packages/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId,
                    paymentMethod
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Lỗi đặt hàng');

            setOrderInfo({
                orderId: data.orderId,
                vouchersCount: data.vouchersCount
            });
            setOrderPlaced(true);
        } catch (error: any) {
            toast.error('Lỗi đặt hàng', error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-brand/20 rounded-full" />
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-6 text-gray-500">Đang tải thông tin gói...</p>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                </div>
                <p className="text-gray-500 text-lg">Không tìm thấy gói hội viên</p>
                <button onClick={() => router.push('/subscriptions')} className="mt-4 text-brand hover:underline">
                    Quay lại trang gói VIP
                </button>
            </div>
        );
    }

    const maxSavings = pkg.maxDiscount > 0 
        ? pkg.maxDiscount * pkg.voucherQuantity 
        : Math.floor(pkg.minOrderValue * pkg.discountValue / 100) * pkg.voucherQuantity;

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumb items={[
                { label: 'Gói hội viên', href: '/subscriptions' }, 
                { label: 'Thanh toán' }
            ]} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                {/* Form Section */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-brand to-brand-light p-6 text-white">
                            <h1 className="text-2xl font-bold">Thanh toán Gói Hội viên</h1>
                            <p className="text-white/80 text-sm mt-1">Hoàn tất đăng ký của bạn</p>
                        </div>

                        <form className="p-6 space-y-6">
                            {/* User Info - Simple for membership */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ tên
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none bg-gray-50"
                                        placeholder="Nhập họ và tên"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none bg-gray-50"
                                        placeholder="Nhập số điện thoại"
                                        value={formData.phone}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none"
                                    value={formData.email}
                                    disabled
                                />
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">💵</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Phương thức thanh toán</h3>
                                        <p className="text-sm text-gray-600">
                                            Chọn phương thức thanh toán phù hợp với bạn
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Payment Method Selection */}
                                <div className="flex gap-3 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('banking')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                            paymentMethod === 'banking' 
                                                ? 'border-brand bg-brand text-white' 
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span>🏦</span>
                                        <span className="font-medium">Chuyển khoản</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                            paymentMethod === 'cod' 
                                                ? 'border-brand bg-brand text-white' 
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <span>💵</span>
                                        <span className="font-medium">Thanh toán khi nhận hàng</span>
                                    </button>
                                </div>
                                
                                {/* Bank Transfer Info */}
                                {paymentMethod === 'banking' && (
                                    <div className="mt-4">
                                        <BankInfoDisplay 
                                            amount={pkg.price}
                                            description={`VIP${pkg._id.slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}`}
                                        />
                                    </div>
                                )}

                                {paymentMethod === 'cod' && (
                                    <div className="mt-4 p-4 bg-amber-100/50 rounded-lg">
                                        <p className="text-sm text-amber-800">
                                            💡 <strong>Lưu ý:</strong> Với phương thức COD, gói hội viên sẽ được kích hoạt sau khi bạn thanh toán tiền mặt cho nhân viên giao hàng.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Confirmation for Banking */}
                            {paymentMethod === 'banking' && !paymentConfirmed && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl">✓</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-800 mb-1">Xác nhận đã chuyển khoản</h4>
                                            <p className="text-sm text-green-700 mb-3">
                                                Sau khi quét mã QR và chuyển khoản, hãy xác nhận để hoàn tất đăng ký.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentConfirmed(true)}
                                                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>✓</span>
                                                <span>Đã chuyển khoản - Xác nhận</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || (paymentMethod === 'banking' && !paymentConfirmed)}
                                className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                    isProcessing || (paymentMethod === 'banking' && !paymentConfirmed)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-brand to-brand-light text-white hover:shadow-lg hover:shadow-brand/30'
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        {paymentMethod === 'banking' ? '✅ Gửi yêu cầu xác nhận thanh toán' : '📦 Gửi yêu cầu đăng ký'} - {formatPrice(pkg.price)}đ
                                    </>
                                )}
                            </button>

                            {/* Cancel Confirmation Button */}
                            {paymentMethod === 'banking' && paymentConfirmed && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentConfirmed(false)}
                                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-all"
                                >
                                    ← Quay lại
                                </button>
                            )}

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <ShieldIcon className="w-5 h-5 text-green-500" />
                                <span>Thông tin được bảo mật tuyệt đối</span>
                            </div>
                        </form>

                        {/* Order Placed Success View */}
                        {orderPlaced && (
                            <div className="p-6 animate-in fade-in duration-500">
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="text-4xl">✓</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        {paymentMethod === 'banking' 
                                            ? 'Đơn hàng đang chờ xác nhận'
                                            : 'Đăng ký thành công!'}
                                    </h2>
                                    
                                    {paymentMethod === 'banking' ? (
                                        <div className="space-y-4">
                                            <p className="text-gray-600">
                                                Cảm ơn bạn đã đăng ký! Đơn hàng của bạn đang chờ hệ thống kiểm tra và xác nhận thanh toán.
                                            </p>
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-xl">ℹ️</span>
                                                    <div className="text-sm text-amber-800">
                                                        <p className="font-semibold mb-1">Quy trình xác nhận:</p>
                                                        <ol className="list-decimal list-inside space-y-1">
                                                            <li>Hệ thống kiểm tra khoản chuyển</li>
                                                            <li>Xác nhận và kích hoạt gói VIP</li>
                                                            <li>Gửi email thông báo qua {formData.email}</li>
                                                        </ol>
                                                        <p className="mt-2">Thời gian xử lý: 1-24 giờ</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">
                                            Yêu cầu đã được ghi nhận. Gói VIP và voucher chỉ được kích hoạt sau khi hệ thống xác nhận đã thanh toán.
                                        </p>
                                    )}

                                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                                        <p className="font-mono font-bold text-lg">{orderInfo?.orderId}</p>
                                    </div>

                                    <div className="mt-6 flex gap-4 justify-center">
                                        <button
                                            onClick={() => router.push('/account')}
                                            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                                        >
                                            Xem tài khoản
                                        </button>
                                        <button
                                            onClick={() => router.push('/')}
                                            className="px-6 py-3 bg-brand text-white font-medium rounded-xl hover:bg-brand/90 transition-all"
                                        >
                                            Về trang chủ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Thông tin gói</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Package Info */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-brand/10 to-brand-light/10 rounded-xl flex items-center justify-center">
                                        <span className="text-3xl">⭐</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-lg">{pkg.name}</h3>
                                        <p className="text-sm text-gray-500">{pkg.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-gradient-to-r from-brand to-brand-light rounded-xl p-5 text-white">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-white/80 text-sm">Giá gói</span>
                                    <span className="text-3xl font-black">{formatPrice(pkg.price)}đ</span>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Quyền lợi</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckIcon className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            <strong>{pkg.voucherQuantity}</strong> voucher giảm giá
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckIcon className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            Giảm <strong>{pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}</strong> mỗi đơn
                                            {pkg.maxDiscount > 0 && ` (tối đa ${formatPrice(pkg.maxDiscount)}đ)`}
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <CheckIcon className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">
                                            Hiệu lực <strong>{pkg.validityDays} ngày</strong>
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Savings */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">💰</span>
                                    <span className="font-semibold text-green-700">Tiết kiệm tối đa</span>
                                </div>
                                <div className="text-2xl font-black text-green-600">{formatPrice(maxSavings)}đ</div>
                            </div>

                            {/* Notes */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <h4 className="font-semibold text-amber-800 text-sm mb-2">⚠️ Lưu ý</h4>
                                <ul className="text-xs text-amber-700 space-y-1">
                                    <li>• Voucher có hiệu lực {pkg.validityDays} ngày từ ngày kích hoạt</li>
                                    <li>• Áp dụng cho đơn từ {formatPrice(pkg.minOrderValue)}đ trở lên</li>
                                    <li>• Không áp dụng cùng chương trình KM khác</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MembershipCheckoutPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />
            <Suspense fallback={
                <div className="container mx-auto px-4 py-32 text-center">
                    <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
            }>
                <MembershipCheckoutContent />
            </Suspense>
            <Footer />
        </main>
    );
}
