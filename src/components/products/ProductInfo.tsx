'use client';

import React, { useState } from 'react';
import QuantitySelector from '../common/QuantitySelector';
import { useCart } from '@/context/CartContext';

interface ProductInfoProps {
    id: string;
    image: string;
    name: string;
    price: string | number;
    originalPrice?: string | number;
    description: string;
}

export default function ProductInfo({ id, image, name, price, originalPrice, description }: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    const formattedPrice = typeof price === 'number' ? `${price.toLocaleString()}₫` : price;
    const formattedOriginalPrice = typeof originalPrice === 'number' ? `${originalPrice.toLocaleString()}₫` : originalPrice;

    const handleAddToCart = () => {
        const priceValue = typeof price === 'number' ? price : parseFloat(price.replace(/[^\d]/g, ''));
        addToCart({
            id,
            name,
            image,
            originalPrice: priceValue,
            quantity
        });
        alert('Đã thêm sản phẩm vào giỏ hàng');
    };

    return (
        <div className="product-info-detail">
            <h1 className="product-title">{name}</h1>
            <div className="product-meta">
                <span className="current-price">{formattedPrice}</span>
                {originalPrice && <span className="original-price">{formattedOriginalPrice}</span>}
            </div>

            <div className="product-description">
                <p>{description}</p>
            </div>

            <div className="product-actions">
                <QuantitySelector value={quantity} onChange={setQuantity} />
                <button className="add-to-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
            </div>

            <div className="product-extras">
                <div className="extra-item">✓ Giao hàng toàn quốc</div>
                <div className="extra-item">✓ Đổi trả trong 7 ngày</div>
            </div>

            <style jsx>{`
        .product-info-detail {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .product-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--color-text-dark);
        }
        .product-meta {
            display: flex;
            align-items: baseline;
            gap: 15px;
        }
        .current-price {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-success-green);
        }
        .original-price {
            font-size: 16px;
            text-decoration: line-through;
            color: #999;
        }
        .product-description {
            font-size: 15px;
            line-height: 1.6;
            color: #555;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            padding: 20px 0;
        }
        .product-actions {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }
        .add-to-cart-btn {
            background: var(--color-primary-brown);
            color: white;
            border: none;
            padding: 0 40px;
            height: 44px; /* Match quantity selector height roughly */
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .add-to-cart-btn:hover {
            background: #7a5a36;
        }
        .product-extras {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        .extra-item {
            margin-bottom: 5px;
        }
      `}</style>
        </div>
    );
}
