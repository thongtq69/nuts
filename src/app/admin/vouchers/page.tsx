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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/25">
                        <Ticket className="h-5 w-5" />
                    </div>
                    Quản lý Voucher Đã Phát Hành
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                    {vouchers.length} voucher đã phát hành
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-16">STT</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mã Voucher</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Người sở hữu</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Giá trị</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {vouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Ticket className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Chưa có voucher nào
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map((v, index) => (
                                    <tr key={v._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                                            {v.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                            {typeof v.userId === 'object' && v.userId ? `${v.userId.name} (${v.userId.email})` : v.userId || 'Không xác định'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-amber-600">
                                            {v.discountValue.toLocaleString()}{v.discountType === 'percent' ? '%' : 'đ'}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${v.isUsed ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                {v.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(v._id, v.code)}
                                                disabled={deleting === v._id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                {deleting === v._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                                Xóa
                                            </button>
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
