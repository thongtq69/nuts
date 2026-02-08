'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import {
    Save,
    ArrowLeft,
    Package,
    Image as ImageIcon,
    Tag,
    FileText,
    Box,
    Loader2,
    X,
    Plus,
    Trash2,
    Eye,
    Upload,
    CheckCircle2,
    AlertCircle,
    Grid3X3,
    Settings,
    BarChart3,
    Wallet
} from 'lucide-react';
import { RichTextEditor } from './ui';
import TagInput from './TagInput';

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

type TabType = 'basic' | 'images' | 'inventory' | 'seo';

const CATEGORIES = [
    { value: '', label: 'Chọn danh mục' },
    { value: 'Jars', label: 'Hũ đựng', icon: '🫙' },
    { value: 'Bags', label: 'Túi đựng', icon: '🛍️' },
    { value: 'Nuts', label: 'Các loại hạt', icon: '🥜' },
    { value: 'Berries', label: 'Quả mọng', icon: '🫐' },
    { value: 'Seeds', label: 'Hạt giống', icon: '🌱' },
    { value: 'Dried Fruits', label: 'Trái cây sấy', icon: '🍎' },
    { value: 'Snacks', label: 'Đồ ăn vặt', icon: '🍿' },
];

const BADGE_COLORS = [
    { value: '', label: 'Không có', class: '' },
    { value: 'red', label: 'Đỏ', class: 'bg-red-500' },
    { value: 'green', label: 'Xanh lá', class: 'bg-emerald-500' },
    { value: 'pink', label: 'Hồng', class: 'bg-pink-500' },
    { value: 'blue', label: 'Xanh dương', class: 'bg-blue-500' },
    { value: 'purple', label: 'Tím', class: 'bg-purple-500' },
    { value: 'orange', label: 'Cam', class: 'bg-orange-500' },
];

