'use client';

import { useState, useEffect } from 'react';
import { Settings, Percent, Tag, ShoppingBag, Calculator } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminAffiliateSettingsPage() {
    const [settings, setSettings] = useState<any>({
        defaultCommissionRate: 10,
        cookieDurationDays: 30,
        minWithdrawalAmount: 200000,
        commissionType: 'percent',
        agentDiscountEnabled: true,
        agentDiscountPercent: 10,
        bulkDiscountEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'commission' | 'agent' | 'bulk'>('commission');
    const toast = useToast();

    useEffect(() => {
        fetch('/api/admin/affiliate-settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setSettings((prev: any) => ({ 
                        ...prev, 
                        ...data,
                        defaultCommissionRate: data.defaultCommissionRate ?? prev.defaultCommissionRate,
                        cookieDurationDays: data.cookieDurationDays ?? prev.cookieDurationDays,
                        minWithdrawalAmount: data.minWithdrawalAmount ?? prev.minWithdrawalAmount,
                        commissionType: data.commissionType ?? prev.commissionType,
                        agentDiscountEnabled: data.agentDiscountEnabled ?? prev.agentDiscountEnabled,
                        agentDiscountPercent: data.agentDiscountPercent ?? prev.agentDiscountPercent,
                        bulkDiscountEnabled: data.bulkDiscountEnabled ?? prev.bulkDiscountEnabled
                    }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/affiliate-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('Lưu cài đặt thành công');
            } else {
                toast.error('Lỗi lưu cài đặt', 'Vui lòng thử lại.');
            }
        } catch {
            toast.error('Lỗi lưu cài đặt', 'Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-brand" />
                    Cài đặt Affiliate & Đại lý
                </h1>
                <p className="text-slate-500 mt-1">Quản lý hoa hồng, giá đại lý và giảm giá số lượng</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
                {[
                    { key: 'commission', label: 'Hoa hồng', icon: Percent },
                    { key: 'agent', label: 'Giá Đại lý', icon: Tag },
                    { key: 'bulk', label: 'Giảm số lượng', icon: ShoppingBag }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.key 
                                ? 'border-brand text-brand' 
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {activeTab === 'commission' && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Percent className="w-5 h-5 text-brand" />
                            <h2 className="text-lg font-semibold">Cài đặt Hoa hồng</h2>
                        </div>
                        
                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tỷ lệ hoa hồng mặc định (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                                    value={settings.defaultCommissionRate}
                                    onChange={e => setSettings((prev: any) => ({ ...prev, defaultCommissionRate: Number(e.target.value) }))}
                                />
                                <p className="text-xs text-slate-500 mt-1">Phần trăm hoa hồng đại lý/CTV nhận được khi khách mua hàng</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Thời gian lưu Cookie (ngày)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                                    value={settings.cookieDurationDays}
                                    onChange={e => setSettings((prev: any) => ({ ...prev, cookieDurationDays: Number(e.target.value) }))}
                                />
                                <p className="text-xs text-slate-500 mt-1">Thời gian cookie giới thiệu có hiệu lực (mặc định: 30 ngày)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Hạn mức rút tiền tối thiểu (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                                    value={settings.minWithdrawalAmount}
                                    onChange={e => setSettings((prev: any) => ({ ...prev, minWithdrawalAmount: Number(e.target.value) }))}
                                />
                                <p className="text-xs text-slate-500 mt-1">Số tiền tối thiểu để yêu cầu rút (mặc định: 200.000đ)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Loại hoa hồng
                                </label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                                    value={settings.commissionType}
                                    onChange={e => setSettings((prev: any) => ({ ...prev, commissionType: e.target.value }))}
                                >
                                    <option value="percent">Phần trăm (%)</option>
                                    <option value="fixed">Tiền cố định (VNĐ)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'agent' && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-brand" />
                            <h2 className="text-lg font-semibold">Cài đặt Giá Đại lý</h2>
                        </div>

                        <div className="bg-brand-light/10 border border-brand/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-slate-700">
                                <strong>Lưu ý:</strong> Giá đại lý được cấu hình trực tiếp trên từng sản phẩm. 
                                Cài đặt này chỉ kiểm soát việc có áp dụng giảm giá cho đại lý hay không.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-slate-900">Bật chế độ giá đại lý</h3>
                                    <p className="text-sm text-slate-500 mt-1">Cho phép đại lý được giảm giá khi mua hàng</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.agentDiscountEnabled}
                                        onChange={e => setSettings((prev: any) => ({ ...prev, agentDiscountEnabled: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tỷ lệ giảm giá cho Đại lý (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={!settings.agentDiscountEnabled}
                                    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${!settings.agentDiscountEnabled ? 'bg-slate-100 text-slate-400' : 'border-slate-300'}`}
                                    value={settings.agentDiscountPercent}
                                    onChange={e => setSettings((prev: any) => ({ ...prev, agentDiscountPercent: Number(e.target.value) }))}
                                />
                                <p className="text-xs text-slate-500 mt-1">Phần trăm giảm giá cho đại lý so với giá gốc (mặc định: 10%)</p>
                            </div>

                            {settings.agentDiscountEnabled && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                        <Calculator className="w-4 h-4" />
                                        Ví dụ tính giá
                                    </h4>
                                    <div className="text-sm text-green-700 space-y-1">
                                        <p>Giá gốc: <strong>100.000đ</strong></p>
                                        <p>Giảm giá đại lý: <strong>{settings.agentDiscountPercent}%</strong></p>
                                        <p className="font-medium">Giá đại lý: <strong>{(100000 * (1 - settings.agentDiscountPercent / 100)).toLocaleString('vi-VN')}đ</strong></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingBag className="w-5 h-5 text-brand" />
                            <h2 className="text-lg font-semibold">Cài đặt Giảm giá Số lượng</h2>
                        </div>

                        <div className="bg-brand-light/10 border border-brand/20 rounded-lg p-4 mb-4">
                            <p className="text-sm text-slate-700">
                                <strong>Lưu ý:</strong> Giảm giá theo số lượng được cấu hình trực tiếp trên từng sản phẩm. 
                                Cài đặt này chỉ kiểm soát việc có áp dụng tính năng này hay không.
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-slate-900">Bật chế độ giảm giá số lượng</h3>
                                    <p className="text-sm text-slate-500 mt-1">Cho phép giảm giá khi mua số lượng lớn</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.bulkDiscountEnabled}
                                        onChange={e => setSettings((prev: any) => ({ ...prev, bulkDiscountEnabled: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Cách hoạt động
                                </h4>
                                <div className="text-sm text-green-700 space-y-2">
                                    <p>Với mỗi sản phẩm, Admin có thể cấu hình các mức giảm giá theo số lượng:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Min Quantity: Số lượng tối thiểu để được giảm giá</li>
                                        <li>Discount Percent: Phần trăm giảm giá áp dụng</li>
                                    </ul>
                                    <p className="mt-2">Khi khách mua đủ số lượng, giá sẽ tự động được giảm theo mức cao nhất phù hợp.</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 mb-2">Ví dụ cấu hình sản phẩm:</h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p>• Mức 1: Mua ≥ 10 sản phẩm → Giảm 5%</p>
                                    <p>• Mức 2: Mua ≥ 50 sản phẩm → Giảm 10%</p>
                                    <p>• Mức 3: Mua ≥ 100 sản phẩm → Giảm 15%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-brand text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-dark disabled:bg-slate-400 transition-colors flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang lưu...
                            </>
                        ) : (
                            'Lưu cài đặt'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
