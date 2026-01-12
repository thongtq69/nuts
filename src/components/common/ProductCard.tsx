import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
    id: string | number;
    image: string;
    name: string;
    currentPrice: string | number;
    originalPrice?: string | number;
    badgeText?: string;
    badgeColor?: string;
    buttonColor?: string;
    priceColor?: string;
}

import { useCart } from '@/context/CartContext';

const ProductCard: React.FC<ProductCardProps> = ({
    id, image, name, currentPrice, originalPrice,
    badgeText, badgeColor, buttonColor, priceColor
}) => {
    const { addToCart } = useCart();

    const formattedCurrentPrice = typeof currentPrice === 'number'
        ? `${currentPrice.toLocaleString()}₫`
        : currentPrice;

    const formattedOriginalPrice = typeof originalPrice === 'number'
        ? `${originalPrice.toLocaleString()}₫`
        : originalPrice;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if wrapped in Link
        const price = typeof currentPrice === 'number' ? currentPrice : parseFloat(currentPrice.replace(/[^\d]/g, ''));
        addToCart({
            id: String(id),
            name,
            image,
            price,
            quantity: 1
        });
        alert('Đã thêm vào giỏ hàng');
    };

    return (
        <div className="product-card">
            {badgeText && (
                <div className={`badge ${badgeColor}`}>
                    {badgeText}
                </div>
            )}
            <Link href={`/products/${id}`}>
                <div className="product-image">
                    <img src={image} alt={name} />
                </div>
            </Link>
            <div className="product-info">
                <h3 className="product-title">
                    <Link href={`/products/${id}`}>{name}</Link>
                </h3>
                <div className="product-price">
                    <span className={`current-price ${priceColor}`}>{formattedCurrentPrice}</span>
                    {originalPrice && <span className="original-price">{formattedOriginalPrice}</span>}
                </div>
                <button
                    className={`btn-choose ${buttonColor}`}
                    onClick={handleAddToCart}
                >
                    Add to cart
                </button>
            </div>
        </div>
    );
}

export default ProductCard;
