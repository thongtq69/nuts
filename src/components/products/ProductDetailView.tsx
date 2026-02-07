'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductSection from '@/components/home/ProductSection';
import { IProduct } from '@/models/Product';

interface ProductDetailViewProps {
    product: IProduct;
    relatedProducts: IProduct[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
    // Handle case where images array is empty - use main image
    const productImages = (product.images && product.images.length > 0)
        ? product.images
        : product.image
            ? [product.image]
            : ['/assets/images/product1.jpg'];

    // Fallback for single image display
    const mainImage = (product.images && product.images.length > 0)
        ? product.images[0]
        : product.image || '/assets/images/product1.jpg';

    return (
        <main className="product-detail-page">
            <Header />
            <Navbar />
            <Breadcrumb
                items={[
                    { label: 'Trang chủ', href: '/' },
                    { label: 'Sản phẩm', href: '/products' },
                    { label: product.name }
                ]}
            />

            <div className="container">
                {/* Main Product Section */}
                <div className="product-detail-wrapper">
                    <div className="product-detail-grid">
                        {/* Left: Gallery */}
                        <div className="product-gallery-column">
                            <ProductGallery
                                images={productImages}
                                productName={product.name}
                            />
                        </div>

                        {/* Right: Product Info */}
                        <div className="product-info-column">
                            <ProductInfo
                                id={String(product.id || (product as any)._id)}
                                image={mainImage}
                                name={product.name}
                                price={product.currentPrice}
                                originalPrice={product.originalPrice}
                                description={product.description || ''}
                                sku={product.sku}
                                inStock={product.stockStatus !== 'out_of_stock'}
                                tags={product.tags}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Description Tabs */}
                <div className="product-tabs-section">
                    <div className="tabs-header">
                        <button className="tab-btn active">Mô tả sản phẩm</button>
                        <button className="tab-btn">Thông tin chi tiết</button>
                        <button className="tab-btn">Đánh giá</button>
                    </div>
                    <div className="tabs-content">
                        <div className="tab-panel active">
                            <div className="description-content">
                                {product.description ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="no-description">Chưa có mô tả cho sản phẩm này.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <ProductSection
                            title="Sản phẩm liên quan"
                            products={relatedProducts as any[]}
                            variant="four"
                        />
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
