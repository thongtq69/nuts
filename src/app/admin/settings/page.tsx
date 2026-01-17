'use client';

import { useState, useEffect } from 'react';
import { 
    Settings, 
    Phone, 
    Mail, 
    MapPin, 
    Facebook, 
    Instagram, 
    Youtube,
    Save,
    Loader2,
    Globe,
    Megaphone,
    Truck,
    Users
} from 'lucide-react';

interface SiteSettings {
    hotline: string;
    zaloLink: string;
    email: string;
    address: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    promoText: string;
    promoEnabled: boolean;
    agentRegistrationUrl: string;
    ctvRegistrationUrl: string;
    freeShippingThreshold: number;
    logoUrl: string;
    siteName: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({
        hotline: '',
        zaloLink: '',
        email: '',
        address: '',
        facebookUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        tiktokUrl: '',
        promoText: '',
        promoEnabled: true,
        agentRegistrationUrl: '',
        ctvRegistrationUrl: '',
        freeShippingThreshold: 500000,
        logoUrl: '',
        siteName: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            
            if (res.ok) {
                alert('Đã lưu cài đặt thành công!');
            } else {
                alert('Lỗi khi lưu cài đặt');
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Settings className="text-amber-600" />
                        Cài đặt Website
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý thông tin liên hệ, mạng xã hội và các cài đặt khác</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu cài đặt
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Phone className="text-amber-600" size={20} />
                        Thông tin liên hệ
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hotline</label>
                            <input
                                type="text"
                                value={settings.hotline}
                                onChange={e => setSettings({ ...settings, hotline: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="090xxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link Zalo</label>
                            <input
                                type="text"
                                value={settings.zaloLink}
                                onChange={e => setSettings({ ...settings, zaloLink: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="https://zalo.me/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="contact@gonuts.vn"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                            <textarea
                                value={settings.address}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                rows={2}
                                placeholder="Địa chỉ cửa hàng..."
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Globe className="text-amber-600" size={20} />
                        Mạng xã hội
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Facebook size={16} className="text-blue-600" /> Facebook
                            </label>
                            <input
                                type="text"
                                value={settings.facebookUrl}
                                onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Instagram size={16} className="text-pink-600" /> Instagram
                            </label>
                            <input
                                type="text"
                                value={settings.instagramUrl}
                                onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Youtube size={16} className="text-red-600" /> YouTube
                            </label>
                            <input
                                type="text"
                                value={settings.youtubeUrl}
                                onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TikTok</label>
                            <input
                                type="text"
                                value={settings.tiktokUrl}
                                onChange={e => setSettings({ ...settings, tiktokUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="https://tiktok.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Megaphone className="text-amber-600" size={20} />
                        Banner khuyến mãi
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="promoEnabled"
                                checked={settings.promoEnabled}
                                onChange={e => setSettings({ ...settings, promoEnabled: e.target.checked })}
                                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <label htmlFor="promoEnabled" className="text-sm font-medium text-slate-700">
                                Hiển thị banner khuyến mãi
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung banner</label>
                            <input
                                type="text"
                                value={settings.promoText}
                                onChange={e => setSettings({ ...settings, promoText: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Giảm giá 8% khi mua hàng từ 899 trở lên..."
                            />
                        </div>
                    </div>
                </div>

                {/* Agent/CTV */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="text-amber-600" size={20} />
                        Đại lý / Cộng tác viên
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link đăng ký Đại lý</label>
                            <input
                                type="text"
                                value={settings.agentRegistrationUrl}
                                onChange={e => setSettings({ ...settings, agentRegistrationUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="/agent/register"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link đăng ký CTV</label>
                            <input
                                type="text"
                                value={settings.ctvRegistrationUrl}
                                onChange={e => setSettings({ ...settings, ctvRegistrationUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="/agent/register"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Truck className="text-amber-600" size={20} />
                        Vận chuyển
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Miễn phí vận chuyển cho đơn từ (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={settings.freeShippingThreshold}
                                onChange={e => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="500000"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Hiện tại: Miễn phí ship cho đơn từ {settings.freeShippingThreshold.toLocaleString()}đ
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
