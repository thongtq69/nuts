'use client';

import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
}

type ConfirmHandler = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmHandler | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((nextOptions: ConfirmOptions) => {
        setOptions(nextOptions);
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const handleCancel = useCallback(() => {
        resolverRef.current?.(false);
        resolverRef.current = null;
        setOptions(null);
    }, []);

    const handleConfirm = useCallback(() => {
        resolverRef.current?.(true);
        resolverRef.current = null;
        setOptions(null);
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <ConfirmDialog
                isOpen={Boolean(options)}
                title={options?.title ?? ''}
                description={options?.description ?? ''}
                confirmText={options?.confirmText}
                cancelText={options?.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}
