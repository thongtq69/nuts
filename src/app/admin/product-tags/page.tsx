'use client';

import { useState, useEffect } from 'react';
import { Tag, RefreshCw, Plus, Check, AlertCircle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    tags: string[];
}

interface TagStats {
    'best-seller': number;
    'new': number;
    'promo': number;
    'featured': number;
    'no-tags': number;
}

export default function ProductTagsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [tagStats, setTagStats] = useState<TagStats>({
        'best-seller': 0,
        'new': 0,
        'promo': 0,
        'featured': 0,
        'no-tags': 0
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProductTags();
    }, []);

    const fetchProductTags = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/seed/product-tags');
            const data = await response.json();
            
            if (response.ok) {
                setProducts(data.products);
                setTagStats(data.tagStats);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to fetch product tags' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching product tags' });
        } finally {
            setLoading(false);
        }
    };

    const updateProductTags = async () => {
        try {
            setUpdating(true);
            setMessage(null);
            
            const response = await fetch('/api/seed/product-tags', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
                // Refresh data
                await fetchProductTags();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update product tags' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error updating product tags' });
        } finally {
            setUpdating(false);
        }
    };

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
                            <Tag className="h-5 w-5" />
                        </div>
                        Quản lý Tags Sản phẩm
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        Quản lý tags để hiển thị sản phẩm trên trang chủ
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchProductTags}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-medium transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                    <button
                        onClick={updateProductTags}
                        disabled={updating}
                        className="inline-flex items-center gap-2 bg-brand-light/30 hover:bg-brand-light/50 text-slate-800 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        {updating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        {updating ? 'Đang cập nhật...' : 'Thêm Tags Tự động'}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.type === 'success' ? (
                        <Check className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-brand">{tagStats['best-seller']}</div>
                    <div className="text-sm text-slate-600">Bán chạy</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{tagStats['new']}</div>
                    <div className="text-sm text-slate-600">Sản phẩm mới</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{tagStats['promo']}</div>
                    <div className="text-sm text-slate-600">Khuyến mãi</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-brand">{tagStats['featured']}</div>
                    <div className="text-sm text-slate-600">Nổi bật</div>
                </div>
                <div className="glass-card p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{tagStats['no-tags']}</div>
                    <div className="text-sm text-slate-600">Chưa có tags</div>
                </div>
            </div>

            {/* Products Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Danh sách sản phẩm và tags</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">STT</th>
                                <th>Tên sản phẩm</th>
                                <th className="text-center">Tags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Tag className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">Chưa có sản phẩm nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td>
                                            <div className="font-semibold text-slate-800">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                ID: {product.id.slice(-8)}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {product.tags.length > 0 ? (
                                                    product.tags.map((tag, tagIndex) => (
                                                        <span
                                                            key={tagIndex}
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                 tag === 'best-seller' ? 'bg-brand/10 text-brand' :
                                                                 tag === 'new' ? 'bg-emerald-100 text-emerald-800' :
                                                                 tag === 'promo' ? 'bg-brand-light/30 text-brand-dark' :
                                                                 tag === 'featured' ? 'bg-brand-light/50 text-brand-dark' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Chưa có tags</span>
                                                )}
                                            </div>
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