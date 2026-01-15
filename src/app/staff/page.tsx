'use client';
import { useAuth } from '@/context/AuthContext';
export default function StaffPage() {
    const { user } = useAuth();
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-medium mb-2">Pending Orders</h3>
                    <p className="text-3xl font-bold">--</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-medium mb-2">My Tasks</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>
        </div>
    );
}
