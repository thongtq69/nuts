'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const data = [
    { name: 'T1', revenue: 4000 },
    { name: 'T2', revenue: 3000 },
    { name: 'T3', revenue: 2000 },
    { name: 'T4', revenue: 2780 },
    { name: 'T5', revenue: 1890 },
    { name: 'T6', revenue: 2390 },
    { name: 'T7', revenue: 3490 },
    { name: 'T8', revenue: 4000 },
    { name: 'T9', revenue: 3000 },
    { name: 'T10', revenue: 2000 },
    { name: 'T11', revenue: 2780 },
    { name: 'T12', revenue: 3890 },
];

const productData = [
    { name: 'Hạt Điều', sales: 400 },
    { name: 'Hạnh Nhân', sales: 300 },
    { name: 'Mắc Ca', sales: 300 },
    { name: 'Óc Chó', sales: 200 },
];

const statusData = [
    { name: 'Hoàn thành', value: 400, color: '#059669' },
    { name: 'Chờ xử lý', value: 300, color: '#d97706' },
    { name: 'Hủy', value: 100, color: '#dc2626' },
];

export function RevenueChart({ data }: { data: any[] }) {
    return (
        <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Doanh thu theo thời gian</h3>
                <select className="text-sm border-none bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer focus:outline-none">
                    <option>7 ngày qua</option>
                    <option>Tháng này</option>
                    <option>Năm nay</option>
                </select>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
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
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--tooltip-bg, #fff)',
                                borderRadius: '8px',
                                border: '1px solid var(--tooltip-border, #e2e8f0)',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: 'var(--tooltip-text, #0f172a)', fontWeight: 600 }}
                            formatter={(value: any) => [`${value?.toLocaleString()} đ`, 'Doanh thu']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export function TopProductsChart({ data }: { data: any[] }) {
    return (
        <Card className="h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6">Top sản phẩm bán chạy</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--tooltip-cursor, #f1f5f9)' }}
                            contentStyle={{
                                backgroundColor: 'var(--tooltip-bg, #fff)',
                                borderRadius: '8px',
                                border: '1px solid var(--tooltip-border, #e2e8f0)'
                            }}
                            itemStyle={{ color: 'var(--tooltip-text, #0f172a)' }}
                        />
                        <Bar dataKey="sales" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export function OrderStatusChart({ data, total }: { data: any[], total: number }) {
    return (
        <Card className="h-full">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6">Trạng thái đơn hàng</h3>
            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--tooltip-bg, #fff)',
                                borderRadius: '8px',
                                border: '1px solid var(--tooltip-border, #e2e8f0)'
                            }}
                            itemStyle={{ color: 'var(--tooltip-text, #0f172a)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">{total}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng đơn</div>
                </div>
            </div>
        </Card>
    );
}
