'use client';

import React, { useState, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { cleanHTMLContent } from '@/lib/textUtils';

interface ProductInfoProps {
    id: string;
    image: string;
    name: string;
    price: string | number;
    originalPrice?: string | number;
    description: string;
    sku?: string;
    inStock?: boolean;
    tags?: string[];
}

export default function ProductInfo({
    id,
    image,
    name,
    price,
    originalPrice,
    description,
    sku,
    inStock = true,
    tags = []
}: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { addToCart } = useCart();
    const toast = useToast();
    const { settings } = useSettings();

    // Format price
    const formatPrice = (value: string | number | undefined): string => {
        if (value === undefined || value === null) return '';
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d]/g, ''));
        if (isNaN(numValue)) return '';
        return numValue.toLocaleString('vi-VN') + 'đ';
    };

    const formattedPrice = formatPrice(price);
    const formattedOriginalPrice = formatPrice(originalPrice);

    // Calculate discount percentage
    const discountPercent = (() => {
        if (!originalPrice) return 0;
        const current = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d]/g, ''));
        const original = typeof originalPrice === 'number' ? originalPrice : parseFloat(String(originalPrice).replace(/[^\d]/g, ''));
        if (isNaN(current) || isNaN(original) || original <= current) return 0;
        return Math.round(((original - current) / original) * 100);
    })();

    const handleQuantityChange = useCallback((delta: number) => {
        setQuantity(prev => {
            const newVal = prev + delta;
            return Math.max(1, Math.min(999, newVal));
        });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1 && value <= 999) {
            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {
        const priceValue = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d]/g, ''));

        if (!priceValue || isNaN(priceValue) || priceValue <= 0) {
            toast.error('Không thể thêm vào giỏ', 'Giá sản phẩm không hợp lệ');
            return;
        }

        setIsAddingToCart(true);

        try {
            addToCart({
                id,
                name,
                image,
                originalPrice: priceValue,
                quantity
            });

            toast.success('Đã thêm vào giỏ hàng', name);
        } catch (error) {
            toast.error('Không thể thêm vào giỏ', 'Vui lòng thử lại sau');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        // Navigate to cart/checkout
        window.location.href = '/cart';
    };

    return (
        <div className="product-info-modern">
            {/* Product Title */}
            <h1 className="product-title-modern">{name}</h1>

            {/* SKU & Stock Status */}
            <div className="product-meta-row">
                {sku && <span className="product-sku">SKU: {sku}</span>}
                <span className={`stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {inStock ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Còn hàng
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            Hết hàng
                        </>
                    )}
                </span>
            </div>

            {/* Price Section */}
            <div className="price-section">
                <div className="price-row">
                    <span className="current-price-modern">{formattedPrice}</span>
                    {discountPercent > 0 && (
                        <span className="discount-badge">-{discountPercent}%</span>
                    )}
                </div>
                {formattedOriginalPrice && discountPercent > 0 && (
                    <span className="original-price-modern">{formattedOriginalPrice}</span>
                )}
            </div>

            {/* Description */}
            <div
                className="product-description-modern"
                dangerouslySetInnerHTML={{ __html: cleanHTMLContent(description) }}
            />

            {/* Tags */}
            {tags.length > 0 && (
                <div className="product-tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="product-tag">{tag}</span>
                    ))}
                </div>
            )}

            {/* Divider */}
            <div className="section-divider" />

            {/* Quantity & Actions */}
            <div className="purchase-section">
                <div className="quantity-row">
                    <span className="quantity-label">Số lượng:</span>
                    <div className="quantity-selector-modern">
                        <button
                            className="qty-btn-modern"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            aria-label="Giảm số lượng"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleInputChange}
                            className="qty-input-modern"
                            min="1"
                            max="999"
                        />
                        <button
                            className="qty-btn-modern"
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= 999}
                            aria-label="Tăng số lượng"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        className="btn-add-to-cart"
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || !inStock}
                    >
                        {isAddingToCart ? (
                            <span className="loading-spinner" />
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Thêm vào giỏ hàng
                            </>
                        )}
                    </button>
                    <button
                        className="btn-buy-now"
                        onClick={handleBuyNow}
                        disabled={!inStock}
                    >
                        Mua ngay
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="section-divider" />

            {/* Features */}
            <div className="product-features">
                {(settings?.productFeatures || [
                    { title: 'Giao hàng toàn quốc', description: 'Miễn phí đơn từ 500.000đ', icon: 'truck', enabled: true },
                    { title: 'Đổi trả trong 7 ngày', description: 'Nếu sản phẩm lỗi từ nhà sản xuất', icon: 'refresh', enabled: true },
                    { title: 'Đảm bảo chất lượng', description: 'Sản phẩm chính hãng 100%', icon: 'shield', enabled: true }
                ]).filter(f => f.enabled).map((feature, index) => (
                    <div key={index} className="feature-item-modern">
                        <div className="feature-icon-modern">
                            {feature.icon === 'truck' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="3" width="15" height="13" />
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                            )}
                            {feature.icon === 'refresh' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 4 23 10 17 10" />
                                    <polyline points="1 20 1 14 7 14" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                            )}
                            {feature.icon === 'shield' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <polyline points="9 12 11 14 15 10" />
                                </svg>
                            )}
                        </div>
                        <div className="feature-text-modern">
                            <strong>{feature.title}</strong>
                            <span>{feature.description}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Support */}
            <div className="support-section">
                <div className="support-content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                        <span>Hotline hỗ trợ:</span>
                        <a href={`tel:${(settings?.supportHotline || '1900 123 456').replace(/\s/g, '')}`} className="hotline-number">
                            {settings?.supportHotline || '1900 123 456'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
