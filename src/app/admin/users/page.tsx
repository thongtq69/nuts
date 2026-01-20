'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { ExportButton, exportToCSV, ExportColumn } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { Button } from '@/components/admin/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { usePrompt } from '@/context/PromptContext';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'sale' | 'admin';
    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'user' | 'sale' | 'admin' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
        isOpen: false,
        userId: null,
        userName: ''
    });
    const [deleting, setDeleting] = useState<string | null>(null);
    const toast = useToast();
    const confirm = useConfirm();
    const prompt = usePrompt();

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleApproveSale = async (userId: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận duyệt đại lý',
            description: 'Xác nhận duyệt đại lý này?',
            confirmText: 'Duyệt',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/approve-sale`, {
                method: 'POST',
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error approving sale:', error);
        }
    };

    const handleRejectSale = async (userId: string) => {
        const reason = await prompt({
            title: 'Lý do từ chối',
            description: 'Lý do từ chối (để trống nếu không có):',
            placeholder: 'Nhập lý do...',
            confirmText: 'Gửi',
            cancelText: 'Hủy',
        });
        if (reason === null) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}/reject-sale`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error rejecting sale:', error);
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        const confirmed = await confirm({
            title: 'Xác nhận đổi quyền',
            description: `Đổi role thành ${newRole}?`,
            confirmText: 'Xác nhận',
            cancelText: 'Hủy',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    const openDeleteModal = (userId: string, userName: string, userRole: string) => {
        if (userRole === 'admin') {
            toast.warning('Không thể xóa tài khoản Admin', 'Hãy chọn tài khoản khác.');
            return;
        }
        setDeleteModal({ isOpen: true, userId, userName });
    };

    const handleDelete = async () => {
        if (!deleteModal.userId) return;
        try {
            setDeleting(deleteModal.userId);
            const res = await fetch(`/api/admin/users/${deleteModal.userId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setUsers(prev => prev.filter(user => user._id !== deleteModal.userId));
                setDeleteModal({ isOpen: false, userId: null, userName: '' });
            } else {
                const data = await res.json();
                toast.error('Lỗi xóa người dùng', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Lỗi xóa người dùng', 'Vui lòng thử lại.');
        } finally {
            setDeleting(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && user.saleApplicationStatus === 'pending') ||
            user.role === filter;
        const matchesSearch = searchTerm === '' ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const pendingCount = users.filter(u => u.saleApplicationStatus === 'pending').length;

    const exportColumns: ExportColumn<User>[] = [
        { key: '_id', label: 'ID', format: (v) => v || '' },
        { key: 'name', label: 'Tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Số điện thoại', format: (v) => v || '-' },
        {
            key: 'role', label: 'Vai trò', format: (v) =>
                v === 'admin' ? 'Admin' : v === 'sale' ? 'Đại lý' : 'Khách hàng'
        },
        {
            key: 'saleApplicationStatus', label: 'Trạng thái', format: (v) =>
                v === 'pending' ? 'Đang chờ duyệt' : v === 'approved' ? 'Đã duyệt' : v === 'rejected' ? 'Từ chối' : '-'
        },
        { key: 'createdAt', label: 'Ngày tham gia', format: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '-' }
    ];

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDelete}
                title="Xóa người dùng"
                message={`Bạn có chắc chắn muốn xóa người dùng "${deleteModal.userName}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                variant="danger"
                isLoading={deleting !== null}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="h-6 w-6 text-brand" />
                        Quản lý Người dùng
                    </h1>
                    <p className="text-slate-500 mt-1">{filteredUsers.length} người dùng</p>
                </div>
                <ExportButton
                    data={filteredUsers}
                    columns={exportColumns}
                    filename="nguoi-dung"
                    disabled={filteredUsers.length === 0}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-brand text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setFilter('all')}
                        >
                            Tất cả ({users.length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'user' ? 'bg-brand text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setFilter('user')}
                        >
                            Khách hàng ({users.filter(u => u.role === 'user').length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'sale' ? 'bg-brand text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setFilter('sale')}
                        >
                            Đại lý ({users.filter(u => u.role === 'sale').length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'admin' ? 'bg-brand text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setFilter('admin')}
                        >
                            Quản trị viên ({users.filter(u => u.role === 'admin').length})
                        </button>
                        {pendingCount > 0 && (
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'pending' ? 'bg-brand text-black shadow-md' : 'bg-brand-light/30 text-brand-dark hover:bg-brand-light/50'}`}
                                onClick={() => setFilter('pending')}
                            >
                                Chờ duyệt ({pendingCount})
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Tìm theo tên, email, SĐT..."
                        isLoading={loading}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 w-16">STT</th>
                                <th className="px-6 py-4">Tên</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">SĐT</th>
                                <th className="px-6 py-4 text-center">Vai trò</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user, index) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/admin/users/${user._id}`}
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{user.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${user.role === 'admin' ? 'bg-brand/10 text-brand' :
                                                    user.role === 'sale' ? 'bg-brand-light/30 text-brand-dark' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {user.role === 'user' ? 'Khách hàng' :
                                                    user.role === 'sale' ? 'Đại lý' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.saleApplicationStatus === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-light/30 text-brand-dark border border-brand-light/50">
                                                    Đang chờ duyệt
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {user.saleApplicationStatus === 'pending' && (
                                                    <>
                                                        <button
                                                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            onClick={() => handleApproveSale(user._id)}
                                                            title="Duyệt làm đại lý"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            onClick={() => handleRejectSale(user._id)}
                                                            title="Từ chối"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {user.role === 'user' && !user.saleApplicationStatus && (
                                                    <button
                                                        className="px-3 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-lg hover:bg-brand/20 transition-colors"
                                                        onClick={() => handleChangeRole(user._id, 'sale')}
                                                    >
                                                        Nâng cấp Đại lý
                                                    </button>
                                                )}
                                                {user.role === 'sale' && (
                                                    <button
                                                        className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                                                        onClick={() => handleChangeRole(user._id, 'user')}
                                                    >
                                                        Hạ cấp
                                                    </button>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        onClick={() => openDeleteModal(user._id, user.name, user.role)}
                                                        disabled={deleting === user._id}
                                                        title="Xóa người dùng"
                                                    >
                                                        {deleting === user._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <MoreHorizontal size={16} />
                                                        )}
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={filteredUsers.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    isLoading={loading}
                />
            </div>
        </div>
    );
}
