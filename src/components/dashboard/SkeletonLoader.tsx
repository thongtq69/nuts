'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
    );
}

export function StatsCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100/50 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>
            <Skeleton className="h-[300px] rounded-xl" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-50">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-5">
                    <Skeleton className="h-6 w-full max-w-[120px]" />
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <Skeleton className="h-6 w-48" />
            </div>
            <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-6 py-5">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 w-full">
            {/* Welcome Banner Skeleton */}
            <Skeleton className="h-48 rounded-3xl" />
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>
            
            {/* Chart & Actions Row Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <ChartSkeleton />
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Table Skeleton */}
            <TableSkeleton rows={3} columns={5} />
        </div>
    );
}

export default Skeleton;
