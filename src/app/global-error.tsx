'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary for failures in the root layout itself, where the
 * normal error boundary cannot render. Must ship its own html/body.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error boundary:', error);
    }, [error]);

    return (
        <html lang="vi">
            <body style={{ margin: 0, fontFamily: 'Montserrat, Arial, sans-serif', background: '#faf9f7' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                }}>
                    <div style={{
                        maxWidth: '460px',
                        width: '100%',
                        textAlign: 'center',
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: '16px',
                        padding: '40px 28px',
                    }}>
                        <div style={{ fontSize: '44px', marginBottom: '12px' }}>⚠️</div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>
                            Trang đang gặp sự cố
                        </h1>
                        <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#6b7280', margin: 0 }}>
                            Hệ thống tạm thời không phản hồi. Anh/chị bấm &quot;Thử lại&quot; giúp em.
                        </p>
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                marginTop: '24px',
                                padding: '10px 22px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: '#9C7043',
                                color: '#fff',
                            }}
                        >
                            Thử lại
                        </button>
                        {error.digest && (
                            <p style={{ marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
                                Mã lỗi: <code>{error.digest}</code>
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
