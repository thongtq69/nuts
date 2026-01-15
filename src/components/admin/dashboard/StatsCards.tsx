import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
}

export function StatsCards({ stats }: { stats: StatCardProps[] }) {
    const colorStyles = {
        amber: 'stat-icon-amber',
        emerald: 'stat-icon-emerald',
        blue: 'stat-icon-blue',
        purple: 'stat-icon-purple',
        rose: 'stat-icon-rose',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const iconClass = colorStyles[stat.color || 'amber'];
                return (
                    <div
                        key={index}
                        className={`stat-card-premium animate-slide-in stagger-${index + 1}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`stat-icon-container ${iconClass}`}>
                                <stat.icon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            {stat.trend === 'up' && (
                                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    <ArrowUpRight size={12} />
                                    {stat.change}
                                </div>
                            )}
                            {stat.trend === 'down' && (
                                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
                                    <ArrowDownRight size={12} />
                                    {stat.change}
                                </div>
                            )}
                            {stat.trend === 'neutral' && (
                                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                    <Minus size={12} />
                                    {stat.change}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{stat.title}</h3>
                            <div className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                                {stat.value}
                            </div>
                        </div>

                        {/* Decorative gradient line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                    </div>
                );
            })}
        </div>
    );
}
