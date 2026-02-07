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
    ImageIcon,
    Crop
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import ImageCropper from '@/components/admin/ImageCropper';

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
        productsBannerUrl: '/assets/images/slide1.jpg',
        productsBannerEnabled: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [cropperImageUrl, setCropperImageUrl] = useState('');
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const toast = useToast();

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

    // Handle file upload for products banner
    const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra tỉ lệ ảnh
        const img = new Image();
        img.onload = async () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const targetRatio = 3; // 3:1

            // Nếu tỉ lệ không đúng (cho phép sai lệch 15%), mở cropper
            if (Math.abs(aspectRatio - targetRatio) > 0.15) {
                setCropperImageUrl(URL.createObjectURL(file));
                setShowCropper(true);
            } else {
                // Tỉ lệ đúng, upload trực tiếp
                await uploadBannerFile(file);
            }
        };
        img.onerror = () => {
            toast.error('Không thể đọc file ảnh', 'Vui lòng chọn file ảnh hợp lệ.');
        };
        img.src = URL.createObjectURL(file);
    };

    // Upload banner file to Cloudinary
    const uploadBannerFile = async (file: File | null, croppedImageUrl?: string) => {
        setUploadingBanner(true);
        try {
            let imageData: string | FormData;
            let isBase64 = false;

            if (croppedImageUrl) {
                // Sử dụng ảnh đã crop (base64)
                imageData = croppedImageUrl;
                isBase64 = true;
            } else if (file) {
                // Upload file trực tiếp
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'gonuts/banners');
                formData.append('type', 'products_banner');
                imageData = formData;
            } else {
                throw new Error('No file or image data provided');
            }

            let result;
            if (isBase64) {
                // Upload base64 (ảnh đã crop)
                const response = await fetch('/api/upload', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        imageData: imageData,
                        folder: 'gonuts/banners',
                        type: 'products_banner',
                        filename: 'cropped'
                    }),
                });
                result = await response.json();
            } else {
                // Upload file
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: imageData as FormData,
                });
                result = await response.json();
            }

            if (result.success) {
                setSettings({ ...settings, productsBannerUrl: result.data.url });
                toast.success('Upload ảnh thành công');
            } else {
                toast.error('Upload thất bại', result.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error uploading banner:', error);
            toast.error('Lỗi khi upload ảnh', 'Vui lòng thử lại.');
        } finally {
            setUploadingBanner(false);
            setShowCropper(false);
            setCropperImageUrl('');
        }
    };

    // Handle cropped image
    const handleCroppedImage = (croppedImageUrl: string) => {
        uploadBannerFile(null, croppedImageUrl);
    };

    // Handle cropper cancel
    const handleCropperCancel = () => {
        setShowCropper(false);
        setCropperImageUrl('');
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
                    disabled={saving}
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
                                onChange={e => setSettings({ ...settings, hotline: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="090xxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Link Zalo</label>
                            <input
                                type="text"
                                value={settings.zaloLink}
                                onChange={e => setSettings({ ...settings, zaloLink: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="https://zalo.me/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="contact@gonuts.vn"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                            <textarea
                                value={settings.address}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
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
                                onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
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
                                onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
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
                                onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TikTok</label>
                            <input
                                type="text"
                                value={settings.tiktokUrl}
                                onChange={e => setSettings({ ...settings, tiktokUrl: e.target.value })}
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
                                onChange={e => setSettings({ ...settings, promoEnabled: e.target.checked })}
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
                                onChange={e => setSettings({ ...settings, promoText: e.target.value })}
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
                                onChange={e => setSettings({ ...settings, productsBannerEnabled: e.target.checked })}
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
                            <div className="text-brand text-xs mt-1">
                                Ảnh sẽ được tự động cắt và điều chỉnh về đúng tỉ lệ
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
                                    onChange={handleBannerFileUpload}
                                    disabled={uploadingBanner}
                                />
                            </label>

                            {settings.productsBannerUrl && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCropperImageUrl(settings.productsBannerUrl);
                                        setShowCropper(true);
                                    }}
                                    className="px-4 py-3 bg-brand-light/30 hover:bg-brand-light/50 text-brand-dark font-medium rounded-lg border-2 border-brand-light/50 transition-all flex items-center gap-2"
                                    disabled={uploadingBanner}
                                >
                                    <Crop size={18} />
                                    <span>Chỉnh sửa</span>
                                </button>
                            )}
                        </div>

                        {/* URL Input */}
                        <div className="relative">
                            <div className="text-xs text-slate-500 mb-2 text-center">hoặc nhập URL</div>
                            <input
                                type="text"
                                value={settings.productsBannerUrl}
                                onChange={e => setSettings({ ...settings, productsBannerUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                                placeholder="/assets/images/slide1.jpg"
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
                                            (e.target as HTMLImageElement).src = '/assets/images/slide1.jpg';
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
                                onChange={e => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
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
                                                const newFeatures = [...settings.productFeatures];
                                                newFeatures[index] = { ...feature, title: e.target.value };
                                                setSettings({ ...settings, productFeatures: newFeatures });
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
                                                const newFeatures = [...settings.productFeatures];
                                                newFeatures[index] = { ...feature, description: e.target.value };
                                                setSettings({ ...settings, productFeatures: newFeatures });
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
                            onChange={e => setSettings({ ...settings, supportHotline: e.target.value })}
                            className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                            placeholder="096 118 5753"
                        />
                    </div>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {showCropper && cropperImageUrl && (
                <ImageCropper
                    imageUrl={cropperImageUrl}
                    onCrop={handleCroppedImage}
                    onCancel={handleCropperCancel}
                    aspectRatio={3}
                />
            )}
        </div>
    );
}
