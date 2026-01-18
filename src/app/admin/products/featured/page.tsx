'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Sparkles, Package, Plus, BarChart3, Eye } from 'lucide-react';

interface ProductStats {
    bestSellers: number;
    newProducts: number;
    promoProducts: number;
    totalProducts: number;
}

interface FeaturedProduct {
    _id: string;
    name: string;
    currentPrice: number;
    image: string;
    category?: string;
    tags: string[];
    createdAt: string;
}

export default function FeaturedProductsPage() {
    const [stats, setStats] = useState<ProductStats>({
        bestSellers: 0,
        newProducts: 0,
        promoProducts: 0,
        totalProducts: 0
    });
    const [recentProducts, setRecentProducts] = useState<FeaturedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch products
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const products = await response.json();
            
            // Calculate stats
            const bestSellers = products.filter((p: FeaturedProduct) => p.tags?.includes('best-seller')).length;
            const newProducts = products.filter((p: FeaturedProduct) => p.tags?.includes('new')).length;
            const promoProducts = products.filter((p: FeaturedProduct) => p.tags?.includes('promo')).length;
            
            setStats({
                bestSellers,
                newProducts,
                promoProducts,
                totalProducts: products.length
            });

            // Get recent featured products
            const featuredProducts = products
                .filter((p: FeaturedProduct) => p.tags?.some(tag => ['best-seller', 'new', 'promo'].includes(tag)))
                .sort((a: FeaturedProduct, b: FeaturedProduct) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 8);
            
            setRecentProducts(featuredProducts);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                            <Star className="h-5 w-5" />
                        </div>
                        Sản phẩm Nổi bật
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        Tổng quan và quản lý sản phẩm hiển thị trên trang chủ
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Thêm Sản phẩm
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link href="/admin/products/best-sellers" className="glass-card p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{stats.bestSellers}</div>
                            <div className="text-sm text-slate-600">Sản phẩm Bán chạy</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-blue-600 font-medium">
                        Quản lý →
                    </div>
                </Link>

                <Link href="/admin/products/new-products" className="glass-card p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{stats.newProducts}</div>
                            <div className="text-sm text-slate-600">Sản phẩm Mới</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-green-600 font-medium">
                        Quản lý →
                    </div>
                </Link>

                <Link href="/admin/product-tags" className="glass-card p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{stats.promoProducts}</div>
                            <div className="text-sm text-slate-600">Khuyến mãi</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-orange-600 font-medium">
                        Quản lý Tags →
                    </div>
                </Link>

                <Link href="/admin/products" className="glass-card p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white shadow-lg shadow-slate-500/25 group-hover:scale-110 transition-transform">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{stats.totalProducts}</div>
                            <div className="text-sm text-slate-600">Tổng sản phẩm</div>
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-600 font-medium">
                        Xem tất cả →
                    </div>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Thao tác nhanh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin/products/best-sellers"
                        className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                    >
                        <TrendingUp className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="font-medium text-blue-800">Quản lý Bán chạy</div>
                            <div className="text-sm text-blue-600">Thêm/xóa sản phẩm bán chạy</div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/products/new-products"
                        className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                    >
                        <Sparkles className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="font-medium text-green-800">Quản lý Sản phẩm Mới</div>
                            <div className="text-sm text-green-600">Thêm/xóa sản phẩm mới</div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/product-tags"
                        className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
                    >
                        <BarChart3 className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                        <div>
                            <div className="font-medium text-orange-800">Quản lý Tags</div>
                            <div className="text-sm text-orange-600">Xem thống kê và quản lý tags</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Featured Products */}
            <div className="glass-card">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-slate-600" />
                        Sản phẩm Nổi bật gần đây ({recentProducts.length})
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Các sản phẩm có tags đặc biệt được thêm gần đây</p>
                </div>
                <div className="p-6">
                    {recentProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500">Chưa có sản phẩm nổi bật nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentProducts.map((product) => (
                                <div key={product._id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
                                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-slate-50">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <h4 className="font-medium text-slate-800 text-sm mb-2 line-clamp-2">
                                        {product.name}
                                    </h4>
                                    <div className="text-lg font-bold text-amber-600 mb-2">
                                        {product.currentPrice.toLocaleString()}đ
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {product.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    tag === 'best-seller' ? 'bg-blue-100 text-blue-700' :
                                                    tag === 'new' ? 'bg-green-100 text-green-700' :
                                                    tag === 'promo' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {tag === 'best-seller' ? 'Bán chạy' :
                                                 tag === 'new' ? 'Mới' :
                                                 tag === 'promo' ? 'Khuyến mãi' : tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}