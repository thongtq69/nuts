'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import Sidebar from '@/components/common/Sidebar';
import ProductCard from '@/components/common/ProductCard';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { IProduct } from '@/models/Product';

interface ProductListProps {
    products: IProduct[];
}

export default function ProductList({ products }: ProductListProps) {
    const searchParams = useSearchParams();
    const [sortOption, setSortOption] = useState('default');
    
    // Get sort parameter from URL
    const urlSort = searchParams.get('sort');
    
    useEffect(() => {
        if (urlSort && urlSort !== sortOption) {
            setSortOption(urlSort);
        }
    }, [urlSort, sortOption]);

    // Filter and sort products based on URL parameters and sort option
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];
        
        // Filter by URL sort parameter
        if (urlSort === 'bestselling') {
            filtered = products.filter(product => 
                product.tags && product.tags.includes('best-seller')
            );
        } else if (urlSort === 'newest') {
            filtered = products.filter(product => 
                product.tags && product.tags.includes('new')
            );
        }
        
        // Sort products
        switch (sortOption) {
            case 'price-low-high':
                return filtered.sort((a, b) => a.currentPrice - b.currentPrice);
            case 'price-high-low':
                return filtered.sort((a, b) => b.currentPrice - a.currentPrice);
            case 'newest':
                return filtered.sort((a, b) => 
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
            case 'bestselling':
                return filtered.filter(p => p.tags && p.tags.includes('best-seller'));
            default:
                return filtered;
        }
    }, [products, urlSort, sortOption]);

    // Get page title based on URL sort parameter
    const getPageTitle = () => {
        if (urlSort === 'bestselling') return 'Sản phẩm bán chạy';
        if (urlSort === 'newest') return 'Sản phẩm mới';
        return 'Sản phẩm';
    };

    // Get breadcrumb items based on URL sort parameter
    const getBreadcrumbItems = () => {
        const baseItems = [{ label: 'Trang chủ', href: '/' }];
        if (urlSort === 'bestselling') {
            return [...baseItems, { label: 'Sản phẩm bán chạy' }];
        }
        if (urlSort === 'newest') {
            return [...baseItems, { label: 'Sản phẩm mới' }];
        }
        return [...baseItems, { label: 'Sản phẩm' }];
    };
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={getBreadcrumbItems()} />

            <div className="container product-page-container">
                <Sidebar />

                <div className="product-content">
                    <div className="product-banner">
                        <img 
                            src="/assets/images/slide1.jpg" 
                            alt="Shop Banner" 
                            className="banner-img"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Page Title */}
                    <div className="page-header">
                        <h1 className="page-title">{getPageTitle()}</h1>
                        {urlSort === 'bestselling' && (
                            <p className="page-description">Những sản phẩm được yêu thích và bán chạy nhất</p>
                        )}
                        {urlSort === 'newest' && (
                            <p className="page-description">Sản phẩm mới nhất vừa được cập nhật</p>
                        )}
                    </div>

                    <div className="sort-bar">
                        <span>Hiển thị 1–{filteredAndSortedProducts.length} trong {filteredAndSortedProducts.length} kết quả</span>
                        <select 
                            className="sort-select"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="default">Thứ tự mặc định</option>
                            <option value="price-low-high">Giá thấp đến cao</option>
                            <option value="price-high-low">Giá cao đến thấp</option>
                            <option value="newest">Mới nhất</option>
                            <option value="bestselling">Bán chạy nhất</option>
                        </select>
                    </div>

                    <div className="products-grid">
                        {filteredAndSortedProducts.length > 0 ? (
                            filteredAndSortedProducts.map((product) => (
                                <ProductCard
                                    key={product.id || (product as any)._id}
                                    id={product.id || (product as any)._id}
                                    image={product.image}
                                    name={product.name}
                                    currentPrice={product.currentPrice}
                                    originalPrice={product.originalPrice}
                                    badgeText={product.badgeText}
                                    badgeColor={product.badgeColor}
                                    buttonColor={product.buttonColor}
                                    priceColor={product.priceColor}
                                />
                            ))
                        ) : (
                            <div className="no-products">
                                <div className="no-products-icon">📦</div>
                                <h3>Không tìm thấy sản phẩm</h3>
                                <p>
                                    {urlSort === 'bestselling' 
                                        ? 'Chưa có sản phẩm bán chạy nào. Vui lòng quay lại sau.'
                                        : urlSort === 'newest'
                                        ? 'Chưa có sản phẩm mới nào. Vui lòng quay lại sau.'
                                        : 'Đang cập nhật sản phẩm...'
                                    }
                                </p>
                                <Link href="/" className="back-home-btn">
                                    Về trang chủ
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
        .product-page-container {
            display: flex;
            gap: 30px;
            margin-bottom: 60px;
        }
        .product-content {
            flex: 1;
        }
        .product-banner {
            margin-bottom: 30px;
        }
        .banner-img {
            width: 100%;
            border-radius: 8px;
        }
        .page-header {
            margin-bottom: 30px;
            text-align: center;
        }
        .page-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .page-description {
            font-size: 1.1rem;
            color: #718096;
            margin: 0;
        }
        .sort-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #555;
        }
        .sort-select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            font-size: 14px;
            cursor: pointer;
        }
        .sort-select:focus {
            outline: none;
            border-color: #9C7044;
            box-shadow: 0 0 0 2px rgba(156, 112, 68, 0.1);
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        .no-products {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 2px dashed #dee2e6;
        }
        .no-products-icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        .no-products h3 {
            font-size: 1.5rem;
            color: #495057;
            margin-bottom: 10px;
        }
        .no-products p {
            color: #6c757d;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }
        .back-home-btn {
            display: inline-block;
            padding: 12px 24px;
            background: #9C7044;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .back-home-btn:hover {
            background: #7d5a36;
        }
        @media (max-width: 992px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .page-title {
                font-size: 2rem;
            }
        }
        @media (max-width: 768px) {
            .product-page-container {
                flex-direction: column;
            }
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .sort-bar {
                flex-direction: column;
                gap: 10px;
                align-items: stretch;
            }
            .page-title {
                font-size: 1.8rem;
            }
        }
        @media (max-width: 480px) {
            .products-grid {
                grid-template-columns: 1fr;
            }
            .page-title {
                font-size: 1.5rem;
            }
        }
      `}</style>
        </main>
    );
}
