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
    ShoppingBag
} from 'lucide-react';

interface Package {
    _id: string;
    name: string;
    price: number;
    description: string;
    voucherQuantity: number;
    discountValue: number;
    discountType: 'percent' | 'fixed';
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isActive: boolean;
    purchaseCount?: number;
}

interface Package {
    _id: string;
    name: string;
    price: number;
    description: string;
    voucherQuantity: number;
    discountValue: number;
    discountType: 'percent' | 'fixed';
    maxDiscount: number;
    minOrderValue: number;
    validityDays: number;
    isActive: boolean;
}

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [newPkg, setNewPkg] = useState<Partial<Package>>({
        name: '',
        price: 0,
        description: '',
        voucherQuantity: 1,
        discountType: 'percent',
        discountValue: 0,
        maxDiscount: 0,
        minOrderValue: 0,
        validityDays: 30
    });
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPkg),
            });
            if (res.ok) {
                fetchPackages();
                setNewPkg({
                    name: '',
                    price: 0,
                    description: '',
                    voucherQuantity: 1,
                    discountType: 'percent',
                    discountValue: 0,
                    maxDiscount: 0,
                    minOrderValue: 0,
                    validityDays: 30
                });
                alert('Tạo gói thành công');
            } else {
                alert('Lỗi khi tạo gói');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Mock stats - replace with real data
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
                    onClick={() => window.scrollTo({ top: document.getElementById('create-form')?.offsetTop, behavior: 'smooth' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg shadow-md hover:from-amber-600 hover:to-amber-700 transition-all hover:shadow-lg"
                >
                    <Plus size={20} />
                    Tạo gói mới
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

            {/* Create Form */}
            <div id="create-form" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-6 h-6" />
                        Tạo Gói Hội Viên Mới
                    </h2>
                    <p className="text-amber-50 text-sm mt-1">Điền thông tin để tạo gói ưu đãi cho khách hàng</p>
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
                                value={newPkg.name} 
                                onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} 
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
                                value={newPkg.price} 
                                onChange={e => setNewPkg({ ...newPkg, price: Number(e.target.value) })} 
                                required 
                                placeholder="199000"
                            />
                            <p className="text-xs text-slate-500">Giá hiển thị: {newPkg.price ? newPkg.price.toLocaleString('vi-VN') + 'đ' : '0đ'}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="text-blue-600" />
                                Thời hạn gói (ngày)
                            </label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" 
                                value={newPkg.validityDays} 
                                onChange={e => setNewPkg({ ...newPkg, validityDays: Number(e.target.value) })} 
                                required 
                                placeholder="30"
                            />
                            <p className="text-xs text-slate-500">Gói có hiệu lực trong {newPkg.validityDays || 0} ngày</p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <ShoppingBag size={16} className="text-purple-600" />
                                Mô tả gói
                            </label>
                            <textarea 
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none" 
                                value={newPkg.description} 
                                onChange={e => setNewPkg({ ...newPkg, description: e.target.value })} 
                                rows={3}
                                placeholder="Mô tả chi tiết về gói hội viên..."
                            />
                        </div>

                    </div>

                    {/* Voucher Configuration */}
                    <div className="lg:col-span-2 mt-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Percent className="text-blue-600" size={20} />
                                Cấu hình Voucher
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Số lượng voucher</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" 
                                        value={newPkg.voucherQuantity} 
                                        onChange={e => setNewPkg({ ...newPkg, voucherQuantity: Number(e.target.value) })} 
                                        required 
                                        min="1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Loại giảm giá</label>
                                    <select 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" 
                                        value={newPkg.discountType} 
                                        onChange={e => setNewPkg({ ...newPkg, discountType: e.target.value as any })}
                                    >
                                        <option value="percent">Phần trăm (%)</option>
                                        <option value="fixed">Số tiền cố định (VND)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Giá trị giảm {newPkg.discountType === 'percent' ? '(%)' : '(VND)'}
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" 
                                        value={newPkg.discountValue} 
                                        onChange={e => setNewPkg({ ...newPkg, discountValue: Number(e.target.value) })} 
                                        required 
                                        placeholder={newPkg.discountType === 'percent' ? '20' : '50000'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Giảm tối đa (VND)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" 
                                        value={newPkg.maxDiscount} 
                                        onChange={e => setNewPkg({ ...newPkg, maxDiscount: Number(e.target.value) })} 
                                        placeholder="50000"
                                    />
                                    <p className="text-xs text-slate-500">Để 0 nếu không giới hạn</p>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Áp dụng cho đơn tối thiểu (VND)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" 
                                        value={newPkg.minOrderValue} 
                                        onChange={e => setNewPkg({ ...newPkg, minOrderValue: Number(e.target.value) })} 
                                        placeholder="100000"
                                    />
                                    <p className="text-xs text-slate-500">Giá trị đơn hàng tối thiểu để áp dụng voucher</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-2 flex items-center gap-4 pt-6 border-t border-slate-200">
                        <button 
                            type="submit" 
                            className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Tạo Gói Mới
                                </>
                            )}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setNewPkg({
                                name: '',
                                price: 0,
                                description: '',
                                voucherQuantity: 1,
                                discountType: 'percent',
                                discountValue: 0,
                                maxDiscount: 0,
                                minOrderValue: 0,
                                validityDays: 30
                            })}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-all"
                        >
                            Đặt lại
                        </button>
                    </div>
                </form>
            </div>

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
                                    <td colSpan={7} className="px-6 py-16 text-center">
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
                            ) : packages.map(pkg => (
                                <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
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
                                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                                            <Tag size={14} />
                                            {pkg.voucherQuantity}
                                        </div>
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
                                    <td className="px-6 py-4 text-center">
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Nhân bản"
                                                onClick={() => {
                                                    setNewPkg({
                                                        ...pkg,
                                                        name: pkg.name + ' (Copy)',
                                                        _id: undefined as any
                                                    });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
