import React, { SelectHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: Array<{ label: string; value: string | number }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, helperText, options, id, ...props }, ref) => {
        const selectId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={`
                            w-full text-sm rounded-lg border bg-white appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50
                            disabled:bg-slate-50 disabled:text-slate-500
                            pl-3 pr-10 py-2.5
                            ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200 hover:border-slate-300'
                            }
                            ${className}
                        `}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                    </div>
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
