'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

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
                                            <td>{item.price.toLocaleString()}₫</td>
                                            <td>
                                                <div className="qty-control">
                                                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                                </div>
                                            </td>
                                            <td className="subtotal">{(item.price * item.quantity).toLocaleString()}₫</td>
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
                                <span>Tạm tính</span>
                                <span>{cartTotal.toLocaleString()}₫</span>
                            </div>
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
        </main>
    );
}
