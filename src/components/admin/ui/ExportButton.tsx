import React, { useState } from 'react';
import { Download, FileText, Table, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { ConfirmModal } from './ConfirmModal';

export interface ExportColumn<T = any> {
    key: keyof T;
    label: string;
    format?: (value: any) => string;
}

export interface ExportOptions<T = any> {
    data: T[];
    columns: ExportColumn<T>[];
    filename?: string;
    format?: 'csv' | 'excel';
}

interface ExportButtonProps<T = any> {
    data: T[];
    columns: ExportColumn<T>[];
    filename?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export const ExportButton = <T extends Record<string, any>>({
    data,
    columns,
    filename = 'export',
    disabled = false,
    isLoading = false,
    className = '',
}: ExportButtonProps<T>) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');

    const handleExport = (format: 'csv' | 'excel') => {
        const options: ExportOptions<T> = {
            data,
            columns,
            filename,
            format,
        };

        if (format === 'csv') {
            exportToCSV(options);
        } else {
            exportToExcel(options);
        }

        setShowExportModal(false);
    };

    return (
        <>
            <Button
                onClick={() => setShowExportModal(true)}
                disabled={disabled || isLoading || data.length === 0}
                variant="secondary"
                className={className}
            >
                {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Download size={18} />
                )}
                <span className="ml-2">Xuất dữ liệu</span>
            </Button>

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowExportModal(false)}
                    />

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Chọn định dạng xuất dữ liệu
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => handleExport('csv')}
                                className="flex flex-col items-center gap-3 p-6 border-2 border-slate-200 rounded-lg hover:border-brand hover:bg-brand/5 transition-all"
                            >
                                <div className="p-3 bg-brand/20 rounded-lg">
                                    <FileText size={32} className="text-brand" />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-slate-900">CSV</div>
                                    <div className="text-sm text-slate-600">
                                        Dạng văn bản, dễ chia sẻ
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleExport('excel')}
                                className="flex flex-col items-center gap-3 p-6 border-2 border-slate-200 rounded-lg hover:border-brand hover:bg-brand/5 transition-all"
                            >
                                <div className="p-3 bg-brand/20 rounded-lg">
                                    <Table size={32} className="text-brand" />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-slate-900">Excel</div>
                                    <div className="text-sm text-slate-600">
                                        Có định dạng, dễ xem
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                                Số bản ghi: <span className="font-semibold text-brand">{data.length}</span>
                            </div>

                            <Button
                                onClick={() => setShowExportModal(false)}
                                variant="secondary"
                                size="sm"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

interface BulkExportProps {
    selectedIds: string[];
    totalCount: number;
    onExport: (format: 'csv' | 'excel', selectedOnly: boolean) => void;
    disabled?: boolean;
    isLoading?: boolean;
}

export const BulkExport = ({
    selectedIds,
    totalCount,
    onExport,
    disabled = false,
    isLoading = false,
}: BulkExportProps) => {
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
    const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');

    const handleExport = () => {
        onExport(exportFormat, exportScope === 'selected');
        setShowExportModal(false);
    };

    return (
        <>
            <button
                onClick={() => setShowExportModal(true)}
                disabled={disabled || isLoading || totalCount === 0}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xuất dữ liệu"
            >
                {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-slate-600" />
                ) : (
                    <Download size={18} className="text-slate-600" />
                )}
            </button>

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowExportModal(false)}
                    />

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Xuất dữ liệu
                            </h3>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-600" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phạm vi
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setExportScope('all')}
                                        className={`p-3 border-2 rounded-lg text-left transition-all ${
                                            exportScope === 'all'
                                                ? 'border-brand bg-brand/5'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="font-medium text-slate-900">Tất cả</div>
                                        <div className="text-sm text-slate-600">
                                            {totalCount} bản ghi
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setExportScope('selected')}
                                        disabled={selectedIds.length === 0}
                                        className={`p-3 border-2 rounded-lg text-left transition-all ${
                                            exportScope === 'selected'
                                                ? 'border-brand bg-brand/5'
                                                : 'border-slate-200 hover:border-slate-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className="font-medium text-slate-900">Đã chọn</div>
                                        <div className="text-sm text-slate-600">
                                            {selectedIds.length} bản ghi
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Định dạng
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setExportFormat('csv')}
                                        className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                                            exportFormat === 'csv'
                                                ? 'border-brand bg-brand/5'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText size={20} className={exportFormat === 'csv' ? 'text-brand' : 'text-slate-400'} />
                                            <span className="font-medium">CSV</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setExportFormat('excel')}
                                        className={`flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                                            exportFormat === 'excel'
                                                ? 'border-brand bg-brand/5'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Table size={20} className={exportFormat === 'excel' ? 'text-brand' : 'text-slate-400'} />
                                            <span className="font-medium">Excel</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                            <Button
                                onClick={() => setShowExportModal(false)}
                                variant="secondary"
                                size="sm"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleExport}
                                disabled={exportScope === 'selected' && selectedIds.length === 0}
                            >
                                Xuất dữ liệu
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const exportToCSV = <T extends Record<string, any>>(options: ExportOptions<T>) => {
    const { data, columns, filename = 'export' } = options;

    const headers = columns.map(col => col.label).join(',');

    const rows = data.map(row =>
        columns.map(col => {
            const value = row[col.key as string];
            const formattedValue = col.format ? col.format(value) : value ?? '';

            return `"${String(formattedValue).replace(/"/g, '""')}"`;
        }).join(',')
    );

    const csv = [headers, ...rows].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToExcel = <T extends Record<string, any>>(options: ExportOptions<T>) => {
    const { data, columns, filename = 'export' } = options;

    const headers = columns.map(col => `<th>${col.label}</th>`).join('');

    const rows = data.map(row =>
        columns.map(col => {
            const value = row[col.key as string];
            const formattedValue = col.format ? col.format(value) : value ?? '';

            return `<td>${formattedValue}</td>`;
        }).join('')
    );

    const table = `
        <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows.map(r => `<tr>${r}</tr>`).join('')}</tbody>
        </table>
    `;

    const html = `
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    table { border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; font-weight: bold; }
                </style>
            </head>
            <body>
                ${table}
            </body>
        </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
