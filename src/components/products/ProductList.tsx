'use client';

import React from 'react';
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
    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]} />

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

                    <div className="sort-bar">
                        <span>Hiển thị 1–{products.length} trong {products.length} kết quả</span>
                        <select className="sort-select">
                            <option>Thứ tự mặc định</option>
                            <option>Giá thấp đến cao</option>
                            <option>Giá cao đến thấp</option>
                        </select>
                    </div>

                    <div className="products-grid">
                        {products.length > 0 ? (
                            products.map((product) => (
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
                            <p>Đang cập nhật sản phẩm...</p>
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
        .sort-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #555;
        }
        .sort-select {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        @media (max-width: 992px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 768px) {
            .product-page-container {
                flex-direction: column;
            }
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 480px) {
            .products-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
        </main>
    );
}
