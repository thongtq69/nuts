'use client';

import { useState, useEffect } from 'react';
import { 
    Image as ImageIcon, 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Loader2, 
    Eye, 
    EyeOff,
    Link as LinkIcon
} from 'lucide-react';

interface Banner {
    _id: string;
    title: string;
    imageUrl: string;
    link?: string;
    isActive: boolean;
    order: number;
    clicks?: number;
    createdAt: string;
}

export default function StaffBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        link: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/staff/banners');
            if (res.ok) {
                const data = await res.json();
                setBanners(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, order: data.length + 1 }));
                }
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingBanner ? `/api/staff/banners` : '/api/staff/banners';
            const method = editingBanner ? 'PATCH' : 'POST';
            
            const body = editingBanner 
                ? { id: editingBanner._id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchBanners();
                closeModal();
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi khi lưu banner');
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Lỗi khi lưu banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;

        try {
            const res = await fetch('/api/staff/banners', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                fetchBanners();
            } else {
                alert('Lỗi khi xóa banner');
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('Lỗi khi xóa banner');
        }
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            const res = await fetch('/api/staff/banners', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: banner._id, 
                    isActive: !banner.isActive 
                })
            });

            if (res.ok) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Error toggling active:', error);
        }
    };

    const openModal = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                imageUrl: banner.imageUrl,
                link: banner.link || '',
                order: banner.order,
                isActive: banner.isActive
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                imageUrl: '',
                link: '',
                order: banners.length + 1,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBanner(null);
    };

    const stats = {
        total: banners.length,
        active: banners.filter(b => b.isActive).length,
        inactive: banners.filter(b => !b.isActive).length,
        clicks: banners.reduce((sum, b) => sum + (b.clicks || 0), 0)
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/25">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        Quản lý Banner
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {banners.length} banner • {stats.active} đang hoạt động
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-orange-500/25 transition-all"
                >
                    <Plus size={20} />
                    Thêm banner mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                            <ImageIcon className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-800">{stats.total}</div>
                            <div className="text-gray-500 font-medium">Tổng banner</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                            <Eye className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-emerald-600">{stats.active}</div>
                            <div className="text-gray-500 font-medium">Hoạt động</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <EyeOff className="w-7 h-7 text-gray-500" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-500">{stats.inactive}</div>
                            <div className="text-gray-500 font-medium">Không hoạt động</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                            <LinkIcon className="w-7 h-7 text-violet-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-violet-600">{stats.clicks}</div>
                            <div className="text-gray-500 font-medium">Lượt click</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner Grid */}
            {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium">Đang tải...</p>
                    </div>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium text-lg">Chưa có banner nào</p>
                            <p className="text-gray-500 text-sm mt-1">Hãy tạo banner đầu tiên!</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Tạo banner đầu tiên
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {banners.map((banner) => (
                        <div 
                            key={banner._id}
                            className={`bg-white rounded-3xl shadow-lg border overflow-hidden transition-all hover:shadow-xl ${
                                banner.isActive ? 'border-gray-100' : 'border-gray-200 opacity-70'
                            }`}
                        >
                            {/* Banner Image */}
                            <div className="relative aspect-video bg-gray-100">
                                {banner.imageUrl ? (
                                    <img 
                                        src={banner.imageUrl} 
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        banner.isActive 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-gray-400 text-white'
                                    }`}>
                                        {banner.isActive ? '✅ Hoạt động' : '❌ Tắt'}
                                    </span>
                                </div>
                                {/* Order Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-700 shadow">
                                        #{banner.order}
                                    </span>
                                </div>
                            </div>

                            {/* Banner Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{banner.title}</h3>
                                {banner.link && (
                                    <p className="text-gray-500 text-sm line-clamp-1 mb-3">
                                        <LinkIcon size={12} className="inline mr-1" />
                                        {banner.link}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        {banner.clicks || 0} clicks
                                    </span>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleToggleActive(banner)}
                                            className={`p-2 rounded-lg transition-all ${
                                                banner.isActive
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                    : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                            }`}
                                            title={banner.isActive ? 'Tắt banner' : 'Bật banner'}
                                        >
                                            {banner.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button
                                            onClick={() => openModal(banner)}
                                            className="p-2 bg-brand/10 text-brand hover:bg-brand/20 rounded-lg transition-all"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                                            title="Xóa"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingBanner ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="Nhập tiêu đề banner..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">URL hình ảnh *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="Nhập URL hình ảnh..."
                                />
                                {formData.imageUrl && (
                                    <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200">
                                        <img 
                                            src={formData.imageUrl} 
                                            alt="Preview"
                                            className="w-full aspect-video object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Link (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="https://example.com..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                            formData.isActive
                                                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                                                : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                        }`}
                                    >
                                        {formData.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        {formData.isActive ? 'Hoạt động' : 'Tạm tắt'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        'Lưu banner'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
