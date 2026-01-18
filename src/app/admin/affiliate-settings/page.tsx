'use client';

import { useState, useEffect } from 'react';


export default function AdminAffiliateSettingsPage() {
    const [settings, setSettings] = useState<any>({
        defaultCommissionRate: 10,
        cookieDurationDays: 30,
        minWithdrawalAmount: 200000,
        commissionType: 'percent'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/admin/affiliate-settings')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setSettings((prev: any) => ({ ...prev, ...data }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch('/api/admin/affiliate-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Lưu cài đặt thành công');
        } catch {
            alert('Lỗi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Cài đặt Affiliate</h1>

            <form onSubmit={handleSave} className="bg-white p-6 rounded shadow max-w-lg">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Tỷ lệ hoa hồng mặc định (%)</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={settings.defaultCommissionRate}
                        onChange={e => setSettings((prev: any) => ({ ...prev, defaultCommissionRate: Number(e.target.value) }))}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Thời gian lưu Cookie (ngày)</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={settings.cookieDurationDays}
                        onChange={e => setSettings((prev: any) => ({ ...prev, cookieDurationDays: Number(e.target.value) }))}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Hạn mức rút tiền tối thiểu (VNĐ)</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={settings.minWithdrawalAmount}
                        onChange={e => setSettings((prev: any) => ({ ...prev, minWithdrawalAmount: Number(e.target.value) }))}
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark disabled:bg-gray-400"
                >
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
            </form>
        </div>
    );
}
