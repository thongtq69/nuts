'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            // router.push('/cart'); // Optional: enforce non-empty cart
        }
    }, [cartItems, router]);

    const subtotal = cartTotal;
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: 'Hà Nội',
        district: '',
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

    const handlePlaceOrder = async () => {
        if (isProcessing) return;
        
        try {
            setIsProcessing(true);

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
                    city: formData.city,
                    district: formData.district,
                },
                paymentMethod,
                shippingFee,
                totalAmount: total,
                note: formData.note,
            };

            // Handle VNPay payment
            if (paymentMethod === 'vnpay') {
                const res = await fetch('/api/vnpay/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData),
                });

                const data = await res.json();
                
                if (!res.ok) {
                    console.error('VNPay error:', data);
                    throw new Error(data.message || 'Tạo thanh toán thất bại');
                }

                if (!data.paymentUrl) {
                    console.error('No payment URL returned:', data);
                    throw new Error('Không nhận được URL thanh toán từ VNPay');
                }

                console.log('Redirecting to VNPay:', data.paymentUrl);
                
                // Redirect to VNPay payment page
                window.location.href = data.paymentUrl;
                return;
            }

            // Handle COD and Banking
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Đặt hàng thất bại');
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
                                <label>Họ và tên</label>
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
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại</label>
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
                                <label>Địa chỉ</label>
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
                                    <label>Tỉnh / Thành phố</label>
                                    <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                                        <option>Hà Nội</option>
                                        <option>TP. Hồ Chí Minh</option>
                                        <option>Đà Nẵng</option>
                                        <option>Khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quận / Huyện</label>
                                    <select value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}>
                                        <option value="">Chọn Quận/Huyện</option>
                                        <option value="Ba Đình">Ba Đình</option>
                                        <option value="Cầu Giấy">Cầu Giấy</option>
                                        <option value="Hoàn Kiếm">Hoàn Kiếm</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
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
                            <label className={`payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="vnpay"
                                    checked={paymentMethod === 'vnpay'}
                                    onChange={() => setPaymentMethod('vnpay')}
                                />
                                <span>💳 Thanh toán qua VNPay</span>
                            </label>
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
                        
                        {paymentMethod === 'vnpay' && (
                            <div className="payment-note">
                                <p>✓ Hỗ trợ thanh toán qua ATM, Visa, MasterCard, JCB, QR Code</p>
                                <p>✓ Bảo mật cao với công nghệ mã hóa SSL</p>
                            </div>
                        )}
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

                            <div className="summary-row">
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString()}₫</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển</span>
                                <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}₫`}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span className="total-amount">{total.toLocaleString()}₫</span>
                            </div>

                            <button 
                                className="place-order-btn" 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Đang xử lý...' : (paymentMethod === 'vnpay' ? 'Thanh toán ngay' : 'Đặt hàng')}
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
            .payment-note {
                margin-top: 15px;
                padding: 15px;
                background: #f0f9ff;
                border-left: 3px solid #0ea5e9;
                border-radius: 4px;
            }
            .payment-note p {
                margin: 5px 0;
                font-size: 14px;
                color: #0c4a6e;
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
