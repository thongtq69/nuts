'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import {
    GripVertical,
    Save,
    ArrowLeft,
    Package,
    Loader2,
    Search,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';

interface Product {
    _id: string;
    id: string;
    name: string;
    image: string;
    currentPrice: number;
    category: string;
    sortOrder: number;
}

export default function ProductReorderPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                // Products from API are already sorted by sortOrder desc
                setProducts(data);
            }
        } catch (error) {
            toast.error('Lỗi', 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;

        const newProducts = [...products];
        const itemToMove = newProducts.splice(draggedItem, 1)[0];
        newProducts.splice(index, 0, itemToMove);

        setProducts(newProducts);
        setDraggedItem(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const productIds = products.map(p => p._id);
            const res = await fetch('/api/products/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds }),
            });

            if (res.ok) {
                toast.success('Sắp xếp thành công', 'Thứ tự hiển thị đã được cập nhật');
                router.refresh();
            } else {
                throw new Error('Failed to save order');
            }
        } catch (error) {
            toast.error('Lỗi', 'Không thể lưu thứ tự mới');
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white shadow-lg shadow-brand/25">
                                <GripVertical className="h-5 w-5" />
                            </div>
                            Sắp xếp hiển thị
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">
                            Kéo thả để thay đổi thứ tự xuất hiện của sản phẩm trên trang chủ
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <button
                        onClick={handleSaveOrder}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-brand/25 hover:shadow-xl disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Đang lưu...' : 'Lưu thứ tự'}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm để sắp xếp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
            </div>

            {/* Reorder List/Grid */}
            {viewMode === 'list' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product._id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-move ${draggedItem === index ? 'opacity-50 bg-brand/5 border-2 border-brand border-dashed' : ''
                                    }`}
                            >
                                <div className="text-slate-400 group-hover:text-brand transition-colors">
                                    <GripVertical size={20} />
                                </div>
                                <div className="text-sm font-bold text-slate-400 w-8">
                                    #{index + 1}
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                            {product.category}
                                        </span>
                                        <span className="text-xs text-brand font-bold">
                                            {product.currentPrice.toLocaleString('vi-VN')}₫
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 italic">
                                    Order: {product.sortOrder}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product._id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-move relative flex flex-col items-center text-center group ${draggedItem === index ? 'opacity-50 ring-2 ring-brand ring-dashed ring-offset-2' : ''
                                }`}
                        >
                            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                                {index + 1}
                            </div>
                            <div className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical size={14} />
                            </div>
                            <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-3">
                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 min-h-[32px]">{product.name}</h4>
                        </div>
                    ))}
                </div>
            )}

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Không tìm thấy sản phẩm nào</p>
                </div>
            )}

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                    💡
                </div>
                <div className="text-sm text-amber-800">
                    <p className="font-bold">Mẹo nhỏ:</p>
                    <p>Thứ tự ở đây sẽ tương ứng chính xác với thứ tự hiển thị trên trang chủ và danh sách sản phẩm. Sản phẩm ở trên cùng (#1) sẽ được hiển thị đầu tiên.</p>
                </div>
            </div>
        </div>
    );
}
