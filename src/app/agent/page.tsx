'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface AgentStats {
    referralCode: string;
    walletBalance: number;
    totalCommission: number;
    totalReferrals: number; // Count of orders
    recentOrders: any[];
}

export default function AgentDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (!authLoading && user && user.role !== 'sale') {
            router.push('/');
            return;
        }

        if (user) {
            fetchAgentStats();
        }
    }, [user, authLoading, router]);

    const fetchAgentStats = async () => {
        try {
            // In a real app, create a dedicated endpoint /api/agent/stats
            // For now, we mock/derive from user object and maybe fetch orders?
            // Let's create a dedicated API route for this to be clean.
            const res = await fetch('/api/agent/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (stats?.referralCode) {
            const link = `${window.location.origin}?ref=${stats.referralCode}`;
            navigator.clipboard.writeText(link);
            alert('Đã sao chép link giới thiệu!');
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Dành cho Đại lý</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Số dư ví</h3>
                    <p className="text-2xl font-bold text-brand">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.walletBalance || 0)}
                    </p>
                    <button className="mt-4 text-sm text-brand font-medium hover:underline">
                        Yêu cầu rút tiền
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Tổng thu nhập</h3>
                    <p className="text-2xl font-bold text-brand">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalCommission || 0)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Đơn hàng giới thiệu</h3>
                    <p className="text-2xl font-bold text-brand-light">{stats?.totalReferrals || 0}</p>
                </div>
            </div>

            {/* Tools */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-bold mb-4">Công cụ tiếp thị</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-md">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Mã giới thiệu của bạn</label>
                        <div className="font-mono font-bold text-lg">{stats?.referralCode}</div>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs text-gray-500 mb-1">Link giới thiệu</label>
                        <div className="flex">
                            <input
                                type="text"
                                readOnly
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${stats?.referralCode}`}
                                className="flex-1 p-2 text-sm border border-gray-300 rounded-l-md bg-white focus:outline-none"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-brand text-white px-4 py-2 text-sm rounded-r-md hover:bg-brand/90 transition-colors"
                            >
                                Sao chép
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold">Lịch sử giới thiệu</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Mã đơn</th>
                                <th className="px-6 py-3">Ngày</th>
                                <th className="px-6 py-3">Giá trị đơn</th>
                                <th className="px-6 py-3">Hoa hồng (10%)</th>
                                <th className="px-6 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.recentOrders?.length ? (
                                stats.recentOrders.map((order: any) => (
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</td>
                                        <td className="px-6 py-4 font-bold text-brand">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.commissionAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.commissionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                                    order.commissionStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-brand-light/30 text-gray-700'
                                                }`}>
                                                {order.commissionStatus === 'approved' ? 'Đã nhận' :
                                                    order.commissionStatus === 'cancelled' ? 'Đã hủy' : 'Chờ duyệt'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Chưa có đơn hàng giới thiệu nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
