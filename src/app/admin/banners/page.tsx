'use client';

import { useState, useEffect } from 'react';

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
        return <div>Đang tải...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Quản lý Banner</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Thêm Banner
                </button>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Thứ tự</th>
                            <th>Hình ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Link</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map((banner) => (
                            <tr key={banner._id}>
                                <td>{banner.order}</td>
                                <td>
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="image-preview"
                                    />
                                </td>
                                <td>{banner.title}</td>
                                <td>{banner.link || '-'}</td>
                                <td>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={banner.isActive}
                                            onChange={() => handleToggleActive(banner)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => openModal(banner)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(banner._id)}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {banners.length === 0 && (
                    <div className="empty-state">
                        <h3>Chưa có banner nào</h3>
                        <p>Thêm banner để hiển thị trên trang chủ.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingBanner ? 'Sửa Banner' : 'Thêm Banner'}</h2>
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
                            <div className="form-group">
                                <label>URL Hình ảnh</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    required
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Link (tùy chọn)</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thứ tự</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                    >
                                        <option value="active">Hiển thị</option>
                                        <option value="inactive">Ẩn</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingBanner ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
