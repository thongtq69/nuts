'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProductListActions from '@/components/admin/ProductListActions';
import { PlusCircle, Package, Grid3X3, List, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { ExportButton, exportToCSV, ExportColumn } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { Button } from '@/components/admin/ui/Button';

interface Product {
    id: string;
    name: string;
    currentPrice: number;
    originalPrice?: number;
    category?: string;
    image: string;
    inStock: boolean;
    createdAt?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
        isOpen: false,
        productId: null,
        productName: ''
    });
    const [deleting, setDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            const mappedProducts = data.map((p: any) => ({
                id: p._id,
                name: p.name,
                currentPrice: p.currentPrice,
                originalPrice: p.originalPrice,
                category: p.category,
                image: p.image,
                inStock: true,
                createdAt: p.createdAt
            }));
            setProducts(mappedProducts);
            setTotalRecords(mappedProducts.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async () => {
        if (!deleteModal.productId) return;
        try {
            setDeleting(true);
            const res = await fetch(`/api/admin/products/${deleteModal.productId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== deleteModal.productId));
                setTotalRecords(prev => prev - 1);
                setDeleteModal({ isOpen: false, productId: null, productName: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi xóa sản phẩm');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Lỗi xóa sản phẩm');
        } finally {
            setDeleting(false);
        }
    };

    const openDeleteModal = (productId: string, productName: string) => {
        setDeleteModal({ isOpen: true, productId, productName });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const exportColumns: ExportColumn<Product>[] = [
        { key: 'id', label: 'ID', format: (v) => v || '' },
        { key: 'name', label: 'Tên sản phẩm' },
        { key: 'category', label: 'Danh mục' },
        { key: 'originalPrice', label: 'Giá gốc', format: (v) => v ? `${v.toLocaleString()}đ` : '-' },
        { key: 'currentPrice', label: 'Giá bán', format: (v) => `${v.toLocaleString()}đ` },
        { key: 'inStock', label: 'Trạng thái', format: (v) => v ? 'Còn hàng' : 'Hết hàng' }
    ];

    if (loading && products.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <p className="text-red-500">Error: {error}</p>
                    <button
                        onClick={fetchProducts}
                        className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDelete}
                title="Xóa sản phẩm"
                message={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteModal.productName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
                isLoading={deleting}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                            <Package className="h-5 w-5" />
                        </div>
                        Quản lý Sản phẩm
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        {filteredProducts.length} sản phẩm
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportButton
                        data={filteredProducts}
                        columns={exportColumns}
                        filename="san-pham"
                        disabled={filteredProducts.length === 0}
                    />
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 bg-brand-light hover:bg-brand-light/80 text-slate-800 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <PlusCircle size={18} />
                        Thêm Sản phẩm Mới
                    </Link>
                </div>
            </div>

            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm kiếm sản phẩm..."
                        isLoading={loading}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                        Lọc
                    </button>
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button className="px-3 py-2.5 bg-brand-light/20 dark:bg-brand-light/10 text-brand border-r border-slate-200 dark:border-slate-700">
                            <List size={18} />
                        </button>
                        <button className="px-3 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <Grid3X3 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">STT</th>
                                <th className="w-20">Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th className="text-right">Giá gốc</th>
                                <th className="text-right">Giá bán</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Package className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
                                            </p>
                                            {!searchTerm && (
                                                <Link href="/admin/products/new" className="text-brand hover:text-brand-dark font-medium text-sm">
                                                    + Thêm sản phẩm đầu tiên
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        onClick={() => window.location.href = `/admin/products/${product.id}`}
                                    >
                                        <td className="text-center font-semibold text-slate-500 text-sm">
                                            {startIndex + index + 1}
                                        </td>
                                        <td>
                                            <div className="h-14 w-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 p-1.5 group-hover:border-brand transition-colors">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-semibold text-slate-800 dark:text-white group-hover:text-brand transition-colors">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">
                                                ID: {product.id.slice(-8)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-premium badge-info">
                                                {product.category || 'Chưa phân loại'}
                                            </span>
                                        </td>
                                        <td className="text-right text-slate-500 dark:text-slate-400 line-through text-sm">
                                            {product.originalPrice?.toLocaleString()}đ
                                        </td>
                                        <td className="text-right">
                                            <span className="font-bold text-lg text-brand">
                                                {product.currentPrice.toLocaleString()}đ
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            {product.inStock ? (
                                                <span className="badge-premium badge-success">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Còn hàng
                                                </span>
                                            ) : (
                                                <span className="badge-premium badge-danger">
                                                    Hết hàng
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <ProductListActions productId={product.id} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={filteredProducts.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    isLoading={loading}
                />
            </div>
        </div>
    );
}
