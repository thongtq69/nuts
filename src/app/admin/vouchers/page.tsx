'use client';

import { useState, useEffect } from 'react';
import { Ticket, Trash2, Loader2, Users, ArrowLeft, Search, Filter } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface VoucherGroup {
    id: string;
    source: string;
    sourceId: string | null;
    name: string;
    count: number;
    usedCount: number;
    remainingCount: number;
}

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
    // View Mode State
    const [viewMode, setViewMode] = useState<'groups' | 'list'>('groups');
    const [selectedGroup, setSelectedGroup] = useState<VoucherGroup | null>(null);

    // Data State
    const [groups, setGroups] = useState<VoucherGroup[]>([]);
    const [vouchers, setVouchers] = useState<UserVoucher[]>([]);

    // Loading State
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const toast = useToast();
    const confirm = useConfirm();

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'unused'>('all');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/vouchers/groups');
            if (res.ok) {
                setGroups(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupClick = async (group: VoucherGroup) => {
        setSelectedGroup(group);
        setViewMode('list');
        setLoadingDetails(true);
        // Reset filters
        setSearchTerm('');
        setStatusFilter('all');

        try {
            const res = await fetch(`/api/vouchers/all?source=${group.source}&sourceId=${group.sourceId || 'null'}`);
            if (res.ok) {
                setVouchers(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleBackToGroups = () => {
        setViewMode('groups');
        setSelectedGroup(null);
        setVouchers([]);
        fetchGroups(); // Refresh counts
    };

    const handleDelete = async (voucherId: string, code: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận xóa voucher',
            description: `Bạn có chắc muốn xóa voucher "${code}"? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa voucher',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;
        try {
            setDeleting(voucherId);
            const res = await fetch(`/api/vouchers/${voucherId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setVouchers(prev => prev.filter(v => v._id !== voucherId));
                // Update group count locally if in list view
                if (selectedGroup) {
                    setSelectedGroup(prev => prev ? {
                        ...prev,
                        count: prev.count - 1,
                        remainingCount: prev.remainingCount - 1 // Assuming we delete unused ones mostly
                    } : null);
                }
            } else {
                const data = await res.json();
                toast.error('Lỗi xóa voucher', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting voucher:', error);
            toast.error('Lỗi xóa voucher', 'Vui lòng thử lại.');
        } finally {
            setDeleting(null);
        }
    };

    // Filter Logic
    const filteredVouchers = vouchers.filter(v => {
        const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof v.userId === 'object' && v.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'used'
                ? v.isUsed
                : !v.isUsed;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    // --- GROUP VIEW ---
    if (viewMode === 'groups') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                            <Ticket className="h-5 w-5" />
                        </div>
                        Quản lý Voucher Đã Phát Hành
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        Chọn nhóm voucher để xem chi tiết
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => handleGroupClick(group)}
                            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-green-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {group.source === 'manual' ? 'Thủ công' : 'Tự động'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1" title={group.name}>
                                {group.name}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Tổng số lượng:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{group.count.toLocaleString()}</span>
                                </div>

                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full rounded-full"
                                        style={{ width: `${(group.usedCount / group.count) * 100}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Đã dùng: {group.usedCount}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        Còn lại: {group.remainingCount}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            Chưa có voucher nào được phát hành.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={handleBackToGroups}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-2 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách nhóm
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="line-clamp-1">{selectedGroup?.name}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Danh sách chi tiết voucher
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm appearance-none"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="used">Đã sử dụng</option>
                        <option value="unused">Chưa sử dụng</option>
                    </select>
                </div>
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
                            {loadingDetails ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredVouchers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Ticket className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">
                                                Không tìm thấy voucher nào
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredVouchers.map((v, index) => (
                                    <tr
                                        key={v._id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                                            {v.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                            {typeof v.userId === 'object' && v.userId ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{v.userId.name}</span>
                                                    <span className="text-xs text-slate-400">{v.userId.email}</span>
                                                </div>
                                            ) : (
                                                v.userId || 'Không xác định'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-brand">
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
