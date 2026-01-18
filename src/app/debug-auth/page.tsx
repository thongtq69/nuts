'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DebugAuthPage() {
    const { user, loading, checkUser } = useAuth();
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        const fetchDebug = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                setDebugInfo({
                    status: res.status,
                    data: data,
                    hasUser: !!user,
                    userRole: user?.role,
                    isAdmin: user?.role === 'admin'
                });
            } catch (error) {
                setDebugInfo({ error: String(error) });
            }
        };
        fetchDebug();
    }, [user]);

    if (loading) {
        return <div className="p-8">Đang tải...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
            
            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-lg font-semibold mb-4">Auth Context</h2>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify({ user, loading }, null, 2)}
                </pre>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-4">
                <h2 className="text-lg font-semibold mb-4">API /auth/me Response</h2>
                <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="flex gap-4">
                    <button 
                        onClick={() => checkUser()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Refresh Auth
                    </button>
                    <button 
                        onClick={() => window.location.href = '/admin'}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Go to Admin
                    </button>
                    <button 
                        onClick={() => window.location.href = '/api/auth/logout'}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {debugInfo && !debugInfo.isAdmin && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Cảnh báo:</strong> User không có quyền admin!
                    <br />
                    Role hiện tại: <code>{user?.role}</code>
                    <br />
                    Vui lòng truy cập <a href="/setup-admin" className="underline">/setup-admin</a> để cập nhật role.
                </div>
            )}
        </div>
    );
}
