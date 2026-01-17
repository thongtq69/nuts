'use client';

import { useState, useEffect } from 'react';
import {
    Tag,
    CheckCircle,
    XCircle,
    Plus,
    Edit2,
    Trash2,
    Copy,
    TrendingUp,
    Users,
    DollarSign,
    Package as PackageIcon,
    Percent,
    Calendar,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react';

interface VoucherConfig {
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxDiscount: number;
    minOrderValue: number;
    quantity: number;
}

interface Package {
    _id: string;
    name: string;
    price: number;
    description: string;
    terms: string;
    voucherQuantity: number;
    discountValue: number;
    discountType: 'percent' | 'fixed';
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isActive: boolean;
    isUnlimitedVoucher?: boolean;
    purchaseCount?: number;
    vouchers?: VoucherConfig[];
}

const defaultVoucher: VoucherConfig = {
    discountType: 'percent',
    discountValue: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    quantity: 1
};

const defaultPackage: Partial<Package> = {
    name: '',
    price: 0,
    description: '',
    terms: '',
    voucherQuantity: 1,
    discountType: 'percent',
    discountValue: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    validityDays: 30
};

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Package>>(defaultPackage);
    const [vouchers, setVouchers] = useState<VoucherConfig[]>([{ ...defaultVoucher }]);
    const [isUnlimitedVoucher, setIsUnlimitedVoucher] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        const res = await fetch('/api/packages');
        if (res.ok) {
            setPackages(await res.json());
        }
    };

    const resetForm = () => {
        setFormData(defaultPackage);
        setVouchers([{ ...defaultVoucher }]);
        setIsUnlimitedVoucher(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Calculate total voucher quantity from all vouchers
            const totalVoucherQty = vouchers.reduce((sum, v) => sum + v.quantity, 0);

            // For backward compatibility, use first voucher's config as main config
            const mainVoucher = vouchers[0];

            const payload = {
                ...formData,
                voucherQuantity: totalVoucherQty,
                isUnlimitedVoucher: isUnlimitedVoucher,
                discountType: mainVoucher.discountType,
                discountValue: mainVoucher.discountValue,
                maxDiscount: mainVoucher.maxDiscount,
                minOrderValue: mainVoucher.minOrderValue,
                vouchers: vouchers
            };

            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...payload, id: editingId } : payload;

            const res = await fetch('/api/packages', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                fetchPackages();
                resetForm();
                alert(editingId ? 'Cập nhật gói thành công' : 'Tạo gói thành công');
            } else {
                alert('Lỗi khi lưu gói');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pkg: Package) => {
        setEditingId(pkg._id);
        setFormData({
            name: pkg.name,
            price: pkg.price,
            description: pkg.description,
            terms: pkg.terms || '',
            validityDays: pkg.validityDays,
        });

        // If package has vouchers array, use it; otherwise create from single config
        if (pkg.vouchers && pkg.vouchers.length > 0) {
            setVouchers(pkg.vouchers);
        } else {
            setVouchers([{
                discountType: pkg.discountType,
                discountValue: pkg.discountValue,
                maxDiscount: pkg.maxDiscount,
                minOrderValue: pkg.minOrderValue,
                quantity: pkg.voucherQuantity
            }]);
        }

        setIsUnlimitedVoucher(pkg.isUnlimitedVoucher || false);
        setShowForm(true);
        setTimeout(() => {
            document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const addVoucher = () => {
        setVouchers([...vouchers, { ...defaultVoucher }]);
    };

    const removeVoucher = (index: number) => {
        if (vouchers.length > 1) {
            setVouchers(vouchers.filter((_, i) => i !== index));
        }
    };

    const updateVoucher = (index: number, field: keyof VoucherConfig, value: any) => {
        const updated = [...vouchers];
        updated[index] = { ...updated[index], [field]: value };
        setVouchers(updated);
    };

    // Mock stats
    const stats = {
        totalPackages: packages.filter(p => p.isActive).length,
        totalRevenue: 15750000,
        totalMembers: 234,
        conversionRate: 12.5
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý Gói Hội Viên</h1>
                    <p className="text-slate-500 mt-1">Cấu hình các gói đăng ký và ưu đãi voucher cho hội viên</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm && !editingId) {
                            resetForm();
                        } else {
                            resetForm();
                            setShowForm(true);
                            setTimeout(() => {
                                document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                        }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 ${showForm && !editingId
                        ? 'bg-slate-600 hover:bg-slate-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-black'
                        }`}
                >
                    {showForm && !editingId ? (
                        <>
                            <X size={22} strokeWidth={2.5} />
                            <span className="text-base">Đóng</span>
                        </>
                    ) : (
                        <>
                            <Plus size={22} strokeWidth={2.5} />
                            <span className="text-base">Tạo gói mới</span>
                        </>
                    )}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <PackageIcon className="w-6 h-6 text-blue-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Gói đang bán</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalPackages}</div>
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                            Tổng {packages.length} gói
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-emerald-200 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-50">
                            <DollarSign className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} />
                            +18.2%
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Doanh thu tháng này</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalRevenue.toLocaleString('vi-VN')}đ</div>
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                            Từ gói hội viên
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-50">
                            <Users className="w-6 h-6 text-purple-600" strokeWidth={2} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} />
                            +8.5%
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Hội viên hiện tại</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalMembers}</div>
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                            Đang hoạt động
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-amber-200 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-50">
                            <TrendingUp className="w-6 h-6 text-amber-600" strokeWidth={2} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium mb-2">Tỷ lệ chuyển đổi</h3>
                        <div className="text-3xl font-bold text-slate-800">{stats.conversionRate}%</div>
                        <div className="mt-2 text-xs text-slate-500 font-medium">
                            Khách → Hội viên
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Form - Collapsible */}
            {showForm && (
                <div id="create-form" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <div className={`px-6 py-4 ${editingId ? 'bg-amber-600' : 'bg-blue-600'}`}>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {editingId ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            {editingId ? 'Chỉnh sửa Gói Hội Viên' : 'Tạo Gói Hội Viên Mới'}
                        </h2>
                        <p className="text-white/80 text-sm mt-1">
                            {editingId ? 'Cập nhật thông tin gói hội viên' : 'Điền thông tin để tạo gói ưu đãi cho khách hàng'}
                        </p>
                    </div>
                    <form onSubmit={handleCreate} className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Tag size={16} className="text-amber-600" />
                                    Tên gói
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="VD: Gói Gold 1 Tháng"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <DollarSign size={16} className="text-emerald-600" />
                                    Giá bán (VND)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    required
                                    placeholder="199000"
                                />
                                <p className="text-xs text-slate-500">Giá hiển thị: {formData.price ? formData.price.toLocaleString('vi-VN') + 'đ' : '0đ'}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Calendar size={16} className="text-blue-600" />
                                    Thời hạn gói (ngày)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                                    value={formData.validityDays}
                                    onChange={e => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                                    required
                                    placeholder="30"
                                />
                                <p className="text-xs text-slate-500">Gói có hiệu lực trong {formData.validityDays || 0} ngày</p>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <ShoppingBag size={16} className="text-purple-600" />
                                    Mô tả gói
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Mô tả chi tiết về gói hội viên..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    📋 Thể lệ gói hội viên
                                    <span className="text-xs text-slate-400 font-normal">(Có thể copy từ Google Docs)</span>
                                </label>
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="w-full min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white prose prose-sm prose-slate"
                                    onBlur={(e) => {
                                        setFormData({ ...formData, terms: e.currentTarget.innerHTML });
                                    }}
                                    onPaste={(e) => {
                                        // Allow rich paste from Google Docs
                                        const html = e.clipboardData.getData('text/html');
                                        if (html) {
                                            e.preventDefault();
                                            // Clean up the HTML a bit but keep formatting
                                            const cleanHtml = html
                                                .replace(/<meta[^>]*>/gi, '')
                                                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                                .replace(/class="[^"]*"/gi, '')
                                                .replace(/style="[^"]*"/gi, '');
                                            document.execCommand('insertHTML', false, cleanHtml);
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: formData.terms || '' }}
                                />
                                <p className="text-xs text-slate-500">
                                    💡 Hỗ trợ copy/paste từ Google Docs, Word với đầy đủ định dạng (bold, italic, danh sách...)
                                </p>
                            </div>
                        </div>

                        {/* Unlimited Voucher Toggle */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isUnlimitedVoucher}
                                    onChange={e => setIsUnlimitedVoucher(e.target.checked)}
                                    className="w-6 h-6 rounded-lg border-2 border-emerald-400 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-emerald-700">♾️ Không giới hạn số lượng mã</span>
                                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">UNLIMITED</span>
                                    </div>
                                    <p className="text-sm text-emerald-600 mt-1">
                                        Khi bật, hội viên có thể sử dụng mã giảm giá không giới hạn số lần trong thời hạn gói
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Multiple Vouchers Configuration */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Percent className="text-blue-600" size={20} />
                                    Cấu hình Voucher ({isUnlimitedVoucher ? '∞' : vouchers.length} loại)
                                </h3>
                                <button
                                    type="button"
                                    onClick={addVoucher}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-all"
                                >
                                    <Plus size={18} />
                                    Thêm loại voucher
                                </button>
                            </div>

                            <div className="space-y-4">
                                {vouchers.map((voucher, index) => (
                                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-blue-100 relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full">
                                                Voucher #{index + 1}
                                            </span>
                                            {vouchers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVoucher(index)}
                                                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-slate-600">Số lượng</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                                                    value={voucher.quantity}
                                                    onChange={e => updateVoucher(index, 'quantity', Number(e.target.value))}
                                                    required
                                                    min="1"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-slate-600">Loại giảm</label>
                                                <select
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                                                    value={voucher.discountType}
                                                    onChange={e => updateVoucher(index, 'discountType', e.target.value)}
                                                >
                                                    <option value="percent">%</option>
                                                    <option value="fixed">VND</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-slate-600">
                                                    Giá trị {voucher.discountType === 'percent' ? '(%)' : '(VND)'}
                                                </label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                                                    value={voucher.discountValue}
                                                    onChange={e => updateVoucher(index, 'discountValue', Number(e.target.value))}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-slate-600">Giảm tối đa (VND)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                                                    value={voucher.maxDiscount}
                                                    onChange={e => updateVoucher(index, 'maxDiscount', Number(e.target.value))}
                                                    placeholder="0 = không giới hạn"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-xs font-semibold text-slate-600">Đơn tối thiểu (VND)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                                                    value={voucher.minOrderValue}
                                                    onChange={e => updateVoucher(index, 'minOrderValue', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-all"
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className={`px-8 py-3 font-bold rounded-lg shadow-sm transition-all hover:shadow-md flex items-center justify-center gap-2 ${editingId
                                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                    : 'bg-blue-600 hover:bg-blue-700 text-black'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                                        <span>{editingId ? 'Cập nhật' : 'Tạo Gói Mới'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Packages List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Danh sách Gói Hội Viên</h2>
                        <div className="text-sm text-slate-500">
                            Tổng: <span className="font-semibold text-slate-700">{packages.length}</span> gói
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider w-16">STT</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tên Gói</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Giá Bán</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Voucher</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Cấu Hình Giảm Giá</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Số Người Mua</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {packages.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <PackageIcon className="text-slate-400" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800 mb-1">Chưa có gói nào</h3>
                                                <p className="text-slate-500 text-sm">Tạo gói hội viên đầu tiên để bắt đầu</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : packages.map((pkg, index) => (
                                <tr
                                    key={pkg._id}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => handleEdit(pkg)}
                                >
                                    <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                                                <Tag className="text-white" size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{pkg.name}</div>
                                                <div className="text-xs text-slate-500">{pkg.validityDays} ngày</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-lg text-emerald-600">{pkg.price.toLocaleString('vi-VN')}đ</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {pkg.isUnlimitedVoucher ? (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                                                <span className="text-lg">♾️</span>
                                                UNLIMITED
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                                                <Tag size={14} />
                                                {pkg.voucherQuantity}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-purple-600">
                                                    {pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}
                                                </span>
                                                {pkg.maxDiscount > 0 && (
                                                    <span className="text-slate-500">• Max {pkg.maxDiscount.toLocaleString('vi-VN')}đ</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Đơn từ {pkg.minOrderValue.toLocaleString('vi-VN')}đ
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className={`px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold rounded-lg transition-all
                                                ${pkg.isActive
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            onClick={async () => {
                                                if (!confirm('Đổi trạng thái gói này?')) return;
                                                await fetch('/api/packages', {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ id: pkg._id, isActive: !pkg.isActive })
                                                });
                                                fetchPackages();
                                            }}
                                        >
                                            {pkg.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            {pkg.isActive ? 'Đang bán' : 'Tạm dừng'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-lg font-bold text-slate-800">{pkg.purchaseCount || 0}</div>
                                        <div className="text-xs text-slate-500">lượt mua</div>
                                    </td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Nhân bản"
                                                onClick={() => {
                                                    setFormData({
                                                        name: pkg.name + ' (Copy)',
                                                        price: pkg.price,
                                                        description: pkg.description,
                                                        validityDays: pkg.validityDays,
                                                    });
                                                    setVouchers([{
                                                        discountType: pkg.discountType,
                                                        discountValue: pkg.discountValue,
                                                        maxDiscount: pkg.maxDiscount,
                                                        minOrderValue: pkg.minOrderValue,
                                                        quantity: pkg.voucherQuantity
                                                    }]);
                                                    setEditingId(null);
                                                    setShowForm(true);
                                                    setTimeout(() => {
                                                        document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' });
                                                    }, 100);
                                                }}
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa"
                                                onClick={async () => {
                                                    if (!confirm('Xóa gói này? Hành động không thể hoàn tác!')) return;
                                                    await fetch('/api/packages', {
                                                        method: 'DELETE',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ id: pkg._id })
                                                    });
                                                    fetchPackages();
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
