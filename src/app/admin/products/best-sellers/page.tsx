'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Search, Filter, Package, Plus, Star, Crown, Eye, EyeOff } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    currentPrice: number;
    originalPrice?: number;
    category?: string;
    image: string;
    tags: string[];
    sortOrder?: number;
    createdAt: string;
    isActive: boolean;
}

export default function BestSellersPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();

            // Sản phẩm có tag 'best-seller'
            const bestSellers = data
                .filter((p: Product) => p.tags && p.tags.includes('best-seller'))
                .sort((a: any, b: any) => (b.sortOrder || 0) - (a.sortOrder || 0));

            // Tất cả sản phẩm không có tag 'best-seller'
            const otherProducts = data.filter((p: Product) => !p.tags || !p.tags.includes('best-seller'));

            setProducts(bestSellers);
            setAllProducts(otherProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToBestSeller = async (productId: string) => {
        try {
            setUpdating(productId);
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add_tag',
                    tag: 'best-seller'
                })
            });

            if (response.ok) {
                await fetchProducts();
            }
        } catch (error) {
            console.error('Error adding to best sellers:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleRemoveFromBestSeller = async (productId: string) => {
        try {
            setUpdating(productId);
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'remove_tag',
                    tag: 'best-seller'
                })
            });

            if (response.ok) {
                await fetchProducts();
            }
        } catch (error) {
            console.error('Error removing from best sellers:', error);
        } finally {
            setUpdating(null);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAllProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        Sản phẩm Bán chạy
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        Quản lý {products.length} sản phẩm bán chạy trên trang chủ
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-brand/10 hover:bg-brand/20 text-brand px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Thêm Sản phẩm
                </Link>
            </div>

            {/* Current Best Sellers */}
            <div className="glass-card">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-brand" />
                        Sản phẩm Bán chạy hiện tại ({filteredProducts.length})
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Những sản phẩm đang hiển thị trong section "Sản phẩm bán chạy" trên trang chủ</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">STT</th>
                                <th className="w-20">Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th className="text-right">Giá bán</th>
                                <th className="text-center">Ngày tạo</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                                                <TrendingUp className="w-8 h-8 text-brand" />
                                            </div>
                                            <p className="text-slate-500">Chưa có sản phẩm bán chạy nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="text-center font-semibold text-slate-500 text-sm">
                                            <div className="flex items-center justify-center gap-1">
                                                <Crown className="w-4 h-4 text-brand" />
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden bg-white p-1.5 relative">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                                                    <Star className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-semibold text-slate-800">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                ID: {product._id.slice(-8)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-premium badge-info">
                                                {product.category || 'Chưa phân loại'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <span className="font-bold text-lg text-brand">
                                                {product.currentPrice.toLocaleString()}đ
                                            </span>
                                        </td>
                                        <td className="text-center text-sm text-slate-600">
                                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleRemoveFromBestSeller(product._id)}
                                                disabled={updating === product._id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {updating === product._id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <EyeOff size={14} />
                                                )}
                                                Ẩn
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Available Products to Add */}
            <div className="glass-card">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Package className="h-5 w-5 text-slate-600" />
                        Sản phẩm có thể thêm ({filteredAllProducts.length})
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Chọn sản phẩm để thêm vào section "Sản phẩm bán chạy"</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">STT</th>
                                <th className="w-20">Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th className="text-right">Giá bán</th>
                                <th className="text-center">Ngày tạo</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAllProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <Package className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">Không có sản phẩm nào để thêm</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAllProducts.map((product, index) => (
                                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td>
                                            <div className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden bg-white p-1.5">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-semibold text-slate-800">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                ID: {product._id.slice(-8)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-premium badge-info">
                                                {product.category || 'Chưa phân loại'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <span className="font-bold text-lg text-brand">
                                                {product.currentPrice.toLocaleString()}đ
                                            </span>
                                        </td>
                                        <td className="text-center text-sm text-slate-600">
                                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => handleAddToBestSeller(product._id)}
                                                disabled={updating === product._id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {updating === product._id ? (
                                                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Eye size={14} />
                                                )}
                                                Thêm
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}