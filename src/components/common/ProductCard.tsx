'use client';

import Link from 'next/link';
import { useCart, CartItem } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

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
    agentPrice?: string | number;
    bulkPricing?: { minQuantity: number; discountPercent: number }[];
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
    weight?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
    id, image, name, currentPrice, originalPrice,
    badgeText, badgeColor, buttonColor, priceColor,
    agentPrice, bulkPricing, stockStatus = 'in_stock',
    weight
}) => {
    const { addToCart } = useCart();
    const toast = useToast();
    const isOutOfStock = stockStatus === 'out_of_stock';

    const formattedCurrentPrice = typeof currentPrice === 'number'
        ? `${currentPrice.toLocaleString('vi-VN')}₫`
        : currentPrice;

    const formattedOriginalPrice = typeof originalPrice === 'number'
        ? `${originalPrice.toLocaleString('vi-VN')}₫`
        : originalPrice;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();

        if (isOutOfStock) {
            toast.error('Sản phẩm đã hết hàng', 'Vui lòng chọn sản phẩm khác');
            return;
        }

        const price = typeof currentPrice === 'number'
            ? currentPrice
            : parseFloat(currentPrice.replace(/[^\d]/g, ''));

        if (!price || Number.isNaN(price) || price <= 0) {
            toast.error('Không thể thêm vào giỏ', 'Giá sản phẩm không hợp lệ');
            return;
        }

        const agentP = typeof agentPrice === 'number'
            ? agentPrice
            : agentPrice
                ? parseFloat(String(agentPrice).replace(/[^\d]/g, ''))
                : undefined;

        const item: Omit<CartItem, 'price' | 'isAgent'> = {
            id: String(id),
            name,
            image,
            originalPrice: price,
            quantity: 1,
            agentPrice: agentP,
            bulkPricing,
            weight
        };

        addToCart(item);
        toast.success('Đã thêm vào giỏ hàng', name);
    };

    return (
        <div className="product-card">
            {!!badgeText && (
                <div className={`product-badge ${badgeColor}`}>
                    {badgeText}
                </div>
            )}
            <Link href={`/products/${id}`}>
                <div className="product-image">
                    <img
                        src={image}
                        alt={name}
                        onError={(e) => {
                            console.error(`Failed to load product image: ${image}`);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f1f5f9" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="16"%3EKhông có ảnh%3C/text%3E%3C/svg%3E';
                        }}
                    />
                </div>
            </Link>
            <div className="product-info">
                <h3 className="product-title">
                    <Link href={`/products/${id}`}>{name}</Link>
                </h3>
                <div className="product-price">
                    <span className={`current-price ${priceColor}`}>{formattedCurrentPrice}</span>
                    {!!originalPrice && Number(originalPrice) > 0 && <span className="original-price">{formattedOriginalPrice}</span>}
                </div>
                <button
                    className={`btn-choose ${buttonColor} ${isOutOfStock ? 'out-of-stock' : ''}`}
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        </div>
    );
}

export default ProductCard;
