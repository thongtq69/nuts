'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, MoreHorizontal, Trash2, Loader2, Eye } from 'lucide-react';

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
    const [deleting, setDeleting] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'user' | 'sale' | 'admin' | 'pending'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSale = async (userId: string) => {
        if (!confirm('Xác nhận duyệt đại lý này?')) return;

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
        const reason = prompt('Lý do từ chối (để trống nếu không có):');
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
        if (!confirm(`Đổi role thành ${newRole}?`)) return;

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

    const handleDelete = async (userId: string, userName: string, userRole: string) => {
        if (userRole === 'admin') {
            alert('Không thể xóa tài khoản Admin!');
            return;
        }
        if (!confirm(`Bạn có chắc muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`)) {
            return;
        }
        try {
            setDeleting(userId);
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setUsers(prev => prev.filter(user => user._id !== userId));
            } else {
                const data = await res.json();
                alert(data.error || 'Lỗi xóa người dùng');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Lỗi xóa người dùng');
        } finally {
            setDeleting(null);
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        if (filter === 'pending') return user.saleApplicationStatus === 'pending';
        return user.role === filter;
    });

    const pendingCount = users.filter(u => u.saleApplicationStatus === 'pending').length;

    if (loading) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="h-6 w-6 text-indigo-600" />
                        Quản lý Người dùng
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý danh sách khách hàng, đại lý và quản trị viên.</p>
                </div>
            </div>

            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả ({users.length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setFilter('user')}
                    >
                        Khách hàng ({users.filter(u => u.role === 'user').length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'sale' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setFilter('sale')}
                    >
                        Đại lý ({users.filter(u => u.role === 'sale').length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setFilter('admin')}
                    >
                        Quản trị viên ({users.filter(u => u.role === 'admin').length})
                    </button>
                    {pendingCount > 0 && (
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'pending' ? 'bg-amber-500 text-black shadow-md' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Chờ duyệt ({pendingCount})
                        </button>
                    )}
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
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr 
                                        key={user._id} 
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/admin/users/${user._id}`}
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{user.phone || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'sale' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {user.role === 'user' ? 'Khách hàng' :
                                                    user.role === 'sale' ? 'Đại lý' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.saleApplicationStatus === 'pending' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
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
                                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
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
                                                        onClick={() => handleDelete(user._id, user.name, user.role)}
                                                        disabled={deleting === user._id}
                                                        title="Xóa người dùng"
                                                    >
                                                        {deleting === user._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={16} />
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
            </div>
        </div>
    );
}
