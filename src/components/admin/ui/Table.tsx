'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
    columns,
    data,
    isLoading,
    page = 1,
    totalPages = 1,
    onPageChange,
    emptyMessage = "No data found"
}: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-500 font-medium">Loading data...</div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                    <p>{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                {columns.map((col, index) => (
                                    <td key={index} className={`px-6 py-4 text-slate-600 dark:text-slate-400 ${col.className || ''}`}>
                                        {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && onPageChange && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Page <span className="font-medium text-slate-900 dark:text-slate-200">{page}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => onPageChange(1)}
                            className="w-8 px-0"
                        >
                            <ChevronsLeft size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                            className="w-8 px-0"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="w-8 px-0"
                        >
                            <ChevronRight size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => onPageChange(totalPages)}
                            className="w-8 px-0"
                        >
                            <ChevronsRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
