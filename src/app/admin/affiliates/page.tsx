'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Tag, Wallet, DollarSign, Calendar } from 'lucide-react';

export default function AdminAffiliatesPage() {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/affiliates')
            .then(res => res.json())
            .then(data => {
                setAffiliates(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Cộng tác viên</h1>
                    <p className="text-slate-500 mt-1">Danh sách tất cả CTV và affiliate partner.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 text-center w-16">STT</th>
                                <th className="px-6 py-4">Họ tên</th>
                                <th className="px-6 py-4">Liên hệ</th>
                                <th className="px-6 py-4">Mã Ref</th>
                                <th className="px-6 py-4 text-right">Số dư ví</th>
                                <th className="px-6 py-4 text-right">Tổng hoa hồng</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin"></div>
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : affiliates.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        Chưa có cộng tác viên nào.
                                    </td>
                                </tr>
                            ) : (
                                affiliates.map((aff: any, index: number) => (
                                    <tr 
                                        key={aff._id} 
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            // Navigate to affiliate detail page if it exists, or show info
                                            alert(`Cộng tác viên: ${aff.name}\nMã Ref: ${aff.referralCode}\nSố dư ví: ${new Intl.NumberFormat('vi-VN').format(aff.walletBalance || 0)}đ\nTổng hoa hồng: ${new Intl.NumberFormat('vi-VN').format(aff.totalCommission || 0)}đ`);
                                        }}
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                                                    {aff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-medium text-slate-900">{aff.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {aff.email}
                                                </div>
                                                {aff.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {aff.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                <Tag size={12} />
                                                {aff.referralCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-medium text-slate-900">
                                                {new Intl.NumberFormat('vi-VN').format(aff.walletBalance || 0)}đ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-medium text-green-600">
                                                {new Intl.NumberFormat('vi-VN').format(aff.totalCommission || 0)}đ
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(aff.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
