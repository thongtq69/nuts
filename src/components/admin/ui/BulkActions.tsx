import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Trash2, FileText, Download, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { ConfirmModal } from './ConfirmModal';

export interface BulkAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: (selectedIds: string[]) => void;
    danger?: boolean;
    disabled?: boolean;
    requiresConfirmation?: boolean;
    confirmTitle?: string;
    confirmMessage?: string;
}

interface BulkActionsProps {
    selectedIds: string[];
    totalCount: number;
    actions: BulkAction[];
    onClearSelection: () => void;
    onSelectAll: () => void;
    position?: 'top' | 'bottom' | 'floating';
}

export const BulkActions = ({
    selectedIds,
    totalCount,
    actions,
    onClearSelection,
    onSelectAll,
    position = 'top',
}: BulkActionsProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<BulkAction | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectAll = () => {
        if (selectedIds.length === totalCount) {
            onClearSelection();
        } else {
            onSelectAll();
        }
    };

    const handleActionClick = (action: BulkAction) => {
        setIsDropdownOpen(false);

        if (action.requiresConfirmation && selectedIds.length > 0) {
            setActionToConfirm(action);
        } else if (!action.disabled) {
            action.onClick(selectedIds);
        }
    };

    const handleConfirmAction = () => {
        if (actionToConfirm) {
            actionToConfirm.onClick(selectedIds);
            setActionToConfirm(null);
        }
    };

    const isAllSelected = selectedIds.length === totalCount && totalCount > 0;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < totalCount;
    const hasSelection = selectedIds.length > 0;

    const bulkPositionClasses = {
        top: 'top-0 right-0',
        bottom: 'bottom-0 right-0',
        floating: 'fixed bottom-8 right-8',
    };

    if (!hasSelection) {
        return (
            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${isAllSelected
                            ? 'bg-brand border-brand'
                            : 'border-slate-300 group-hover:border-brand'
                        }
                    `}>
                        {isAllSelected && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-sm text-slate-600">Chọn tất cả</span>
                </label>
            </div>
        );
    }

    return (
        <>
            <div className={`flex items-center gap-4 bg-brand-light/10 px-4 py-3 rounded-lg border border-brand/30 ${bulkPositionClasses[position]}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                    <div
                        onClick={handleSelectAll}
                        className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer
                            ${isAllSelected
                                ? 'bg-brand border-brand'
                                : isSomeSelected
                                    ? 'bg-brand/20 border-brand'
                                    : 'border-slate-300 hover:border-brand'
                            }
                        `}
                    >
                        {isAllSelected && <Check size={14} className="text-white" />}
                        {isSomeSelected && (
                            <div className="w-3 h-1 bg-brand rounded-sm" />
                        )}
                    </div>
                    <span className="text-sm font-semibold text-brand">
                        Đã chọn {selectedIds.length}/{totalCount}
                    </span>
                </label>

                <div className="h-6 w-px bg-brand/30" />

                <div className="relative" ref={dropdownRef}>
                    <Button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <MoreHorizontal size={16} />
                        Thao tác hàng loạt
                        <ChevronDown size={16} />
                    </Button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1">
                            {actions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleActionClick(action)}
                                    disabled={action.disabled}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all
                                        ${action.disabled
                                            ? 'text-slate-400 cursor-not-allowed'
                                            : action.danger
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    <span className="flex-shrink-0">
                                        {action.icon}
                                    </span>
                                    <span className="flex-1 text-left">{action.label}</span>
                                    {action.disabled && (
                                        <span className="text-xs text-slate-400">
                                            ({selectedIds.length} tối đa)
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    onClick={onClearSelection}
                    variant="secondary"
                    size="sm"
                >
                    Bỏ chọn
                </Button>
            </div>

            {actionToConfirm && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setActionToConfirm(null)}
                    onConfirm={handleConfirmAction}
                    title={actionToConfirm.confirmTitle || 'Xác nhận thao tác'}
                    message={
                        actionToConfirm.confirmMessage ||
                        `Bạn có chắc chắn muốn thực hiện hành động "${actionToConfirm.label}" cho ${selectedIds.length} mục đã chọn?`
                    }
                    confirmText="Xác nhận"
                    cancelText="Hủy"
                    variant="danger"
                />
            )}
        </>
    );
};

interface BulkActionToolbarProps {
    selectedIds: string[];
    totalCount: number;
    actions: BulkAction[];
    onClearSelection: () => void;
    onSelectAll: () => void;
}

export const BulkActionToolbar = ({
    selectedIds,
    totalCount,
    actions,
    onClearSelection,
    onSelectAll,
}: BulkActionToolbarProps) => {
    if (selectedIds.length === 0) {
        return null;
    }

    return (
        <div className="bg-brand/5 border-b border-brand/20 px-6 py-3 flex items-center justify-between sticky top-16 z-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-brand">
                    Đã chọn {selectedIds.length} mục
                </span>

                <div className="flex items-center gap-2">
                    {actions.map((action) => (
                        <Button
                            key={action.id}
                            onClick={() => action.onClick(selectedIds)}
                            variant={action.danger ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={action.disabled}
                            className={action.danger ? 'text-red-600 hover:text-red-700' : ''}
                        >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <Button
                onClick={onClearSelection}
                variant="secondary"
                size="sm"
            >
                Bỏ chọn
            </Button>
        </div>
    );
};

export const BulkActionItem = ({
    children,
    onClick,
    disabled = false,
    danger = false,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all
                ${disabled
                    ? 'text-slate-400 cursor-not-allowed'
                    : danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-700 hover:bg-slate-100'
                }
            `}
        >
            {children}
        </button>
    );
};
