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
    Users,
    Shield,
    RefreshCw,
    Package,
    ImageIcon
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ProductFeature {
    title: string;
    description: string;
    icon: 'truck' | 'refresh' | 'shield';
    enabled: boolean;
}

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
    businessLicense: string;
    workingHours: string;
    productFeatures: ProductFeature[];
    supportHotline: string;
    productsBannerUrl: string;
    productsBannerEnabled: boolean;
    homePromoBannerUrl: string;
    homePromoBannerTitle: string;
    homePromoBannerButtonText: string;
    homePromoBannerButtonLink: string;
    homePromoBannerNote: string;
    homePromoBannerEnabled: boolean;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({
        hotline: '096 118 5753',
        zaloLink: 'https://zalo.me/...',
        email: 'contact.gonuts@gmail.com',
        address: 'Tầng 4, VT1-B09, Khu đô thị mới An Hưng, Phường Dương Nội, Thành phố Hà Nội, Việt Nam',
        facebookUrl: 'https://www.facebook.com/profile.php?id=61572944004088',
        instagramUrl: 'https://instagram.com/...',
        youtubeUrl: 'https://youtube.com/...',
        tiktokUrl: 'https://tiktok.com/...',
        promoText: 'Giảm giá 8% khi mua hàng từ 899k trở lên với mã "SAVER8"',
        promoEnabled: true,
        agentRegistrationUrl: '/agent/register',
        ctvRegistrationUrl: '/agent/register',
        freeShippingThreshold: 2000000,
        logoUrl: '/assets/logo.png',
        siteName: 'Go Nuts Vietnam',
        businessLicense: '0123xxxxxx',
        workingHours: 'Thứ 2 - Thứ 7: 8:00 - 17:30',
        productFeatures: [
            { title: 'Giao hàng toàn quốc', description: 'Miễn phí đơn từ 500.000đ', icon: 'truck', enabled: true },
            { title: 'Đổi trả trong 7 ngày', description: 'Nếu sản phẩm lỗi từ nhà sản xuất', icon: 'refresh', enabled: true },
            { title: 'Đảm bảo chất lượng', description: 'Sản phẩm chính hãng 100%', icon: 'shield', enabled: true }
        ],
        supportHotline: '096 118 5753',
        productsBannerUrl: '/assets/images/gonuts-banner-member.png',
        productsBannerEnabled: true,
        homePromoBannerUrl: '/assets/images/gonuts-banner-member.png',
        homePromoBannerTitle: "TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN",
        homePromoBannerButtonText: 'ĐĂNG KÝ NGAY',
        homePromoBannerButtonLink: '/register',
        homePromoBannerNote: '*Áp dụng cho đơn hàng từ 300.000đ',
        homePromoBannerEnabled: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [bannerType, setBannerType] = useState<'products' | 'homePromo'>('products');
    const toast = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
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
                toast.success('Đã lưu cài đặt thành công');
            } else {
                toast.error('Lỗi khi lưu cài đặt', 'Vui lòng thử lại.');
            }
        } catch (error) {
            toast.error('Lỗi kết nối', 'Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    // Handle file upload for banners
    const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'homePromo') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBannerType(type);
        setUploadingBanner(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'gonuts/banners');
            formData.append('type', 'products_banner');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                const newUrl = result.data.url;
                setSettings(prev => ({
                    ...prev,
                    [type === 'products' ? 'productsBannerUrl' : 'homePromoBannerUrl']: newUrl
                }));
                toast.success('Upload ảnh thành công');
            } else {
                toast.error('Upload thất bại', result.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error uploading banner:', error);
            toast.error('Lỗi khi upload ảnh', 'Vui lòng thử lại.');
        } finally {
            setUploadingBanner(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Settings className="text-brand" />
                        Cài đặt Website
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý thông tin liên hệ, mạng xã hội và các cài đặt khác</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || uploadingBanner}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand-dark text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu cài đặt
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Phone className="text-brand" size={20} />
                        Thông tin liên hệ
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hotline</label>
                            <input
                                type="text"
                                value={settings.hotline}
                                onChange={e => setSettings(prev => ({ ...prev, hotline: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="090xxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link Zalo</label>
                            <input
                                type="text"
                                value={settings.zaloLink}
                                onChange={e => setSettings(prev => ({ ...prev, zaloLink: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="https://zalo.me/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="contact@gonuts.vn"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                            <textarea
                                value={settings.address}
                                onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                rows={2}
                                placeholder="Địa chỉ cửa hàng..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Số giấy phép kinh doanh</label>
                            <input
                                type="text"
                                value={settings.businessLicense}
                                onChange={e => setSettings({ ...settings, businessLicense: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="0123xxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Giờ làm việc</label>
                            <input
                                type="text"
                                value={settings.workingHours}
                                onChange={e => setSettings({ ...settings, workingHours: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="Thứ 2 - Thứ 7: 8:00 - 17:30"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Globe className="text-brand" size={20} />
                        Mạng xã hội
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Facebook size={16} className="text-brand" /> Facebook
                            </label>
                            <input
                                type="text"
                                value={settings.facebookUrl}
                                onChange={e => setSettings(prev => ({ ...prev, facebookUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
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
                                onChange={e => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
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
                                onChange={e => setSettings(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TikTok</label>
                            <input
                                type="text"
                                value={settings.tiktokUrl}
                                onChange={e => setSettings(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="https://tiktok.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Megaphone className="text-brand" size={20} />
                        Banner khuyến mãi
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="promoEnabled"
                                checked={settings.promoEnabled}
                                onChange={e => setSettings(prev => ({ ...prev, promoEnabled: e.target.checked }))}
                                className="w-5 h-5 text-brand rounded focus:ring-brand"
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
                                onChange={e => setSettings(prev => ({ ...prev, promoText: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="Giảm giá 8% khi mua hàng từ 899 trở lên..."
                            />
                        </div>
                    </div>
                </div>

                {/* Products Page Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ImageIcon className="text-brand" size={20} />
                        Banner trang Sản phẩm
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="productsBannerEnabled"
                                checked={settings.productsBannerEnabled}
                                onChange={e => setSettings(prev => ({ ...prev, productsBannerEnabled: e.target.checked }))}
                                className="w-5 h-5 text-brand rounded focus:ring-brand"
                            />
                            <label htmlFor="productsBannerEnabled" className="text-sm font-medium text-slate-700">
                                Hiển thị banner trang sản phẩm
                            </label>
                        </div>

                        {/* Upload Info */}
                        <div className="bg-brand/10 border border-brand/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-brand-dark text-sm">
                                <span className="font-medium">💡 Khuyến nghị:</span>
                                <span>Tỉ lệ 3:1 (VD: 1200x400px) để hiển thị tốt nhất</span>
                            </div>
                        </div>

                        {/* Upload Button */}
                        <div className="flex gap-3">
                            <label className="flex-1 cursor-pointer">
                                <div className={`flex items-center justify-center gap-2 px-4 py-3 bg-brand/10 hover:bg-brand/20 text-brand font-medium rounded-lg border-2 border-brand/20 transition-all ${uploadingBanner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploadingBanner ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ImageIcon size={18} />
                                    )}
                                    <span>{uploadingBanner ? 'Đang upload...' : 'Chọn ảnh từ thiết bị'}</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/svg+xml,image/tiff"
                                    className="hidden"
                                    onChange={(e) => handleBannerFileUpload(e, 'products')}
                                    disabled={uploadingBanner}
                                />
                            </label>

                        </div>

                        {/* URL Input */}
                        <div className="relative">
                            <div className="text-xs text-slate-500 mb-2 text-center">hoặc nhập URL</div>
                            <input
                                type="text"
                                value={settings.productsBannerUrl}
                                onChange={e => setSettings(prev => ({ ...prev, productsBannerUrl: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="/assets/images/gonuts-banner-member.png"
                            />
                        </div>

                        {/* Image Preview */}
                        {settings.productsBannerUrl && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Xem trước:</label>
                                <div className="relative w-full rounded-lg overflow-hidden border-2 border-slate-200" style={{ aspectRatio: '3/1' }}>
                                    <img
                                        src={settings.productsBannerUrl}
                                        alt="Products Banner Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/assets/images/gonuts-banner-member.png';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        Tỉ lệ 3:1
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Home Page Promo Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Megaphone className="text-brand" size={20} />
                        Banner Khuyến mãi Trang chủ
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="homePromoBannerEnabled"
                                checked={settings.homePromoBannerEnabled}
                                onChange={e => setSettings(prev => ({ ...prev, homePromoBannerEnabled: e.target.checked }))}
                                className="w-5 h-5 text-brand rounded focus:ring-brand"
                            />
                            <label htmlFor="homePromoBannerEnabled" className="text-sm font-medium text-slate-700">
                                Hiển thị banner này
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề (Hỗ trợ &lt;br /&gt;)</label>
                            <input
                                type="text"
                                value={settings.homePromoBannerTitle}
                                onChange={e => setSettings(prev => ({ ...prev, homePromoBannerTitle: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="WIN RAHUL DRAVID'S..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Chữ trên nút</label>
                                <input
                                    type="text"
                                    value={settings.homePromoBannerButtonText}
                                    onChange={e => setSettings(prev => ({ ...prev, homePromoBannerButtonText: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                    placeholder="BUY MORE, WIN MORE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link trên nút</label>
                                <input
                                    type="text"
                                    value={settings.homePromoBannerButtonLink}
                                    onChange={e => setSettings(prev => ({ ...prev, homePromoBannerButtonLink: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                    placeholder="/products"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú nhỏ</label>
                            <input
                                type="text"
                                value={settings.homePromoBannerNote}
                                onChange={e => setSettings(prev => ({ ...prev, homePromoBannerNote: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="*Jersey & Miniature Bat"
                            />
                        </div>

                        <div className="bg-brand/10 border border-brand/20 rounded-lg p-3">
                            <div className="text-brand-dark text-xs">
                                💡 Banner này có kích thước đặc biệt, khuyến nghị dùng ảnh có chủ thể bên phải.
                            </div>
                        </div>

                        {/* Upload Button */}
                        <div className="flex gap-3">
                            <label className="flex-1 cursor-pointer">
                                <div className={`flex items-center justify-center gap-2 px-4 py-3 bg-brand/10 hover:bg-brand/20 text-brand font-medium rounded-lg border-2 border-brand/20 transition-all ${uploadingBanner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploadingBanner && bannerType === 'homePromo' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <ImageIcon size={18} />
                                    )}
                                    <span>{uploadingBanner && bannerType === 'homePromo' ? 'Đang upload...' : 'Chọn ảnh mới'}</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleBannerFileUpload(e, 'homePromo')}
                                    disabled={uploadingBanner}
                                />
                            </label>

                        </div>

                        {/* Image Preview */}
                        {settings.homePromoBannerUrl && (
                            <div className="mt-4">
                                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100" style={{ aspectRatio: '3/1' }}>
                                    <img
                                        src={settings.homePromoBannerUrl}
                                        alt="Home Promo Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-brand">Xem trước Banner Trang Chủ</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agent/CTV */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Users className="text-brand" size={20} />
                        Đại lý / Cộng tác viên
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link đăng ký Đại lý</label>
                            <input
                                type="text"
                                value={settings.agentRegistrationUrl}
                                onChange={e => setSettings({ ...settings, agentRegistrationUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="/agent/register"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link đăng ký CTV</label>
                            <input
                                type="text"
                                value={settings.ctvRegistrationUrl}
                                onChange={e => setSettings({ ...settings, ctvRegistrationUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="/agent/register"
                            />
                        </div>
                    </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Truck className="text-brand" size={20} />
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
                                onChange={e => setSettings(prev => ({ ...prev, freeShippingThreshold: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="500000"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Hiện tại: Miễn phí ship cho đơn từ {settings.freeShippingThreshold.toLocaleString()}đ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Product Features / Commitments */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Package className="text-brand" size={20} />
                        Thông tin cam kết sản phẩm
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">Hiển thị dưới phần thông tin sản phẩm trên trang chi tiết</p>

                    <div className="space-y-4">
                        {settings.productFeatures?.map((feature, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-2">
                                        {feature.icon === 'truck' && <Truck className="text-brand" size={20} />}
                                        {feature.icon === 'refresh' && <RefreshCw className="text-brand" size={20} />}
                                        {feature.icon === 'shield' && <Shield className="text-brand" size={20} />}
                                        <span className="font-medium text-slate-700">Cam kết {index + 1}</span>
                                    </div>
                                    <label className="flex items-center gap-2 ml-auto">
                                        <input
                                            type="checkbox"
                                            checked={feature.enabled}
                                            onChange={e => {
                                                const newFeatures = [...settings.productFeatures];
                                                newFeatures[index] = { ...feature, enabled: e.target.checked };
                                                setSettings({ ...settings, productFeatures: newFeatures });
                                            }}
                                            className="w-4 h-4 text-brand rounded focus:ring-brand"
                                        />
                                        <span className="text-sm text-slate-600">Hiển thị</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Tiêu đề</label>
                                        <input
                                            type="text"
                                            value={feature.title}
                                            onChange={e => {
                                                setSettings(prev => {
                                                    const newFeatures = [...prev.productFeatures];
                                                    newFeatures[index] = { ...feature, title: e.target.value };
                                                    return { ...prev, productFeatures: newFeatures };
                                                });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-sm"
                                            placeholder="Giao hàng toàn quốc"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Mô tả</label>
                                        <input
                                            type="text"
                                            value={feature.description}
                                            onChange={e => {
                                                setSettings(prev => {
                                                    const newFeatures = [...prev.productFeatures];
                                                    newFeatures[index] = { ...feature, description: e.target.value };
                                                    return { ...prev, productFeatures: newFeatures };
                                                });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-sm"
                                            placeholder="Miễn phí đơn từ 500.000đ"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Support Hotline */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Hotline hỗ trợ (hiển thị trên trang sản phẩm)
                        </label>
                        <input
                            type="text"
                            value={settings.supportHotline}
                            onChange={e => setSettings(prev => ({ ...prev, supportHotline: e.target.value }))}
                            className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                            placeholder="096 118 5753"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
