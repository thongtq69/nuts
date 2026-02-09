'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function formatPrice(value: number): string {
    if (isNaN(value) || value === undefined || value === null) {
        return '0';
    }
    return Math.round(value).toLocaleString();
}

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, originalTotal, savingsTotal, getItemPrice } = useCart();

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giỏ hàng' }]} />

            <div className="container">
                <h1 className="page-title">Giỏ hàng của bạn</h1>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Giỏ hàng đang trống.</p>
                        <Link href="/products" className="continue-btn">Tiếp tục mua sắm</Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items-container">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item-card">
                                    <div className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </div>
                                    <div className="cart-item-info">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <div className="cart-item-prices">
                                            {item.isAgent && item.originalPrice !== getItemPrice(item) ? (
                                                <div className="price-display">
                                                    <span className="original-price-strikethrough">{formatPrice(item.originalPrice)}₫</span>
                                                    <span className="agent-price">{formatPrice(getItemPrice(item))}₫</span>
                                                </div>
                                            ) : (
                                                <span className="item-price">{formatPrice(item.originalPrice)}₫</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="cart-item-quantity">
                                        <div className="qty-control">
                                            <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>-</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="cart-item-subtotal">
                                        <span className="subtotal-label md:hidden">Tạm tính: </span>
                                        <span className="subtotal-value">{formatPrice(getItemPrice(item) * item.quantity)}₫</span>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="cart-item-remove" aria-label="Xóa sản phẩm">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3>Tổng giỏ hàng</h3>
                            <div className="summary-row">
                                <span>Giá gốc</span>
                                <span className="original-price-strikethrough">{formatPrice(originalTotal)}₫</span>
                            </div>
                            {savingsTotal > 0 && (
                                <div className="summary-row savings">
                                    <span>Tiết kiệm</span>
                                    <span className="savings-amount">-{formatPrice(savingsTotal)}₫</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(cartTotal)}₫</span>
                            </div>
                            <Link href="/checkout">
                                <button className="checkout-btn">Thanh toán</button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            <Footer />

            <style jsx>{`
                .price-display {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .original-price-strikethrough {
                    text-decoration: line-through;
                    color: #999;
                    font-size: 12px;
                }
                .agent-price {
                    color: #16a34a;
                    font-weight: 600;
                }
                .savings {
                    color: #16a34a;
                }
                .savings-amount {
                    font-weight: 600;
                    color: #16a34a;
                }
            `}</style>
        </main>
    );
}
