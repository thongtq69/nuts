'use client';

import { useState, useEffect } from 'react';
import {
    Gift,
    Plus,
    Trash2,
    Loader2,
    Save,
    X,
    Edit3,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

interface VoucherRewardRule {
    _id: string;
    name: string;
    minOrderValue: number;
    voucherValue: number;
    validityDays: number;
    extensionFee: number;
    extensionDays: number;
    maxExtensions: number;
    minOrderForVoucher: number;
    isActive: boolean;
    priority: number;
}

const defaultRule: Omit<VoucherRewardRule, '_id'> = {
    name: '',
    minOrderValue: 500000,
    voucherValue: 50000,
    validityDays: 90,
    extensionFee: 5000,
    extensionDays: 90,
    maxExtensions: 1,
    minOrderForVoucher: 0,
    isActive: true,
    priority: 0,
};

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

export default function AdminVoucherRewardsPage() {
    const [rules, setRules] = useState<VoucherRewardRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<VoucherRewardRule | null>(null);
    const [formData, setFormData] = useState<Omit<VoucherRewardRule, '_id'>>(defaultRule);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/voucher-reward-rules');
            if (res.ok) {
                setRules(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = '/api/admin/voucher-reward-rules';
            const method = editingRule ? 'PUT' : 'POST';
            const body = editingRule ? { ...formData, _id: editingRule._id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                await fetchRules();
                setShowForm(false);
                setEditingRule(null);
                setFormData(defaultRule);
                alert(editingRule ? 'Đã cập nhật quy tắc' : 'Đã tạo quy tắc mới');
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi lưu quy tắc');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (rule: VoucherRewardRule) => {
        setEditingRule(rule);
        setFormData({
            name: rule.name,
            minOrderValue: rule.minOrderValue,
            voucherValue: rule.voucherValue,
            validityDays: rule.validityDays,
            extensionFee: rule.extensionFee,
            extensionDays: rule.extensionDays,
            maxExtensions: rule.maxExtensions,
            minOrderForVoucher: rule.minOrderForVoucher,
            isActive: rule.isActive,
            priority: rule.priority,
        });
        setShowForm(true);
    };

    const handleDelete = async (ruleId: string, name: string) => {
        if (!confirm(`Xóa quy tắc "${name}"?`)) return;

        setDeleting(ruleId);
        try {
            const res = await fetch(`/api/admin/voucher-reward-rules?id=${ruleId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setRules(rules.filter(r => r._id !== ruleId));
            } else {
                alert('Lỗi xóa quy tắc');
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleActive = async (rule: VoucherRewardRule) => {
        try {
            const res = await fetch('/api/admin/voucher-reward-rules', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: rule._id, isActive: !rule.isActive }),
            });
            if (res.ok) {
                setRules(rules.map(r => r._id === rule._id ? { ...r, isActive: !r.isActive } : r));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingRule(null);
        setFormData(defaultRule);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
                            <Gift className="h-5 w-5" />
                        </div>
                        Chính sách tặng Voucher
                    </h1>
                    <p className="text-slate-500 mt-1 ml-13">
                        Cấu hình tự động tặng voucher khi khách mua hàng đạt giá trị
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                    <Plus size={18} />
                    Thêm quy tắc
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-semibold text-amber-800 mb-2">📌 Cách hoạt động:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Khi khách mua hàng đạt <strong>giá trị đơn tối thiểu</strong>, hệ thống tự động tặng voucher</li>
                    <li>• Voucher có <strong>thời hạn sử dụng</strong> (mặc định 3 tháng)</li>
                    <li>• Khách có thể <strong>gia hạn</strong> voucher hết hạn bằng cách trả phí nhỏ</li>
                    <li>• Nếu đơn hàng đủ điều kiện nhiều quy tắc, chỉ áp dụng quy tắc có giá trị đơn cao nhất</li>
                </ul>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tên quy tắc</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Đơn tối thiểu</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Voucher</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Thời hạn</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Phí gia hạn</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rules.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                                <Gift className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">Chưa có quy tắc nào</p>
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="text-amber-600 hover:text-amber-700 font-medium"
                                            >
                                                + Thêm quy tắc đầu tiên
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule) => (
                                    <tr key={rule._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {rule.name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-600">
                                            {formatPrice(rule.minOrderValue)}đ
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex px-2.5 py-1 rounded-lg bg-green-100 text-green-700 font-bold text-sm">
                                                {formatPrice(rule.voucherValue)}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600">
                                            {rule.validityDays} ngày
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-600">
                                            {formatPrice(rule.extensionFee)}đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleActive(rule)}
                                                className="inline-flex items-center gap-1.5"
                                            >
                                                {rule.isActive ? (
                                                    <ToggleRight className="w-8 h-8 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(rule)}
                                                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule._id, rule.name)}
                                                    disabled={deleting === rule._id}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === rule._id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
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

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingRule ? 'Sửa quy tắc' : 'Thêm quy tắc mới'}
                            </h2>
                            <button
                                onClick={closeForm}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Tên quy tắc *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="VD: Tặng 50k cho đơn từ 500k"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Đơn hàng tối thiểu (đ) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderValue}
                                        onChange={e => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Đơn ≥ {formatPrice(formData.minOrderValue)}đ sẽ được tặng voucher
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Giá trị Voucher (đ) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.voucherValue}
                                        onChange={e => setFormData({ ...formData, voucherValue: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Thời hạn (ngày)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.validityDays}
                                        onChange={e => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 90 })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        ≈ {Math.round(formData.validityDays / 30)} tháng
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Đơn tối thiểu để dùng voucher (đ)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderForVoucher}
                                        onChange={e => setFormData({ ...formData, minOrderForVoucher: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                <h3 className="font-semibold text-slate-700">⏰ Cấu hình gia hạn</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Phí gia hạn (đ)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.extensionFee}
                                            onChange={e => setFormData({ ...formData, extensionFee: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Ngày gia hạn
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.extensionDays}
                                            onChange={e => setFormData({ ...formData, extensionDays: parseInt(e.target.value) || 90 })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Số lần gia hạn tối đa
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxExtensions}
                                            onChange={e => setFormData({ ...formData, maxExtensions: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                    Kích hoạt quy tắc này
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {editingRule ? 'Cập nhật' : 'Tạo quy tắc'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
