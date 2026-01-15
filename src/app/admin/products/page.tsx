import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Link from 'next/link';
import ProductListActions from '@/components/admin/ProductListActions';
import { PlusCircle, Search, Filter, Package, Grid3X3, List } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts() {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        currentPrice: p.currentPrice,
        originalPrice: p.originalPrice,
        category: p.category,
        image: p.image,
        inStock: true, // Default to true as stock management is not yet implemented
    }));
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                            <Package className="h-5 w-5" />
                        </div>
                        Quản lý Sản phẩm
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        {products.length} sản phẩm đang có trên hệ thống
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                >
                    <PlusCircle size={18} />
                    Thêm Sản phẩm Mới
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors">
                        <Filter size={18} />
                        Lọc
                    </button>
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button className="px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-r border-slate-200 dark:border-slate-700">
                            <List size={18} />
                        </button>
                        <button className="px-3 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <Grid3X3 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table w-full">
                        <thead>
                            <tr>
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
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Package className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">Chưa có sản phẩm nào</p>
                                            <Link href="/admin/products/new" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                                                + Thêm sản phẩm đầu tiên
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.id} className="group">
                                        <td>
                                            <div className="h-14 w-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 p-1.5 group-hover:border-amber-300 transition-colors">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-semibold text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
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
                                            <span className="font-bold text-lg text-amber-600">
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
                                        <td className="text-right">
                                            <ProductListActions productId={product.id} />
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
