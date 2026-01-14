import React, { TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = '', label, error, helperText, id, rows = 4, ...props }, ref) => {
        const textareaId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    ref={ref}
                    rows={rows}
                    className={`
                        w-full text-sm rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50
                        disabled:bg-slate-50 disabled:text-slate-500
                        px-3 py-2.5
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200 hover:border-slate-300'
                        }
                        ${className}
                    `}
                    {...props}
                />
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

Textarea.displayName = 'Textarea';
