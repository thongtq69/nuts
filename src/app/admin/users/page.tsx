'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
        <div>
            <div className="page-header">
                <h1>Quản lý người dùng</h1>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả ({users.length})
                    </button>
                    <button
                        className={`btn ${filter === 'user' ? 'btn-primary' : ''}`}
                        onClick={() => setFilter('user')}
                    >
                        User ({users.filter(u => u.role === 'user').length})
                    </button>
                    <button
                        className={`btn ${filter === 'sale' ? 'btn-primary' : ''}`}
                        onClick={() => setFilter('sale')}
                    >
                        Đại lý ({users.filter(u => u.role === 'sale').length})
                    </button>
                    <button
                        className={`btn ${filter === 'admin' ? 'btn-primary' : ''}`}
                        onClick={() => setFilter('admin')}
                    >
                        Admin ({users.filter(u => u.role === 'admin').length})
                    </button>
                    {pendingCount > 0 && (
                        <button
                            className={`btn btn-warning ${filter === 'pending' ? 'btn-primary' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Chờ duyệt ({pendingCount})
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
                            <th>Role</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    <span className={`badge badge-${user.role}`}>
                                        {user.role === 'user' ? 'Khách hàng' :
                                            user.role === 'sale' ? 'Đại lý' : 'Admin'}
                                    </span>
                                </td>
                                <td>
                                    {user.saleApplicationStatus === 'pending' && (
                                        <span className="badge badge-pending">Chờ duyệt đại lý</span>
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <div className="action-buttons">
                                        {user.saleApplicationStatus === 'pending' && (
                                            <>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApproveSale(user._id)}
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRejectSale(user._id)}
                                                >
                                                    Từ chối
                                                </button>
                                            </>
                                        )}
                                        {user.role === 'user' && !user.saleApplicationStatus && (
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleChangeRole(user._id, 'sale')}
                                            >
                                                Nâng đại lý
                                            </button>
                                        )}
                                        {user.role === 'sale' && (
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => handleChangeRole(user._id, 'user')}
                                            >
                                                Hạ xuống user
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <h3>Không có người dùng nào</h3>
                        <p>Không tìm thấy người dùng phù hợp với bộ lọc.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
