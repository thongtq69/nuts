'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

// Simplified Revenue Chart
export function RevenueChart({ data }: { data: any[] }) {
    // Default data if empty
    const chartData = data.length > 0 ? data : [
        { name: '01/01', revenue: 0 },
        { name: '02/01', revenue: 0 },
        { name: '03/01', revenue: 0 },
        { name: '04/01', revenue: 0 },
        { name: '05/01', revenue: 0 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: any) => [`${value?.toLocaleString()} đ`, 'Doanh thu']}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// Top Products Bar Chart
export function TopProductsChart({ data }: { data: any[] }) {
    const chartData = data.length > 0 ? data : [
        { name: 'Chưa có dữ liệu', sales: 0 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                    width={100}
                />
                <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}
                />
                <Bar dataKey="sales" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={28} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// Order Status Pie Chart
export function OrderStatusChart({ data, total }: { data: any[], total: number }) {
    const chartData = data.length > 0 ? data : [
        { name: 'Hoàn thành', value: 0, color: '#10b981' },
        { name: 'Chờ xử lý', value: 0, color: '#f59e0b' },
        { name: 'Hủy', value: 0, color: '#ef4444' },
    ];

    return (
        <div className="relative h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0'
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span style={{ color: '#475569', fontWeight: 500 }}>{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-3xl font-bold text-slate-900">{total}</div>
                <div className="text-sm text-slate-500 font-medium">Tổng đơn</div>
            </div>
        </div>
    );
}
