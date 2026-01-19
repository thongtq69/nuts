'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

const toastIcons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const toastColors = {
    success: {
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: '#fff',
        border: '#059669',
    },
    error: {
        bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: '#fff',
        border: '#dc2626',
    },
    warning: {
        bg: 'linear-gradient(135deg, #9C7043 0%, #7d5a36 100%)',
        icon: '#fff',
        border: '#7d5a36',
    },
    info: {
        bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        icon: '#fff',
        border: '#2563eb',
    },
};

export default function Toast({ id, type, title, message, duration = 4000, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);
    const Icon = toastIcons[type];
    const colors = toastColors[type];

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    }, [id, onClose]);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 50);

        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration, handleClose]);

    return (
        <div
            className={`toast-item ${isExiting ? 'toast-exit' : 'toast-enter'}`}
            style={{
                background: colors.bg,
                borderLeft: `4px solid ${colors.border}`,
            }}
        >
            <div className="toast-content">
                <div className="toast-icon" style={{ color: colors.icon }}>
                    <Icon size={24} />
                </div>
                <div className="toast-text">
                    <p className="toast-title">{title}</p>
                    {message && <p className="toast-message">{message}</p>}
                </div>
                <button className="toast-close" onClick={handleClose}>
                    <X size={18} />
                </button>
            </div>
            <div className="toast-progress-bar">
                <div
                    className="toast-progress"
                    style={{
                        width: `${progress}%`,
                        background: 'rgba(255,255,255,0.4)',
                    }}
                />
            </div>
        </div>
    );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={onClose} />
            ))}
        </div>
    );
}
