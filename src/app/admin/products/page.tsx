'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Package,
    Search,
    Filter,
    Grid3X3,
    List,
    Loader2,
    Image as ImageIcon,
    Edit3,
    Trash2,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Box,
    ArrowUpRight,
    Download
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface Product {
    _id: string;
    id: string;
    name: string;
    currentPrice: number;
    originalPrice?: number;
    category?: string;
    image: string;
    images?: string[];
    stock: number;
    stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock';
    sku?: string;
    soldCount?: number;
    sortOrder?: number;
    createdAt?: Date;
}

const STATUS_CONFIG = {
    in_stock: { label: 'Còn hàng', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', icon: CheckCircle2 },
    low_stock: { label: 'Sắp hết', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: AlertCircle },
    out_of_stock: { label: 'Hết hàng', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: XCircle },
};

export default function AdminProductsPage() {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [updatingStock, setUpdatingStock] = useState<string | null>(null);

    // Stats
    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.stockStatus === 'in_stock').length;
    const outOfStockCount = products.filter(p => p.stockStatus === 'out_of_stock').length;
    const lowStockCount = products.filter(p => p.stockStatus === 'low_stock').length;

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            const mappedProducts = data.map((p: any) => ({
                ...p,
                id: p._id,
                stock: p.stock || 0,
                stockStatus: p.stockStatus || (p.stock > 10 ? 'in_stock' : p.stock > 0 ? 'low_stock' : 'out_of_stock'),
                soldCount: p.soldCount || 0,
            }));
            setProducts(mappedProducts);
        } catch (err) {
            toast.error('Lỗi tải sản phẩm', 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleUpdateStockStatus = async (productId: string, newStatus: 'in_stock' | 'out_of_stock') => {
        setUpdatingStock(productId);
        try {
            const res = await fetch(`/api/admin/products/${productId}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stockStatus: newStatus }),
            });

            if (res.ok) {
                setProducts(prev => prev.map(p =>
                    p.id === productId ? { ...p, stockStatus: newStatus } : p
                ));
                toast.success('Cập nhật thành công', `Sản phẩm đã chuyển sang trạng thái ${STATUS_CONFIG[newStatus].label}`);
            } else {
                throw new Error('Failed to update');
            }
        } catch {
            toast.error('Lỗi cập nhật', 'Không thể cập nhật trạng thái tồn kho');
        } finally {
            setUpdatingStock(null);
        }
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa',
            description: `Bạn có chắc muốn xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa sản phẩm',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success('Đã xóa sản phẩm');
            } else {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || 'Failed to delete');
            }
        } catch (error: any) {
            toast.error('Lỗi xóa sản phẩm', error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const toggleSelectProduct = (productId: string) => {
        const newSet = new Set(selectedProducts);
        if (newSet.has(productId)) {
            newSet.delete(productId);
        } else {
            newSet.add(productId);
        }
        setSelectedProducts(newSet);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStock = stockFilter === 'all' || product.stockStatus === stockFilter;
        return matchesSearch && matchesStock;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                            <Package className="h-5 w-5" />
                        </div>
                        Quản lý Sản phẩm
                    </h1>
                    <p className="text-slate-500 mt-1">{totalProducts} sản phẩm trong kho</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </button>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30"
                    >
                        <Plus className="h-5 w-5" />
                        Thêm sản phẩm
                    </Link>
                </div>
            </div>

            {/* Stats Cards - Bento Grid Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tổng sản phẩm</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                            <Box className="h-5 w-5 text-brand" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>+12% so với tháng trước</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Còn hàng</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{inStockCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${totalProducts ? (inStockCount / totalProducts) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Sắp hết hàng</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-amber-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${totalProducts ? (lowStockCount / totalProducts) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Hết hàng</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                            className="bg-red-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${totalProducts ? (outOfStockCount / totalProducts) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                        />
                    </div>

                    {/* Stock Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                        {([
                            { key: 'all', label: 'Tất cả', count: totalProducts },
                            { key: 'in_stock', label: 'Còn hàng', count: inStockCount },
                            { key: 'low_stock', label: 'Sắp hết', count: lowStockCount },
                            { key: 'out_of_stock', label: 'Hết hàng', count: outOfStockCount },
                        ] as const).map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setStockFilter(filter.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${stockFilter === filter.key
                                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                {filter.label}
                                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${stockFilter === filter.key ? 'bg-white/20' : 'bg-slate-200'
                                    }`}>
                                    {filter.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list'
                                ? 'bg-brand text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid'
                                ? 'bg-brand text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Display */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Package className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Không tìm thấy sản phẩm</h3>
                    <p className="text-slate-500 mt-1">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm mới
                    </Link>
                </div>
            ) : viewMode === 'list' ? (
                /* List View */
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-4 w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ưu tiên</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tồn kho</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => {
                                    const status = STATUS_CONFIG[product.stockStatus];
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr
                                            key={product.id}
                                            className="group hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.has(product.id)}
                                                    onChange={() => toggleSelectProduct(product.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 group-hover:border-brand/30 transition-colors">
                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ImageIcon className="h-6 w-6 text-slate-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                            SKU: {product.sku || product.id.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                                                    {product.category || 'Chưa phân loại'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-slate-900">
                                                        {product.currentPrice?.toLocaleString('vi-VN')}đ
                                                    </p>
                                                    {!!product.originalPrice && Number(product.originalPrice) > 0 && (
                                                        <p className="text-sm text-slate-400 line-through">
                                                            {product.originalPrice?.toLocaleString('vi-VN')}đ
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-brand min-w-[36px]">
                                                    {product.sortOrder || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                                                    <Box className="h-4 w-4 text-slate-400" />
                                                    <span className="font-semibold text-slate-700">{product.stock || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleUpdateStockStatus(
                                                            product.id,
                                                            product.stockStatus === 'out_of_stock' ? 'in_stock' : 'out_of_stock'
                                                        )}
                                                        disabled={updatingStock === product.id}
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${product.stockStatus === 'in_stock'
                                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : product.stockStatus === 'low_stock'
                                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                            }`}
                                                    >
                                                        {updatingStock === product.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                        )}
                                                        {status.label}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => router.push(`/admin/products/${product.id}`)}
                                                        className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                        const status = STATUS_CONFIG[product.stockStatus];
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand/20 transition-all overflow-hidden"
                            >
                                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => toggleSelectProduct(product.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                                        />
                                    </div>
                                </div>

                                <div className="p-4">
                                    <p className="text-xs text-slate-500 font-mono mb-1">
                                        SKU: {product.sku || product.id.slice(-8)}
                                    </p>
                                    <h4 className="font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-brand transition-colors">
                                        {product.name}
                                    </h4>
                                    <p className="text-sm text-slate-500 mb-3">
                                        {product.category || 'Chưa phân loại'}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {product.currentPrice?.toLocaleString('vi-VN')}đ
                                            </p>
                                            {!!product.originalPrice && Number(product.originalPrice) > 0 && (
                                                <p className="text-xs text-slate-400 line-through">
                                                    {product.originalPrice?.toLocaleString('vi-VN')}đ
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Tồn kho</p>
                                            <p className="font-semibold text-slate-700">{product.stock || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => router.push(`/admin/products/${product.id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-brand/10 text-slate-600 hover:text-brand rounded-xl text-sm font-medium transition-all"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStockStatus(
                                                product.id,
                                                product.stockStatus === 'out_of_stock' ? 'in_stock' : 'out_of_stock'
                                            )}
                                            disabled={updatingStock === product.id}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${product.stockStatus === 'out_of_stock'
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            {updatingStock === product.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    {product.stockStatus === 'out_of_stock' ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                    {product.stockStatus === 'out_of_stock' ? 'Mở bán' : 'Hết hàng'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedProducts.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl">
                        <span className="text-sm font-medium">
                            Đã chọn {selectedProducts.size} sản phẩm
                        </span>
                        <div className="w-px h-4 bg-slate-700" />
                        <button className="text-sm hover:text-brand-light transition-colors">
                            Xóa
                        </button>
                        <button className="text-sm hover:text-brand-light transition-colors">
                            Cập nhật tồn kho
                        </button>
                        <button
                            onClick={() => setSelectedProducts(new Set())}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
