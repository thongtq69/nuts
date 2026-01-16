'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherError, setVoucherError] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isVoucherApplied, setIsVoucherApplied] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);

    // Voucher State
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [loadingVouchers, setLoadingVouchers] = useState(false);

    // Province/District/Ward State
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');

    // Fetch vouchers
    useEffect(() => {
        if (user) {
            setLoadingVouchers(true);
            fetch('/api/user/vouchers')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setVouchers(data.filter(v => !v.isUsed && new Date(v.expiresAt) > new Date()));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingVouchers(false));
        }
    }, [user]);

    // Fetch provinces on mount
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProvinces(data);
                }
            })
            .catch(err => console.error('Error fetching provinces:', err));
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            setDistricts([]);
            setWards([]);
            setSelectedDistrict('');
            setSelectedWard('');
            
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    if (data.districts) {
                        setDistricts(data.districts);
                    }
                })
                .catch(err => console.error('Error fetching districts:', err));
        }
    }, [selectedProvince]);

    // Fetch wards when district changes
    useEffect(() => {
        if (selectedDistrict) {
            setWards([]);
            setSelectedWard('');
            
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    if (data.wards) {
                        setWards(data.wards);
                    }
                })
                .catch(err => console.error('Error fetching wards:', err));
        }
    }, [selectedDistrict]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            // router.push('/cart'); // Optional: enforce non-empty cart
        }
    }, [cartItems, router]);

    const subtotal = cartTotal;
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee - appliedDiscount;

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

    // Update form data if user loads
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

    const handleApplyVoucher = async () => {
        if (!voucherCode) return;
        setVoucherError('');
        try {
            const res = await fetch('/api/vouchers/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: voucherCode, orderValue: subtotal })
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedDiscount(data.discountAmount);
                setIsVoucherApplied(true);
                alert(`Đã áp dụng mã: Giảm ${new Intl.NumberFormat('vi-VN').format(data.discountAmount)}đ`);
            } else {
                setVoucherError(data.message || 'Mã không hợp lệ');
                setAppliedDiscount(0);
                setIsVoucherApplied(false);
            }
        } catch (e) {
            setVoucherError('Lỗi khi kiểm tra mã');
        }
    };

    const handlePlaceOrder = async () => {
        if (isProcessing) return;

        // Strict Validation
        if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
            alert('Vui lòng điền đầy đủ: Họ tên, Số điện thoại, Địa chỉ.');
            return;
        }
        if (!selectedProvince || !selectedDistrict || !selectedWard) {
            alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã.');
            return;
        }
        if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            alert('Số điện thoại không hợp lệ.');
            return;
        }

        try {
            setIsProcessing(true);

            // Get names from selected codes
            const provinceName = provinces.find(p => p.code.toString() === selectedProvince)?.name || '';
            const districtName = districts.find(d => d.code.toString() === selectedDistrict)?.name || '';
            const wardName = wards.find(w => w.code.toString() === selectedWard)?.name || '';

            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image
                })),
                shippingInfo: {
                    fullName: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: provinceName,
                    district: districtName,
                    ward: wardName,
                },
                paymentMethod,
                shippingFee,
                totalAmount: total,
                note: formData.note,
                voucherCode: isVoucherApplied ? voucherCode : undefined // Send voucher to backend
            };

            // Only COD/Banking supported now
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Đặt hàng thất bại');
            }

            clearCart();
            router.push('/checkout/success');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Đặt hàng thất bại');
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
                <h1>Thanh toán</h1>

                <div className="checkout-layout">
                    {/* Left Column: Shipping Info */}
                    <div className="checkout-form-section">
                        <h3 className="section-header">Thông tin giao hàng</h3>
                        <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); }}>
                            <div className="form-group">
                                <label>Họ và tên <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Nhập họ và tên"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="Nhập email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        placeholder="Nhập số điện thoại"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Số 23 ngõ 86..."
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label>Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                                    <select 
                                        value={selectedProvince} 
                                        onChange={e => {
                                            setSelectedProvince(e.target.value);
                                            const provinceName = provinces.find(p => p.code.toString() === e.target.value)?.name || '';
                                            setFormData({ ...formData, city: provinceName });
                                        }}
                                        required
                                    >
                                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                        {provinces.map(province => (
                                            <option key={province.code} value={province.code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quận / Huyện <span className="text-red-500">*</span></label>
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
                                        <option value="">-- Chọn Quận/Huyện --</option>
                                        {districts.map(district => (
                                            <option key={district.code} value={district.code}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phường / Xã <span className="text-red-500">*</span></label>
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
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map(ward => (
                                        <option key={ward.code} value={ward.code}>
                                            {ward.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ghi chú đơn hàng (tùy chọn)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Ví dụ: Giao hàng giờ hành chính..."
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                ></textarea>
                            </div>
                        </form>

                        <h3 className="section-header mt-4">Phương thức thanh toán</h3>
                        <div className="payment-methods">
                            <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                <span>💵 Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            {/* VNPay Disabled temporarily */}
                            <label className={`payment-option ${paymentMethod === 'banking' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="banking"
                                    checked={paymentMethod === 'banking'}
                                    onChange={() => setPaymentMethod('banking')}
                                />
                                <span>🏦 Chuyển khoản ngân hàng</span>
                            </label>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="order-summary-section">
                        <div className="order-summary-box">
                            <h3>Đơn hàng của bạn</h3>
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">x {item.quantity}</span>
                                        </div>
                                        <span className="item-price">{(item.price * item.quantity).toLocaleString()}₫</span>
                                    </div>
                                ))}
                            </div>

                            {/* Voucher Input */}
                            <div className="mb-4 pt-4 border-t">
                                <label className="block text-sm font-medium mb-2">Mã voucher</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border p-2 rounded text-sm uppercase"
                                        placeholder="Nhập mã giảm giá"
                                        value={voucherCode}
                                        onChange={e => setVoucherCode(e.target.value)}
                                        disabled={isVoucherApplied}
                                    />
                                    {isVoucherApplied ? (
                                        <button
                                            className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                                            onClick={() => {
                                                setIsVoucherApplied(false);
                                                setAppliedDiscount(0);
                                                setVoucherCode('');
                                            }}
                                        >
                                            Xoá
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                                                onClick={() => setShowVoucherModal(true)}
                                            >
                                                Chọn
                                            </button>
                                            <button
                                                className="bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-black"
                                                onClick={handleApplyVoucher}
                                            >
                                                Áp dụng
                                            </button>
                                        </>
                                    )}
                                </div>
                                {voucherError && <p className="text-red-500 text-xs mt-1">{voucherError}</p>}
                            </div>

                            {/* Voucher Selection Modal */}
                            {showVoucherModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                                        <div className="p-4 border-b flex justify-between items-center">
                                            <h3 className="font-bold text-lg">Chọn Voucher của bạn</h3>
                                            <button onClick={() => setShowVoucherModal(false)} className="text-gray-500 hover:text-black">
                                                ✕
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-y-auto flex-1 space-y-3">
                                            {loadingVouchers ? (
                                                <div className="text-center py-4 text-gray-500">Đang tải voucher...</div>
                                            ) : vouchers.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>Bạn chưa có voucher nào khả dụng.</p>
                                                </div>
                                            ) : (
                                                vouchers.map(voucher => {
                                                    const canApply = subtotal >= voucher.minOrderValue;
                                                    return (
                                                        <div
                                                            key={voucher._id}
                                                            className={`border rounded-lg p-3 transition-colors relative ${canApply ? 'hover:border-amber-500 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                                                            onClick={() => {
                                                                if (canApply) {
                                                                    // Set voucher code and auto-apply
                                                                    setVoucherCode(voucher.code);
                                                                    setShowVoucherModal(false);
                                                                    // Calculate discount
                                                                    let discount = 0;
                                                                    if (voucher.discountType === 'percent') {
                                                                        discount = Math.floor(subtotal * voucher.discountValue / 100);
                                                                        if (voucher.maxDiscount && discount > voucher.maxDiscount) {
                                                                            discount = voucher.maxDiscount;
                                                                        }
                                                                    } else {
                                                                        discount = voucher.discountValue;
                                                                    }
                                                                    setAppliedDiscount(discount);
                                                                    setIsVoucherApplied(true);
                                                                    setVoucherError('');
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-bold text-amber-600">{voucher.code}</div>
                                                                    <div className="text-sm font-medium mt-1">
                                                                        Giảm {voucher.discountType === 'percent' ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString()}đ`}
                                                                        {voucher.maxDiscount > 0 && voucher.discountType === 'percent' && (
                                                                            <span className="text-gray-500"> (tối đa {voucher.maxDiscount.toLocaleString()}đ)</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        Đơn tối thiểu: {voucher.minOrderValue.toLocaleString()}đ
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        HSD: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                                                                    </div>
                                                                    {!canApply && (
                                                                        <div className="text-xs text-red-500 mt-1">
                                                                            Đơn hàng chưa đủ điều kiện
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className={`text-xs px-2 py-1 rounded-full ${canApply ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {canApply ? 'Áp dụng' : 'Không đủ ĐK'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString()}₫</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển</span>
                                <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}₫`}</span>
                            </div>
                            {isVoucherApplied && (
                                <div className="summary-row text-green-600 font-medium">
                                    <span>Voucher giảm giá</span>
                                    <span>- {appliedDiscount.toLocaleString()}₫</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span className="total-amount">{total > 0 ? total.toLocaleString() : 0}₫</span>
                            </div>

                            <button
                                className="place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
                            </button>

                            <div className="security-note">
                                🔒 Bảo mật thanh toán 100%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                border-color: var(--color-primary-brown);
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
                color: var(--color-text-dark);
                align-items: center;
            }
            .total-amount {
                color: var(--color-primary-brown);
                font-size: 24px;
            }

            .place-order-btn {
                width: 100%;
                padding: 15px;
                background: var(--color-primary-brown);
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
                background: #7a5a36;
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

            @media (max-width: 768px) {
                .checkout-layout {
                    grid-template-columns: 1fr;
                }
                .order-summary-section {
                    order: -1; 
                }
            }
          `}</style>
        </main>
    );
}
