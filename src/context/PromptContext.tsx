'use client';

import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import PromptDialog from '@/components/common/PromptDialog';

interface PromptOptions {
    title: string;
    description: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    defaultValue?: string;
}

type PromptHandler = (options: PromptOptions) => Promise<string | null>;

const PromptContext = createContext<PromptHandler | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<PromptOptions | null>(null);
    const [value, setValue] = useState('');
    const resolverRef = useRef<((value: string | null) => void) | null>(null);

    const prompt = useCallback((nextOptions: PromptOptions) => {
        setOptions(nextOptions);
        setValue(nextOptions.defaultValue ?? '');
        return new Promise<string | null>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const handleCancel = useCallback(() => {
        resolverRef.current?.(null);
        resolverRef.current = null;
        setOptions(null);
    }, []);

    const handleConfirm = useCallback(() => {
        resolverRef.current?.(value);
        resolverRef.current = null;
        setOptions(null);
    }, [value]);

    return (
        <PromptContext.Provider value={prompt}>
            {children}
            <PromptDialog
                isOpen={Boolean(options)}
                title={options?.title ?? ''}
                description={options?.description ?? ''}
                placeholder={options?.placeholder}
                confirmText={options?.confirmText}
                cancelText={options?.cancelText}
                value={value}
                onChange={setValue}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </PromptContext.Provider>
    );
}

export function usePrompt() {
    const context = useContext(PromptContext);
    if (!context) {
        throw new Error('usePrompt must be used within a PromptProvider');
    }
    return context;
}
