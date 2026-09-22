'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle, XCircle, UserX, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/admin/ui/Pagination';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { ExportButton, ExportColumn } from '@/components/admin/ui/ExportButton';
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { usePrompt } from '@/context/PromptContext';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'sale' | 'admin' | 'staff';
    saleType?: 'agent' | 'collaborator' | null;
    affiliateLevel?: 'staff' | 'collaborator';
    saleApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
    isActive?: boolean;
    createdAt: string;
    managedBy?: {
        _id: string;
        name: string;
        email?: string;
        staffCode?: string;
    } | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'user' | 'sale' | 'admin' | 'staff' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string | null; userName: string }>({
        isOpen: false,
        userId: null,
        userName: ''
    });
    const [deleting, setDeleting] = useState<string | null>(null);
    const { error: showError, success: showSuccess, warning: showWarning } = useToast();
    const confirm = useConfirm();
    const prompt = usePrompt();

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Không thể tải danh sách người dùng');
            }
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showError(
                'Không thể tải người dùng',
                error instanceof Error ? error.message : 'Vui lòng thử lại.',
            );
        } finally {
            setLoading(false);
        }
    }, [showError]);

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
            showWarning('Không thể xóa tài khoản Admin', 'Hãy chọn tài khoản khác.');
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
                showSuccess('Đã xóa người dùng', 'Danh sách và các quan hệ quản lý đã được đồng bộ.');
                await fetchUsers();
            } else {
                const data = await res.json();
                showError('Lỗi xóa người dùng', data.error || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showError('Lỗi xóa người dùng', 'Vui lòng thử lại.');
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
            key: 'managedBy',
            label: 'Nhân viên quản lý',
            format: (value) => {
                const manager = value as User['managedBy'];
                return manager?.name
                    ? `${manager.name}${manager.staffCode ? ` (${manager.staffCode})` : ''}`
                    : 'Chưa gắn';
            },
        },
        {
            key: 'role', label: 'Vai trò', format: (v) =>
                v === 'admin' ? 'Admin' : v === 'staff' ? 'Nhân viên' : v === 'sale' ? 'Đại lý/CTV' : 'Khách hàng'
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
                message={`Xóa tài khoản "${deleteModal.userName}"? Tài khoản sẽ bị xóa khỏi danh sách và không thể đăng nhập; lịch sử đơn hàng, thanh toán và hoa hồng vẫn được giữ để đối soát.`}
                confirmText="Xóa người dùng"
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
                <label className="lg:hidden">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Nhóm người dùng</span>
                    <select value={filter} onChange={event => { setFilter(event.target.value as typeof filter); setCurrentPage(1); }} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm outline-none focus:border-brand">
                        <option value="all">Tất cả ({users.length})</option>
                        <option value="user">Khách hàng ({users.filter(user => user.role === 'user').length})</option>
                        <option value="sale">Đại lý/CTV ({users.filter(user => user.role === 'sale').length})</option>
                        <option value="staff">Nhân viên ({users.filter(user => user.role === 'staff').length})</option>
                        <option value="admin">Quản trị viên ({users.filter(user => user.role === 'admin').length})</option>
                        {pendingCount > 0 && <option value="pending">Chờ duyệt ({pendingCount})</option>}
                    </select>
                </label>
                <div className="hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:block">
                    <div className="flex flex-wrap gap-2">
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
                            Đại lý/CTV ({users.filter(u => u.role === 'sale').length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'staff' ? 'bg-brand text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setFilter('staff')}
                        >
                            Nhân viên ({users.filter(u => u.role === 'staff').length})
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

            </div>

            <SearchInput
                value={searchTerm}
                onChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                className="max-w-2xl"
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100 lg:hidden">
                    {paginatedUsers.length === 0 ? <p className="px-5 py-12 text-center italic text-slate-500">Không tìm thấy người dùng nào.</p> : paginatedUsers.map((user, index) => <article key={`mobile-${user._id}`} onClick={() => window.location.href = `/admin/users/${user._id}`} className="cursor-pointer p-4 transition hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0"><span className="text-xs font-bold text-slate-400">#{startIndex + index + 1}</span><h2 className="mt-1 font-bold text-slate-800">{user.name}</h2><p className="break-all text-sm text-slate-600">{user.email}</p>{user.phone && <p className="mt-1 text-xs text-slate-500">{user.phone}</p>}</div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : user.role === 'staff' ? 'bg-brand/10 text-brand' : user.role === 'sale' ? 'bg-brand-light/30 text-brand-dark' : 'bg-slate-100 text-slate-600'}`}>{user.role === 'user' ? 'Khách hàng' : user.role === 'sale' ? (user.affiliateLevel === 'collaborator' || user.saleType === 'collaborator' ? 'CTV' : 'Đại lý') : user.role === 'staff' ? 'Nhân viên' : 'Admin'}</span>
                        </div>
                        {user.role === 'user' && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs"><span className="text-slate-400">Nhân viên quản lý</span><p className="mt-1 font-semibold text-slate-700">{user.managedBy?.name || 'Chưa gắn nhân viên'}</p></div>}
                        <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>{user.isActive === false && <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">Đã vô hiệu hóa</span>}{user.saleApplicationStatus === 'pending' && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">Chờ duyệt</span>}</div>
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3" onClick={event => event.stopPropagation()}>
                            {user.isActive !== false && user.saleApplicationStatus === 'pending' && <><button onClick={() => handleApproveSale(user._id)} className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">Duyệt</button><button onClick={() => handleRejectSale(user._id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">Từ chối</button></>}
                            {user.isActive !== false && user.role === 'user' && !user.saleApplicationStatus && <button onClick={() => handleChangeRole(user._id, 'sale')} className="rounded-lg bg-brand/10 px-3 py-2 text-xs font-bold text-brand">Nâng cấp Đại lý</button>}
                            {user.isActive !== false && user.role === 'sale' && <button onClick={() => handleChangeRole(user._id, 'user')} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">Hạ cấp</button>}
                            {user.role !== 'admin' && user.isActive !== false && <button onClick={() => openDeleteModal(user._id, user.name, user.role)} disabled={deleting === user._id} className="ml-auto rounded-lg bg-red-50 p-2 text-red-600 disabled:opacity-50" aria-label={`Xóa ${user.name}`}>{deleting === user._id ? <Loader2 size={16} className="animate-spin"/> : <UserX size={16}/>}</button>}
                        </div>
                    </article>)}
                </div>
                <div className="hidden lg:block">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="px-6 py-4 w-16">STT</th>
                                <th className="px-6 py-4">Tên</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">SĐT</th>
                                <th className="px-6 py-4">Nhân viên quản lý</th>
                                <th className="px-6 py-4 text-center">Vai trò</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4">Ngày tham gia</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500 italic">
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
                                        <td className="px-6 py-4">
                                            {user.role === 'user' ? (
                                                user.managedBy ? (
                                                    <div>
                                                        <div className="font-semibold text-slate-700 text-sm">{user.managedBy.name}</div>
                                                        <div className="text-xs text-[#9C7044] font-mono">{user.managedBy.staffCode || user.managedBy.email || ''}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Chưa gắn nhân viên</span>
                                                )
                                            ) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                                    user.role === 'staff' ? 'bg-brand/10 text-brand' :
                                                        user.role === 'sale' ? 'bg-brand-light/30 text-brand-dark' :
                                                            'bg-slate-100 text-slate-600'
                                                }`}>
                                                {user.role === 'user' ? 'Khách hàng' :
                                                    user.role === 'sale'
                                                        ? (user.affiliateLevel === 'collaborator' || user.saleType === 'collaborator' ? 'Cộng tác viên' : 'Đại lý') :
                                                        user.role === 'staff' ? 'Nhân viên' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isActive === false ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    Đã vô hiệu hóa
                                                </span>
                                            ) : user.saleApplicationStatus === 'pending' && (
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
                                                {user.isActive !== false && user.saleApplicationStatus === 'pending' && (
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
                                                {user.isActive !== false && user.role === 'user' && !user.saleApplicationStatus && (
                                                    <button
                                                        className="px-3 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-lg hover:bg-brand/20 transition-colors"
                                                        onClick={() => handleChangeRole(user._id, 'sale')}
                                                    >
                                                        Nâng cấp Đại lý
                                                    </button>
                                                )}
                                                {user.isActive !== false && user.role === 'sale' && (
                                                    <button
                                                        className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                                                        onClick={() => handleChangeRole(user._id, 'user')}
                                                    >
                                                        Hạ cấp
                                                    </button>
                                                )}
                                                {user.role !== 'admin' && user.isActive !== false && (
                                                    <button
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        onClick={() => openDeleteModal(user._id, user.name, user.role)}
                                                        disabled={deleting === user._id}
                                                        title="Xóa người dùng"
                                                    >
                                                        {deleting === user._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <UserX size={16} />
                                                        )}
                                                    </button>
                                                )}
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
