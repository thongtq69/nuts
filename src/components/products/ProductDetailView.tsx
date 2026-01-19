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
        <main>
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
                <div className="product-detail-layout">
                    <div className="gallery-section">
                        <ProductGallery images={productImages} />
                    </div>
                    <div className="info-section">
                        <ProductInfo
                            id={String(product.id || (product as any)._id)}
                            image={mainImage}
                            name={product.name}
                            price={product.currentPrice}
                            originalPrice={product.originalPrice}
                            description={product.description || ''}
                        />
                    </div>
                </div>

                <div className="related-products">
                    <ProductSection title="Sản phẩm liên quan" products={relatedProducts as any[]} />
                </div>
            </div>

            <Footer />
        </main>
    );
}
