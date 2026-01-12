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

    const total = cartTotal;

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giỏ hàng' }]} />

            <div className="container">
                <h1>Giỏ hàng của bạn</h1>

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
                                <span>{total.toLocaleString()}₫</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span>{total.toLocaleString()}₫</span>
                            </div>
                            <Link href="/checkout">
                                <button className="checkout-btn">Tiến hành thanh toán</button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            <style jsx>{`
        h1 {
            margin-bottom: 30px;
        }
        .cart-layout {
            display: flex;
            gap: 40px;
            margin-bottom: 80px;
        }
        .cart-items {
            flex: 2;
        }
        .cart-table {
            width: 100%;
            border-collapse: collapse;
        }
        .cart-table th {
            text-align: left;
            padding: 15px;
            border-bottom: 2px solid #eee;
            font-weight: 600;
        }
        .cart-table td {
            padding: 20px 15px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
        }
        .product-col {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .product-col img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
        }
        .qty-control {
            display: flex;
            align-items: center;
            border: 1px solid #ddd;
            width: fit-content;
            border-radius: 4px;
        }
        .qty-control button {
            width: 25px;
            height: 25px;
            border: none;
            background: #f9f9f9;
            cursor: pointer;
        }
        .qty-control span {
            width: 30px;
            text-align: center;
            font-size: 13px;
        }
        .subtotal {
            font-weight: 600;
            color: var(--color-primary-brown);
        }
        .remove-btn {
            color: #999;
            font-size: 20px;
            cursor: pointer;
        }
        .remove-btn:hover {
            color: red;
        }

        .cart-summary {
            flex: 1;
            background: #f9f9f9;
            padding: 25px;
            border-radius: 8px;
            height: fit-content;
        }
        .cart-summary h3 {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            color: #555;
        }
        .summary-row.total {
            font-weight: 700;
            font-size: 18px;
            color: var(--color-text-dark);
            margin-top: 10px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .checkout-btn {
            width: 100%;
            padding: 12px;
            background: var(--color-sale-red);
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            margin-top: 20px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .checkout-btn:hover {
            background: #c62042;
        }

        .empty-cart {
            text-align: center;
            padding: 50px 0;
        }
        .continue-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 25px;
            background: var(--color-primary-brown);
            color: white;
            border-radius: 4px;
        }

        @media (max-width: 768px) {
            .cart-layout {
                flex-direction: column;
            }
        }
      `}</style>
        </main>
    );
}
