import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Link from 'next/link';
import ProductListActions from '@/components/admin/ProductListActions';
import { PlusCircle, Search, Filter, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts() {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        currentPrice: p.currentPrice,
        category: p.category,
        image: p.image,
    }));
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="h-6 w-6 text-amber-600" />
                        Quản lý Sản phẩm
                    </h1>
                    <p className="text-slate-500 mt-1">Danh sách tất cả sản phẩm đang có trên hệ thống.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <PlusCircle size={18} />
                    Thêm Sản phẩm Mới
                </Link>
            </div>

            {/* Filters (Placeholder for now) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg char(104)over:bg-slate-50 text-slate-700 font-medium">
                    <Filter size={18} />
                    Lọc
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 w-20">Hình ảnh</th>
                                <th className="px-6 py-4">Tên sản phẩm</th>
                                <th className="px-6 py-4">Danh mục</th>
                                <th className="px-6 py-4 text-right">Giá bán</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                        Chưa có sản phẩm nào.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="h-12 w-12 rounded-lg border border-slate-200 overflow-hidden bg-white p-1">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{product.name}</div>
                                            <div className="text-xs text-slate-500">ID: {product.id.slice(-6)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                {product.category || 'Chưa phân loại'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-amber-600">
                                            {product.currentPrice.toLocaleString()}đ
                                        </td>
                                        <td className="px-6 py-4 text-right">
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
