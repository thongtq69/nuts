'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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

function getPageSize(width: number) {
    if (width >= 1400) return 6;
    if (width >= 1200) return 5;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    return 2;
}

export default function ProductSection({ title, products }: ProductSectionProps) {
    const [pageSize, setPageSize] = useState(6);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const update = () => setPageSize(getPageSize(window.innerWidth));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));

    useEffect(() => {
        setPage(0);
    }, [pageSize, products.length]);

    const visibleProducts = useMemo(() => {
        const start = page * pageSize;
        return products.slice(start, start + pageSize);
    }, [products, page, pageSize]);

    const canPrev = page > 0;
    const canNext = page < totalPages - 1;

    return (
        <section className="products-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    <div className="section-actions">
                        {products.length > pageSize && (
                            <div className="section-pager" aria-label="Product section pagination">
                                <button
                                    type="button"
                                    className="pager-btn"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={!canPrev}
                                    aria-label="Previous"
                                >
                                    {'<'}
                                </button>
                                <span className="pager-count">{page + 1}/{totalPages}</span>
                                <button
                                    type="button"
                                    className="pager-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={!canNext}
                                    aria-label="Next"
                                >
                                    {'>'}
                                </button>
                            </div>
                        )}
                        <Link href="/products" className="view-more">
                            Xem thêm
                        </Link>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className="products-grid-6">
                        {visibleProducts.map((product) => (
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
                    </div>
                )}
            </div>
        </section>
    );
}
