'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Tag, X, Image as ImageIcon, TrendingUp } from 'lucide-react';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    category: string;
    coverImage?: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
}

const CATEGORIES = ['Tin tức', 'Hướng dẫn', 'Review', 'Khuyến mãi'];

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Tin tức',
        coverImage: '',
        isPublished: false,
    });

    // Mock stats
    const stats = {
        totalBlogs: blogs.length,
        published: blogs.filter(b => b.isPublished).length,
        draft: blogs.filter(b => !b.isPublished).length,
        views: 1250
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs');
            const data = await res.json();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingBlog
                ? `/api/blogs/${editingBlog._id}`
                : '/api/blogs';
            const method = editingBlog ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchBlogs();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving blog:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xác nhận xóa bài viết này?')) return;

        try {
            const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
        }
    };

    const handleTogglePublish = async (blog: Blog) => {
        try {
            const res = await fetch(`/api/blogs/${blog._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !blog.isPublished }),
            });
            if (res.ok) {
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error toggling blog:', error);
        }
    };

    const openModal = async (blog?: Blog) => {
        if (blog) {
            const res = await fetch(`/api/blogs/${blog._id}`);
            const fullBlog = await res.json();
            setEditingBlog(blog);
            setFormData({
                title: fullBlog.title,
                excerpt: fullBlog.excerpt,
                content: fullBlog.content,
                category: fullBlog.category,
                coverImage: fullBlog.coverImage || '',
                isPublished: fullBlog.isPublished,
            });
        } else {
            setEditingBlog(null);
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                category: 'Tin tức',
                coverImage: '',
                isPublished: false,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBlog(null);
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
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý Bài viết</h1>
                    <p className="text-slate-500 mt-1">Quản lý nội dung blog và tin tức</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-amber-700 transition-all hover:shadow-lg"
                >
                    <Plus size={20} />
                    Thêm bài viết
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <FileText className="w-6 h-6 text-blue-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Tổng bài viết</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalBlogs}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-50">
                            <Eye className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Đã xuất bản</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.published}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-50">
                            <EyeOff className="w-6 h-6 text-amber-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Bản nháp</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.draft}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-50">
                            <TrendingUp className="w-6 h-6 text-purple-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Lượt xem</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.views}</div>
                    </div>
                </div>
            </div>

            {/* Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                        {/* Cover Image */}
                        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                            {blog.coverImage ? (
                                <img 
                                    src={blog.coverImage} 
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <FileText className="w-16 h-16 text-slate-300" />
                                </div>
                            )}
                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                                {blog.isPublished ? (
                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <Eye size={12} />
                                        Xuất bản
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <EyeOff size={12} />
                                        Nháp
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                                    {blog.category}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                {blog.title}
                            </h3>
                            
                            <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                {blog.excerpt}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleTogglePublish(blog)}
                                    className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                        blog.isPublished
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {blog.isPublished ? 'Ẩn' : 'Xuất bản'}
                                </button>
                                <button
                                    onClick={() => openModal(blog)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(blog._id)}
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
            {blogs.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <FileText className="text-slate-400" size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có bài viết nào</h3>
                            <p className="text-slate-500 mb-6">Thêm bài viết đầu tiên để hiển thị trên blog</p>
                            <button
                                onClick={() => openModal()}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                            >
                                Tạo bài viết đầu tiên
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText size={24} />
                                {editingBlog ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
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
                                        <FileText size={16} className="text-amber-600" />
                                        Tiêu đề bài viết
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        placeholder="Nhập tiêu đề bài viết..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            <Tag size={16} className="text-blue-600" />
                                            Danh mục
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                            {formData.isPublished ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-amber-600" />}
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.isPublished ? 'published' : 'draft'}
                                            onChange={e => setFormData({ ...formData, isPublished: e.target.value === 'published' })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        >
                                            <option value="draft">Nháp</option>
                                            <option value="published">Xuất bản</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <ImageIcon size={16} className="text-purple-600" />
                                        Ảnh bìa (URL)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.coverImage}
                                        onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Mô tả ngắn</label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                        required
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                                        placeholder="Mô tả ngắn gọn về bài viết..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Nội dung</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        required
                                        rows={12}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none font-mono text-sm"
                                        placeholder="Nội dung chi tiết bài viết..."
                                    />
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
                                    {editingBlog ? 'Cập nhật' : 'Thêm bài viết'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
