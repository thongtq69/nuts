import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    textColor: string;
    bgColor: string;
    borderColor: string;
}

export default function StatCard({
    title,
    value,
    change,
    trend = 'neutral',
    icon: Icon,
    textColor,
    bgColor,
    borderColor
}: StatCardProps) {
    return (
        <div
            className={`bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border-2 ${borderColor} dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bgColor} dark:bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${textColor}`} strokeWidth={2} />
                </div>
                {trend === 'up' && change && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                        <ArrowUpRight size={12} />
                        {change}
                    </div>
                )}
                {trend === 'down' && change && (
                    <div className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full">
                        <ArrowDownRight size={12} />
                        {change}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{title}</h3>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{value}</div>
                {trend === 'neutral' && change && (
                    <div className="mt-2 text-xs text-slate-500 font-medium">
                        {change}
                    </div>
                )}
            </div>
        </div>
    );
}
