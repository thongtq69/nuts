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
        const priceValue = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d]/g, ''));
        
        // Validate price
        if (!priceValue || isNaN(priceValue) || priceValue <= 0) {
            alert('Lỗi: Giá sản phẩm không hợp lệ');
            console.error('Invalid price:', { price, priceValue });
            return;
        }
        
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
        </div>
    );
}
