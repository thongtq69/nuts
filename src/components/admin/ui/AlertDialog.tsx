import React from 'react';
import { X, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    type?: 'info' | 'warning' | 'success' | 'error';
    actionText?: string;
    onAction?: () => void;
    isLoading?: boolean;
}

export const AlertDialog = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    actionText,
    onAction,
    isLoading = false,
}: AlertDialogProps) => {
    if (!isOpen) return null;

    const typeConfig = {
        info: {
            icon: Info,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-100',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-brand',
            iconBg: 'bg-brand/20',
            bgColor: 'bg-brand/10',
            borderColor: 'border-brand/30',
        },
        success: {
            icon: CheckCircle,
            iconColor: 'text-emerald-500',
            iconBg: 'bg-emerald-100',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
        },
        error: {
            icon: XCircle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-100',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
        },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={`relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all scale-100 opacity-100 border-2 ${config.borderColor}`}>
                <div className={`flex items-center justify-between px-6 py-4 border-b ${config.borderColor} bg-white`}>
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${config.iconBg}`}>
                            <Icon size={20} className={config.iconColor} />
                        </div>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {message && (
                    <div className={`p-6 ${config.bgColor}`}>
                        <p className="text-slate-700 text-base leading-relaxed">
                            {message}
                        </p>
                    </div>
                )}

                <div className="px-6 py-4 bg-white rounded-b-xl flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        disabled={isLoading}
                    >
                        Đóng
                    </Button>
                    {actionText && onAction && (
                        <Button
                            onClick={onAction}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : actionText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
