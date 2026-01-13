'use client';

import { useState, useEffect } from 'react';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
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
            // Fetch full blog content
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
        return <div>Đang tải...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Quản lý Bài viết</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Thêm bài viết
                </button>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Danh mục</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog) => (
                            <tr key={blog._id}>
                                <td>
                                    <div>
                                        <strong>{blog.title}</strong>
                                        <div style={{ fontSize: 12, color: '#999' }}>/{blog.slug}</div>
                                    </div>
                                </td>
                                <td>{blog.category}</td>
                                <td>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={blog.isPublished}
                                            onChange={() => handleTogglePublish(blog)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </td>
                                <td>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => openModal(blog)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(blog._id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {blogs.length === 0 && (
                    <div className="empty-state">
                        <h3>Chưa có bài viết nào</h3>
                        <p>Thêm bài viết để hiển thị trên blog.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingBlog ? 'Sửa bài viết' : 'Thêm bài viết'}</h2>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tiêu đề</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        value={formData.isPublished ? 'published' : 'draft'}
                                        onChange={e => setFormData({ ...formData, isPublished: e.target.value === 'published' })}
                                    >
                                        <option value="draft">Nháp</option>
                                        <option value="published">Xuất bản</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Ảnh bìa (URL)</label>
                                <input
                                    type="url"
                                    value={formData.coverImage}
                                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả ngắn</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    required
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung</label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    rows={10}
                                    style={{ minHeight: 200 }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingBlog ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
