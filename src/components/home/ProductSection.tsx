import React from 'react';
import ProductCard from '../common/ProductCard';

interface Product {
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

interface ProductSectionProps {
    title: string;
    products: Product[];
}

export default function ProductSection({ title, products }: ProductSectionProps) {
    console.log(`📦 ProductSection "${title}": Rendering ${products.length} products`);
    
    return (
        <section className="products-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    <a href="/products" className="view-more">
                        Xem thêm
                    </a>
                </div>
                
                {products.length > 0 ? (
                    <div className="products-grid-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                image={product.image}
                                name={product.name}
                                currentPrice={product.currentPrice}
                                originalPrice={product.originalPrice}
                                badgeText={product.badgeText}
                                badgeColor={product.badgeColor}
                                buttonColor={product.buttonColor}
                                priceColor={product.priceColor}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-products">
                        <div className="no-products-content">
                            <div className="no-products-icon">📦</div>
                            <h3>Đang cập nhật sản phẩm</h3>
                            <p>Chúng tôi đang cập nhật các sản phẩm mới. Vui lòng quay lại sau!</p>
                        </div>
                        
                        <style jsx>{`
                            .no-products {
                                padding: 60px 20px;
                                text-align: center;
                                background: #f8f9fa;
                                border-radius: 12px;
                                margin: 20px 0;
                            }
                            .no-products-content {
                                max-width: 400px;
                                margin: 0 auto;
                            }
                            .no-products-icon {
                                font-size: 48px;
                                margin-bottom: 16px;
                            }
                            .no-products h3 {
                                color: #333;
                                margin-bottom: 8px;
                                font-size: 20px;
                            }
                            .no-products p {
                                color: #666;
                                font-size: 14px;
                                line-height: 1.5;
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </section>
    );
}
