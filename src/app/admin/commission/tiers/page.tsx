'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Badge, Card, Modal, Table } from '@/components/admin/ui';
import {
    Trophy,
    Shield,
    Gem,
    Crown,
    Star,
    Users,
    TrendingUp,
    Plus,
    Trash2,
    Edit2,
    CheckCircle2,
    XCircle,
    Info,
    ChevronRight,
    Zap,
    Gift,
    Target
} from 'lucide-react';


interface CommissionTier {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    color: string;
    icon?: string;
    requirements: {
        minMonthlySales?: number;
        minMonthlyOrders?: number;
        minTeamSize?: number;
        minTeamSales?: number;
        consecutiveMonths?: number;
    };
    commissionRates: {
        directSale: number;
        teamSaleL1: number;
        teamSaleL2?: number;
    };
    benefits: {
        bonusPerOrder?: number;
        monthlyBonus?: number;
        freeShipping?: boolean;
        prioritySupport?: boolean;
        discountPercent?: number;
    };
    order: number;
    isActive: boolean;
    isDefault?: boolean;
}

export default function CommissionTiersPage() {
    const [tiers, setTiers] = useState<CommissionTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const res = await fetch('/api/admin/commission/tiers');
            const data = await res.json();
            if (data.success) {
                setTiers(data.data);
            }
        } catch (error) {
            console.error('Error fetching tiers:', error);
        } finally {
            setLoading(false);
        }
    };

    const seedDefaultTiers = async () => {
        if (!confirm('Bạn có chắc muốn tạo các cấp bậc mặc định?')) return;

        try {
            const res = await fetch('/api/admin/commission/tiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seedDefaults: true })
            });
            const data = await res.json();
            if (data.success) {
                fetchTiers();
                alert('Đã tạo cấp bậc mặc định thành công!');
            } else {
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error seeding tiers:', error);
        }
    };

    const saveTier = async () => {
        if (!editingTier) return;
        setSaving(true);

        try {
            const method = editingTier.id ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/commission/tiers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTier)
            });
            const data = await res.json();
            if (data.success) {
                fetchTiers();
                setIsModalOpen(false);
                setEditingTier(null);
            } else {
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving tier:', error);
        } finally {
            setSaving(false);
        }
    };

    const deleteTier = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa cấp bậc này?')) return;

        try {
            const res = await fetch(`/api/admin/commission/tiers?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                fetchTiers();
            } else {
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error deleting tier:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const openEditModal = (tier?: CommissionTier) => {
        setEditingTier(
            tier || {
                id: '',
                name: 'custom',
                displayName: '',
                description: '',
                color: '#9C7043',
                icon: '⭐',
                requirements: {
                    minMonthlySales: 0,
                    minMonthlyOrders: 0,
                    minTeamSize: 0,
                    minTeamSales: 0,
                    consecutiveMonths: 1
                },
                commissionRates: {
                    directSale: 5,
                    teamSaleL1: 0,
                    teamSaleL2: 0
                },
                benefits: {
                    bonusPerOrder: 0,
                    monthlyBonus: 0,
                    freeShipping: false,
                    prioritySupport: false,
                    discountPercent: 0
                },
                order: tiers.length + 1,
                isActive: true,
                isDefault: false
            }
        );
        setIsModalOpen(true);
    };

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Cấp bậc Hoa hồng</h1>
                    <p className="text-gray-500 mt-1">
                        Thiết lập các cấp bậc và tỷ lệ hoa hồng cho CTV
                    </p>
                </div>
                <div className="flex gap-3">
                    {tiers.length === 0 && (
                        <Button onClick={seedDefaultTiers} variant="secondary">
                            🌱 Tạo cấp bậc mặc định
                        </Button>
                    )}
                    <Button onClick={() => openEditModal()}>+ Thêm cấp bậc</Button>
                </div>
            </div>

            {/* Tiers Grid */}
            {tiers.length === 0 ? (
                <Card className="p-16 text-center bg-white/50 backdrop-blur-md border-dashed border-2 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="w-10 h-10 text-violet-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Chưa có cấp bậc nào</h3>
                    <p className="text-slate-500 mb-8 max-w-sm">
                        Bấm "Tạo cấp bậc mặc định" để khởi tạo hệ thống hoa hồng chuyên nghiệp cho cộng tác viên của bạn.
                    </p>
                    <Button onClick={seedDefaultTiers} size="lg" className="px-8 py-6 rounded-xl shadow-lg shadow-violet-200">
                        🌱 Tạo cấp bậc mặc định
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.id}
                            className="group p-0 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-200 hover:-translate-y-1 border-t-4 bg-white/80 backdrop-blur-md"
                            style={{ borderTopColor: tier.color }}
                        >
                            {/* Card Content Decoration */}
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full opacity-5 transition-all group-hover:opacity-10"
                                style={{ backgroundColor: tier.color }} />

                            <div className="p-6">
                                {/* Tier Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: `${tier.color}15`, color: tier.color }}>
                                            {tier.icon && tier.icon.length > 2 ?
                                                <Star className="w-6 h-6" /> :
                                                <span className="font-bold">{tier.icon || '🏆'}</span>
                                            }
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                {tier.displayName}
                                                {tier.isDefault && (
                                                    <Badge variant="default" className="bg-slate-100 text-slate-500 text-[10px] font-medium border-0 px-2 py-0">
                                                        Mặc định
                                                    </Badge>
                                                )}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                Order: #{tier.order}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={tier.isActive ? 'success' : 'default'} className="rounded-lg px-2 shadow-none border-0">
                                        <div className="flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tier.isActive ? 'animate-pulse bg-current' : 'bg-current'}`} />
                                            {tier.isActive ? 'Hoạt động' : 'Đang ẩn'}
                                        </div>
                                    </Badge>
                                </div>

                                {/* Commission Stats */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-emerald-500" /> Trực tiếp
                                            </span>
                                            <span className="text-sm font-bold text-emerald-600">
                                                {tier.commissionRates.directSale}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(tier.commissionRates.directSale * 4, 100)}%` }} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-2.5 rounded-xl bg-violet-50/50 border border-violet-100 transition-colors group-hover:bg-violet-50">
                                            <span className="block text-[10px] text-violet-500 font-bold mb-0.5 uppercase tracking-tighter">Team L1</span>
                                            <span className="text-base font-black text-violet-700">{tier.commissionRates.teamSaleL1}%</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 transition-colors group-hover:bg-blue-50">
                                            <span className="block text-[10px] text-blue-500 font-bold mb-0.5 uppercase tracking-tighter">Team L2</span>
                                            <span className="text-base font-black text-blue-700">{tier.commissionRates.teamSaleL2 || 0}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements List */}
                                <div className="space-y-3 pt-6 border-t border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Điều kiện duy trì
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center justify-between group/item">
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <TrendingUp className="w-3 h-3 text-slate-300 transition-colors group-hover/item:text-orange-500" /> Doanh số
                                            </span>
                                            <span className="text-xs font-bold text-slate-700">
                                                {formatCurrency(tier.requirements.minMonthlySales || 0)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between group/item">
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <Users className="w-3 h-3 text-slate-300 transition-colors group-hover/item:text-blue-500" /> Thành viên
                                            </span>
                                            <span className="text-xs font-bold text-slate-700">
                                                {tier.requirements.minTeamSize || 0} người
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2 mt-6">
                                    <button
                                        onClick={() => openEditModal(tier)}
                                        className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-violet-600 active:scale-95 shadow-lg shadow-slate-200"
                                    >
                                        <Edit2 className="w-3 h-3" /> Chỉnh sửa
                                    </button>
                                    {!tier.isDefault && (
                                        <button
                                            onClick={() => deleteTier(tier.id)}
                                            className="w-10 h-10 rounded-xl border border-slate-200 text-slate-400 flex items-center justify-center transition-all hover:border-red-200 hover:text-red-500 hover:bg-red-50 active:scale-95"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Add New Tier Bento Card */}
                    <div
                        onClick={() => openEditModal()}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30 transition-all hover:border-violet-300 hover:bg-violet-50/30 cursor-pointer h-full min-h-[400px]"
                    >
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:shadow-md group-hover:bg-violet-600 group-hover:text-white text-slate-400">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-violet-600">Thêm cấp bậc mới</span>
                        <p className="text-xs text-slate-400 mt-2 text-center px-4">Tạo thêm các mốc hoa hồng hấp dẫn cho CTV</p>
                    </div>
                </div>
            )}


            {/* Edit Modal */}
            {isModalOpen && editingTier && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingTier.id ? 'Chỉnh sửa cấp bậc' : 'Thêm cấp bậc mới'}
                    size="lg"
                >
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên hiển thị *</label>
                                <Input
                                    value={editingTier.displayName}
                                    onChange={(e) =>
                                        setEditingTier({ ...editingTier, displayName: e.target.value })
                                    }
                                    placeholder="VD: Vàng"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Icon</label>
                                <Input
                                    value={editingTier.icon || ''}
                                    onChange={(e) =>
                                        setEditingTier({ ...editingTier, icon: e.target.value })
                                    }
                                    placeholder="🥇"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Màu sắc</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={editingTier.color}
                                        onChange={(e) =>
                                            setEditingTier({ ...editingTier, color: e.target.value })
                                        }
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <Input
                                        value={editingTier.color}
                                        onChange={(e) =>
                                            setEditingTier({ ...editingTier, color: e.target.value })
                                        }
                                        placeholder="#FFD700"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Thứ tự</label>
                                <Input
                                    type="number"
                                    value={editingTier.order}
                                    onChange={(e) =>
                                        setEditingTier({ ...editingTier, order: parseInt(e.target.value) })
                                    }
                                    min={1}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Mô tả</label>
                            <Input
                                value={editingTier.description || ''}
                                onChange={(e) =>
                                    setEditingTier({ ...editingTier, description: e.target.value })
                                }
                                placeholder="Mô tả về cấp bậc này"
                            />
                        </div>

                        {/* Commission Rates */}
                        <div>
                            <h4 className="font-semibold mb-3 text-green-600">💰 Tỷ lệ hoa hồng (%)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Trực tiếp</label>
                                    <Input
                                        type="number"
                                        value={editingTier.commissionRates.directSale}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                commissionRates: {
                                                    ...editingTier.commissionRates,
                                                    directSale: parseFloat(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        max={100}
                                        step={0.5}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Team L1</label>
                                    <Input
                                        type="number"
                                        value={editingTier.commissionRates.teamSaleL1}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                commissionRates: {
                                                    ...editingTier.commissionRates,
                                                    teamSaleL1: parseFloat(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        max={100}
                                        step={0.5}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Team L2</label>
                                    <Input
                                        type="number"
                                        value={editingTier.commissionRates.teamSaleL2 || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                commissionRates: {
                                                    ...editingTier.commissionRates,
                                                    teamSaleL2: parseFloat(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        max={100}
                                        step={0.5}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div>
                            <h4 className="font-semibold mb-3 text-blue-600">📊 Yêu cầu để đạt cấp bậc</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Doanh số tháng tối thiểu (VNĐ)
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingTier.requirements.minMonthlySales || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                requirements: {
                                                    ...editingTier.requirements,
                                                    minMonthlySales: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        step={1000000}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Số đơn hàng tối thiểu/tháng
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingTier.requirements.minMonthlyOrders || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                requirements: {
                                                    ...editingTier.requirements,
                                                    minMonthlyOrders: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Số lượng CTV tối thiểu
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingTier.requirements.minTeamSize || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                requirements: {
                                                    ...editingTier.requirements,
                                                    minTeamSize: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Doanh số team tối thiểu (VNĐ)
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingTier.requirements.minTeamSales || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                requirements: {
                                                    ...editingTier.requirements,
                                                    minTeamSales: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        step={1000000}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div>
                            <h4 className="font-semibold mb-3 text-purple-600">🎁 Quyền lợi</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Thưởng mỗi đơn (VNĐ)
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingTier.benefits.bonusPerOrder || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                benefits: {
                                                    ...editingTier.benefits,
                                                    bonusPerOrder: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        step={1000}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Thưởng hàng tháng (VNĐ)
                                    </label>
                                    <Input
                                        type="number"
                                        value={editingTier.benefits.monthlyBonus || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                benefits: {
                                                    ...editingTier.benefits,
                                                    monthlyBonus: parseInt(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        step={100000}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Giảm giá sản phẩm (%)</label>
                                    <Input
                                        type="number"
                                        value={editingTier.benefits.discountPercent || 0}
                                        onChange={(e) =>
                                            setEditingTier({
                                                ...editingTier,
                                                benefits: {
                                                    ...editingTier.benefits,
                                                    discountPercent: parseFloat(e.target.value)
                                                }
                                            })
                                        }
                                        min={0}
                                        max={100}
                                    />
                                </div>
                                <div className="flex items-center gap-4 pt-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editingTier.benefits.freeShipping || false}
                                            onChange={(e) =>
                                                setEditingTier({
                                                    ...editingTier,
                                                    benefits: {
                                                        ...editingTier.benefits,
                                                        freeShipping: e.target.checked
                                                    }
                                                })
                                            }
                                        />
                                        <span className="text-sm">Miễn phí ship</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={editingTier.benefits.prioritySupport || false}
                                            onChange={(e) =>
                                                setEditingTier({
                                                    ...editingTier,
                                                    benefits: {
                                                        ...editingTier.benefits,
                                                        prioritySupport: e.target.checked
                                                    }
                                                })
                                            }
                                        />
                                        <span className="text-sm">Hỗ trợ ưu tiên</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={editingTier.isActive}
                                onChange={(e) =>
                                    setEditingTier({ ...editingTier, isActive: e.target.checked })
                                }
                            />
                            <span className="text-sm font-medium">Kích hoạt cấp bậc này</span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <Button
                                onClick={saveTier}
                                disabled={saving}
                                className="px-8 py-2.5 rounded-xl shadow-lg shadow-violet-200"
                            >
                                {saving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang lưu...
                                    </div>
                                ) : (
                                    'Lưu cấp bậc'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