export default function ProductForm({ initialData = {}, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        // Basic Info
        name: initialData.name || '',
        currentPrice: initialData.currentPrice || 0,
        originalPrice: initialData.originalPrice || 0,
        category: initialData.category || '',
        shortDescription: initialData.shortDescription || '',
        description: initialData.description || '',
        tags: initialData.tags || [],

        // Images
        image: initialData.image || '',
        images: initialData.images || [],

        // Inventory
        stock: initialData.stock || 100,
        stockStatus: initialData.stockStatus || 'in_stock',
        sku: initialData.sku || '',
        soldCount: initialData.soldCount || 0,

        // Badge
        badgeText: initialData.badgeText || '',
        badgeColor: initialData.badgeColor || '',

        // SEO
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',

        // Physical
        weight: initialData.weight || 0.5,
        sortOrder: initialData.sortOrder || 0,
    });


    // Auto-detect unsaved changes
    useEffect(() => {
        setUnsavedChanges(true);
    }, [formData]);

    // Fetch all existing tags to suggest
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const products = await res.json();
                    const tags = new Set<string>();
                    products.forEach((p: any) => {
                        if (p.tags && Array.isArray(p.tags)) {
                            p.tags.forEach((t: string) => tags.add(t));
                        }
                    });
                    setAllTags(Array.from(tags));
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImages(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'gonuts/products');
        uploadData.append('type', 'product');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, image: data.url }));
                toast.success('Tải ảnh thành công');
            } else {
                throw new Error('Upload failed');
            }
        } catch {
            toast.error('Lỗi tải ảnh', 'Vui lòng thử lại');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImages(true);
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('folder', 'gonuts/products');
            uploadData.append('type', 'product');

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData
                });

                if (res.ok) {
                    const data = await res.json();
                    uploadedUrls.push(data.url);
                }
            } catch {
                toast.error('Lỗi tải ảnh', `Không thể tải ${file.name}`);
            }
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        setUploadingImages(false);

        if (uploadedUrls.length > 0) {
            toast.success(`Đã tải ${uploadedUrls.length} ảnh`);
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);

        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `/api/products/${initialData._id || initialData.id}` : '/api/products';

            const processedData = {
                ...formData,
                tags: formData.tags,
                currentPrice: Number(formData.currentPrice),
                originalPrice: Number(formData.originalPrice),
                stock: Number(formData.stock),
                soldCount: Number(formData.soldCount),
                weight: Number(formData.weight),
                sortOrder: Number(formData.sortOrder),
            };


            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            if (res.ok) {
                toast.success(isEdit ? 'Cập nhật thành công' : 'Tạo sản phẩm thành công');
                setUnsavedChanges(false);
                router.push('/admin/products');
                router.refresh();
            } else {
                const error = await res.json();
                throw new Error(error.message || 'Lưu thất bại');
            }
        } catch (error: any) {
            toast.error('Lỗi', error.message || 'Không thể lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'basic', label: 'Thông tin cơ bản', icon: Package },
        { id: 'images', label: 'Hình ảnh', icon: ImageIcon },
        { id: 'inventory', label: 'Tồn kho', icon: Box },
        { id: 'seo', label: 'SEO', icon: BarChart3 },
    ];

    // Stock status auto-update based on quantity
    const handleStockChange = (value: number) => {
        let newStatus = formData.stockStatus;
        if (value === 0) newStatus = 'out_of_stock';
        else if (value <= 10) newStatus = 'low_stock';
        else newStatus = 'in_stock';

        setFormData(prev => ({
            ...prev,
            stock: value,
            stockStatus: newStatus
        }));
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
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
                                {isEdit ? <Package className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </div>
                            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </h1>
                        {isEdit && (
                            <p className="text-slate-500 mt-1 text-sm">
                                ID: {initialData.id} • Cập nhật lần cuối: {new Date(initialData.updatedAt).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {unsavedChanges && (
                        <span className="text-sm text-amber-600 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" />
                            Chưa lưu thay đổi
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <Eye className="h-4 w-4" />
                        {previewMode ? 'Ẩn xem trước' : 'Xem trước'}
                    </button>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-brand/25 hover:shadow-xl disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {loading ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
                    </button>
                </div>
            </div>

            {/* Preview Mode */}
            {previewMode && (
                <div className="mb-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                    <div className="flex items-start gap-6">
                        <div className="w-32 h-32 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                            {formData.image ? (
                                <img src={formData.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-10 w-10 text-white/30" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    {formData.badgeText && (
                                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium mb-2 ${BADGE_COLORS.find(c => c.value === formData.badgeColor)?.class || 'bg-brand'
                                            }`}>
                                            {formData.badgeText}
                                        </span>
                                    )}
                                    <h2 className="text-2xl font-bold">{formData.name || 'Tên sản phẩm'}</h2>
                                    <p className="text-slate-400 mt-1">{CATEGORIES.find(c => c.value === formData.category)?.label || 'Chưa chọn danh mục'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-brand-light">
                                        {Number(formData.currentPrice).toLocaleString('vi-VN')}đ
                                    </p>
                                    {formData.originalPrice > 0 && (
                                        <p className="text-slate-500 line-through">
                                            {Number(formData.originalPrice).toLocaleString('vi-VN')}đ
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4 text-sm">
                                <span className="flex items-center gap-2">
                                    <Box className="h-4 w-4 text-slate-400" />
                                    Tồn kho: {formData.stock}
                                </span>
                                <span className={`flex items-center gap-2 ${formData.stockStatus === 'in_stock' ? 'text-emerald-400' :
                                    formData.stockStatus === 'low_stock' ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    {formData.stockStatus === 'in_stock' ? 'Còn hàng' :
                                        formData.stockStatus === 'low_stock' ? 'Sắp hết' : 'Hết hàng'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="border-b border-slate-100">
                    <div className="flex">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Product Name */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tên sản phẩm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập tên sản phẩm"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <Wallet size={16} className="text-brand" />
                                        Giá bán <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="currentPrice"
                                        value={formData.currentPrice}
                                        onChange={handleNumberChange}
                                        required
                                        min="0"
                                        placeholder="Nhập giá bán (VNĐ)"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    />
                                </div>

                                {/* Original Price */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <Wallet size={16} className="text-slate-400" />
                                        Giá gốc
                                        <span className="text-xs text-slate-400 ml-1">(tùy chọn)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleNumberChange}
                                        min="0"
                                        placeholder="Nhập giá gốc (VNĐ)"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    />
                                    {formData.originalPrice > formData.currentPrice && (
                                        <p className="text-xs text-emerald-600 mt-1">
                                            Giảm {Math.round((1 - formData.currentPrice / formData.originalPrice) * 100)}%
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Danh mục <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all appearance-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mã SKU
                                    </label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="VD: SP001"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-mono"
                                    />
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Thứ tự ưu tiên
                                        <span className="text-xs text-slate-400 ml-2">(Số cao hơn sẽ hiển thị trước)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="sortOrder"
                                        value={formData.sortOrder}
                                        onChange={handleNumberChange}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    />
                                </div>

                                {/* Tags */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Tags
                                    </label>
                                    <TagInput
                                        value={formData.tags}
                                        onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                                        suggestions={allTags.length > 0 ? allTags : undefined}
                                    />
                                </div>

                                {/* Badge */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nhãn sản phẩm
                                    </label>
                                    <input
                                        type="text"
                                        name="badgeText"
                                        value={formData.badgeText}
                                        onChange={handleChange}
                                        placeholder="VD: Bán chạy, Mới"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Màu nhãn
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            name="badgeColor"
                                            value={formData.badgeColor}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        >
                                            {BADGE_COLORS.map(color => (
                                                <option key={color.value} value={color.value}>
                                                    {color.label}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.badgeColor && (
                                            <div className={`w-10 h-10 rounded-xl ${BADGE_COLORS.find(c => c.value === formData.badgeColor)?.class}`} />
                                        )}
                                    </div>
                                </div>

                                {/* Short Description */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mô tả ngắn
                                        <span className="text-xs text-slate-400 ml-2">(Hiển thị ở phần thông tin sản phẩm)</span>
                                    </label>
                                    <textarea
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Mô tả ngắn gọn về sản phẩm (1-2 câu giới thiệu)..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Ví dụ: "Hạt điều vỏ lụa nguyên hạt rang muối, sự kết hợp hoàn hảo giữa hạt điều thơm ngon và vị mặn nhẹ của muối."
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mô tả chi tiết
                                        <span className="text-xs text-slate-400 ml-2">(Hiển thị trong tab "Mô tả sản phẩm")</span>
                                    </label>
                                    <RichTextEditor
                                        value={formData.description}
                                        onChange={(content: string) => setFormData(prev => ({ ...prev, description: content }))}
                                        placeholder="Nhập mô tả chi tiết về sản phẩm: thành phần, hướng vị, nguồn gốc, hướng dẫn sử dụng..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Images Tab */}
                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            {/* Main Image */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Ảnh chính <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-start gap-6">
                                    <div className="w-48 h-48 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
                                        {formData.image ? (
                                            <img
                                                src={formData.image}
                                                alt="Main"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-12 w-12 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleChange}
                                            placeholder="URL ảnh hoặc upload từ máy"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleMainImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <button
                                                type="button"
                                                disabled={uploadingImages}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all disabled:opacity-50"
                                            >
                                                {uploadingImages ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Upload className="h-4 w-4" />
                                                )}
                                                {uploadingImages ? 'Đang tải...' : 'Tải ảnh lên'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Thư viện ảnh
                                    <span className="text-xs text-slate-400 ml-1">({formData.images.length} ảnh)</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {/* Upload Button */}
                                    <div className="relative aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-brand hover:bg-brand/5 transition-all flex items-center justify-center group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleGalleryUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-center">
                                            <Plus className="h-8 w-8 text-slate-400 group-hover:text-brand mx-auto mb-1" />
                                            <span className="text-xs text-slate-500 group-hover:text-brand">Thêm ảnh</span>
                                        </div>
                                    </div>

                                    {/* Gallery Items */}
                                    {formData.images.map((img: string, index: number) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden group"
                                        >
                                            <img
                                                src={img}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Stock Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Số lượng tồn kho
                                    </label>
                                    <div className="relative">
                                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => handleStockChange(Number(e.target.value))}
                                            min="0"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Weight */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Khối lượng (kg)
                                        <span className="text-xs text-slate-400 ml-2">(Dùng để tính phí vận chuyển)</span>
                                    </label>
                                    <div className="relative">
                                        <Plus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleNumberChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="VD: 0.5"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">VD: Hộp 500g điền 0.5, Túi 100g điền 0.1</p>
                                </div>

                                {/* Stock Status */}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Trạng thái tồn kho
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, stockStatus: 'in_stock' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${formData.stockStatus === 'in_stock'
                                                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                                                : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                                                }`}
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Còn hàng
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, stockStatus: 'low_stock' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${formData.stockStatus === 'low_stock'
                                                ? 'bg-amber-50 text-amber-700 border-2 border-amber-500'
                                                : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                                                }`}
                                        >
                                            <AlertCircle className="h-4 w-4" />
                                            Sắp hết
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, stockStatus: 'out_of_stock' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${formData.stockStatus === 'out_of_stock'
                                                ? 'bg-red-50 text-red-700 border-2 border-red-500'
                                                : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                                                }`}
                                        >
                                            <X className="h-4 w-4" />
                                            Hết hàng
                                        </button>
                                    </div>
                                </div>

                                {/* Sold Count (Read-only usually) */}
                                {isEdit && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Đã bán
                                        </label>
                                        <div className="relative">
                                            <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="number"
                                                name="soldCount"
                                                value={formData.soldCount}
                                                onChange={handleNumberChange}
                                                min="0"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                                                readOnly={isEdit}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Tự động cập nhật khi có đơn hàng</p>
                                    </div>
                                )}
                            </div>

                            {/* Stock Alert */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-800">Lưu ý về tồn kho</h4>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Khi số lượng tồn kho = 0, trạng thái sẽ tự động chuyển thành &quot;Hết hàng&quot;.
                                        Sản phẩm hết hàng sẽ không hiển thị trên trang chủ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={formData.metaTitle}
                                        onChange={handleChange}
                                        placeholder={formData.name}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formData.metaTitle.length}/60 ký tự (khuyến nghị)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        name="metaDescription"
                                        value={formData.metaDescription}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder={formData.description?.slice(0, 160)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formData.metaDescription.length}/160 ký tự (khuyến nghị)
                                    </p>
                                </div>

                                {/* SEO Preview */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Xem trước Google</p>
                                    <h3 className="text-lg text-blue-600 hover:underline cursor-pointer truncate">
                                        {formData.metaTitle || formData.name || 'Tên sản phẩm'}
                                    </h3>
                                    <p className="text-sm text-green-700">
                                        gonuts.vn › sản-phẩm › {formData.category?.toLowerCase() || 'danh-muc'}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                        {formData.metaDescription || formData.description?.slice(0, 160) || 'Mô tả sản phẩm...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.push('/admin/products')}
                    className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                    Hủy
                </button>
                <div className="flex items-center gap-3">
                    {isEdit && (
                        <button
                            type="button"
                            onClick={() => router.push(`/admin/products/${initialData.id}`)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
                        >
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                        </button>
                    )}
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-all shadow-lg shadow-brand/25 hover:shadow-xl disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {loading ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
