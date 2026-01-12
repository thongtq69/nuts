'use client';

import React, { useSearchParams } from 'next/navigation';
import { products } from '@/data/products';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/common/ProductCard';
import Breadcrumb from '@/components/common/Breadcrumb';

// Suspense wrapper for search params
import { Suspense } from 'react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="container">
            <h1 className="search-title">
                Kết quả tìm kiếm cho: <span>&quot;{query}&quot;</span>
            </h1>

            {filteredProducts.length > 0 ? (
                <div className="search-grid">
                    {filteredProducts.map((product) => (
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
                <div className="no-results">
                    <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa &quot;{query}&quot;.</p>
                    <div className="suggestions">
                        <p>Gợi ý:</p>
                        <ul>
                            <li>Kiểm tra lỗi chính tả của từ khóa.</li>
                            <li>Thử tìm kiếm bằng từ khóa khác hoặc chung chung hơn.</li>
                            <li>Thử tìm kiếm theo danh mục sản phẩm.</li>
                        </ul>
                    </div>
                </div>
            )}

            <style jsx>{`
            .search-title {
                margin: 30px 0;
                font-size: 24px;
                font-weight: 600;
            }
            .search-title span {
                color: var(--color-primary-brown);
            }
            .search-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 80px;
            }
            .no-results {
                background: #f9f9f9;
                padding: 40px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 80px;
            }
            .suggestions {
                margin-top: 20px;
                text-align: left;
                display: inline-block;
            }
            .suggestions ul {
                list-style: disc;
                padding-left: 20px;
                margin-top: 10px;
                color: #666;
            }
            
            @media (max-width: 992px) {
                .search-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            @media (max-width: 768px) {
                .search-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `}</style>
        </div>
    );
}

export default function SearchPage() {
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tìm kiếm' }]} />

            <Suspense fallback={<div className="container">Loading...</div>}>
                <SearchResults />
            </Suspense>

            <Footer />
        </main>
    );
}
