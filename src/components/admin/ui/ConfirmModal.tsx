import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: AlertTriangle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-100',
            confirmColor: 'bg-red-500 hover:bg-red-600 text-white',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-brand',
            iconBg: 'bg-brand/20',
            confirmColor: 'bg-brand hover:bg-brand-dark text-white',
        },
        info: {
            icon: AlertTriangle,
            iconColor: 'text-brand',
            iconBg: 'bg-brand/20',
            confirmColor: 'bg-brand hover:bg-brand-dark text-white',
        },
    };

    const { icon: Icon, iconColor, iconBg, confirmColor } = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col transform transition-all scale-100 opacity-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Icon size={20} className={iconColor} />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-700 text-base leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={confirmColor}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
