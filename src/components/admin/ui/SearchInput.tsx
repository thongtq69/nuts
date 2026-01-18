import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    isLoading?: boolean;
    onClear?: () => void;
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
}

export const SearchInput = ({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    debounceMs = 300,
    isLoading = false,
    onClear,
    disabled = false,
    autoFocus = false,
    className = '',
}: SearchInputProps) => {
    const [localValue, setLocalValue] = useState(value);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleInputChange = (newValue: string) => {
        setLocalValue(newValue);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
        if (onClear) {
            onClear();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <Input
                type="text"
                value={localValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled || isLoading}
                autoFocus={autoFocus}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10"
            />

            {(localValue || isLoading) && (
                <button
                    onClick={handleClear}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <X size={16} className="text-slate-400" />
                    )}
                </button>
            )}
        </div>
    );
};

export const AdvancedSearch = ({
    filters,
    onFilterChange,
    onReset,
}: {
    filters: { [key: string]: string | number | boolean };
    onFilterChange: (key: string, value: string | number | boolean) => void;
    onReset: () => void;
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(filters).map(([key, value]) => {
                    if (typeof value === 'boolean') {
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`filter-${key}`}
                                    checked={value as boolean}
                                    onChange={(e) => onFilterChange(key, e.target.checked)}
                                    className="w-4 h-4 text-brand focus:ring-brand rounded border-slate-300"
                                />
                                <label
                                    htmlFor={`filter-${key}`}
                                    className="text-sm font-medium text-slate-700 cursor-pointer"
                                >
                                    {key}
                                </label>
                            </div>
                        );
                    }

                    return (
                        <div key={key} className="flex flex-col gap-1">
                            <label
                                htmlFor={`filter-${key}`}
                                className="text-sm font-medium text-slate-700"
                            >
                                {key}
                            </label>
                            <input
                                type="text"
                                id={`filter-${key}`}
                                value={value as string}
                                onChange={(e) => onFilterChange(key, e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                            />
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200">
                <button
                    onClick={onReset}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
                >
                    Đặt lại
                </button>
                <button
                    onClick={() => onFilterChange('search', true)}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-medium text-sm transition-colors"
                >
                    Tìm kiếm
                </button>
            </div>
        </div>
    );
};
