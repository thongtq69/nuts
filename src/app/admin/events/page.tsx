'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Eye, EyeOff, MapPin, X, Image as ImageIcon, TrendingUp, Clock } from 'lucide-react';
import { useConfirm } from '@/context/ConfirmContext';

interface Event {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    eventDate?: string;
    eventLocation?: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const confirm = useConfirm();
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        coverImage: '',
        eventDate: '',
        eventLocation: '',
        isPublished: false,
    });

    // Mock stats
    const stats = {
        totalEvents: events.length,
        published: events.filter(e => e.isPublished).length,
        draft: events.filter(e => !e.isPublished).length,
        upcoming: events.filter(e => e.eventDate && new Date(e.eventDate) > new Date()).length,
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingEvent
                ? `/api/events/${editingEvent._id}`
                : '/api/events';
            const method = editingEvent ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchEvents();
                closeModal();
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa sự kiện',
            description: 'Xác nhận xóa sự kiện này?',
            confirmText: 'Xóa sự kiện',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleTogglePublish = async (event: Event) => {
        try {
            const res = await fetch(`/api/events/${event._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublished: !event.isPublished }),
            });

            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Error toggling publish:', error);
        }
    };

    const openModal = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                excerpt: event.excerpt,
                content: event.content || '',
                coverImage: event.coverImage || '',
                eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
                eventLocation: event.eventLocation || '',
                isPublished: event.isPublished,
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                coverImage: '',
                eventDate: '',
                eventLocation: '',
                isPublished: false,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEvent(null);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý Sự kiện</h1>
                        <p className="text-slate-600 mt-1">Tạo và quản lý các sự kiện của bạn</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#9C7044] text-white rounded-lg hover:bg-[#7d5a36] transition-colors font-medium"
                    >
                        <Plus size={20} />
                        Thêm sự kiện
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-slate-900">{stats.totalEvents}</div>
                        <div className="text-sm text-slate-600">Tổng sự kiện</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                        <div className="text-sm text-slate-600">Đã đăng</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-amber-600">{stats.draft}</div>
                        <div className="text-sm text-slate-600">Bản nháp</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
                        <div className="text-sm text-slate-600">Sắp diễn ra</div>
                    </div>
                </div>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-32 h-24 bg-slate-200 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có sự kiện nào</h3>
                    <p className="text-slate-600 mb-4">Bắt đầu tạo sự kiện đầu tiên của bạn</p>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-[#9C7044] text-white rounded-lg hover:bg-[#7d5a36] transition-colors font-medium"
                    >
                        Thêm sự kiện
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                                <div className="w-32 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {event.coverImage ? (
                                        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <ImageIcon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{event.excerpt}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                {event.eventDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(event.eventDate)}
                                                    </span>
                                                )}
                                                {event.eventLocation && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {event.eventLocation}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleTogglePublish(event)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    event.isPublished
                                                        ? 'text-green-600 hover:bg-green-50'
                                                        : 'text-slate-400 hover:bg-slate-100'
                                                }`}
                                                title={event.isPublished ? 'Ẩn sự kiện' : 'Đăng sự kiện'}
                                            >
                                                {event.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button
                                                onClick={() => openModal(event)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Tiêu đề sự kiện
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C7044] focus:border-transparent"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Ngày tổ chức
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.eventDate}
                                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C7044] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Địa điểm
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.eventLocation}
                                        onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                                        placeholder="Nhập địa điểm"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C7044] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Ảnh bìa (URL)
                                </label>
                                <input
                                    type="text"
                                    value={formData.coverImage}
                                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C7044] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Mô tả ngắn
                                </label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C7044] focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nội dung chi tiết
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C7044] focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="w-4 h-4 text-[#9C7044] border-slate-300 rounded focus:ring-[#9C7044]"
                                />
                                <label htmlFor="isPublished" className="text-sm text-slate-700">
                                    Đăng ngay (hiển thị công khai)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#9C7044] text-white rounded-lg hover:bg-[#7d5a36] transition-colors font-medium"
                                >
                                    {editingEvent ? 'Cập nhật' : 'Tạo sự kiện'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
