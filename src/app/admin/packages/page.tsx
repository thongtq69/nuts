'use client';

import { useState, useEffect } from 'react';
import { Tag, CheckCircle, XCircle } from 'lucide-react';

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Quản lý Gói Hội Viên</h1>
                <p className="text-slate-500 mt-1">Cấu hình các gói đăng ký và ưu đãi voucher cho hội viên.</p>
            </div>

            {/* Create Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Tag className="text-amber-500" />
                    Tạo Gói Mới
                </h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Tên gói</label>
                        <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} required placeholder="Ví dụ: Gói Gold 1 Tháng" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Giá tiền (VND)</label>
                        <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: Number(e.target.value) })} required />
                    </div>

                    <div className="space-y-2 border-t border-slate-100 md:col-span-2 pt-4 mt-2">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Cấu hình Voucher</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-600">Số lượng voucher</label>
                                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.voucherQuantity} onChange={e => setNewPkg({ ...newPkg, voucherQuantity: Number(e.target.value) })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-600">Loại giảm giá</label>
                                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.discountType} onChange={e => setNewPkg({ ...newPkg, discountType: e.target.value as any })}>
                                    <option value="percent">Phần trăm (%)</option>
                                    <option value="fixed">Số tiền cố định (VND)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-600">Giá trị giảm ({newPkg.discountType === 'percent' ? '%' : 'VND'})</label>
                                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.discountValue} onChange={e => setNewPkg({ ...newPkg, discountValue: Number(e.target.value) })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-600">Giảm tối đa (0 = KGH)</label>
                                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.maxDiscount} onChange={e => setNewPkg({ ...newPkg, maxDiscount: Number(e.target.value) })} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-slate-600">Áp dụng cho đơn từ (VND)</label>
                                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" value={newPkg.minOrderValue} onChange={e => setNewPkg({ ...newPkg, minOrderValue: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Tag size={18} />
                                    Tạo Gói Mới
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Tên Gói</th>
                                <th className="px-6 py-4 text-right">Giá bán</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Số lượng</th>
                                <th className="px-6 py-4">Chi tiết ưu đãi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {packages.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Chưa có gói nào.</td></tr>
                            ) : packages.map(pkg => (
                                <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{pkg.name}</div>
                                        <div className="text-xs text-slate-500">ID: {pkg._id.slice(-6)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-amber-600">{pkg.price.toLocaleString()}đ</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full border transition-all
                                                ${pkg.isActive
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
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
                                            {pkg.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {pkg.isActive ? 'Đang bán' : 'Ngưng bán'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="font-medium text-slate-700">{pkg.voucherQuantity} voucher</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Giảm: <span className="font-semibold">{pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}</span></li>
                                            {pkg.maxDiscount > 0 && <li>Tối đa: {pkg.maxDiscount.toLocaleString()}đ</li>}
                                            <li>Đơn từ: {pkg.minOrderValue.toLocaleString()}đ</li>
                                        </ul>
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
