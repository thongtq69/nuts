import React from 'react';
import ProductCard from '../common/ProductCard';

interface Product {
    id: number;
    image: string;
    name: string;
    currentPrice: string;
    originalPrice: string;
    badgeText: string;
    badgeColor?: 'red' | 'green' | 'pink' | '';
    buttonColor?: 'green' | 'pink' | '';
    priceColor?: 'pink' | '';
}

interface ProductSectionProps {
    title: string;
    products: Product[];
}

export default function ProductSection({ title, products }: ProductSectionProps) {
    return (
        <section className="products-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    <a href="/products" className="view-more">
                        Xem thêm
                    </a>
                </div>
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
            </div>
        </section>
    );
}
