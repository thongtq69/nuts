'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    GripVertical,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Loader2,
    Filter,
    ChevronDown,
    Save,
    X
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { Button, Input, Modal, Table, Badge, Card, Select, Textarea, RichTextEditor } from '@/components/admin/ui';

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
}

const CATEGORIES = [
    { value: 'general', label: 'Chung' },
    { value: 'about', label: 'Về chúng tôi' },
    { value: 'membership', label: 'Hội viên & VIP' },
    { value: 'shipping', label: 'Giao hàng & Đổi trả' },
    { value: 'payment', label: 'Thanh toán' },
];

// Helper function to strip HTML tags and decode entities for preview
const stripHtml = (html: string): string => {
    if (!html) return '';
    // Create a temporary div to decode HTML entities
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

export default function AdminFAQsPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);

    const toast = useToast();
    const confirm = useConfirm();

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/faqs?admin=true');
            if (res.ok) {
                const data = await res.json();
                setFaqs(data);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Lỗi khi tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (faq?: FAQ) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                order: faq.order,
                isActive: faq.isActive
            });
        } else {
            setEditingFaq(null);
            setFormData({
                question: '',
                answer: '',
                category: 'general',
                order: faqs.length,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingFaq ? `/api/faqs/${editingFaq._id}` : '/api/faqs';
            const method = editingFaq ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingFaq ? 'Cập nhật thành công' : 'Thêm mới thành công');
                fetchFAQs();
                setIsModalOpen(false);
            } else {
                toast.error('Lỗi khi lưu dữ liệu');
            }
        } catch (error) {
            toast.error('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (faq: FAQ) => {
        const confirmed = await confirm({
            title: 'Xóa câu hỏi',
            description: `Bạn có chắc chắn muốn xóa câu hỏi: "${faq.question}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            cancelText: 'Hủy'
        });

        if (confirmed) {
            try {
                const res = await fetch(`/api/faqs/${faq._id}`, { method: 'DELETE' });
                if (res.ok) {
                    toast.success('Đã xóa câu hỏi');
                    fetchFAQs();
                }
            } catch (error) {
                toast.error('Lỗi khi xóa câu hỏi');
            }
        }
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryLabel = (value: string) => {
        return CATEGORIES.find(c => c.value === value)?.label || value;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <HelpCircle className="text-brand" size={32} />
                        Câu hỏi thường gặp (Q&A)
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý các câu hỏi và câu trả lời hiển thị trên website</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    variant="primary"
                    className="flex items-center gap-2"
                >
                    <Plus size={20} />
                    Thêm câu hỏi
                </Button>
            </div>

            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">Tất cả danh mục</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-brand focus:border-brand"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Thứ tự</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Câu hỏi</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Danh mục</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                                        <p className="text-slate-500">Đang tải dữ liệu...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredFaqs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    Không tìm thấy câu hỏi nào.
                                </td>
                            </tr>
                        ) : (
                            filteredFaqs.map((faq) => (
                                <tr key={faq._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-slate-400">#{faq.order}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800 line-clamp-1">{stripHtml(faq.question)}</div>
                                        <div className="text-xs text-slate-400 line-clamp-1 mt-1">{stripHtml(faq.answer)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="default" className="bg-slate-50">
                                            {getCategoryLabel(faq.category)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {faq.isActive ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                                                <CheckCircle2 size={16} /> Hiển thị
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <XCircle size={16} /> Ẩn
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(faq)}
                                                className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(faq)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingFaq ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Câu hỏi <span className="text-red-500">*</span></label>
                                <Input
                                    value={formData.question}
                                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                                    required
                                    placeholder="Nhập câu hỏi..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Câu trả lời <span className="text-red-500">*</span></label>
                                <RichTextEditor
                                    value={formData.answer}
                                    onChange={content => setFormData({ ...formData, answer: content })}
                                    placeholder="Nhập câu trả lời chi tiết..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Danh mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full text-sm rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Thứ tự hiển thị</label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-5 h-5 text-brand rounded focus:ring-brand"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Cho phép hiển thị trên website
                                </label>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {editingFaq ? 'Cập nhật' : 'Lưu câu hỏi'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
