'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, Eye, EyeOff, Link as LinkIcon, X, ArrowUpDown, TrendingUp } from 'lucide-react';

interface Banner {
    _id: string;
    title: string;
    imageUrl: string;
    link?: string;
    isActive: boolean;
    order: number;
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        link: '',
        isActive: true,
        order: 0,
    });

    // Mock stats
    const stats = {
        totalBanners: banners.length,
        active: banners.filter(b => b.isActive).length,
        inactive: banners.filter(b => !b.isActive).length,
        clicks: 3420
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/banners');
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingBanner
                ? `/api/banners/${editingBanner._id}`
                : '/api/banners';
            const method = editingBanner ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchBanners();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving banner:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xác nhận xóa banner này?')) return;

        try {
            const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            const res = await fetch(`/api/banners/${banner._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !banner.isActive }),
            });
            if (res.ok) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Error toggling banner:', error);
        }
    };

    const openModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                imageUrl: banner.imageUrl,
                link: banner.link || '',
                isActive: banner.isActive,
                order: banner.order,
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                imageUrl: '',
                link: '',
                isActive: true,
                order: banners.length,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBanner(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-600 font-medium">Đang tải...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý Banner</h1>
                    <p className="text-slate-500 mt-1">Quản lý hình ảnh banner hiển thị trên trang chủ</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-amber-700 transition-all hover:shadow-lg"
                >
                    <Plus size={20} />
                    Thêm Banner
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <ImageIcon className="w-6 h-6 text-blue-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Tổng banner</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalBanners}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-50">
                            <Eye className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Đang hiển thị</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.active}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-50">
                            <EyeOff className="w-6 h-6 text-amber-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Đang ẩn</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.inactive}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-50">
                            <TrendingUp className="w-6 h-6 text-purple-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Lượt click</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.clicks}</div>
                    </div>
                </div>
            </div>

            {/* Banners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                        {/* Banner Image */}
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                            <img 
                                src={banner.imageUrl} 
                                alt={banner.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                            />
                            {/* Order Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 bg-slate-900/70 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                    <ArrowUpDown size={12} />
                                    #{banner.order}
                                </span>
                            </div>
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                                {banner.isActive ? (
                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <Eye size={12} />
                                        Hiển thị
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-slate-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <EyeOff size={12} />
                                        Ẩn
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                {banner.title}
                            </h3>
                            
                            {banner.link && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                    <LinkIcon size={14} />
                                    <span className="truncate">{banner.link}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleToggleActive(banner)}
                                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                        banner.isActive
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {banner.isActive ? 'Ẩn' : 'Hiển thị'}
                                </button>
                                <button
                                    onClick={() => openModal(banner)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {banners.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="text-slate-400" size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có banner nào</h3>
                            <p className="text-slate-500 mb-6">Thêm banner đầu tiên để hiển thị trên trang chủ</p>
                            <button
                                onClick={() => openModal()}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                            >
                                Tạo banner đầu tiên
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ImageIcon size={24} />
                                {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
                            </h2>
                            <button onClick={closeModal} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <ImageIcon size={16} className="text-amber-600" />
                                        Tiêu đề Banner
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        placeholder="Nhập tiêu đề banner..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <ImageIcon size={16} className="text-blue-600" />
                                        URL Hình ảnh
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        placeholder="https://example.com/banner.jpg"
                                    />
                                    {formData.imageUrl && (
                                        <div className="mt-3 rounded-lg overflow-hidden border-2 border-slate-200">
                                            <img 
                                                src={formData.imageUrl} 
                                                alt="Preview" 
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f1f5f9" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="14"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <LinkIcon size={16} className="text-purple-600" />
                                        Link đích (tùy chọn)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        placeholder="https://example.com/promotion"
                                    />
                                    <p className="text-xs text-slate-500">Link khi người dùng click vào banner</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <ArrowUpDown size={16} className="text-slate-600" />
                                            Thứ tự hiển thị
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            min="0"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            {formData.isActive ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-slate-600" />}
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.isActive ? 'active' : 'inactive'}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        >
                                            <option value="active">Hiển thị</option>
                                            <option value="inactive">Ẩn</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-200 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                                >
                                    {editingBanner ? 'Cập nhật' : 'Thêm Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
