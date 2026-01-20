'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string; // gradient classes e.g. "from-brand to-brand-light"
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    href?: string;
    loading?: boolean;
}

export default function StatsCard({
    label,
    value,
    icon: Icon,
    color,
    change,
    trend = 'neutral',
    href,
    loading = false
}: StatsCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                    <div className="w-16 h-6 rounded-full bg-gray-200" />
                </div>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
        );
    }

    const content = (
        <>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        trend === 'up' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : trend === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-600'
                    }`}>
                        {trend === 'up' && <ArrowUpRight size={12} />}
                        {trend === 'down' && <ArrowDownRight size={12} />}
                        {change}
                    </div>
                )}
            </div>
            <div className="text-3xl font-black text-gray-800 mb-1 group-hover:text-brand transition-colors">
                {value}
            </div>
            <div className="text-gray-500 font-medium">{label}</div>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="group bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1 transition-all duration-300 block"
            >
                {content}
                <div className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 group-hover:bg-brand/10 text-gray-600 group-hover:text-brand font-semibold rounded-xl transition-all text-sm">
                    <span>Xem chi tiet</span>
                    <ArrowUpRight size={16} />
                </div>
            </Link>
        );
    }

    return (
        <div className="group bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1 transition-all duration-300">
            {content}
        </div>
    );
}
