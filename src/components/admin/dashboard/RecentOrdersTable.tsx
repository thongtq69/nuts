'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import Link from 'next/link';

interface Order {
    _id: string;
    user?: { name: string; email: string };
    totalAmount: number;
    status: string;
    createdAt: string;
    id: string; // for compatibility with generic Table
}

export function RecentOrdersTable({ orders }: { orders: any[] }) {
    // Transform data to match Table requirements
    const formattedOrders: Order[] = orders.map(order => ({
        ...order,
        id: order._id.toString(),
        createdAt: new Date(order.createdAt).toLocaleDateString('vi-VN'),
    }));

    const getStatusVariant = (status: string) => {
        const variants: Record<string, any> = {
            pending: 'warning',
            paid: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        return variants[status] || 'default';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Chờ xử lý',
            paid: 'Đã thanh toán',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    const columns = [
        {
            header: 'Mã đơn',
            accessorKey: '_id',
            cell: (row: Order) => <span className="font-medium text-slate-900 dark:text-slate-200">#{row._id.toString().slice(-8)}</span>
        },
        {
            header: 'Khách hàng',
            cell: (row: Order) => (
                <div>
                    <div className="font-medium text-slate-900 dark:text-slate-200">{row.user?.name || 'Khách vãng lai'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{row.user?.email}</div>
                </div>
            )
        },
        {
            header: 'Ngày đặt',
            accessorKey: 'createdAt',
        },
        {
            header: 'Tổng tiền',
            cell: (row: Order) => <span className="font-bold text-slate-900 dark:text-slate-200">{row.totalAmount?.toLocaleString('vi-VN')} đ</span>
        },
        {
            header: 'Trạng thái',
            cell: (row: Order) => (
                <Badge variant={getStatusVariant(row.status)}>
                    {getStatusLabel(row.status)}
                </Badge>
            )
        }
    ];

    return (
        <Card noPadding className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Đơn hàng gần đây</h3>
                <Link href="/admin/orders" className="text-sm font-medium text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400">
                    Xem tất cả →
                </Link>
            </div>
            <Table
                columns={columns as any}
                data={formattedOrders}
                emptyMessage="Chưa có đơn hàng nào"
            />
        </Card>
    );
}
