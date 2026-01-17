'use client';

import { useState } from 'react';
import { Home, RefreshCw, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

export default function FixHomepagePage() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fixing, setFixing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const checkStatus = async () => {
        try {
            setLoading(true);
            setMessage(null);
            
            const response = await fetch('/api/fix-homepage');
            const data = await response.json();
            
            if (response.ok) {
                setStatus(data);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to check status' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error checking status' });
        } finally {
            setLoading(false);
        }
    };

    const fixHomepage = async () => {
        try {
            setFixing(true);
            setMessage(null);
            
            const response = await fetch('/api/fix-homepage', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
                // Refresh status
                await checkStatus();
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to fix homepage' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fixing homepage' });
        } finally {
            setFixing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                            <Home className="h-5 w-5" />
                        </div>
                        Sửa Trang Chủ
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 ml-13">
                        Khắc phục vấn đề sản phẩm không hiển thị trên trang chủ
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={checkStatus}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-medium transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Kiểm tra
                    </button>
                    <button
                        onClick={fixHomepage}
                        disabled={fixing}
                        className="inline-flex items-center gap-2 bg-amber-200 hover:bg-amber-300 text-slate-800 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        {fixing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Wrench className="h-4 w-4" />
                        )}
                        {fixing ? 'Đang sửa...' : 'Sửa Ngay'}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                    ) : (
                        <AlertTriangle className="h-5 w-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Status */}
            {status && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-3 h-3 rounded-full ${status.needsFix ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <h3 className="font-semibold text-slate-800">
                            {status.needsFix ? 'Cần sửa chữa' : 'Hoạt động bình thường'}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{status.totalProducts}</div>
                            <div className="text-sm text-slate-600">Tổng sản phẩm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{status.tagCounts['best-seller']}</div>
                            <div className="text-sm text-slate-600">Bán chạy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{status.tagCounts['new']}</div>
                            <div className="text-sm text-slate-600">Sản phẩm mới</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{status.tagCounts['promo']}</div>
                            <div className="text-sm text-slate-600">Khuyến mãi</div>
                        </div>
                    </div>

                    {status.tagCounts['no-tags'] > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">
                                    Có {status.tagCounts['no-tags']} sản phẩm chưa có tags
                                </span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1">
                                Những sản phẩm này sẽ không hiển thị trên trang chủ. Nhấn "Sửa Ngay" để thêm tags tự động.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="glass-card p-6">
                <h3 className="font-semibold text-slate-800 mb-3">Hướng dẫn</h3>
                <div className="space-y-2 text-sm text-slate-600">
                    <p>• <strong>Kiểm tra:</strong> Xem tình trạng hiện tại của sản phẩm và tags</p>
                    <p>• <strong>Sửa Ngay:</strong> Tự động thêm tags cho tất cả sản phẩm để hiển thị trên trang chủ</p>
                    <p>• <strong>Tags được thêm:</strong> best-seller, new, promo (phân bổ đều cho các sản phẩm)</p>
                    <p>• <strong>Kết quả:</strong> Sản phẩm sẽ hiển thị trong các section "Bán chạy", "Sản phẩm mới", "Khuyến mãi"</p>
                </div>
            </div>
        </div>
    );
}