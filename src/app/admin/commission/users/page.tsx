'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button, Input, Select, Badge, Card, Modal } from '@/components/admin/ui';
import {
    Search,
    Filter,
    Settings,
    BarChart3,
    Users,
    User as UserIcon,
    Mail,
    Award,
    TrendingUp,
    ChevronRight,
    SearchX,
    MoreHorizontal,
    Star,
    CheckCircle2,
    Briefcase
} from 'lucide-react';


interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    commissionSettings?: {
        tier: string;
        personalCommissionRate?: number;
        managerId?: string;
        teamId?: string;
    };
    performance?: {
        currentMonthSales: number;
        currentMonthOrders: number;
        totalSales: number;
        totalOrders: number;
    };
}

interface CommissionTier {
    id: string;
    name: string;
    displayName: string;
    color: string;
    icon?: string;
}

export default function CommissionUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [tiers, setTiers] = useState<CommissionTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState('');
    const [filterRole, setFilterRole] = useState('');

    // Edit modal state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        tier: 'bronze',
        personalCommissionRate: '',
        managerId: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, tiersRes] = await Promise.all([
                fetch('/api/admin/users?role=sale,staff'),
                fetch('/api/admin/commission/tiers?active=true')
            ]);

            const usersData = await usersRes.json();
            const tiersData = await tiersRes.json();

            // Handle users data (it might be an array or { success: true, users: [] })
            if (Array.isArray(usersData)) {
                setUsers(usersData);
            } else if (usersData.success) {
                setUsers(usersData.users || usersData.data || []);
            }

            if (tiersData.success) {
                setTiers(tiersData.data || []);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            tier: user.commissionSettings?.tier || 'bronze',
            personalCommissionRate: user.commissionSettings?.personalCommissionRate?.toString() || '',
            managerId: user.commissionSettings?.managerId || ''
        });
        setIsEditModalOpen(true);
    };

    const saveCommissionSettings = async () => {
        if (!selectedUser) return;
        setSaving(true);

        try {
            const body: any = {
                tier: editForm.tier
            };

            if (editForm.personalCommissionRate) {
                body.personalCommissionRate = parseFloat(editForm.personalCommissionRate);
            } else {
                body.clearPersonalRate = true;
            }

            if (editForm.managerId) {
                body.managerId = editForm.managerId;
            } else {
                body.managerId = null;
            }

            const res = await fetch(`/api/admin/commission/users/${selectedUser._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                fetchData();
                setIsEditModalOpen(false);
                setSelectedUser(null);
            } else {
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getTierBadge = (tierName: string) => {
        const tier = tiers.find((t: any) => t.name === tierName);
        if (!tier) return <Badge variant="default">{tierName}</Badge>;


        return (
            <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                    backgroundColor: `${tier.color}20`,
                    color: tier.color,
                    border: `1px solid ${tier.color}40`
                }}
            >
                {tier.icon} {tier.displayName}
            </span>
        );
    };

    // Filter users
    const filteredUsers = users.filter((user) => {
        const matchSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTier = !filterTier || user.commissionSettings?.tier === filterTier;
        const matchRole = !filterRole || user.role === filterRole;
        return matchSearch && matchTier && matchRole;
    });

    // Managers list (staff/sale users)
    const managers = users.filter((u) => u.role === 'staff' || u.role === 'sale');

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hoa hồng theo User</h1>
                <p className="text-gray-500 mt-1">
                    Quản lý cài đặt hoa hồng cho từng nhân viên/CTV
                </p>
            </div>

            {/* Filters */}
            <Card className="p-6 bg-white shadow-sm border-slate-200">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-0">
                    <div className="relative flex-1 w-full md:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo tên hoặc email CTV..."
                            className="pl-11 h-12 bg-slate-50 border-0 focus:ring-2 focus:ring-violet-500 rounded-2xl"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <Select
                                value={filterTier}
                                onChange={(e) => setFilterTier(e.target.value)}
                                className="h-9 border-0 bg-transparent text-xs font-bold text-slate-600 focus:ring-0 w-[140px]"
                            >
                                <option value="">Tất cả cấp bậc</option>
                                {tiers.map((tier) => (
                                    <option key={tier.id} value={tier.name}>
                                        {tier.displayName}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            <Select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="h-9 border-0 bg-transparent text-xs font-bold text-slate-600 focus:ring-0 w-[140px]"
                            >
                                <option value="">Tất cả vai trò</option>
                                <option value="staff">Nhân viên</option>
                                <option value="sale">CTV/Đại lý</option>
                            </Select>
                        </div>

                        {(searchTerm || filterTier || filterRole) && (
                            <button
                                onClick={() => { setSearchTerm(''); setFilterTier(''); setFilterRole(''); }}
                                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-2"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>
            </Card>


            {/* Users Table */}
            <Card className="overflow-hidden border-slate-200 shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">User / Affiliate</th>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Vai trò</th>
                                <th className="p-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest text-center">Cấp bậc</th>
                                <th className="p-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Chiết khấu (%)</th>
                                <th className="p-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">DS Tháng</th>
                                <th className="p-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Đơn hàng</th>
                                <th className="p-5 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                                            <SearchX className="w-12 h-12 mb-2" />
                                            <p className="text-slate-500 font-bold">Không tìm thấy người dùng nào</p>
                                            <p className="text-slate-400 text-sm">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="transition-all hover:bg-slate-50 group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold border-2 border-white shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm group-hover:text-violet-600 transition-colors">
                                                        {user.name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                        <Mail className="w-3 h-3" /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.role === 'staff' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                <span className="text-xs font-bold text-slate-600">
                                                    {user.role === 'staff' ? 'Nhân viên' : 'CTV/Đại lý'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center">
                                                {getTierBadge(user.commissionSettings?.tier || 'bronze')}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            {user.commissionSettings?.personalCommissionRate !== undefined ? (
                                                <div className="inline-flex flex-col items-end">
                                                    <span className="text-sm font-black text-emerald-600">
                                                        {user.commissionSettings.personalCommissionRate}%
                                                    </span>
                                                    <Badge variant="warning" className="text-[9px] px-1.5 py-0 border-0 bg-amber-100 text-amber-700 font-black uppercase tracking-tighter">Custom</Badge>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 italic">Theo tier</span>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="text-sm font-black text-slate-800">
                                                    {formatCurrency(user.performance?.currentMonthSales || 0)}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                                                    Tăng 12%
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600 border border-slate-200">
                                                {user.performance?.currentMonthOrders || 0}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-violet-600 hover:text-white transition-all active:scale-90"
                                                    title="Cài đặt"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                <Link href={`/admin/commission/users/${user._id}`}>
                                                    <button
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                                                        title="Chi tiết"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>


            {/* Edit Modal */}
            {isEditModalOpen && selectedUser && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title={`Cài đặt hoa hồng - ${selectedUser.name}`}
                >
                    <div className="space-y-4">
                        {/* Current Stats */}
                        <div className="p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Doanh số tháng này</p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(selectedUser.performance?.currentMonthSales || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số đơn hàng</p>
                                <p className="text-lg font-bold">
                                    {selectedUser.performance?.currentMonthOrders || 0}
                                </p>
                            </div>
                        </div>

                        {/* Tier Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Cấp bậc</label>
                            <Select
                                value={editForm.tier}
                                onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                            >
                                {tiers.map((tier) => (
                                    <option key={tier.id} value={tier.name}>
                                        {tier.icon} {tier.displayName}
                                    </option>
                                ))}
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                Thay đổi thủ công cấp bậc (không theo KPI tự động)
                            </p>
                        </div>

                        {/* Personal Commission Rate */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                % Hoa hồng cá nhân (tùy chọn)
                            </label>
                            <Input
                                type="number"
                                value={editForm.personalCommissionRate}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, personalCommissionRate: e.target.value })
                                }
                                placeholder="Để trống nếu dùng theo tier"
                                min={0}
                                max={100}
                                step={0.5}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Để trống để sử dụng % theo cấp bậc
                            </p>
                        </div>

                        {/* Manager Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Quản lý trực tiếp
                            </label>
                            <Select
                                value={editForm.managerId}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, managerId: e.target.value })
                                }
                            >
                                <option value="">Không có</option>
                                {managers
                                    .filter((m) => m._id !== selectedUser._id)
                                    .map((manager) => (
                                        <option key={manager._id} value={manager._id}>
                                            {manager.name} ({manager.email})
                                        </option>
                                    ))}
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                Quản lý sẽ nhận hoa hồng team từ đơn hàng của user này
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <Button
                                onClick={saveCommissionSettings}
                                disabled={saving}
                                className="px-8 py-2.5 rounded-xl shadow-lg shadow-violet-200"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang lưu...
                                    </div>
                                ) : (
                                    'Lưu cài đặt'
                                )}
                            </Button>
                        </div>

                    </div>
                </Modal>
            )}
        </div>
    );
}
