import { ReactNode } from 'react';

interface AdminCardProps {
    title?: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
    noPadding?: boolean;
}

export default function AdminCard({ 
    title, 
    children, 
    className = '', 
    headerAction,
    noPadding = false 
}: AdminCardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
            {title && (
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                        {headerAction}
                    </div>
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}
