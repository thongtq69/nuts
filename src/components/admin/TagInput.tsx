'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Tag, X, Plus, Search } from 'lucide-react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
    'best-seller',
    'new',
    'promo',
    'hot',
    'khuyến-mãi',
    'bán-chạy',
    'hạt-dinh-dưỡng',
    'trái-cây-sấy',
    'đặc-sản',
    'hữu-cơ'
];

export default function TagInput({ value = [], onChange, suggestions = DEFAULT_SUGGESTIONS }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter suggestions based on input and already selected tags
    const filteredSuggestions = suggestions.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
    );

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase();
        if (trimmedTag && !value.includes(trimmedTag)) {
            onChange([...value, trimmedTag]);
        }
        setInputValue('');
        setIsMenuOpen(false);
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value[value.length - 1]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="min-h-[52px] w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all flex flex-wrap gap-2 items-center"
                onClick={() => inputRef.current?.focus()}
            >
                <Tag className="absolute left-4 top-[18px] h-4 w-4 text-slate-400" />

                {value.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand/10 text-brand-dark text-sm font-medium rounded-lg border border-brand/20 group"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                            }}
                            className="hover:bg-brand/20 rounded-md p-0.5 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsMenuOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsMenuOpen(true)}
                    placeholder={value.length === 0 ? "Nhấn để chọn hoặc nhập tag..." : ""}
                    className="flex-1 bg-transparent border-none outline-none min-w-[120px] py-1 text-sm"
                />
            </div>

            {/* Suggestions Menu */}
            {isMenuOpen && (filteredSuggestions.length > 0 || (inputValue.trim() && !value.includes(inputValue.trim().toLowerCase()))) && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 max-h-60 overflow-y-auto">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Gợi ý tags
                        </div>
                        {filteredSuggestions.map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => addTag(suggestion)}
                                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-brand/5 hover:text-brand rounded-lg transition-colors flex items-center justify-between group"
                            >
                                {suggestion}
                                <Plus className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}

                        {inputValue.trim() && !filteredSuggestions.includes(inputValue.trim().toLowerCase()) && !value.includes(inputValue.trim().toLowerCase()) && (
                            <button
                                type="button"
                                onClick={() => addTag(inputValue)}
                                className="w-full text-left px-3 py-2.5 text-sm text-brand font-medium hover:bg-brand/5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm mới: "{inputValue.trim()}"
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
