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
    initialSettings?: SiteSettings;
}

interface SiteSettings {
    productsBannerUrl?: string;
    productsBannerEnabled?: boolean;
}

interface LinkedMenuCategory {
    _id: string;
    name: string;
    submenus: Array<{
        _id: string;
        name: string;
    }>;
}

export default function ProductList({ products, initialSettings }: ProductListProps) {
    const searchParams = useSearchParams();
    const [sortOption, setSortOption] = useState('default');
    const [settings, setSettings] = useState<SiteSettings>(initialSettings || {
        productsBannerUrl: '/assets/images/gonuts-banner-member.png',
        productsBannerEnabled: true
    });
    const [linkedMenuCategories, setLinkedMenuCategories] = useState<LinkedMenuCategory[]>([]);

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
        fetch('/api/linked-product-categories')
            .then(response => response.ok ? response.json() : [])
            .then(data => setLinkedMenuCategories(Array.isArray(data) ? data : []))
            .catch(() => setLinkedMenuCategories([]));
    }, []);

    // Get sort parameter from URL
    const urlSort = searchParams.get('sort');
    const isLinkedProductsPage = searchParams.get('linked') === '1';
    const linkedMenuCategoryId = searchParams.get('linkedMenuCategory')?.trim() || '';
    const linkedMenuSubmenuId = searchParams.get('linkedMenuSubmenu')?.trim() || '';
    const selectedLinkedCategory = linkedMenuCategories.find(
        category => category._id === linkedMenuCategoryId
    );
    const selectedLinkedSubmenu = selectedLinkedCategory?.submenus.find(
        submenu => submenu._id === linkedMenuSubmenuId
    );

    useEffect(() => {
        if (urlSort && urlSort !== sortOption) {
            setSortOption(urlSort);
        }
    }, [urlSort, sortOption]);

    // Filter and sort products based on URL parameters and sort option
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(product =>
            isLinkedProductsPage ? product.isLinkedProduct : !product.isLinkedProduct
        );

        if (isLinkedProductsPage && linkedMenuCategoryId) {
            filtered = filtered.filter(
                product => String(product.linkedMenuCategoryId || '') === linkedMenuCategoryId
            );
        }
        if (isLinkedProductsPage && linkedMenuSubmenuId) {
            filtered = filtered.filter(
                product => String(product.linkedMenuSubmenuId || '') === linkedMenuSubmenuId
            );
        }

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
        urlSort,
        sortOption,
        isLinkedProductsPage,
        linkedMenuCategoryId,
        linkedMenuSubmenuId,
    ]);

    // Get page title based on URL sort parameter
    const getPageTitle = () => {
        if (isLinkedProductsPage && selectedLinkedSubmenu) return selectedLinkedSubmenu.name;
        if (isLinkedProductsPage && selectedLinkedCategory) return selectedLinkedCategory.name;
        if (isLinkedProductsPage) return 'Sản phẩm liên kết';
        if (urlSort === 'bestselling') return 'Sản phẩm bán chạy';
        if (urlSort === 'newest') return 'Sản phẩm mới';
        return 'Sản phẩm';
    };

    // Get breadcrumb items based on URL sort parameter
    const getBreadcrumbItems = () => {
        const baseItems = [{ label: 'Trang chủ', href: '/' }];
        if (isLinkedProductsPage) {
            if (selectedLinkedCategory) {
                return [
                    ...baseItems,
                    { label: 'Sản phẩm liên kết', href: '/products?linked=1' },
                    ...(selectedLinkedSubmenu ? [{
                        label: selectedLinkedCategory.name,
                        href: `/products?linked=1&linkedMenuCategory=${selectedLinkedCategory._id}`,
                    }] : []),
                    { label: selectedLinkedSubmenu?.name || selectedLinkedCategory.name }
                ];
            }
            return [...baseItems, { label: 'Sản phẩm liên kết' }];
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
                <Sidebar />

                <div className="product-content">
                    {settings.productsBannerEnabled && (
                        <div className="product-banner">
                            <img
                                src={settings.productsBannerUrl || '/assets/images/gonuts-banner-member.png'}
                                alt="Shop Banner"
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
                                {selectedLinkedSubmenu
                                    ? `Các sản phẩm liên kết thuộc submenu ${selectedLinkedSubmenu.name}`
                                    : selectedLinkedCategory
                                        ? `Các sản phẩm liên kết thuộc danh mục ${selectedLinkedCategory.name}`
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

                    {isLinkedProductsPage && linkedMenuCategories.length > 0 && (
                        <div className="mb-5 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="/products?linked=1"
                                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                        !linkedMenuCategoryId
                                            ? 'bg-[#9C7044] text-white border-[#9C7044]'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#9C7044] hover:text-[#9C7044]'
                                    }`}
                                >
                                    Tất cả
                                </Link>
                                {linkedMenuCategories.map(category => (
                                    <Link
                                        key={category._id}
                                        href={`/products?linked=1&linkedMenuCategory=${category._id}`}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                                            linkedMenuCategoryId === category._id
                                                ? 'bg-[#9C7044] text-white border-[#9C7044]'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#9C7044] hover:text-[#9C7044]'
                                        }`}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                            {!!selectedLinkedCategory?.submenus.length && (
                                <div className="flex flex-wrap gap-2 rounded-xl bg-slate-50 p-3">
                                    <Link
                                        href={`/products?linked=1&linkedMenuCategory=${selectedLinkedCategory._id}`}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                            !linkedMenuSubmenuId
                                                ? 'bg-white text-[#9C7044] shadow-sm'
                                                : 'text-slate-600 hover:bg-white'
                                        }`}
                                    >
                                        Tất cả {selectedLinkedCategory.name}
                                    </Link>
                                    {selectedLinkedCategory.submenus.map(submenu => (
                                        <Link
                                            key={submenu._id}
                                            href={`/products?linked=1&linkedMenuCategory=${selectedLinkedCategory._id}&linkedMenuSubmenu=${submenu._id}`}
                                            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                                linkedMenuSubmenuId === submenu._id
                                                    ? 'bg-white text-[#9C7044] shadow-sm'
                                                    : 'text-slate-600 hover:bg-white'
                                            }`}
                                        >
                                            {submenu.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
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
