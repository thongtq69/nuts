'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import BankInfoDisplay from '@/components/payment/BankInfoDisplay';
import { useLocale } from '@/context/LocaleContext';

interface Province {
    code: number;
    name: string;
}

interface District {
    code: number;
    name: string;
}

interface Ward {
    code: number;
    name: string;
}

interface Voucher {
    _id: string;
    code: string;
    discountType: 'percent' | 'fixed' | string;
    discountValue: number;
    maxDiscount?: number;
    minOrderValue: number;
    expiresAt: string;
    isUsed: boolean;
}

interface ShippingTier {
    minWeight: number;
    maxWeight: number;
    basePrice?: number;
    extraPricePerKg?: number;
    isDirectMultiplier?: boolean;
}

interface ShippingZone {
    provinceNames: string[];
    tiers: ShippingTier[];
}

interface ShippingConfig {
    zones: ShippingZone[];
    fuelSurchargePercent?: number;
    vatPercent?: number;
}

interface SiteSettings {
    freeShippingThreshold?: number;
}

interface BankPaymentModalData {
    amount: number;
    paymentReference: string;
    customerName: string;
    orderCode: string;
    customerEmail?: string;
    customerPhone?: string;
}

interface OrderCreateResponse {
    _id?: string;
    paymentRef?: string;
    message?: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartTotal, originalTotal, savingsTotal, clearCart, getItemPrice } = useCart();
    const { user } = useAuth();
    const toast = useToast();
    const { t, href, apiPath, locale } = useLocale();
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherError, setVoucherError] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isVoucherApplied, setIsVoucherApplied] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('banking');
    const [paymentReference, setPaymentReference] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [bankPaymentModal, setBankPaymentModal] = useState<BankPaymentModalData | null>(null);

    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [manualVoucherCode, setManualVoucherCode] = useState('');

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [addressError, setAddressError] = useState('');
    const [shippingConfig, setShippingConfig] = useState<ShippingConfig | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        if (user) {
            setLoadingVouchers(true);
            fetch('/api/user/vouchers')
                .then(res => res.json() as Promise<Voucher[]>)
                .then(data => {
                    if (Array.isArray(data)) {
                        setVouchers(data.filter(v => !v.isUsed && new Date(v.expiresAt) > new Date()));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingVouchers(false));

        }

        // Fetch shipping config
        fetch('/api/admin/shipping')
            .then(res => res.json() as Promise<ShippingConfig>)
            .then(data => setShippingConfig(data))
            .catch(err => console.error('Error fetching shipping config:', err));

        // Fetch site settings for free shipping threshold
        fetch(apiPath('/api/settings'))
            .then(res => res.json() as Promise<SiteSettings>)
            .then(data => setSiteSettings(data))
            .catch(err => console.error('Error fetching settings:', err));
    }, [user, apiPath]);


    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch provinces');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProvinces(data);
                }
            })
            .catch(err => {
                console.error('Error fetching provinces:', err);
                setAddressError('Không thể tải danh sách tỉnh/thành. Vui lòng tải lại trang.');
            });
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            setDistricts([]);
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');

            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch districts');
                    return res.json();
                })
                .then(data => {
                    if (data.districts) {
                        setDistricts(data.districts);
                    }
                })
                .catch(err => {
                    console.error('Error fetching districts:', err);
                    toast.error('Lỗi tải quận/huyện', 'Không thể tải danh sách quận/huyện. Vui lòng thử lại.');
                });
        }
    }, [selectedProvince, toast]);

    useEffect(() => {
        if (selectedDistrict) {
            setWards([]);
            setSelectedWard('');

            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch wards');
                    return res.json();
                })
                .then(data => {
                    if (data.wards) {
                        setWards(data.wards);
                    }
                })
                .catch(err => {
                    console.error('Error fetching wards:', err);
                    toast.error('Lỗi tải phường/xã', 'Không thể tải danh sách phường/xã. Vui lòng thử lại.');
                });
        }
    }, [selectedDistrict, toast]);

    useEffect(() => {
        if (cartItems.length === 0) {
        }
    }, [cartItems, router]);

    const subtotal = cartTotal;
    const originalSubtotal = originalTotal;
    const savings = savingsTotal;

    const calculateShippingFee = () => {
        // Fallback default fee if config is missing
        const DEFAULT_FEE = 30000;

        // Check for free shipping threshold (Global setting)
        if (siteSettings?.freeShippingThreshold && subtotal >= siteSettings.freeShippingThreshold) {
            return 0;
        }

        if (!shippingConfig || !selectedProvince || cartItems.length === 0) {
            return DEFAULT_FEE;
        }


        const provinceName = provinces.find(p => p.code.toString() === selectedProvince)?.name;
        if (!provinceName) return DEFAULT_FEE;

        const zone = shippingConfig.zones.find((z) =>
            z.provinceNames.some((p: string) => p.includes(provinceName) || provinceName.includes(p))
        );

        if (!zone) return 35000; // Outside standard zones

        const totalWeight = cartItems.reduce((sum, item) => sum + (Number(item.weight) || 0.5) * item.quantity, 0);

        // Find applicable tier
        const sortedTiers = [...zone.tiers].sort((a, b) => a.minWeight - b.minWeight);

        // Match logic: Find the first tier where weight is less than or equal to its maxWeight
        // This handles gaps automatically (e.g. 2.5kg falls into 3-30kg tier if 0-2kg is too light)
        let tier = sortedTiers.find((t) => totalWeight <= t.maxWeight);

        // If still not found (weight exceeds all maxWeights), use the last tier
        if (!tier && sortedTiers.length > 0) {
            tier = sortedTiers[sortedTiers.length - 1];
        }


        if (!tier) return DEFAULT_FEE;

        let fee = 0;
        if (tier.isDirectMultiplier) {
            // Formula for heavy goods: Actual Weight * PricePerKg
            fee = totalWeight * (tier.extraPricePerKg || 0);
        } else {
            // Standard Formula: Base Price + (Extra Weight * PricePerKg)
            // Extra Weight = Actual Weight - Min Weight of this tier
            const basePrice = tier.basePrice || 0;
            const extraPricePerKg = tier.extraPricePerKg || 0;
            const extraWeight = Math.max(0, totalWeight - tier.minWeight);

            fee = basePrice + (extraWeight * extraPricePerKg);
        }

        // Apply Global Surcharges (Fuel & VAT)
        const fuelSurcharge = shippingConfig.fuelSurchargePercent || 0;
        const vat = shippingConfig.vatPercent || 0;

        if (fuelSurcharge > 0) {
            fee = fee * (1 + fuelSurcharge / 100);
        }
        if (vat > 0) {
            fee = fee * (1 + vat / 100);
        }

        // Final sanity check
        if (isNaN(fee) || fee < 0) return DEFAULT_FEE;

        return Math.round(fee);
    };


    const shippingFee = calculateShippingFee();
    const total = subtotal + shippingFee - appliedDiscount;

    const applyVoucherCode = async (code: string) => {
        if (!code) return;

        setVoucherCode(code);
        setVoucherError('');

        try {
            const res = await fetch('/api/vouchers/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    orderValue: subtotal,
                    items: cartItems.map(item => ({
                        productId: item.id,
                        unitPrice: getItemPrice(item),
                        quantity: item.quantity
                    }))
                })
            });
            const data = await res.json();

            if (!res.ok || !data.valid) {
                throw new Error(data.message || 'Mã không hợp lệ');
            }

            setAppliedDiscount(Number(data.discountAmount) || 0);
            setIsVoucherApplied(true);
            setShowVoucherModal(false);
        } catch (error: unknown) {
            setVoucherError(error instanceof Error ? error.message : 'Lỗi khi kiểm tra mã');
            setIsVoucherApplied(false);
            setAppliedDiscount(0);
        }
    };

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: '',
        district: '',
        ward: '',
        note: ''
    });

    const getBankPendingUrl = (paymentData: BankPaymentModalData) => {
        const params = new URLSearchParams({
            order: paymentData.orderCode,
            ref: paymentData.paymentReference,
            amount: paymentData.amount.toString(),
        });

        if (paymentData.customerName) params.set('name', paymentData.customerName);
        if (paymentData.customerEmail) params.set('email', paymentData.customerEmail);
        if (paymentData.customerPhone) params.set('phone', paymentData.customerPhone);

        return `/checkout/bank-pending?${params.toString()}`;
    };

    const goToBankPending = () => {
        if (!bankPaymentModal) return;
        router.push(href(getBankPendingUrl(bankPaymentModal)));
    };

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                address: user.address || prev.address
            }));
        }
    }, [user]);

    // Generate stable payment reference when banking is selected
    useEffect(() => {
        if (paymentMethod === 'banking' && !paymentReference) {
            setPaymentReference(`GO${Date.now().toString().slice(-6)}`);
        }
    }, [paymentMethod, paymentReference]);

    const handlePlaceOrder = async () => {
        if (isProcessing) return;

        if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
            toast.warning(t('Thiếu thông tin'), t('Vui lòng điền đầy đủ: Họ tên, Số điện thoại, Địa chỉ.'));
            return;
        }
        // Bắt buộc email cho khách vãng lai (chưa đăng nhập)
        if (!user && !formData.email.trim()) {
            toast.warning(t('Thiếu thông tin'), t('Vui lòng nhập email để nhận thông tin đơn hàng.'));
            return;
        }
        if (!user && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.warning(t('Email không hợp lệ'), t('Vui lòng kiểm tra lại định dạng email.'));
            return;
        }
        if (!selectedProvince || !selectedDistrict || !selectedWard) {
            toast.warning(t('Thiếu thông tin'), t('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã.'));
            return;
        }
        if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            toast.warning(t('Số điện thoại không hợp lệ'), t('Vui lòng kiểm tra lại số điện thoại.'));
            return;
        }

        try {
            setIsProcessing(true);

            const provinceName = provinces.find(p => p.code.toString() === selectedProvince)?.name || '';
            const districtName = districts.find(d => d.code.toString() === selectedDistrict)?.name || '';
            const wardName = wards.find(w => w.code.toString() === selectedWard)?.name || '';

            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: getItemPrice(item),
                    originalPrice: item.originalPrice,
                    image: item.image,
                    isAgent: item.isAgent
                })),
                shippingInfo: {
                    fullName: formData.name,
                    phone: formData.phone,
                    email: formData.email.trim() || undefined,
                    address: formData.address,
                    city: provinceName,
                    district: districtName,
                    ward: wardName,
                },
                paymentMethod,
                shippingFee,
                totalAmount: total,
                note: paymentMethod === 'banking' ? `${formData.note} [PaymentRef: ${paymentReference}]`.trim() : formData.note,
                voucherCode: isVoucherApplied ? voucherCode : undefined,
                paymentReference
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await res.json() as OrderCreateResponse;

            if (!res.ok) {
                throw new Error(data.message || t('Đặt hàng thất bại'));
            }

            if (paymentMethod === 'banking') {
                const orderCode = data?._id ? data._id.toString().slice(-6).toUpperCase() : paymentReference;
                setBankPaymentModal({
                    amount: total,
                    paymentReference: data?.paymentRef || paymentReference,
                    customerName: formData.name,
                    orderCode,
                    customerEmail: formData.email.trim() || undefined,
                    customerPhone: formData.phone.trim() || undefined,
                });
                clearCart();
                toast.success(t('Đã tạo đơn hàng'), t('Vui lòng quét QR để hoàn tất chuyển khoản.'));
                return;
            }

            clearCart();
            router.push(href('/checkout/success'));
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : t('Vui lòng thử lại sau.');
            toast.error(t('Đặt hàng thất bại'), message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giỏ hàng', href: '/cart' }, { label: 'Thanh toán' }]} />

            <div className="container">
                <h1 className="checkout-title">{t('Thanh toán')}</h1>

                <div className="checkout-layout">
                    {/* Left Column: Shipping Info */}
                    <div className="checkout-form-section">
                        <h3 className="section-header">{t('Thông tin giao hàng')}</h3>
                        <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); }}>
                            <div className="form-group">
                                <label>{t('Họ và tên')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder={t('Nhập họ và tên')}
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>
                                        Email
                                        {!user && <span className="text-red-500">*</span>}
                                        {user && <span className="text-gray-400 text-xs ml-1">{t('(tùy chọn)')}</span>}
                                    </label>
                                    <input
                                        type="email"
                                        placeholder={!user ? t('Nhập email để nhận thông tin đơn hàng') : t('Nhập email')}
                                        required={!user}
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {!user && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('Email sẽ được dùng để tra cứu đơn hàng và nhận thông báo')}
                                        </p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>{t('Số điện thoại')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        placeholder={t('Nhập số điện thoại')}
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('Địa chỉ')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder={t('Ví dụ: Số 23 ngõ 86...')}
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>{t('Tỉnh / Thành phố')} <span className="text-red-500">*</span></label>
                                    {addressError ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder={addressError}
                                                disabled
                                                className="border border-red-300 bg-red-50 text-red-600 text-sm p-3 w-full rounded"
                                            />
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-4 py-3 bg-brand text-white rounded hover:bg-brand-dark"
                                                title={t('Tải lại trang')}
                                            >
                                                ↻
                                            </button>
                                        </div>
                                    ) : provinces.length > 0 ? (
                                        <select
                                            value={selectedProvince}
                                            onChange={e => {
                                                setSelectedProvince(e.target.value);
                                                const provinceName = provinces.find(p => p.code.toString() === e.target.value)?.name || '';
                                                setFormData({ ...formData, city: provinceName });
                                            }}
                                            required
                                        >
                                            <option value="">{t('-- Chọn Tỉnh/Thành phố --')}</option>
                                            {provinces.map(province => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="text-gray-500 p-3 text-center border border-dashed border-gray-300 rounded">
                                            {t('Đang tải...')}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>{t('Quận / Huyện')} <span className="text-red-500">*</span></label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={e => {
                                            setSelectedDistrict(e.target.value);
                                            const districtName = districts.find(d => d.code.toString() === e.target.value)?.name || '';
                                            setFormData({ ...formData, district: districtName });
                                        }}
                                        disabled={!selectedProvince}
                                        required
                                    >
                                        <option value="">{t('-- Chọn Quận/Huyện --')}</option>
                                        {districts.map(district => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('Phường / Xã')} <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedWard}
                                    onChange={e => {
                                        setSelectedWard(e.target.value);
                                        const wardName = wards.find(w => w.code.toString() === e.target.value)?.name || '';
                                        setFormData({ ...formData, ward: wardName });
                                    }}
                                    disabled={!selectedDistrict}
                                    required
                                >
                                    <option value="">{t('-- Chọn Phường/Xã --')}</option>
                                    {wards.map(ward => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('Ghi chú đơn hàng (tùy chọn)')}</label>
                                <textarea
                                    rows={3}
                                    placeholder={t('Ví dụ: Giao hàng giờ hành chính...')}
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                ></textarea>
                            </div>
                        </form>

                        <h3 className="section-header mt-4">{t('Phương thức thanh toán')}</h3>
                        <div className="payment-methods">
                            {/* VNPay Disabled temporarily */}
                            <label className={`payment-option ${paymentMethod === 'banking' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="banking"
                                    checked={paymentMethod === 'banking'}
                                    onChange={() => setPaymentMethod('banking')}
                                />
                                <span>{t('🏦 Chuyển khoản ngân hàng')}</span>
                            </label>
                        </div>

                        {/* Bank Transfer Info */}
                        {paymentMethod === 'banking' && (
                            <div className="banking-info-section">
                                <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                                    <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                        {t('🔔 Hướng dẫn thanh toán')}
                                    </h4>
                                    <p className="text-sm text-amber-700 leading-relaxed">
                                        {t('Sau khi điền đủ thông tin và bấm thanh toán, hệ thống sẽ tạo đơn hàng và mở mã QR chuyển khoản. Đơn hàng tự xác nhận khi ACB ghi nhận giao dịch khớp số tiền và nội dung chuyển khoản.')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="order-summary-section">
                        <div className="order-summary-box">
                            <h3>{t('Đơn hàng của bạn')}</h3>
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">x {item.quantity}</span>
                                        </div>
                                        <span className="item-price">
                                            {item.isAgent && item.originalPrice !== getItemPrice(item) ? (
                                                <span className="agent-price-display">
                                                    <span className="original-strikethrough">{(item.originalPrice * item.quantity).toLocaleString()}₫</span>
                                                    <span className="discounted-price">{(getItemPrice(item) * item.quantity).toLocaleString()}₫</span>
                                                </span>
                                            ) : (
                                                (getItemPrice(item) * item.quantity).toLocaleString() + '₫'
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {savings > 0 && (
                                <div className="savings-row">
                                    <span>{t('💰 Tiết kiệm từ giá Đại lý/Bulk')}</span>
                                    <span className="savings-value">-{savings.toLocaleString()}₫</span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>{t('Giá gốc')}</span>
                                <span className="original-price-display">{originalSubtotal.toLocaleString()}₫</span>
                            </div>

                            {/* Voucher Selection */}
                            <div className="voucher-section">
                                <div className="voucher-header">
                                    <span className="voucher-icon">🎟️</span>
                                    <span className="voucher-label">{t('Mã giảm giá')}</span>
                                </div>

                                {isVoucherApplied ? (
                                    <div className="voucher-applied">
                                        <div className="voucher-applied-info">
                                            <div className="voucher-applied-code">{voucherCode}</div>
                                            <div className="voucher-applied-discount">-{appliedDiscount.toLocaleString()}đ</div>
                                        </div>
                                        <button
                                            className="voucher-remove-btn"
                                            onClick={() => {
                                                setIsVoucherApplied(false);
                                                setAppliedDiscount(0);
                                                setVoucherCode('');
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="voucher-select-btn"
                                        onClick={() => setShowVoucherModal(true)}
                                    >
                                        <span>{t('Chọn hoặc nhập mã')}</span>
                                        <span className="voucher-arrow">→</span>
                                    </button>
                                )}
                            </div>

                            {/* Voucher Modal */}
                            {showVoucherModal && (
                                <div className="voucher-modal-overlay" onClick={() => setShowVoucherModal(false)}>
                                    <div className="voucher-modal" onClick={e => e.stopPropagation()}>
                                        <div className="voucher-modal-header">
                                            <h3>{t('🎟️ Chọn mã giảm giá')}</h3>
                                            <button className="voucher-modal-close" onClick={() => setShowVoucherModal(false)}>✕</button>
                                        </div>

                                        {/* Manual Input */}
                                        <div className="voucher-input-section">
                                            <input
                                                type="text"
                                                className="voucher-input"
                                                placeholder={t('Nhập mã giảm giá')}
                                                value={manualVoucherCode}
                                                onChange={e => setManualVoucherCode(e.target.value.toUpperCase())}
                                            />
                                            <button
                                                className="voucher-apply-btn"
                                                onClick={() => {
                                                    applyVoucherCode(manualVoucherCode);
                                                    setManualVoucherCode('');
                                                }}
                                                disabled={!manualVoucherCode}
                                            >
                                                {t('Áp dụng')}
                                            </button>
                                        </div>
                                        {voucherError && <p className="voucher-error">{voucherError}</p>}

                                        {/* Voucher List */}
                                        <div className="voucher-list-section">
                                            <div className="voucher-list-title">{t('Voucher của bạn')} ({vouchers.length})</div>

                                            {loadingVouchers ? (
                                                <div className="voucher-loading">{t('Đang tải...')}</div>
                                            ) : vouchers.length === 0 ? (
                                                <div className="voucher-empty">
                                                    <span className="voucher-empty-icon">📭</span>
                                                    <p>{t('Bạn chưa có voucher nào')}</p>
                                                </div>
                                            ) : (
                                                <div className="voucher-list">
                                                    {vouchers.map(voucher => {
                                                        const canApply = subtotal >= voucher.minOrderValue;
                                                        return (
                                                            <div
                                                                key={voucher._id}
                                                                className={`voucher-card ${canApply ? '' : 'disabled'}`}
                                                                onClick={() => {
                                                                    if (canApply) {
                                                                        applyVoucherCode(voucher.code);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="voucher-card-left">
                                                                    <div className="voucher-card-discount">
                                                                        {voucher.discountType === 'percent'
                                                                            ? `${voucher.discountValue}%`
                                                                            : `${(voucher.discountValue / 1000).toFixed(0)}K`}
                                                                    </div>
                                                                    <div className="voucher-card-type">{t('GIẢM')}</div>
                                                                </div>
                                                                <div className="voucher-card-right">
                                                                    <div className="voucher-card-code">{voucher.code}</div>
                                                                    <div className="voucher-card-condition">
                                                                        {t('Đơn từ')} {voucher.minOrderValue.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}₫
                                                                    </div>
                                                                    <div className="voucher-card-expiry">
                                                                        {t('HSD:')} {new Date(voucher.expiresAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}
                                                                    </div>
                                                                    {!canApply && (
                                                                        <div className="voucher-card-warning">{t('Chưa đủ điều kiện')}</div>
                                                                    )}
                                                                </div>
                                                                {canApply && (
                                                                    <div className="voucher-card-select">
                                                                        <span>{t('Chọn')}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>{t('Tạm tính')}</span>
                                <span>{subtotal.toLocaleString()}₫</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('Phí vận chuyển')}</span>
                                <span>{shippingFee === 0 ? t('Miễn phí') : `${shippingFee.toLocaleString()}₫`}</span>
                            </div>
                            {isVoucherApplied && (
                                <div className="summary-row text-green-600 font-medium">
                                    <span>{t('Voucher giảm giá')}</span>
                                    <span>- {appliedDiscount.toLocaleString()}₫</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>{t('Tổng cộng')}</span>
                                <span className="total-amount">{total > 0 ? total.toLocaleString() : 0}₫</span>
                            </div>

                            <button
                                className="place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                {isProcessing ? t('Đang xử lý...') : t('Thanh toán')}
                            </button>

                            <div className="security-note">
                                {t('🔒 Bảo mật thanh toán 100%')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {bankPaymentModal && (
                <div className="payment-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="bank-payment-title">
                    <div className="payment-modal">
                        <div className="payment-modal-header">
                            <div>
                                <h3 id="bank-payment-title">{t('Thanh toán chuyển khoản')}</h3>
                                <p>{t('Đơn')} #{bankPaymentModal.orderCode}</p>
                            </div>
                            <button
                                className="payment-modal-close"
                                type="button"
                                aria-label={t('Đóng')}
                                onClick={goToBankPending}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="payment-modal-body">
                            <BankInfoDisplay
                                amount={bankPaymentModal.amount}
                                description={bankPaymentModal.paymentReference}
                                customerName={bankPaymentModal.customerName}
                            />
                        </div>
                        <div className="payment-modal-note">
                            {t('Đơn hàng đang ở trạng thái chờ thanh toán. Hệ thống chỉ tự xác nhận sau khi nhận được giao dịch khớp số tiền và nội dung chuyển khoản.')}
                        </div>
                        <div className="payment-modal-actions">
                            <button type="button" onClick={goToBankPending}>
                                {t('Tôi đã lưu thông tin thanh toán')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            <style jsx>{`
            h1 {
                margin-bottom: 30px;
            }
            .checkout-layout {
                display: grid;
                grid-template-columns: 1.5fr 1fr;
                gap: 50px;
                margin-bottom: 80px;
            }
            .section-header {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .mt-4 {
                margin-top: 40px;
            }
            
            /* Form Styles */
            .form-group {
                margin-bottom: 20px;
            }
            .form-group-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 14px;
            }
            .form-group input, 
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-family: inherit;
            }
            
            /* Payment Methods */
            .payment-methods {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .payment-option {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .payment-option.active {
                border-color: #9C7043;
                background: #fffdf9;
            }
            
            /* Order Summary */
            .order-summary-box {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 8px;
                border: 1px solid #eee;
            }
            .summary-items {
                margin-bottom: 20px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
            }
            .summary-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                font-size: 14px;
            }
            .item-name {
                font-weight: 500;
                margin-right: 5px;
            }
            .item-qty {
                color: #666;
                font-size: 12px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                color: #555;
                font-size: 15px;
            }
            .summary-row.total {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                font-weight: 700;
                font-size: 18px;
                color: #1f2937;
                align-items: center;
            }
            .total-amount {
                color: #9C7043;
                font-size: 24px;
            }

            .place-order-btn {
                width: 100%;
                padding: 15px;
                background: #9C7043;
                color: white;
                border: none;
                border-radius: 4px;
                font-weight: 600;
                font-size: 16px;
                margin-top: 25px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .place-order-btn:hover:not(:disabled) {
                background: #7d5a36;
            }
            .place-order-btn:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            .security-note {
                text-align: center;
                margin-top: 15px;
                font-size: 13px;
                color: #666;
            }

            .payment-modal-overlay {
                position: fixed;
                inset: 0;
                z-index: 1200;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background: rgba(17, 24, 39, 0.55);
            }
            .payment-modal {
                width: min(720px, 100%);
                max-height: min(92vh, 900px);
                overflow-y: auto;
                background: white;
                border-radius: 8px;
                box-shadow: 0 25px 60px rgba(17, 24, 39, 0.25);
            }
            .payment-modal-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                padding: 20px 24px;
                border-bottom: 1px solid #eee;
            }
            .payment-modal-header h3 {
                margin: 0;
                font-size: 22px;
                font-weight: 700;
                color: #1f2937;
            }
            .payment-modal-header p {
                margin: 6px 0 0;
                color: #6b7280;
                font-weight: 600;
            }
            .payment-modal-close {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #e5e7eb;
                border-radius: 50%;
                background: #fff;
                color: #374151;
                cursor: pointer;
            }
            .payment-modal-body {
                padding: 24px;
            }
            .payment-modal-note {
                margin: 0 24px 20px;
                padding: 14px 16px;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                background: #f0fdf4;
                color: #166534;
                font-size: 14px;
                font-weight: 600;
            }
            .payment-modal-actions {
                padding: 0 24px 24px;
                display: flex;
                justify-content: flex-end;
            }
            .payment-modal-actions button {
                min-width: 150px;
                padding: 13px 20px;
                border: none;
                border-radius: 6px;
                background: #9C7043;
                color: white;
                font-weight: 700;
                cursor: pointer;
            }
            .payment-modal-actions button:hover {
                background: #7d5a36;
            }

            /* Voucher Section Styles */
            .voucher-section {
                padding: 16px 0;
                border-top: 1px solid #eee;
                border-bottom: 1px solid #eee;
                margin-bottom: 16px;
            }
            .voucher-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            .voucher-icon {
                font-size: 18px;
            }
            .voucher-label {
                font-weight: 600;
                color: #333;
            }
            .voucher-select-btn {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #fff;
                border: 1px dashed #d1d5db;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                color: #666;
            }
            .voucher-select-btn:hover {
                border-color: #9C7044;
                color: #9C7044;
            }
            .voucher-arrow {
                font-size: 18px;
            }
            .voucher-applied {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
                border: 1px solid #E3E846;
                border-radius: 8px;
            }
            .voucher-applied-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .voucher-applied-code {
                font-weight: 700;
                color: #854d0e;
                font-size: 14px;
            }
            .voucher-applied-discount {
                background: #E3E846;
                color: #333;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
            }
            .voucher-remove-btn {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fee2e2;
                color: #dc2626;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            .voucher-remove-btn:hover {
                background: #dc2626;
                color: white;
            }

            /* Voucher Modal */
            .voucher-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            .voucher-modal {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 450px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
            }
            .voucher-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            .voucher-modal-header h3 {
                font-size: 18px;
                font-weight: 700;
                color: #333;
                margin: 0;
            }
            .voucher-modal-close {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f3f4f6;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                color: #666;
                transition: all 0.2s;
            }
            .voucher-modal-close:hover {
                background: #e5e7eb;
                color: #333;
            }
            .voucher-input-section {
                padding: 20px;
                background: #f9fafb;
                display: flex;
                gap: 10px;
            }
            .voucher-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 1px;
                transition: border-color 0.2s;
            }
            .voucher-input:focus {
                outline: none;
                border-color: #9C7043;
            }
            .voucher-input::placeholder {
                text-transform: none;
                font-weight: 400;
                letter-spacing: 0;
                color: #9ca3af;
            }
            .voucher-apply-btn {
                padding: 12px 24px;
                background: #9C7043;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .voucher-apply-btn:hover:not(:disabled) {
                background: #7d5a36;
            }
            .voucher-apply-btn:disabled {
                background: #d1d5db;
                cursor: not-allowed;
            }
            .voucher-error {
                color: #dc2626;
                font-size: 13px;
                padding: 0 20px 10px;
                margin: 0;
            }
            .voucher-list-section {
                flex: 1;
                overflow-y: auto;
                padding: 0 20px 20px;
            }
            .voucher-list-title {
                font-size: 13px;
                color: #666;
                margin-bottom: 12px;
                font-weight: 500;
            }
            .voucher-loading, .voucher-empty {
                text-align: center;
                padding: 40px 20px;
                color: #9ca3af;
            }
            .voucher-empty-icon {
                font-size: 48px;
                display: block;
                margin-bottom: 12px;
            }
            .voucher-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .voucher-card {
                display: flex;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s;
                background: white;
            }
            .voucher-card:hover:not(.disabled) {
                border-color: #9C7043;
                box-shadow: 0 4px 12px rgba(156, 112, 68, 0.15);
            }
            .voucher-card.disabled {
                opacity: 0.6;
                cursor: not-allowed;
                background: #f9fafb;
            }
            .voucher-card-left {
                width: 80px;
                background: linear-gradient(135deg, #9C7043 0%, #7d5a36 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 16px 8px;
                color: white;
            }
            .voucher-card.disabled .voucher-card-left {
                background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
            }
            .voucher-card-discount {
                font-size: 20px;
                font-weight: 800;
                line-height: 1;
            }
            .voucher-card-type {
                font-size: 10px;
                font-weight: 600;
                margin-top: 4px;
                opacity: 0.9;
            }
            .voucher-card-right {
                flex: 1;
                padding: 12px 16px;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            .voucher-card-code {
                font-weight: 700;
                color: #333;
                font-size: 14px;
                margin-bottom: 4px;
            }
            .voucher-card-condition {
                font-size: 12px;
                color: #666;
            }
            .voucher-card-expiry {
                font-size: 11px;
                color: #9ca3af;
                margin-top: 4px;
            }
            .voucher-card-warning {
                font-size: 11px;
                color: #dc2626;
                margin-top: 4px;
                font-weight: 500;
            }
            .voucher-card-select {
                display: flex;
                align-items: center;
                padding: 0 16px;
                color: #9C7043;
                font-weight: 600;
                font-size: 13px;
            }

            @media (max-width: 768px) {
                .checkout-layout {
                    grid-template-columns: 1fr;
                }
                .form-group-row {
                    grid-template-columns: 1fr;
                    gap: 0;
                }
                .order-summary-section {
                    order: initial;
                }
                .voucher-modal {
                    max-height: 90vh;
                    border-radius: 16px 16px 0 0;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    max-width: 100%;
                }
                .payment-modal-overlay {
                    align-items: flex-end;
                    padding: 0;
                }
                .payment-modal {
                    width: 100%;
                    max-height: 92vh;
                    border-radius: 12px 12px 0 0;
                }
                .payment-modal-header {
                    padding: 18px;
                }
                .payment-modal-body {
                    padding: 18px;
                }
                .payment-modal-note {
                    margin: 0 18px 18px;
                }
                .payment-modal-actions {
                    padding: 0 18px 18px;
                }
                .payment-modal-actions button {
                    width: 100%;
                }
                .savings-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #eee;
                    color: #16a34a;
                    font-weight: 600;
                }
                .savings-value {
                    color: #16a34a;
                }
                .agent-price-display {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .original-strikethrough {
                    text-decoration: line-through;
                    color: #999;
                    font-size: 12px;
                }
                .discounted-price {
                    color: #16a34a;
                    font-weight: 600;
                }
                .original-price-display {
                    text-decoration: line-through;
                    color: #999;
                }
                
                .banking-info-section {
                    margin-top: 20px;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            }
          `}</style>
        </main>
    );
}
