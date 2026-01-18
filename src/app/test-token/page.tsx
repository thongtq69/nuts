'use client';

import { useEffect, useState } from 'react';

export default function TestTokenPage() {
    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [cookieInfo, setCookieInfo] = useState<string>('');

    useEffect(() => {
        // Check cookies
        const cookies = document.cookie;
        setCookieInfo(cookies);

        // Try to decode token
        const match = cookies.match(/token=([^;]+)/);
        if (match) {
            try {
                const base64Url = match[1].split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                setTokenInfo(JSON.parse(jsonPayload));
            } catch (e) {
                setTokenInfo({ error: 'Cannot decode token: ' + e });
            }
        } else {
            setTokenInfo({ error: 'No token found in cookies' });
        }
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Debug Token</h1>
            
            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-lg font-semibold mb-2">Cookies</h2>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
                    {cookieInfo || '(no cookies)'}
                </pre>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-lg font-semibold mb-2">Decoded Token</h2>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(tokenInfo, null, 2)}
                </pre>
            </div>

            {tokenInfo?.role === 'admin' ? (
                <a href="/admin" className="block w-full bg-green-500 text-white text-center py-3 rounded-lg hover:bg-green-600">
                    ✅ Click vào đây để vào Admin
                </a>
            ) : (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>❌ Token không có quyền admin!</strong>
                    <br />
                    Role trong token: <code>{tokenInfo?.role}</code>
                    <br />
                    <br />
                    <a href="/setup-admin" className="underline">Vào /setup-admin để cập nhật role</a>
                </div>
            )}
        </div>
    );
}
