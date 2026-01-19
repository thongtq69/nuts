'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

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
                        <div className="cart-items">
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Giá</th>
                                        <th>Số lượng</th>
                                        <th>Tạm tính</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="product-col">
                                                <img src={item.image} alt={item.name} />
                                                <span>{item.name}</span>
                                            </td>
                                            <td>
                                                <div className="price-display">
                                                    {item.isAgent && item.originalPrice !== getItemPrice(item) ? (
                                                        <>
                                                            <span className="original-price-strikethrough">{(item.originalPrice ?? getItemPrice(item)).toLocaleString()}₫</span>
                                                            <span className="agent-price">{getItemPrice(item).toLocaleString()}₫</span>
                                                        </>
                                                    ) : (
                                                        <span>{(item.originalPrice ?? getItemPrice(item)).toLocaleString()}₫</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="qty-control">
                                                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                                </div>
                                            </td>
                                            <td className="subtotal">{(getItemPrice(item) * item.quantity).toLocaleString()}₫</td>
                                            <td>
                                                <button onClick={() => removeFromCart(item.id)} className="remove-btn">×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="cart-summary">
                            <h3>Tổng giỏ hàng</h3>
                            <div className="summary-row">
                                <span>Giá gốc</span>
                                <span className="original-price-strikethrough">{originalTotal.toLocaleString()}₫</span>
                            </div>
                            {savingsTotal > 0 && (
                                <div className="summary-row savings">
                                    <span>Tiết kiệm</span>
                                    <span className="savings-amount">-{savingsTotal.toLocaleString()}₫</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span>{cartTotal.toLocaleString()}₫</span>
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
