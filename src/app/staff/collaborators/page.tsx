'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Users,
    Plus,
    Trash2,
    Copy,
    Search,
    X,
    Loader2,
    TrendingUp,
    ShoppingBag,
    Eye,
    EyeOff,
    UserPlus,
    CheckCircle,
    AlertCircle
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
    const [copyStatus, setCopyStatus] = useState<{ [key: string]: boolean }>({});

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

    const copyCode = (code: string, id: string) => {
        const link = `${window.location.origin}?ref=${code}`;
        navigator.clipboard.writeText(link);
        setCopyStatus(prev => ({ ...prev, [id]: true }));
        setTimeout(() => setCopyStatus(prev => ({ ...prev, [id]: false })), 2000);
    };

    const filteredCollaborators = collaborators.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = collaborators.reduce((sum, c) => sum + c.revenue, 0);
    const totalOrders = collaborators.reduce((sum, c) => sum + c.orders, 0);
    const totalCommission = collaborators.reduce((sum, c) => sum + c.totalCommission, 0);
    const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-gray-800 shadow-xl shadow-brand/25">
                            <Users className="w-6 h-6" />
                        </div>
                        Quản lý Cộng tác viên
                    </h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {collaborators.length} CTV
                        </span>
                        <span className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" /> {totalOrders} đơn
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-4 h-4" /> {formatPrice(totalRevenue)}đ
                        </span>
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-dark shadow-xl shadow-brand/30 transition-all border-2 border-brand"
                >
                    <UserPlus size={20} />
                    Tạo mã CTV mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-light/10 flex items-center justify-center">
                            <Users className="w-7 h-7 text-brand" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-800">{collaborators.length}</div>
                            <div className="text-gray-500 font-medium">Tổng CTV</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-gray-800">{totalOrders}</div>
                            <div className="text-gray-500 font-medium">Đơn hàng</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-emerald-600">{formatPrice(totalRevenue)}đ</div>
                            <div className="text-gray-500 font-medium">Doanh thu</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-violet-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-violet-600">{formatPrice(totalCommission)}đ</div>
                            <div className="text-gray-500 font-medium">Hoa hồng</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm theo tên, email, mã CTV..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all text-lg"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cộng tác viên</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã giới thiệu</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn hàng</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Doanh thu</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hoa hồng</th>
                                <th className="px-6 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
                                            <p className="text-gray-500 font-medium">Đang tải...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCollaborators.length === 0 ? (
                                 <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
                                                <Users className="w-10 h-10 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium text-lg">
                                                    {searchTerm ? 'Không tìm thấy CTV' : 'Chưa có cộng tác viên nào'}
                                                </p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {searchTerm ? 'Thử từ khóa khác' : 'Hãy tạo CTV đầu tiên để bắt đầu!'}
                                                </p>
                                            </div>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark shadow-lg hover:shadow-brand/30 transition-all flex items-center gap-2 border-2 border-brand"
                                                >
                                                    <Plus size={18} />
                                                    Tạo CTV đầu tiên
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCollaborators.map((collab) => (
                                    <tr key={collab.id} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-light rounded-2xl flex items-center justify-center text-gray-800 font-bold">
                                                    {collab.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">{collab.name}</div>
                                                    <div className="text-gray-500 text-sm">{collab.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                                                    {collab.code}
                                                </span>
                                                <button
                                                    onClick={() => copyCode(collab.code, collab.id)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        copyStatus[collab.id] 
                                                            ? 'bg-emerald-100 text-emerald-600' 
                                                            : 'hover:bg-brand/10 text-brand'
                                                    }`}
                                                    title="Sao chép link"
                                                >
                                                    {copyStatus[collab.id] ? <CheckCircle size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 font-bold rounded-xl">
                                                {collab.orders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-bold text-emerald-600 text-lg">
                                                {collab.revenue.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="font-bold text-brand text-lg">
                                                {collab.totalCommission.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => deleteCollaborator(collab.id, collab.name)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Xóa CTV"
                                            >
                                                <Trash2 size={18} />
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
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-light rounded-2xl flex items-center justify-center text-gray-800 shadow-xl shadow-brand/25">
                                <UserPlus size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Tạo Cộng tác viên mới</h2>
                                <p className="text-gray-500 text-sm mt-1">Mã CTV sẽ được tạo tự động theo mã NV của bạn</p>
                            </div>
                        </div>

                        <form onSubmit={createCollaborator} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCollab.name}
                                    onChange={(e) => setNewCollab({ ...newCollab, name: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={newCollab.email}
                                    onChange={(e) => setNewCollab({ ...newCollab, email: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={newCollab.phone}
                                    onChange={(e) => setNewCollab({ ...newCollab, phone: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={newCollab.password}
                                        onChange={(e) => setNewCollab({ ...newCollab, password: e.target.value })}
                                        className="w-full px-4 py-3.5 pr-12 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3.5 border-2 border-gray-100 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark shadow-xl hover:shadow-brand/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-brand"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Tạo CTV
                                        </>
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
