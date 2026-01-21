'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    FileText,
    Plus,
    Edit2,
    Trash2,
    Search,
    Calendar,
    Tag,
    X,
    Loader2,
    Eye,
    EyeOff,
    Upload,
    Image,
    XCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

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
    views?: number;
    createdAt: string;
}

const CATEGORIES = ['Tin tức', 'Hướng dẫn', 'Review', 'Khuyến mãi'];

const quillModules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

export default function StaffBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const toast = useToast();
    const confirm = useConfirm();

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Tin tức',
        coverImage: '',
        isPublished: true
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/staff/blogs');
            if (res.ok) {
                const data = await res.json();
                setBlogs(data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Lỗi upload', 'Vui lòng chọn file ảnh');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Lỗi upload', 'File ảnh không được vượt quá 5MB');
            return;
        }

        setUploadingImage(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('type', 'blog');
            uploadData.append('folder', 'gonuts/blogs');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, coverImage: data.url });
                toast.success('Thành công', 'Upload ảnh thành công');
            } else {
                const error = await res.json();
                toast.error('Lỗi upload', error.message || 'Không thể upload ảnh');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Lỗi upload', 'Có lỗi xảy ra khi upload ảnh');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeCoverImage = () => {
        setFormData({ ...formData, coverImage: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingBlog ? `/api/staff/blogs` : '/api/staff/blogs';
            const method = editingBlog ? 'PATCH' : 'POST';

            const body = editingBlog
                ? { id: editingBlog._id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchBlogs();
                closeModal();
            } else {
                const data = await res.json();
                toast.error('Lỗi khi lưu bài viết', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            toast.error('Lỗi khi lưu bài viết', 'Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa bài viết',
            description: 'Bạn có chắc chắn muốn xóa bài viết này?',
            confirmText: 'Xóa bài viết',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            const res = await fetch('/api/staff/blogs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                fetchBlogs();
            } else {
                toast.error('Lỗi khi xóa bài viết', 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error('Lỗi khi xóa bài viết', 'Vui lòng thử lại.');
        }
    };

    const handleTogglePublish = async (blog: Blog) => {
        try {
            const res = await fetch('/api/staff/blogs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: blog._id,
                    isPublished: !blog.isPublished
                })
            });

            if (res.ok) {
                fetchBlogs();
            }
        } catch (error) {
            console.error('Error toggling publish:', error);
        }
    };

    const openModal = (blog?: Blog) => {
        if (blog) {
            setEditingBlog(blog);
            setFormData({
                title: blog.title,
                excerpt: blog.excerpt || '',
                content: blog.content || '',
                category: blog.category,
                coverImage: blog.coverImage || '',
                isPublished: blog.isPublished
            });
        } else {
            setEditingBlog(null);
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                category: 'Tin tức',
                coverImage: '',
                isPublished: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBlog(null);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: blogs.length,
        published: blogs.filter(b => b.isPublished).length,
        draft: blogs.filter(b => !b.isPublished).length,
        views: blogs.reduce((sum, b) => sum + (b.views || 0), 0)
    };

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-gray-800 shadow-xl shadow-brand/25">
                            <FileText className="w-6 h-6" />
                        </div>
                        Quản lý Bài viết
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {blogs.length} bài viết • {stats.published} đã đăng • {stats.draft} bản nháp
                    </p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark shadow-xl shadow-brand/30 transition-all border-2 border-brand"
                >
                    <Plus size={20} />
                    Tạo bài viết mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-light/10 flex items-center justify-center">
                            <FileText className="w-7 h-7 text-brand" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-800">{stats.total}</div>
                            <div className="text-gray-500 font-medium">Tổng bài viết</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                            <Eye className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-emerald-600">{stats.published}</div>
                            <div className="text-gray-500 font-medium">Đã đăng</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                            <Edit2 className="w-7 h-7 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-amber-600">{stats.draft}</div>
                            <div className="text-gray-500 font-medium">Bản nháp</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                            <Eye className="w-7 h-7 text-violet-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-violet-600">{stats.views}</div>
                            <div className="text-gray-500 font-medium">Lượt xem</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all text-lg"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                                            <p className="text-gray-500 font-medium">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <FileText className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium text-lg">
                                                    {searchTerm ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
                                                </p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {searchTerm ? 'Thử từ khóa khác' : 'Hãy tạo bài viết đầu tiên!'}
                                                </p>
                                            </div>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => openModal()}
                                                    className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-brand/30 transition-all flex items-center gap-2 border-2 border-brand"
                                                >
                                                    <Plus size={18} />
                                                    Tạo bài viết đầu tiên
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                {blog.coverImage && (
                                                    <img
                                                        src={blog.coverImage}
                                                        alt={blog.title}
                                                        className="w-12 h-12 rounded-xl object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-800 line-clamp-1">{blog.title}</div>
                                                    <div className="text-gray-500 text-sm line-clamp-1">{blog.excerpt}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                                                <Tag size={12} />
                                                {blog.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleTogglePublish(blog)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${blog.isPublished
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    }`}
                                            >
                                                {blog.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {blog.isPublished ? 'Đã đăng' : 'Nháp'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-gray-500">
                                                <Calendar size={14} />
                                                <span className="text-sm">{formatDate(blog.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openModal(blog)}
                                                    className="p-2.5 bg-brand/10 text-brand hover:bg-brand/20 rounded-xl transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blog._id)}
                                                    className="p-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-150px)]">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="Nhập tiêu đề bài viết..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                                        className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${formData.isPublished
                                                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                                                : 'bg-amber-100 text-amber-700 border-2 border-amber-200'
                                            }`}
                                    >
                                        {formData.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                                        {formData.isPublished ? 'Đã đăng' : 'Bản nháp'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh bìa</label>
                                {formData.coverImage ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={formData.coverImage}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeCoverImage}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="cover-image-upload"
                                            disabled={uploadingImage}
                                        />
                                        <label
                                            htmlFor="cover-image-upload"
                                            className="cursor-pointer flex flex-col items-center gap-3"
                                        >
                                            {uploadingImage ? (
                                                <>
                                                    <Loader2 size={48} className="text-brand animate-spin" />
                                                    <p className="text-gray-500">Đang upload...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
                                                        <Image size={32} className="text-brand" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700 font-medium">Nhấp để chọn ảnh</p>
                                                        <p className="text-gray-500 text-sm">hoặc kéo thả file vào đây</p>
                                                    </div>
                                                    <p className="text-gray-400 text-xs">PNG, JPG tối đa 5MB</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                )}
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-2">Hoặc nhập URL ảnh:</p>
                                    <input
                                        type="text"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tóm tắt</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all resize-none"
                                    rows={2}
                                    placeholder="Tóm tắt ngắn về bài viết..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung</label>
                                <div className="bg-white rounded-xl">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(value) => setFormData({ ...formData, content: value })}
                                        modules={quillModules}
                                        className="rounded-xl"
                                    />
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
                                    className="flex-1 px-4 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark shadow-xl hover:shadow-brand/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-brand"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        'Lưu bài viết'
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
