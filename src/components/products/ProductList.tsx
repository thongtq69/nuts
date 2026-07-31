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
import {
    getCategoryValuesWithProducts,
    getProductCategoryLabel,
    PRODUCT_CATEGORIES,
} from '@/constants/product-categories';
import {
    isProductPriceInRanges,
    ProductPriceRange,
} from '@/lib/product-price-filter';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-image';

interface ProductListProps {
    products: IProduct[];
    initialSettings?: SiteSettings;
}

interface SiteSettings {
    productsBannerUrl?: string;
    productsBannerEnabled?: boolean;
}

export default function ProductList({ products, initialSettings }: ProductListProps) {
    const searchParams = useSearchParams();
    const [sortOption, setSortOption] = useState('default');
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<ProductPriceRange[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(initialSettings || {
        productsBannerUrl: '/assets/images/gonuts-banner-member.png',
        productsBannerEnabled: true
    });
    const [productCategories, setProductCategories] = useState(
        PRODUCT_CATEGORIES.map(category => ({ ...category, isDefault: true })),
    );

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        productsBannerUrl: data.productsBannerUrl || '/assets/images/gonuts-banner-member.png',
                        productsBannerEnabled: data.productsBannerEnabled !== false
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        fetch('/api/product-categories')
            .then(response => response.ok ? response.json() : [])
            .then(data => {
                if (Array.isArray(data)) setProductCategories(data);
            })
            .catch(() => undefined);
    }, []);

    // Get sort parameter from URL
    const urlSort = searchParams.get('sort');
    const selectedCategory = searchParams.get('category');
    const selectedCategoryLabel = productCategories.find(
        category => category.value === selectedCategory
    )?.label || getProductCategoryLabel(selectedCategory) || selectedCategory;
    const isLinkedProductsPage = searchParams.get('linked') === '1';
    const linkedCategory = searchParams.get('linkedCategory')?.trim() || '';
    const linkedCategories = useMemo(() => Array.from(new Set(
        products
            .filter(product => product.isLinkedProduct && product.linkedCategory)
            .map(product => product.linkedCategory!.trim())
            .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'vi')), [products]);
    const availableCategoryValues = useMemo(
        () => getCategoryValuesWithProducts(products),
        [products],
    );

    useEffect(() => {
        if (urlSort && urlSort !== sortOption) {
            setSortOption(urlSort);
        }
    }, [urlSort, sortOption]);

    // Filter and sort products based on URL parameters and sort option
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        if (isLinkedProductsPage) {
            filtered = filtered.filter(product => product.isLinkedProduct);
            if (linkedCategory) {
                filtered = filtered.filter(product => product.linkedCategory === linkedCategory);
            }
        } else {
            filtered = filtered.filter(product => !product.isLinkedProduct);
            if (selectedCategory) {
                filtered = filtered.filter(product => product.category === selectedCategory);
            }
        }

        filtered = filtered.filter(product =>
            isProductPriceInRanges(product.currentPrice, selectedPriceRanges)
        );

        // Filter by URL sort parameter
        if (urlSort === 'bestselling') {
            filtered = filtered.filter(product =>
                product.tags && product.tags.includes('best-seller')
            );
        } else if (urlSort === 'newest') {
            filtered = filtered.filter(product =>
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
    }, [
        products,
        selectedCategory,
        urlSort,
        sortOption,
        isLinkedProductsPage,
        linkedCategory,
        selectedPriceRanges,
    ]);

    const handlePriceRangeChange = (range: ProductPriceRange, checked: boolean) => {
        setSelectedPriceRanges(currentRanges => {
            if (checked) {
                return currentRanges.includes(range)
                    ? currentRanges
                    : [...currentRanges, range];
            }

            return currentRanges.filter(currentRange => currentRange !== range);
        });
    };

    // Get page title based on URL sort parameter
    const getPageTitle = () => {
        if (isLinkedProductsPage && linkedCategory) return linkedCategory;
        if (isLinkedProductsPage) return 'Sản phẩm liên kết';
        if (selectedCategoryLabel) return selectedCategoryLabel;
        if (urlSort === 'bestselling') return 'Sản phẩm bán chạy';
        if (urlSort === 'newest') return 'Sản phẩm mới';
        return 'Sản phẩm';
    };

    // Get breadcrumb items based on URL sort parameter
    const getBreadcrumbItems = () => {
        const baseItems = [{ label: 'Trang chủ', href: '/' }];
        if (isLinkedProductsPage) {
            if (linkedCategory) {
                return [
                    ...baseItems,
                    { label: 'Sản phẩm liên kết', href: '/products?linked=1' },
                    { label: linkedCategory },
                ];
            }
            return [...baseItems, { label: 'Sản phẩm liên kết' }];
        }
        if (selectedCategoryLabel) {
            return [
                ...baseItems,
                { label: 'Sản phẩm', href: '/products' },
                { label: selectedCategoryLabel },
            ];
        }
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
                <Sidebar
                    selectedPriceRanges={selectedPriceRanges}
                    onPriceRangeChange={handlePriceRangeChange}
                    availableCategoryValues={availableCategoryValues}
                    linkedCategoryValues={linkedCategories}
                />

                <div className="product-content">
                    {settings.productsBannerEnabled && (
                        <div className="product-banner">
                            <img
                                src={getOptimizedCloudinaryUrl(
                                    settings.productsBannerUrl || '/assets/images/gonuts-banner-member.png',
                                    'f_auto,q_auto,w_1600,c_limit',
                                )}
                                alt="Shop Banner"
                                width={1600}
                                height={533}
                                decoding="async"
                                className="banner-img"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Page Title */}
                    <div className="page-header">
                        <h1 className="page-title">{getPageTitle()}</h1>
                        {isLinkedProductsPage && (
                            <p className="page-description">
                                {linkedCategory
                                    ? `Các sản phẩm liên kết thuộc submenu ${linkedCategory}`
                                    : 'Khám phá các sản phẩm liên kết được Go Nuts tuyển chọn'}
                            </p>
                        )}
                        {urlSort === 'bestselling' && (
                            <p className="page-description">Những sản phẩm được yêu thích và bán chạy nhất</p>
                        )}
                        {urlSort === 'newest' && (
                            <p className="page-description">Sản phẩm mới nhất vừa được cập nhật</p>
                        )}
                    </div>

                    {isLinkedProductsPage && linkedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            <Link
                                href="/products?linked=1"
                                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                    !linkedCategory
                                        ? 'bg-[#9C7044] text-white border-[#9C7044]'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#9C7044] hover:text-[#9C7044]'
                                }`}
                            >
                                Tất cả
                            </Link>
                            {linkedCategories.map(category => (
                                <Link
                                    key={category}
                                    href={`/products?linked=1&linkedCategory=${encodeURIComponent(category)}`}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                        linkedCategory === category
                                            ? 'bg-[#9C7044] text-white border-[#9C7044]'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#9C7044] hover:text-[#9C7044]'
                                    }`}
                                >
                                    {category}
                                </Link>
                            ))}
                        </div>
                    )}

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
                                    weight={product.weight}
                                    vipMaxDiscount={product.vipMaxDiscount}
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
