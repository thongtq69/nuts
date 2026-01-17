'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Copy,
    TrendingUp,
    ShoppingBag,
    X,
    Loader2,
    Eye,
    EyeOff,
    UserCheck,
    ChevronRight
} from 'lucide-react';

interface Staff {
    id: string;
    name: string;
    email: string;
    phone: string;
    staffCode: string;
    collaboratorCount: number;
    totalCommission: number;
    teamRevenue: number;
    teamOrders: number;
    createdAt: string;
}

export default function AdminStaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        staffCode: ''
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const createStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreating(true);
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff)
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Tạo nhân viên thành công!\nMã: ${data.staff.staffCode}`);
                setShowModal(false);
                setNewStaff({ name: '', email: '', phone: '', password: '', staffCode: '' });
                fetchStaff();
            } else {
                alert(data.message || 'Lỗi tạo nhân viên');
            }
        } catch (error) {
            console.error('Error creating staff:', error);
            alert('Lỗi khi tạo nhân viên');
        } finally {
            setCreating(false);
        }
    };

    const deleteStaff = async (id: string, name: string) => {
        if (!confirm(`Xác nhận xóa nhân viên "${name}" và tất cả CTV của họ?`)) return;

        try {
            const res = await fetch('/api/admin/staff', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId: id })
            });

            if (res.ok) {
                fetchStaff();
            } else {
                const data = await res.json();
                alert(data.message || 'Lỗi xóa nhân viên');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert('Đã sao chép mã nhân viên!');
    };

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStaff = staffList.length;
    const totalCTV = staffList.reduce((sum, s) => sum + s.collaboratorCount, 0);
    const totalRevenue = staffList.reduce((sum, s) => sum + s.teamRevenue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        Quản lý Nhân viên
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {totalStaff} nhân viên • {totalCTV} CTV • {totalRevenue.toLocaleString('vi-VN')}đ doanh thu team
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-200 hover:bg-indigo-300 text-slate-800 font-bold rounded-xl hover:shadow-md transition-all"
                >
                    <Plus size={18} />
                    Thêm nhân viên
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalStaff}</div>
                            <div className="text-sm text-slate-500">Nhân viên</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{totalCTV}</div>
                            <div className="text-sm text-slate-500">Tổng CTV</div>
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
                            <div className="text-sm text-slate-500">Tổng doanh thu từ team</div>
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
                        placeholder="Tìm theo tên, email, mã nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase w-16">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nhân viên</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mã NV</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">CTV</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Đơn hàng</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Doanh thu team</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <UserCheck className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">
                                                {searchTerm ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'}
                                            </p>
                                            {!searchTerm && (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="text-sm text-indigo-600 hover:underline font-medium"
                                                >
                                                    Thêm nhân viên đầu tiên
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((staff, index) => (
                                    <tr 
                                        key={staff.id} 
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            // Navigate to staff detail page if it exists, or show info
                                            alert(`Nhân viên: ${staff.name}\nMã NV: ${staff.staffCode}\nSố CTV: ${staff.collaboratorCount}\nDoanh thu team: ${staff.teamRevenue.toLocaleString('vi-VN')}đ`);
                                        }}
                                    >
                                        <td className="px-6 py-4 text-center font-semibold text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {staff.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{staff.name}</div>
                                                    <div className="text-xs text-slate-500">{staff.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">
                                                    {staff.staffCode}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyCode(staff.staffCode);
                                                    }}
                                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Sao chép mã"
                                                >
                                                    <Copy size={14} className="text-slate-500" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-purple-600">{staff.collaboratorCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-semibold text-slate-800">{staff.teamOrders}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-emerald-600">
                                                {staff.teamRevenue.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chi tiết"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteStaff(staff.id, staff.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
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
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Thêm Nhân viên mới</h2>
                                <p className="text-sm text-slate-500">Cấp mã để nhân viên quản lý CTV</p>
                            </div>
                        </div>

                        <form onSubmit={createStaff} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mã nhân viên *</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaff.staffCode}
                                    onChange={(e) => setNewStaff({ ...newStaff, staffCode: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                                    placeholder="VD: NV001"
                                />
                                <p className="text-xs text-slate-500 mt-1">CTV của nhân viên sẽ có mã: {newStaff.staffCode || 'NV001'}-CTV1</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaff.name}
                                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={newStaff.phone}
                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
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
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2.5 bg-indigo-200 hover:bg-indigo-300 text-slate-800 font-bold rounded-xl hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Tạo nhân viên'
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
