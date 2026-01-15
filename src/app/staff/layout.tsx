'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Package, ShoppingBag, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function StaffLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'staff' && user.role !== 'admin') {
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loading, router]);

    if (loading || !isAuthorized) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Staff Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="font-bold text-lg">Staff Portal</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/staff" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                        <LayoutDashboard size={20} />
                        Overview
                    </Link>
                    <Link href="/staff/orders" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                        <ShoppingBag size={20} />
                        Orders
                    </Link>
                    <Link href="/staff/products" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                        <Package size={20} />
                        Products
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-400">
                        <User size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user?.name}</span>
                            <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                        </div>
                    </div>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
