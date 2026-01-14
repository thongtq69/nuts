import React from 'react';
import { Card } from '../ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'red';
}

export function StatsCards({ stats }: { stats: StatCardProps[] }) {
    const colorStyles = {
        amber: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', trend: 'text-amber-600 bg-amber-50' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', trend: 'text-emerald-600 bg-emerald-50' },
        blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', trend: 'text-blue-600 bg-blue-50' },
        purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', trend: 'text-purple-600 bg-purple-50' },
        red: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', trend: 'text-red-600 bg-red-50' },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const colors = colorStyles[stat.color || 'amber'];
                return (
                    <Card key={index} className="transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${colors.bg}`}>
                                <stat.icon className={`w-6 h-6 ${colors.text}`} strokeWidth={2} />
                            </div>
                            {stat.trend === 'up' && (
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight size={12} />
                                    {stat.change}
                                </div>
                            )}
                            {stat.trend === 'down' && (
                                <div className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full">
                                    <ArrowDownRight size={12} />
                                    {stat.change}
                                </div>
                            )}
                            {stat.trend === 'neutral' && (
                                <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-1 rounded-full">
                                    <Minus size={12} />
                                    {stat.change}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
                            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
