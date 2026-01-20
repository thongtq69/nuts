'use client';

import React from 'react';
import { MessageSquareText, X } from 'lucide-react';

interface PromptDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    value: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    onChange: (value: string) => void;
}

export default function PromptDialog({
    isOpen,
    title,
    description,
    value,
    placeholder,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    onChange,
}: PromptDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="prompt-dialog-backdrop" onClick={onCancel} role="presentation">
            <div className="prompt-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <div className="prompt-dialog-header">
                    <div className="prompt-dialog-icon">
                        <MessageSquareText size={20} />
                    </div>
                    <div className="prompt-dialog-title">{title}</div>
                    <button className="prompt-dialog-close" onClick={onCancel} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>
                <div className="prompt-dialog-body">
                    <p>{description}</p>
                    <input
                        className="prompt-dialog-input"
                        value={value}
                        placeholder={placeholder}
                        onChange={(event) => onChange(event.target.value)}
                        autoFocus
                    />
                </div>
                <div className="prompt-dialog-actions">
                    <button className="prompt-dialog-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="prompt-dialog-confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
