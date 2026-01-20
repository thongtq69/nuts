'use client';

import React, { useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface ChartDataPoint {
    date: string;
    value: number;
    label?: string;
}

interface RevenueChartProps {
    title: string;
    subtitle?: string;
    data: ChartDataPoint[];
    loading?: boolean;
    onRefresh?: () => void;
    onPeriodChange?: (period: number) => void;
    periods?: { value: number; label: string }[];
    valuePrefix?: string;
    valueSuffix?: string;
    color?: string;
    gradientId?: string;
}

const defaultPeriods = [
    { value: 7, label: '7 ngay' },
    { value: 14, label: '14 ngay' },
    { value: 30, label: '30 ngay' }
];

export default function RevenueChart({
    title,
    subtitle,
    data,
    loading = false,
    onRefresh,
    onPeriodChange,
    periods = defaultPeriods,
    valuePrefix = '',
    valueSuffix = 'd',
    color = '#9C7043',
    gradientId = 'colorRevenue'
}: RevenueChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(periods[0]?.value || 7);

    const handlePeriodChange = (period: number) => {
        setSelectedPeriod(period);
        onPeriodChange?.(period);
    };

    const formatValue = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toString();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                </div>
                <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand" />
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {periods.length > 1 && (
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => handlePeriodChange(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                        >
                            {periods.map((period) => (
                                <option key={period.value} value={period.value}>
                                    {period.label}
                                </option>
                            ))}
                        </select>
                    )}
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2.5 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Lam moi"
                        >
                            <RefreshCw size={18} className="text-gray-400" />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="h-[300px] w-full min-h-[250px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={true} horizontal={true} />
                            <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12, fill: '#9ca3af' }} 
                                axisLine={{ stroke: '#e5e7eb' }}
                                tickLine={false}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                tickFormatter={formatValue}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                width={50}
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => [
                                    `${valuePrefix}${(value || 0).toLocaleString('vi-VN')}${valueSuffix}`,
                                    'Gia tri'
                                ]}
                                labelStyle={{ color: '#374151', fontWeight: 600 }}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                animationDuration={1000}
                                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>Chua co du lieu</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
