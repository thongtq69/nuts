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
}

export default function Sidebar({
    selectedPriceRanges,
    onPriceRangeChange,
}: SidebarProps) {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category') || '';
    const isLinkedProductsPage = searchParams.get('linked') === '1';
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

    return (
        <aside className="sidebar">
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
                    {categories.map(category => (
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
        </aside>
    );
}
