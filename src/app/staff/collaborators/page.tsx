'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Users,
    Plus,
    Trash2,
    Copy,
    Search,
    Filter,
    X,
    Loader2,
    TrendingUp,
    ShoppingBag,
    Eye,
    EyeOff
} from 'lucide-react';

interface Collaborator {
    id: string;
    name: string;
    email: string;
    phone: string;
    code: string;
    walletBalance: number;
    totalCommission: number;
    orders: number;
    revenue: number;
    createdAt: string;
}

export default function CollaboratorsPage() {
    const searchParams = useSearchParams();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(searchParams.get('action') === 'create');
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [newCollab, setNewCollab] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    useEffect(() => {
        fetchCollaborators();
    }, []);

    const fetchCollaborators = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/staff/collaborators');
            if (res.ok) {
                const data = await res.json();
                setCollaborators(data);
            }
        } catch (error) {
            console.error('Error fetching collaborators:', error);
        } finally {
            setLoading(false);
        }
    };

    const createCollaborator = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            const res = await fetch('/api/staff/collaborators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCollab)
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Tạo CTV thành công!\nMã: ${data.collaborator.code}`);
                setShowModal(false);
                setNewCollab({ name: '', email: '', phone: '', password: '' });
                fetchCollaborators();
            } else {
                alert(data.message || 'Lỗi tạo CTV');
            }
        } catch (error) {
            console.error('Error creating collaborator:', error);
            alert('Lỗi khi tạo cộng tác viên');
        } finally {
            setCreating(false);
        }
    };

    const deleteCollaborator = async (id: string, name: string) => {
        if (!confirm(`Xác nhận xóa cộng tác viên "${name}"?`)) return;

        try {
            const res = await fetch('/api/staff/collaborators', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collaboratorId: id })
            });

            if (res.ok) {
                fetchCollaborators();
            } else {
                const data = await res.json();
                alert(data.message || 'Lỗi xóa CTV');
            }
        } catch (error) {
            console.error('Error deleting collaborator:', error);
        }
    };

    const copyCode = (code: string) => {
        const link = `${window.location.origin}?ref=${code}`;
        navigator.clipboard.writeText(link);
        alert('Đã sao chép link giới thiệu!');
    };

    const filteredCollaborators = collaborators.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = collaborators.reduce((sum, c) => sum + c.revenue, 0);
    const totalOrders = collaborators.reduce((sum, c) => sum + c.orders, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                            <Users className="w-5 h-5" />
                        </div>
                        Quản lý Cộng tác viên
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {collaborators.length} CTV • {totalOrders} đơn hàng • {totalRevenue.toLocaleString('vi-VN')}đ doanh thu
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                    <Plus size={18} />
                    Tạo mã CTV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{collaborators.length}</div>
                            <div className="text-sm text-slate-500">Tổng CTV</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalOrders}</div>
                            <div className="text-sm text-slate-500">Đơn hàng</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}đ</div>
                            <div className="text-sm text-slate-500">Tổng doanh thu team</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, mã CTV..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">CTV</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã giới thiệu</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Đơn hàng</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Doanh thu</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Hoa hồng</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                    </td>
                                </tr>
                            ) : filteredCollaborators.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Users className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">
                                                {searchTerm ? 'Không tìm thấy CTV' : 'Chưa có cộng tác viên nào'}
                                            </p>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="text-sm text-blue-600 hover:underline font-medium"
                                                >
                                                    Tạo CTV đầu tiên
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCollaborators.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {collab.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{collab.name}</div>
                                                    <div className="text-xs text-slate-500">{collab.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                                    {collab.code}
                                                </span>
                                                <button
                                                    onClick={() => copyCode(collab.code)}
                                                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Sao chép link"
                                                >
                                                    <Copy size={14} className="text-blue-600" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-slate-800">{collab.orders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">
                                                {collab.revenue.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-blue-600">
                                                {collab.totalCommission.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => deleteCollaborator(collab.id, collab.name)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa CTV"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Tạo Cộng tác viên mới</h2>
                                <p className="text-sm text-slate-500">Mã CTV sẽ được tạo tự động</p>
                            </div>
                        </div>

                        <form onSubmit={createCollaborator} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCollab.name}
                                    onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={newCollab.email}
                                    onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={newCollab.phone}
                                    onChange={(e) => setNewCollab({ ...newCollab, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={newCollab.password}
                                        onChange={(e) => setNewCollab({ ...newCollab, password: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Tạo CTV'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
