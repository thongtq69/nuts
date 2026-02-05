'use client';

import React, { useState, useEffect } from 'react';
import {
    Save, Plus, Trash2, MapPin, Scale, Info,
    ArrowRight, Truck, Globe, Settings, ChevronRight,
    Search, AlertCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface WeightTier {
    name: string;
    minWeight: number;
    maxWeight: number;
    basePrice: number;
    extraPricePerKg: number;
    isDirectMultiplier: boolean;
}

interface ShippingZone {
    _id?: string;
    name: string;
    provinceNames: string[];
    tiers: WeightTier[];
}

interface ShippingConfig {
    originCity: string;
    fuelSurchargePercent: number;
    vatPercent: number;
    zones: ShippingZone[];
}

export default function ShippingAdminPage() {
    const toast = useToast();
    const [config, setConfig] = useState<ShippingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeZoneIndex, setActiveZoneIndex] = useState(0);

    // List of VN Provinces (Mock for selection - should be from API in real world)
    const allProvinces = [
        "Thành phố Hà Nội", "Thành phố Hồ Chí Minh", "Thành phố Đà Nẵng",
        "Thành phố Hải Phòng", "Thành phố Cần Thơ", "Tỉnh Hà Giang", "Tỉnh Cao Bằng",
        "Tỉnh Bắc Kạn", "Tỉnh Tuyên Quang", "Tỉnh Lào Cai", "Tỉnh Điện Biên",
        "Tỉnh Lai Châu", "Tỉnh Sơn La", "Tỉnh Yên Bái", "Tỉnh Hoà Bình",
        "Tỉnh Thái Nguyên", "Tỉnh Lạng Sơn", "Tỉnh Quảng Ninh", "Tỉnh Bắc Giang",
        "Tỉnh Phú Thọ", "Tỉnh Vĩnh Phúc", "Tỉnh Bắc Ninh", "Tỉnh Hải Dương",
        "Tỉnh Hưng Yên", "Tỉnh Thái Bình", "Tỉnh Hà Nam", "Tỉnh Nam Định",
        "Tỉnh Ninh Bình", "Tỉnh Thanh Hoá", "Tỉnh Nghệ An", "Tỉnh Hà Tĩnh",
        "Tỉnh Quảng Bình", "Tỉnh Quảng Trị", "Tỉnh Thừa Thiên Huế", "Tỉnh Quảng Nam",
        "Tỉnh Quảng Ngãi", "Tỉnh Bình Định", "Tỉnh Phú Yên", "Tỉnh Khánh Hoà",
        "Tỉnh Ninh Thuận", "Tỉnh Bình Thuận", "Tỉnh Kon Tum", "Tỉnh Gia Lai",
        "Tỉnh Đắk Lắk", "Tỉnh Đắk Nông", "Tỉnh Lâm Đồng", "Tỉnh Bình Phước",
        "Tỉnh Tây Ninh", "Tỉnh Bình Dương", "Tỉnh Đồng Nai", "Tỉnh Bà Rịa - Vũng Tàu",
        "Tỉnh Long An", "Tỉnh Tiền Giang", "Tỉnh Bến Tre", "Tỉnh Trà Vinh",
        "Tỉnh Vĩnh Long", "Tỉnh Đồng Tháp", "Tỉnh An Giang", "Tỉnh Kiên Giang",
        "Tỉnh Hậu Giang", "Tỉnh Sóc Trăng", "Tỉnh Bạc Liêu", "Tỉnh Cà Mau"
    ];

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/shipping');
            const data = await res.json();
            setConfig(data);
        } catch (error) {
            toast.error('Lỗi', 'Không thể tải cấu hình vận chuyển');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                toast.success('Thành công', 'Đã lưu cấu hình vận chuyển!');
            } else {
                toast.error('Lỗi', 'Có lỗi xảy ra khi lưu');
            }
        } catch (error) {
            toast.error('Lỗi', 'Lỗi kết nối máy chủ');
        } finally {
            setSaving(false);
        }
    };

    const addZone = () => {
        if (!config) return;
        const newZone: ShippingZone = {
            name: 'Vùng mới',
            provinceNames: [],
            tiers: [
                { name: 'Đến 2kg', minWeight: 0, maxWeight: 2, basePrice: 20000, extraPricePerKg: 0, isDirectMultiplier: false }
            ]
        };
        const newConfig = { ...config, zones: [...config.zones, newZone] };
        setConfig(newConfig);
        setActiveZoneIndex(newConfig.zones.length - 1);
    };

    const removeZone = (index: number) => {
        if (!config) return;
        const newZones = config.zones.filter((_, i) => i !== index);
        setConfig({ ...config, zones: newZones });
        if (activeZoneIndex >= newZones.length) setActiveZoneIndex(Math.max(0, newZones.length - 1));
    };

    const addTier = (zoneIndex: number) => {
        if (!config) return;
        const lastTier = config.zones[zoneIndex].tiers[config.zones[zoneIndex].tiers.length - 1];
        const newTier: WeightTier = {
            name: 'Tier mới',
            minWeight: lastTier?.maxWeight || 0,
            maxWeight: (lastTier?.maxWeight || 0) + 10,
            basePrice: lastTier?.basePrice || 0,
            extraPricePerKg: 0,
            isDirectMultiplier: false
        };
        const newZones = [...config.zones];
        newZones[zoneIndex].tiers.push(newTier);
        setConfig({ ...config, zones: newZones });
    };

    const removeTier = (zoneIndex: number, tierIndex: number) => {
        if (!config) return;
        const newZones = [...config.zones];
        newZones[zoneIndex].tiers = newZones[zoneIndex].tiers.filter((_, i) => i !== tierIndex);
        setConfig({ ...config, zones: newZones });
    };

    const updateTier = (zoneIndex: number, tierIndex: number, field: keyof WeightTier, value: any) => {
        if (!config) return;
        const newZones = [...config.zones];
        (newZones[zoneIndex].tiers[tierIndex] as any)[field] = value;
        setConfig({ ...config, zones: newZones });
    };

    const toggleProvince = (province: string) => {
        if (!config) return;
        const newZones = [...config.zones];
        const zone = newZones[activeZoneIndex];
        if (zone.provinceNames.includes(province)) {
            zone.provinceNames = zone.provinceNames.filter(p => p !== province);
        } else {
            // Remove from other zones first to avoid duplication
            newZones.forEach((z, idx) => {
                if (idx !== activeZoneIndex) {
                    z.provinceNames = z.provinceNames.filter(p => p !== province);
                }
            });
            zone.provinceNames.push(province);
        }
        setConfig({ ...config, zones: newZones });
    };

    if (loading) return <div className="p-8 text-center">Đang tải cấu hình vận chuyển...</div>;

    return (
        <div className="admin-container pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Cấu hình Vận chuyển</h1>
                    <p className="text-slate-500">Quản lý vùng miền và phí ship theo khối lượng</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-brand/20"
                    disabled={saving}
                >
                    <Save size={20} />
                    {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Settings & Zones List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Settings size={16} /> Cài đặt chung
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 block mb-1">Gửi từ</label>
                                <input
                                    type="text"
                                    value={config?.originCity}
                                    onChange={e => config && setConfig({ ...config, originCity: e.target.value })}
                                    className="admin-input"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-1">Phụ phí xăng (%)</label>
                                    <input
                                        type="number"
                                        value={config?.fuelSurchargePercent}
                                        onChange={e => config && setConfig({ ...config, fuelSurchargePercent: Number(e.target.value) })}
                                        className="admin-input"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-1">VAT (%)</label>
                                    <input
                                        type="number"
                                        value={config?.vatPercent}
                                        onChange={e => config && setConfig({ ...config, vatPercent: Number(e.target.value) })}
                                        className="admin-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Truck size={16} /> Các vùng nhận
                            </h3>
                            <button onClick={addZone} className="p-1 hover:bg-brand/10 text-brand rounded-full transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {config?.zones.map((zone, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveZoneIndex(idx)}
                                    className={`
                                        p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group
                                        ${activeZoneIndex === idx
                                            ? 'bg-brand text-white shadow-md shadow-brand/20'
                                            : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'}
                                    `}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <MapPin size={16} className={activeZoneIndex === idx ? 'text-white/70' : 'text-slate-400'} />
                                        <span className="truncate font-medium">{zone.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeZone(idx); }}
                                        className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 hover:text-white rounded transition-all
                                            ${activeZoneIndex === idx ? 'text-white/50' : 'text-slate-400'}`}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Zone Details */}
                <div className="lg:col-span-3 space-y-8">
                    {config && config.zones[activeZoneIndex] ? (
                        <>
                            <div className="glass-card p-8">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={config.zones[activeZoneIndex].name}
                                            onChange={e => {
                                                const newZones = [...config.zones];
                                                newZones[activeZoneIndex].name = e.target.value;
                                                setConfig({ ...config, zones: newZones });
                                            }}
                                            className="text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-brand transition-all w-full outline-none py-1"
                                        />
                                        <p className="text-slate-500 text-sm mt-1">Cấu hình chi phí cho khu vực này</p>
                                    </div>
                                </div>

                                {/* Weight Tiers Table */}
                                <div className="mb-10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                            <Scale size={18} className="text-brand" /> Bảng giá theo khối lượng
                                        </h4>
                                        <button
                                            onClick={() => addTier(activeZoneIndex)}
                                            className="text-sm font-medium text-brand hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Thêm Tier mới
                                        </button>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 bg-slate-100/50">
                                                    <th className="px-6 py-4">Tên Tier</th>
                                                    <th className="px-6 py-4">Mốc (kg)</th>
                                                    <th className="px-6 py-4">Giá cơ bản (VNĐ)</th>
                                                    <th className="px-6 py-4">Giá mỗi kg vượt (VNĐ)</th>
                                                    <th className="px-6 py-4 w-20">Xóa</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {config.zones[activeZoneIndex].tiers.map((tier, tidx) => (
                                                    <tr key={tidx} className="hover:bg-white transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text" value={tier.name}
                                                                onChange={e => updateTier(activeZoneIndex, tidx, 'name', e.target.value)}
                                                                className="bg-transparent font-medium text-slate-700 w-full outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                <input
                                                                    type="number" value={tier.minWeight}
                                                                    onChange={e => updateTier(activeZoneIndex, tidx, 'minWeight', Number(e.target.value))}
                                                                    className="w-16 bg-white border rounded px-2 py-1 outline-brand"
                                                                />
                                                                <span>-</span>
                                                                <input
                                                                    type="number" value={tier.maxWeight}
                                                                    onChange={e => updateTier(activeZoneIndex, tidx, 'maxWeight', Number(e.target.value))}
                                                                    className="w-16 bg-white border rounded px-2 py-1 outline-brand"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number" value={tier.basePrice}
                                                                onChange={e => updateTier(activeZoneIndex, tidx, 'basePrice', Number(e.target.value))}
                                                                className="w-32 bg-white border rounded px-2 py-1 outline-brand font-mono font-semibold text-brand"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <input
                                                                    type="number" value={tier.extraPricePerKg}
                                                                    onChange={e => updateTier(activeZoneIndex, tidx, 'extraPricePerKg', Number(e.target.value))}
                                                                    className="w-32 bg-white border rounded px-2 py-1 outline-brand font-mono"
                                                                />
                                                                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={tier.isDirectMultiplier}
                                                                        onChange={e => updateTier(activeZoneIndex, tidx, 'isDirectMultiplier', e.target.checked)}
                                                                    />
                                                                    Nhân trực tiếp tổng khối lượng
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => removeTier(activeZoneIndex, tidx)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-50 rounded-xl flex gap-3 text-xs text-blue-700 border border-blue-100">
                                        <Info size={16} className="shrink-0" />
                                        <div>
                                            <p className="font-semibold mb-1">Hướng dẫn công thức:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Thông thường: Phí = Giá cơ bản + (Khối lượng thực - Khối lượng tối thiểu của tier) × Giá mỗi kg vượt.</li>
                                                <li>Nhân trực tiếp: Phí = Khối lượng thực × Giá mỗi kg vượt (Dùng cho hàng cực nặng {'>'}500kg).</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Province Selection */}
                                <div>
                                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
                                        <Globe size={18} className="text-brand" /> Các Tỉnh/Thành phố thuộc vùng này
                                    </h4>
                                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto">
                                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {allProvinces.sort().map((province) => {
                                                const isSelected = config.zones[activeZoneIndex].provinceNames.includes(province);
                                                const isUsedElsewhere = config.zones.some((z, idx) => idx !== activeZoneIndex && z.provinceNames.includes(province));

                                                return (
                                                    <button
                                                        key={province}
                                                        onClick={() => toggleProvince(province)}
                                                        className={`
                                                            text-xs p-3 rounded-xl border text-left transition-all relative overflow-hidden group
                                                            ${isSelected
                                                                ? 'bg-brand/10 border-brand text-brand font-semibold ring-1 ring-brand/50'
                                                                : isUsedElsewhere
                                                                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand/50 hover:bg-slate-50'}
                                                        `}
                                                        disabled={isUsedElsewhere}
                                                    >
                                                        {province}
                                                        {isUsedElsewhere && (
                                                            <div className="absolute top-1 right-1">
                                                                <AlertCircle size={10} className="text-slate-300" />
                                                            </div>
                                                        )}
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 bg-brand text-white p-0.5 rounded-bl-lg">
                                                                <ArrowRight size={8} />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card p-12 text-center text-slate-400">
                            <Truck size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Chọn một vùng ở bên trái hoặc thêm vùng mới để bắt đầu cấu hình</p>
                            <button
                                onClick={addZone}
                                className="mt-4 text-brand font-medium hover:underline flex items-center gap-1 mx-auto"
                            >
                                <Plus size={16} /> Thêm vùng ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 24px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
                }
                .admin-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    color: #1e293b;
                    transition: all 0.2s;
                    outline: none;
                }
                .admin-input:focus {
                    border-color: #9C7043;
                    box-shadow: 0 0 0 3px rgba(156, 112, 67, 0.1);
                }
                .btn-primary {
                    background: #9C7043;
                    color: white;
                    transition: all 0.3s;
                }
                .btn-primary:hover {
                    background: #845d36;
                    transform: translateY(-2px);
                }
                .btn-primary:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}
