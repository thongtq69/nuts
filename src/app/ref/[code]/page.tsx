'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decodeAffiliateId } from '@/lib/affiliate';

export default function RefPage() {
    const params = useParams();
    const router = useRouter();
    const [error, setError] = useState(false);

    useEffect(() => {
        const code = params.code as string;
        
        if (code) {
            const userId = decodeAffiliateId(code);
            
            if (userId) {
                fetch(`/api/ref/${code}`)
                    .then(res => {
                        if (res.redirected) {
                            window.location.href = res.url;
                        } else {
                            setError(true);
                        }
                    })
                    .catch(() => {
                        setError(true);
                    });
            } else {
                setError(true);
            }
        }
    }, [params.code]);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <h1>Link không hợp lệ</h1>
                <p>Liên kết này đã hết hạn hoặc không tồn tại.</p>
                <button
                    onClick={() => router.push('/')}
                    style={{
                        padding: '12px 24px',
                        background: '#9C7043',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #9C7043',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
