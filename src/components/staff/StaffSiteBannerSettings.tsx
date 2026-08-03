'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, Image as ImageIcon, Loader2, Megaphone, Save, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface BannerSettings {
    productsBannerUrl: string;
    productsBannerEnabled: boolean;
    homePromoBannerUrl: string;
    homePromoBannerTitle: string;
    homePromoBannerButtonText: string;
    homePromoBannerButtonLink: string;
    homePromoBannerNote: string;
    homePromoBannerEnabled: boolean;
}

const DEFAULT_SETTINGS: BannerSettings = {
    productsBannerUrl: '/assets/images/gonuts-banner-member.png',
    productsBannerEnabled: true,
    homePromoBannerUrl: '/assets/images/gonuts-banner-member.png',
    homePromoBannerTitle: 'TẶNG VOUCHER 50.000 VNĐ<br />KHI ĐĂNG KÝ THÀNH VIÊN',
    homePromoBannerButtonText: 'ĐĂNG KÝ NGAY',
    homePromoBannerButtonLink: '/register',
    homePromoBannerNote: '*Áp dụng cho đơn hàng từ 300.000đ',
    homePromoBannerEnabled: true,
};

type BannerType = 'products' | 'homePromo';

function VisibilityButton({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                enabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
            {enabled ? <Eye size={16} /> : <EyeOff size={16} />}
            {enabled ? 'Đang hiển thị' : 'Đang ẩn'}
        </button>
    );
}

export default function StaffSiteBannerSettings() {
    const [settings, setSettings] = useState<BannerSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<BannerType | null>(null);
    const { error: showError, success: showSuccess } = useToast();

    useEffect(() => {
        let cancelled = false;
        async function loadSettings() {
            try {
                const response = await fetch('/api/staff/banner-settings', { cache: 'no-store' });
                if (!response.ok) throw new Error('Không thể tải cấu hình banner');
                const data = await response.json();
                if (!cancelled) setSettings({ ...DEFAULT_SETTINGS, ...data });
            } catch (error) {
                console.error('Error loading site banners:', error);
                if (!cancelled) showError('Không tải được banner website', 'Vui lòng tải lại trang và thử lại.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadSettings();
        return () => { cancelled = true; };
    }, [showError]);

    const updateSetting = <K extends keyof BannerSettings>(key: K, value: BannerSettings[K]) => {
        setSettings(previous => ({ ...previous, [key]: value }));
    };

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>, type: BannerType) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showError('Tệp không hợp lệ', 'Vui lòng chọn một tệp hình ảnh.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showError('Ảnh quá lớn', 'Dung lượng ảnh tối đa là 10MB.');
            return;
        }

        try {
            setUploading(type);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'gonuts/banners');
            formData.append('type', type === 'products' ? 'products_banner' : 'home_promo_banner');

            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok || !data.url) throw new Error(data.error || data.message || 'Upload thất bại');

            updateSetting(type === 'products' ? 'productsBannerUrl' : 'homePromoBannerUrl', data.url);
            showSuccess('Đã tải ảnh lên', 'Nhấn “Lưu thay đổi” để áp dụng lên website.');
        } catch (error) {
            showError('Không tải được ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.');
        } finally {
            setUploading(null);
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/staff/banner-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Không thể lưu cấu hình banner');

            setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            showSuccess('Đã lưu banner website', 'Thay đổi đã được áp dụng cho khách hàng.');
        } catch (error) {
            showError('Lưu banner thất bại', error instanceof Error ? error.message : 'Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <Loader2 className="mx-auto animate-spin text-brand" />
                <p className="mt-3 text-sm text-slate-500">Đang tải banner website...</p>
            </section>
        );
    }

    const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Banner nội dung website</h2>
                    <p className="mt-1 text-sm text-slate-500">Ẩn, hiện, đổi ảnh hoặc xóa ảnh banner đang hiển thị cho khách hàng.</p>
                </div>
                <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving || uploading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900"><ImageIcon size={20} className="text-brand" /> Banner trang Sản phẩm</h3>
                        <VisibilityButton enabled={settings.productsBannerEnabled} onClick={() => updateSetting('productsBannerEnabled', !settings.productsBannerEnabled)} />
                    </div>
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Khuyến nghị ảnh tỉ lệ 3:1, ví dụ 1200×400px.</p>

                    <label className="block cursor-pointer">
                        <span className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/30 bg-brand/5 px-4 py-3 font-semibold text-brand hover:bg-brand/10">
                            {uploading === 'products' ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {uploading === 'products' ? 'Đang tải ảnh...' : 'Chọn ảnh mới từ thiết bị'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={event => uploadImage(event, 'products')} />
                    </label>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Hoặc nhập URL ảnh</label>
                        <input className={inputClass} value={settings.productsBannerUrl} onChange={event => updateSetting('productsBannerUrl', event.target.value)} placeholder="https://..." />
                    </div>

                    {settings.productsBannerUrl ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <img src={settings.productsBannerUrl} alt="Xem trước banner trang sản phẩm" className="aspect-[3/1] w-full object-cover" />
                        </div>
                    ) : (
                        <div className="flex aspect-[3/1] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">Đã xóa ảnh — hãy lưu để áp dụng</div>
                    )}

                    <button type="button" onClick={() => updateSetting('productsBannerUrl', '')} disabled={!settings.productsBannerUrl} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40">
                        <Trash2 size={16} /> Xóa ảnh banner
                    </button>
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900"><Megaphone size={20} className="text-brand" /> Banner Khuyến mãi Trang chủ</h3>
                        <VisibilityButton enabled={settings.homePromoBannerEnabled} onClick={() => updateSetting('homePromoBannerEnabled', !settings.homePromoBannerEnabled)} />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Tiêu đề (hỗ trợ &lt;br /&gt;)</label>
                        <input className={inputClass} value={settings.homePromoBannerTitle} onChange={event => updateSetting('homePromoBannerTitle', event.target.value)} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Chữ trên nút</label>
                            <input className={inputClass} value={settings.homePromoBannerButtonText} onChange={event => updateSetting('homePromoBannerButtonText', event.target.value)} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Link trên nút</label>
                            <input className={inputClass} value={settings.homePromoBannerButtonLink} onChange={event => updateSetting('homePromoBannerButtonLink', event.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú nhỏ</label>
                        <input className={inputClass} value={settings.homePromoBannerNote} onChange={event => updateSetting('homePromoBannerNote', event.target.value)} />
                    </div>

                    <label className="block cursor-pointer">
                        <span className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/30 bg-brand/5 px-4 py-3 font-semibold text-brand hover:bg-brand/10">
                            {uploading === 'homePromo' ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {uploading === 'homePromo' ? 'Đang tải ảnh...' : 'Chọn ảnh mới từ thiết bị'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={event => uploadImage(event, 'homePromo')} />
                    </label>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">URL ảnh</label>
                        <input className={inputClass} value={settings.homePromoBannerUrl} onChange={event => updateSetting('homePromoBannerUrl', event.target.value)} placeholder="https://..." />
                    </div>

                    {settings.homePromoBannerUrl ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <img src={settings.homePromoBannerUrl} alt="Xem trước banner khuyến mãi trang chủ" className="aspect-[3/1] w-full object-cover" />
                        </div>
                    ) : (
                        <div className="flex aspect-[3/1] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">Đã xóa ảnh — hãy lưu để áp dụng</div>
                    )}

                    <button type="button" onClick={() => updateSetting('homePromoBannerUrl', '')} disabled={!settings.homePromoBannerUrl} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40">
                        <Trash2 size={16} /> Xóa ảnh banner
                    </button>
                </div>
            </div>
        </section>
    );
}
