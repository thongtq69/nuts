import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
    showTotalRecords?: boolean;
    isLoading?: boolean;
}

export const Pagination = ({
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
    showPageSizeSelector = true,
    showTotalRecords = true,
    isLoading = false,
}: PaginationProps) => {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const handlePrevious = () => {
        if (currentPage > 1 && !isLoading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !isLoading) {
            onPageChange(currentPage + 1);
        }
    };

    const handleFirst = () => {
        if (currentPage > 1 && !isLoading) {
            onPageChange(1);
        }
    };

    const handleLast = () => {
        if (currentPage < totalPages && !isLoading) {
            onPageChange(totalPages);
        }
    };

    const handlePageClick = (page: number) => {
        if (page !== currentPage && !isLoading) {
            onPageChange(page);
        }
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value);
        if (onPageSizeChange && !isNaN(newSize)) {
            onPageSizeChange(newSize);
        }
    };

    const pageNumbers = getPageNumbers();
    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-4">
                {showTotalRecords && (
                    <div className="text-sm text-slate-600">
                        Hiển thị{' '}
                        <span className="font-semibold text-brand">{startRecord}</span>
                        {' '}đến{' '}
                        <span className="font-semibold text-brand">{endRecord}</span>
                        {' '}trong{' '}
                        <span className="font-semibold text-brand">{totalRecords.toLocaleString()}</span>
                        {' '}bản ghi
                    </div>
                )}

                {showPageSizeSelector && onPageSizeChange && (
                    <div className="flex items-center gap-2">
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            disabled={isLoading}
                            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}/trang
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleFirst}
                        disabled={currentPage === 1 || isLoading}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Trang đầu"
                    >
                        <ChevronsLeft size={16} />
                    </button>

                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1 || isLoading}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Trang trước"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`dots-${index}`}
                                    className="px-3 py-2 text-slate-400"
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page as number)}
                                disabled={isLoading}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                                    ${currentPage === page
                                        ? 'bg-brand text-white'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages || isLoading}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Trang sau"
                    >
                        <ChevronRight size={16} />
                    </button>

                    <button
                        onClick={handleLast}
                        disabled={currentPage === totalPages || isLoading}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Trang cuối"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
