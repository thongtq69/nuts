'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Without this boundary a server-side exception renders Next's bare white
 * "Application error" screen with only a digest, leaving the visitor stuck.
 */
export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Storefront error boundary:', error);
    }, [error]);

    return (
        <div className="error-wrapper">
            <div className="error-card">
                <div className="error-icon" aria-hidden="true">⚠️</div>
                <h1>Trang đang gặp sự cố</h1>
                <p>
                    Hệ thống tạm thời không tải được dữ liệu. Anh/chị bấm &quot;Thử lại&quot; giúp em,
                    phần lớn trường hợp sẽ vào được ngay.
                </p>

                <div className="error-actions">
                    <button type="button" onClick={reset} className="error-btn error-btn-primary">
                        Thử lại
                    </button>
                    <Link href="/" className="error-btn error-btn-ghost">
                        Về trang chủ
                    </Link>
                </div>

                {error.digest && (
                    <p className="error-digest">
                        Mã lỗi: <code>{error.digest}</code> — gửi mã này cho bộ phận kỹ thuật để được hỗ trợ nhanh hơn.
                    </p>
                )}
            </div>

            <style jsx>{`
                .error-wrapper {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                }
                .error-card {
                    max-width: 480px;
                    width: 100%;
                    text-align: center;
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 16px;
                    padding: 40px 28px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
                }
                .error-icon {
                    font-size: 44px;
                    margin-bottom: 12px;
                }
                h1 {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 12px;
                }
                p {
                    font-size: 14px;
                    line-height: 1.6;
                    color: #6b7280;
                    margin: 0;
                }
                .error-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 24px;
                }
                .error-btn {
                    padding: 10px 22px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                }
                .error-btn-primary {
                    background: var(--color-primary-brown, #9C7043);
                    color: #fff;
                }
                .error-btn-ghost {
                    background: #f3f4f6;
                    color: #374151;
                }
                .error-digest {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #9ca3af;
                }
                .error-digest code {
                    font-weight: 600;
                    color: #6b7280;
                }
            `}</style>
        </div>
    );
}
