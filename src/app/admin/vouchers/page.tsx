'use client';

import { useState, useEffect } from 'react';
import { Ticket, Trash2, Loader2 } from 'lucide-react';

interface UserVoucher {
    _id: string;
    code: string;
    userId: { name: string; email: string } | string | null;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    isUsed: boolean;
    createdAt: string;
}

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/vouchers/all');
            if (res.ok) {
                setVouchers(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (voucherId: string, code: string) => {
        if (!confirm(`Bạn có chắc muốn xóa voucher "${code}"? Hành động này không thể hoàn tác.`)) {
            return;
        }
        try {
            setDeleting(voucherId);
            const res = await fetch(`/api/vouchers/${voucherId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setVouchers(prev => prev.filter(v => v._id !== voucherId));
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi xóa voucher');
            }
        } catch (error) {
            console.error('Error deleting voucher:', error);
            alert('Lỗi xóa voucher');
        } finally {
            setDeleting(null);
        }
    };

    // Group vouchers by userId
    const groupedVouchers = vouchers.reduce((acc, voucher) => {
        let userKey = 'unknown';
        let userInfo = { name: 'Không xác định', email: '' };

        if (voucher.userId && typeof voucher.userId === 'object' && 'name' in voucher.userId) {
            // Assuming the populated object has an _id, but using email as key if needed or a generated ID
            // The interface defined locally doesn't show _id in the object, but let's assume unique email or we need to be careful.
            // Best to use a composite key or just group by object reference if strict equality works (unlikely)
            // Let's use stringifying for safety or email if available.
            const u = voucher.userId as { _id?: string, name: string; email: string };
            userKey = u._id || u.email || 'unknown_user';
            userInfo = { name: u.name, email: u.email };
        } else if (typeof voucher.userId === 'string') {
            userKey = voucher.userId;
            userInfo = { name: 'User ID: ' + voucher.userId, email: '' };
        }

        if (!acc[userKey]) {
            acc[userKey] = {
                user: userInfo,
                vouchers: []
            };
        }
        acc[userKey].vouchers.push(voucher);
        return acc;
    }, {} as Record<string, { user: { name: string; email: string }, vouchers: UserVoucher[] }>);

    // Filter grouped vouchers based on search
    const filteredGroups = Object.entries(groupedVouchers).filter(([_, group]) => {
        const searchLower = searchTerm.toLowerCase();
        const userMatch = group.user.name.toLowerCase().includes(searchLower) || group.user.email.toLowerCase().includes(searchLower);
        const voucherMatch = group.vouchers.some(v => v.code.toLowerCase().includes(searchLower));
        return userMatch || voucherMatch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/25">
                            <Ticket className="h-5 w-5" />
                        </div>
                        Quản lý Voucher Đã Phát Hành
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        {vouchers.length} voucher • {Object.keys(groupedVouchers).length} người dùng
                    </p>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm user, email, mã voucher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 w-full md:w-80 transition-all font-medium"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {filteredGroups.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <Ticket className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Không tìm thấy voucher nào</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Thử tìm kiếm với từ khóa khác
                        </p>
                    </div>
                ) : (
                    filteredGroups.map(([key, group]) => (
                        <div key={key} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                                        {group.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                                            {group.user.name}
                                        </h3>
                                        {group.user.email && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {group.user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium border border-slate-200 dark:border-slate-700">
                                        {group.vouchers.length} voucher
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-700">
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">Mã Voucher</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">Giá trị</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/6">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/6">Ngày tạo</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/6">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {group.vouchers.map((v) => (
                                            <tr
                                                key={v._id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                            >
                                                <td className="px-6 py-3 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {v.code}
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap font-semibold text-amber-600">
                                                    {v.discountValue.toLocaleString()}{v.discountType === 'percent' ? '%' : 'đ'}
                                                </td>
                                                <td className="px-6 py-3 text-center whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${v.isUsed ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                        {v.isUsed ? 'Đã dùng' : 'Chưa dùng'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDelete(v._id, v.code)}
                                                        disabled={deleting === v._id}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === v._id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={12} />
                                                        )}
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
