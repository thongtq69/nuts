import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc' | null;
}

interface SortableHeaderProps {
    label: string;
    sortKey: string;
    currentSort: SortConfig | null;
    onSort: (key: string) => void;
    disabled?: boolean;
    className?: string;
}

export const SortableHeader = ({
    label,
    sortKey,
    currentSort,
    onSort,
    disabled = false,
    className = '',
}: SortableHeaderProps) => {
    const isSorted = currentSort?.key === sortKey;
    const direction = isSorted ? currentSort.direction : null;

    const handleSort = () => {
        if (disabled) return;

        if (isSorted) {
            if (direction === 'asc') {
                onSort(sortKey + ':desc');
            } else if (direction === 'desc') {
                onSort('');
            } else {
                onSort(sortKey);
            }
        } else {
            onSort(sortKey);
        }
    };

    const parseSortKey = (key: string) => {
        const [baseKey, dir] = key.split(':');
        return { key: baseKey, direction: dir as 'asc' | 'desc' | null };
    };

    const renderSortIcon = () => {
        if (disabled) return null;

        if (!isSorted) {
            return <ArrowUpDown size={14} className="text-slate-400" />;
        }

        if (direction === 'asc') {
            return <ArrowUp size={14} className="text-brand" />;
        }

        if (direction === 'desc') {
            return <ArrowDown size={14} className="text-brand" />;
        }

        return <ArrowUpDown size={14} className="text-slate-400" />;
    };

    return (
        <button
            onClick={handleSort}
            disabled={disabled}
            className={`
                flex items-center gap-2 px-3 py-2 font-semibold text-left transition-all
                ${disabled
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-700 hover:text-brand hover:bg-slate-50 active:bg-slate-100 cursor-pointer'
                }
                ${className}
            `}
        >
            <span>{label}</span>
            {renderSortIcon()}
        </button>
    );
};

interface TableHeaderProps {
    columns: Array<{
        key: string;
        label: string;
        sortable?: boolean;
        width?: string;
        className?: string;
    }>;
    sortConfig: SortConfig | null;
    onSort?: (key: string) => void;
}

export const TableHeader = ({
    columns,
    sortConfig,
    onSort,
}: TableHeaderProps) => {
    return (
        <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
                <th className="w-12 px-4 py-3 text-left">
                    <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                </th>

                {columns.map((column) => (
                    <th
                        key={column.key}
                        style={{ width: column.width }}
                        className={`px-4 py-3 text-left ${column.className || ''}`}
                    >
                        {column.sortable && onSort ? (
                            <SortableHeader
                                label={column.label}
                                sortKey={column.key}
                                currentSort={sortConfig}
                                onSort={onSort}
                                className={column.className}
                            />
                        ) : (
                            <span className="px-3 py-2 font-semibold text-slate-700">
                                {column.label}
                            </span>
                        )}
                    </th>
                ))}

                <th className="w-24 px-4 py-3 text-center">
                    <span className="px-3 py-2 font-semibold text-slate-700">
                        Thao tác
                    </span>
                </th>
            </tr>
        </thead>
    );
};

export const useSorting = <T extends Record<string, any>>(
    items: T[],
    initialSort: SortConfig | null = null
) => {
    const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(initialSort);

    const sortItems = React.useMemo(() => {
        if (!sortConfig || !sortConfig.key) {
            return items;
        }

        const sortedItems = [...items];
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'asc' ? 1 : -1;

        sortedItems.sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];

            if (aValue === bValue) return 0;

            if (aValue === null) return 1;
            if (bValue === null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue) * direction;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * direction;
            }

            if (aValue instanceof Date && bValue instanceof Date) {
                return (aValue.getTime() - bValue.getTime()) * direction;
            }

            return 0;
        });

        return sortedItems;
    }, [items, sortConfig]);

    const handleSort = (key: string) => {
        if (key === '') {
            setSortConfig(null);
            return;
        }

        const parsed: SortConfig = key.includes(':')
            ? {
                key: key.split(':')[0],
                direction: key.split(':')[1] as 'asc' | 'desc',
            }
            : {
                key,
                direction: sortConfig?.key === key && sortConfig.direction === 'asc'
                    ? 'desc'
                    : 'asc',
            };

        setSortConfig(parsed);
    };

    return {
        sortedItems: sortItems,
        sortConfig,
        handleSort,
    };
};
