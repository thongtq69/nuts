'use client';

import { useState, useEffect } from 'react';

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
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý Gói Đăng Ký (Subscription Packages)</h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Tạo Gói Mới</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên gói</label>
                        <input type="text" className="w-full border p-2 rounded" value={newPkg.name} onChange={e => setNewPkg({ ...newPkg, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Giá tiền (VND)</label>
                        <input type="number" className="w-full border p-2 rounded" value={newPkg.price} onChange={e => setNewPkg({ ...newPkg, price: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Số lượng voucher</label>
                        <input type="number" className="w-full border p-2 rounded" value={newPkg.voucherQuantity} onChange={e => setNewPkg({ ...newPkg, voucherQuantity: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                        <select className="w-full border p-2 rounded" value={newPkg.discountType} onChange={e => setNewPkg({ ...newPkg, discountType: e.target.value as any })}>
                            <option value="percent">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (VND)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Giá trị giảm ({newPkg.discountType === 'percent' ? '%' : 'VND'})</label>
                        <input type="number" className="w-full border p-2 rounded" value={newPkg.discountValue} onChange={e => setNewPkg({ ...newPkg, discountValue: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Giảm tối đa (VND, 0 = ko giới hạn)</label>
                        <input type="number" className="w-full border p-2 rounded" value={newPkg.maxDiscount} onChange={e => setNewPkg({ ...newPkg, maxDiscount: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu (VND)</label>
                        <input type="number" className="w-full border p-2 rounded" value={newPkg.minOrderValue} onChange={e => setNewPkg({ ...newPkg, minOrderValue: Number(e.target.value) })} />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo Gói'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Gói</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vouchers</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết giảm giá</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {packages.map(pkg => (
                            <tr key={pkg._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{pkg.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{pkg.price.toLocaleString()}đ</td>
                                <td className="px-6 py-4 whitespace-nowrap">{pkg.voucherQuantity} mã</td>
                                <td className="px-6 py-4">
                                    Giảm {pkg.discountValue}{pkg.discountType === 'percent' ? '%' : 'đ'}
                                    (Max: {pkg.maxDiscount.toLocaleString()}đ)
                                    Cho đơn từ {pkg.minOrderValue.toLocaleString()}đ
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
