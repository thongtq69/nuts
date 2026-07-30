'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRODUCT_CATEGORIES } from '@/constants/product-categories';

export default function Sidebar() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category') || '';
    const isLinkedProductsPage = searchParams.get('linked') === '1';

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
                    {PRODUCT_CATEGORIES.map(category => (
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
                    <label><input type="checkbox" /> Dưới 100k</label>
                    <label><input type="checkbox" /> 100k - 300k</label>
                    <label><input type="checkbox" /> 300k - 500k</label>
                    <label><input type="checkbox" /> Trên 500k</label>
                </div>
            </div>
        </aside>
    );
}
