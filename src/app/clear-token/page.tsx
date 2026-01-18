'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearTokenPage() {
    const router = useRouter();

    useEffect(() => {
        // Clear all cookies by expiring them
        document.cookie.split(';').forEach(function(c) { 
            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        
        alert('Đã xóa token! Đang chuyển về login...');
        router.push('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Đang xóa token...</h1>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
}
