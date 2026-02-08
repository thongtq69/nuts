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
import { cleanHTMLContent } from '@/lib/textUtils';

interface ProductDetailViewProps {
    product: IProduct;
    relatedProducts: IProduct[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
    const [activeTab, setActiveTab] = React.useState<'description' | 'specs' | 'reviews'>('description');

    // Process images: Main image should be first, followed by gallery images
    const productImages = React.useMemo(() => {
        const allImages: string[] = [];
        if (product.image) {
            allImages.push(product.image);
        }

        if (product.images && Array.isArray(product.images)) {
            product.images.forEach(img => {
                if (img && img !== product.image && !allImages.includes(img)) {
                    allImages.push(img);
                }
            });
        }

        return allImages.length > 0 ? allImages : ['/assets/images/product1.jpg'];
    }, [product.image, product.images]);

    const mainImage = productImages[0];

    // Get short description: prioritize shortDescription field, fallback to parsing
    const shortDesc = React.useMemo(() => {
        // If shortDescription field exists, use it
        if (product.shortDescription) {
            return product.shortDescription;
        }

        // Fallback: try to extract intro from description for backward compatibility
        if (!product.description) return '';

        const separatorRegex = /<hr\/?>|----------------------------------------|THÔNG TIN CHI TIẾT SẢN PHẨM:/i;
        const parts = product.description.split(separatorRegex);

        if (parts.length > 1 && parts[0].trim().length > 0) {
            return parts[0].trim();
        }

        // If description is very long, truncate it
        if (product.description.length > 500) {
            return product.description.substring(0, 300) + '...';
        }

        return product.description;
    }, [product.shortDescription, product.description]);

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
                                description={shortDesc || ''}
                                sku={product.sku}
                                inStock={product.stockStatus !== 'out_of_stock'}
                                tags={product.tags}
                                weight={product.weight}
                            />
                        </div>
                    </div>
                </div>

                {/* Product Description Tabs */}
                <div className="product-tabs-section">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Mô tả sản phẩm
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specs')}
                        >
                            Thông tin chi tiết
                        </button>
                        {/* Tạm ẩn tab Đánh giá
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Đánh giá
                        </button>
                        */}
                    </div>
                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-panel active">
                                <div className="description-content">
                                    {product.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: cleanHTMLContent(product.description) }} />
                                    ) : (
                                        <p className="no-description">Chưa có mô tả cho sản phẩm này.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="tab-panel active">
                                <div className="description-content">
                                    <div className="specs-list bg-slate-50 p-6 rounded-2xl space-y-3">
                                        {product.sku && (
                                            <div className="flex justify-between py-2 border-b border-slate-200">
                                                <span className="font-medium text-slate-600">Mã sản phẩm:</span>
                                                <span className="text-slate-900">{product.sku}</span>
                                            </div>
                                        )}
                                        {product.category && (
                                            <div className="flex justify-between py-2 border-b border-slate-200">
                                                <span className="font-medium text-slate-600">Danh mục:</span>
                                                <span className="text-slate-900">{product.category}</span>
                                            </div>
                                        )}
                                        {!!product.weight && (
                                            <div className="flex justify-between py-2 border-b border-slate-200">
                                                <span className="font-medium text-slate-600">Trọng lượng:</span>
                                                <span className="text-slate-900">{product.weight} kg</span>
                                            </div>
                                        )}
                                        {!product.sku && !product.category && !product.weight && (
                                            <p className="no-description">Thông tin chi tiết đang được cập nhật.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tạm ẩn tab Đánh giá
                        {activeTab === 'reviews' && (
                            <div className="tab-panel active">
                                <div className="reviews-placeholder">
                                    <p className="text-slate-500 text-center py-10 italic">
                                        Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                                    </p>
                                </div>
                            </div>
                        )}
                        */}
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
