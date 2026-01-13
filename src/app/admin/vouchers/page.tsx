'use client';

import { useState, useEffect } from 'react';

interface UserVoucher {
    _id: string;
    code: string;
    userId: { name: string; email: string } | string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    isUsed: boolean;
    createdAt: string;
}

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<UserVoucher[]>([]);

    useEffect(() => {
        const fetchVouchers = async () => {
            // Need an API to list all vouchers (Admin only)
            // Assuming we will create GET /api/vouchers/all
            try {
                const res = await fetch('/api/vouchers/all');
                if (res.ok) {
                    setVouchers(await res.json());
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchVouchers();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý Voucher Đã Phát Hành</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Voucher</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người sở hữu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vouchers.map(v => (
                            <tr key={v._id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{v.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {typeof v.userId === 'object' ? `${v.userId.name} (${v.userId.email})` : v.userId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {v.discountValue.toLocaleString()}{v.discountType === 'percent' ? '%' : 'đ'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${v.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                        {v.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(v.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
