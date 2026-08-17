'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Admin screens read straight from MongoDB during render, so a dropped
 * connection used to leave staff on a blank "Application error" page with no
 * way back. This keeps them inside the admin shell with a retry.
 */
export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin error boundary:', error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="h-7 w-7 text-amber-600" />
                </div>

                <h1 className="text-xl font-bold text-slate-800">Không tải được dữ liệu</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Kết nối tới cơ sở dữ liệu bị gián đoạn trong lúc mở trang này. Dữ liệu đơn hàng
                    không bị ảnh hưởng — bấm &quot;Tải lại&quot; để thử lại.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                        <RefreshCw size={16} />
                        Tải lại
                    </button>
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                        Về danh sách đơn hàng
                    </Link>
                </div>

                {error.digest && (
                    <p className="mt-5 text-xs text-slate-400">
                        Mã lỗi: <code className="font-semibold text-slate-500">{error.digest}</code>
                    </p>
                )}
            </div>
        </div>
    );
}
