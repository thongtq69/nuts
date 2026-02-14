'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/common/ProductCard';

interface Product {
    _id: string;
    id?: string;
    image: string;
    name: string;
    currentPrice: string;
    originalPrice: string;
    badgeText?: string;
    badgeColor?: string;
    buttonColor?: string;
    priceColor?: string;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
}

interface SearchResultsProps {
    query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    if (loading) {
        return (
            <div className="container">
                <h1 className="search-title">
                    Đang tìm kiếm: <span>&quot;{query}&quot;</span>
                </h1>
                <p>Đang tải...</p>
                <style jsx>{`
                    .search-title {
                        margin: 30px 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .search-title span {
                        color: #9C7044;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="search-title">
                Kết quả tìm kiếm cho: <span>&quot;{query}&quot;</span>
            </h1>

            {products.length > 0 ? (
                <div className="search-grid">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id || product.id}
                            id={product._id || product.id || ''}
                            image={product.image}
                            name={product.name}
                            currentPrice={product.currentPrice}
                            originalPrice={product.originalPrice}
                            badgeText={product.badgeText}
                            badgeColor={product.badgeColor as any}
                            buttonColor={product.buttonColor as any}
                            priceColor={product.priceColor as any}
                            stockStatus={product.stockStatus}
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
                color: #9C7044;
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
