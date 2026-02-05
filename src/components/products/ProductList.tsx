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
                                    stockStatus={product.stockStatus}
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
        </main>
    );
}
