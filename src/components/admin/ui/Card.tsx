import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', children, noPadding = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-xl border border-slate-200 shadow-sm ${!noPadding ? 'p-6' : ''} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
