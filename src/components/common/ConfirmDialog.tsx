'use client';

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    isLoading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="confirm-dialog-backdrop" onClick={onCancel} role="presentation">
            <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="confirm-dialog-header">
                    <div className="confirm-dialog-icon">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="confirm-dialog-title">{title}</div>
                    <button className="confirm-dialog-close" onClick={onCancel} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>
                <div className="confirm-dialog-body">
                    <p>{description}</p>
                </div>
                <div className="confirm-dialog-actions">
                    <button className="confirm-dialog-cancel" onClick={onCancel} disabled={isLoading}>
                        {cancelText}
                    </button>
                    <button className="confirm-dialog-confirm" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Đang xử lý...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
