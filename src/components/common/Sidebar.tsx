'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PRODUCT_CATEGORIES } from '@/constants/product-categories';
import {
    PRODUCT_PRICE_RANGES,
    ProductPriceRange,
} from '@/lib/product-price-filter';

interface SidebarProps {
    selectedPriceRanges: readonly ProductPriceRange[];
    onPriceRangeChange: (range: ProductPriceRange, checked: boolean) => void;
    availableCategoryValues: readonly string[];
    linkedCategoryValues: readonly string[];
}

export default function Sidebar({
    selectedPriceRanges,
    onPriceRangeChange,
    availableCategoryValues,
    linkedCategoryValues,
}: SidebarProps) {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category') || '';
    const isLinkedProductsPage = searchParams.get('linked') === '1';
    const selectedLinkedCategory = searchParams.get('linkedCategory')?.trim() || '';
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [categories, setCategories] = useState(
        PRODUCT_CATEGORIES.map(category => ({ ...category, isDefault: true })),
    );

    useEffect(() => {
        fetch('/api/product-categories')
            .then(response => response.ok ? response.json() : [])
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(() => undefined);
    }, []);

    const availableCategorySet = new Set(availableCategoryValues);
    const visibleCategories = categories.filter(category =>
        availableCategorySet.has(category.value)
    );

    return (
        <aside className={`sidebar ${isMobileFilterOpen ? 'mobile-filter-open' : ''}`}>
            <button
                type="button"
                className="mobile-filter-toggle"
                onClick={() => setIsMobileFilterOpen(open => !open)}
                aria-expanded={isMobileFilterOpen}
                aria-controls="product-filter-content"
            >
                <span className="mobile-filter-toggle-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                    Bộ lọc sản phẩm
                </span>
                <span className="mobile-filter-toggle-meta">
                    {selectedPriceRanges.length > 0 && (
                        <span>{selectedPriceRanges.length} đã chọn</span>
                    )}
                    <span className="mobile-filter-chevron" aria-hidden="true">⌄</span>
                </span>
            </button>

            <div id="product-filter-content" className="sidebar-mobile-content">
                <div className="sidebar-section">
                    <h3 className="sidebar-title">Danh mục</h3>
                    <ul className="sidebar-list">
                        <li>
                            <Link
                                href="/products"
                                aria-current={!selectedCategory && !isLinkedProductsPage ? 'page' : undefined}
                                className={!selectedCategory && !isLinkedProductsPage ? 'font-semibold text-[#9C7044]' : ''}
                            >
                                Tất cả sản phẩm
                            </Link>
                        </li>
                        {visibleCategories.map(category => (
                            <li key={category.value}>
                                <Link
                                    href={`/products?category=${encodeURIComponent(category.value)}`}
                                    aria-current={selectedCategory === category.value ? 'page' : undefined}
                                    className={selectedCategory === category.value ? 'font-semibold text-[#9C7044]' : ''}
                                >
                                    {category.label}
                                </Link>
                            </li>
                        ))}
                        {linkedCategoryValues.map(category => (
                            <li key={`linked-${category}`}>
                                <Link
                                    href={`/products?linked=1&linkedCategory=${encodeURIComponent(category)}`}
                                    aria-current={isLinkedProductsPage && selectedLinkedCategory === category ? 'page' : undefined}
                                    className={isLinkedProductsPage && selectedLinkedCategory === category ? 'font-semibold text-[#9C7044]' : ''}
                                >
                                    {category}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-title">Khoảng giá</h3>
                    <div className="price-filter">
                        {PRODUCT_PRICE_RANGES.map(range => (
                            <label key={range.value}>
                                <input
                                    type="checkbox"
                                    checked={selectedPriceRanges.includes(range.value)}
                                    onChange={event => onPriceRangeChange(range.value, event.target.checked)}
                                />
                                {' '}{range.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
