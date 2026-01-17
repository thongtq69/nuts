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
    ToggleRight,
    ChevronRight,
    ArrowLeft,
    Clock,
    Wallet,
    RefreshCw,
    ShoppingCart
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

// Generate icon based on voucher value
function getVoucherIcon(value: number) {
    if (value >= 100000) {
        return (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <span className="text-3xl">🎁</span>
            </div>
        );
    } else if (value >= 50000) {
        return (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                <span className="text-3xl">🎫</span>
            </div>
        );
    } else {
        return (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <span className="text-3xl">🏷️</span>
            </div>
        );
    }
}

export default function AdminVoucherRewardsPage() {
    const [rules, setRules] = useState<VoucherRewardRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedRule, setSelectedRule] = useState<VoucherRewardRule | null>(null);
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
        setSelectedRule(null);
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
                setSelectedRule(null);
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
                if (selectedRule?._id === rule._id) {
                    setSelectedRule({ ...selectedRule, isActive: !rule.isActive });
                }
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

    // Detail View
    if (selectedRule) {
        return (
            <div className="space-y-0 max-w-2xl mx-auto bg-white min-h-[80vh] rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 z-10">
                    <button
                        onClick={() => setSelectedRule(null)}
                        className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <h2 className="font-semibold text-slate-800">Chi tiết quy tắc</h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Title Card */}
                    <div className="flex items-start gap-4">
                        {getVoucherIcon(selectedRule.voucherValue)}
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800">{selectedRule.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Voucher {formatPrice(selectedRule.voucherValue)}đ cho đơn từ {formatPrice(selectedRule.minOrderValue)}đ
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedRule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {selectedRule.isActive ? 'Đang hoạt động' : 'Tắt'}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-slate-200" />

                    {/* Thể lệ */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4">📋 Điều khoản sử dụng</h4>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm text-slate-600">
                            <div className="flex items-start gap-3">
                                <ShoppingCart size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                <p><strong>Đơn tối thiểu:</strong> Khách hàng mua đơn từ <strong>{formatPrice(selectedRule.minOrderValue)}đ</strong> sẽ được tặng voucher này.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Gift size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                                <p><strong>Giá trị voucher:</strong> Giảm <strong>{formatPrice(selectedRule.voucherValue)}đ</strong> cho đơn hàng tiếp theo.</p>
                            </div>
                            {selectedRule.minOrderForVoucher > 0 && (
                                <div className="flex items-start gap-3">
                                    <Wallet size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p><strong>Điều kiện dùng:</strong> Áp dụng cho đơn từ <strong>{formatPrice(selectedRule.minOrderForVoucher)}đ</strong>.</p>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <Clock size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                                <p><strong>Thời hạn:</strong> Voucher có hiệu lực trong <strong>{selectedRule.validityDays} ngày</strong> (~{Math.round(selectedRule.validityDays / 30)} tháng) kể từ ngày nhận.</p>
                            </div>
                        </div>
                    </div>

                    {/* Gia hạn */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4">⏰ Chính sách gia hạn</h4>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3 text-sm text-amber-900">
                            <div className="flex items-start gap-3">
                                <RefreshCw size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                <p><strong>Phí gia hạn:</strong> Khách hàng trả <strong>{formatPrice(selectedRule.extensionFee)}đ</strong> để gia hạn voucher hết hạn.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                <p><strong>Thời gian gia hạn:</strong> Mỗi lần gia hạn thêm <strong>{selectedRule.extensionDays} ngày</strong>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Gift size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                <p><strong>Số lần tối đa:</strong> Cho phép gia hạn tối đa <strong>{selectedRule.maxExtensions} lần</strong>.</p>
                            </div>
                        </div>
                    </div>

                    {/* Lưu ý */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4">⚠️ Lưu ý</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Mỗi đơn hàng chỉ được tặng <strong>1 voucher</strong> (voucher có giá trị cao nhất phù hợp).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Voucher chỉ áp dụng cho tài khoản đã đăng nhập.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Không áp dụng đồng thời với các chương trình khuyến mãi khác.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-slate-400">•</span>
                                <span>Voucher không được hoàn lại và không thể chuyển nhượng.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Voucher tặng</p>
                            <p className="text-xl font-bold text-green-600">{formatPrice(selectedRule.voucherValue)}đ</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleToggleActive(selectedRule)}
                                className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors ${selectedRule.isActive
                                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                            >
                                {selectedRule.isActive ? (
                                    <>
                                        <ToggleRight size={18} />
                                        Tắt
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft size={18} />
                                        Bật
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleEdit(selectedRule)}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2"
                            >
                                <Edit3 size={18} />
                                Sửa quy tắc
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6 max-w-3xl mx-auto">
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
                        Bấm vào từng quy tắc để xem chi tiết và thể lệ
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
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📌 Cách hoạt động:</h3>
                <p className="text-sm text-blue-700">
                    Khi khách mua hàng đạt giá trị đơn tối thiểu, hệ thống tự động tặng voucher.
                    Voucher hết hạn có thể gia hạn bằng phí nhỏ.
                </p>
            </div>

            {/* Rules List - Card Style */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {rules.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Gift className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">Chưa có quy tắc nào</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-amber-600 hover:text-amber-700 font-semibold"
                            >
                                + Thêm quy tắc đầu tiên
                            </button>
                        </div>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div
                            key={rule._id}
                            onClick={() => setSelectedRule(rule)}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                            {/* Icon */}
                            {getVoucherIcon(rule.voucherValue)}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                                    {rule.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5 truncate">
                                    Đơn từ {formatPrice(rule.minOrderValue)}đ • HSD {rule.validityDays} ngày
                                </p>
                            </div>

                            {/* Badge - Voucher Value */}
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${rule.isActive
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {formatPrice(rule.voucherValue)}đ
                                </span>
                                <ChevronRight size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                            </div>
                        </div>
                    ))
                )}
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
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Đơn ≥ {formatPrice(formData.minOrderValue)}đ sẽ được tặng
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Đơn tối thiểu dùng voucher
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderForVoucher}
                                        onChange={e => setFormData({ ...formData, minOrderForVoucher: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-xl space-y-4 border border-amber-100">
                                <h3 className="font-semibold text-amber-800">⏰ Cấu hình gia hạn</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Phí gia hạn
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.extensionFee}
                                            onChange={e => setFormData({ ...formData, extensionFee: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Số lần tối đa
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.maxExtensions}
                                            onChange={e => setFormData({ ...formData, maxExtensions: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 text-amber-600 rounded-lg focus:ring-amber-500 border-slate-300"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                    Kích hoạt quy tắc này
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
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
