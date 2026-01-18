import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    showHome?: boolean;
    homeHref?: string;
}

export const Breadcrumbs = ({
    items,
    separator = <ChevronRight size={16} className="text-slate-400" />,
    showHome = true,
    homeHref = '/admin',
}: BreadcrumbsProps) => {
    return (
        <nav className="flex items-center gap-2 px-6 py-4 bg-white border-b border-slate-200 text-sm" aria-label="Breadcrumbs">
            {showHome && (
                <Link
                    href={homeHref}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand transition-colors"
                >
                    <Home size={18} />
                    <span className="font-medium">Trang chủ</span>
                </Link>
            )}

            {showHome && items.length > 0 && (
                <span className="text-slate-400">{separator}</span>
            )}

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const key = `${item.label}-${index}`;

                return (
                    <React.Fragment key={key}>
                        {item.href ? (
                            <Link
                                href={item.href}
                                className={`flex items-center gap-2 text-slate-600 hover:text-brand transition-colors ${
                                    isLast ? 'font-semibold text-brand' : 'hover:underline'
                                }`}
                            >
                                {item.icon && (
                                    <span className="text-slate-500">
                                        {item.icon}
                                    </span>
                                )}
                                <span className={isLast ? 'max-w-xs truncate' : ''}>
                                    {item.label}
                                </span>
                            </Link>
                        ) : (
                            <span className={`flex items-center gap-2 text-slate-600 ${
                                isLast ? 'font-semibold text-brand' : ''
                            }`}>
                                {item.icon && (
                                    <span className="text-slate-500">
                                        {item.icon}
                                    </span>
                                )}
                                <span className={isLast ? 'max-w-xs truncate' : ''}>
                                    {item.label}
                                </span>
                            </span>
                        )}

                        {!isLast && (
                            <span className="text-slate-400">{separator}</span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

interface BreadcrumbListProps {
    items: BreadcrumbItem[];
}

export const BreadcrumbList = ({ items }: BreadcrumbListProps) => {
    return (
        <nav className="bg-slate-50 border-b border-slate-200" aria-label="Breadcrumbs">
            <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <li className="flex items-center gap-2 text-sm">
                    <a
                        href="/admin"
                        className="flex items-center gap-2 text-slate-600 hover:text-brand transition-colors"
                    >
                        <Home size={16} />
                        <span>Admin</span>
                    </a>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const key = `${item.label}-${index}`;

                    return (
                        <li
                            key={key}
                            className="flex items-center gap-2 text-sm"
                        >
                            <ChevronRight size={16} className="text-slate-400" />

                            {item.href ? (
                                <a
                                    href={item.href}
                                    className={`flex items-center gap-2 text-slate-600 hover:text-brand transition-colors ${
                                        isLast ? 'font-semibold text-brand' : 'hover:underline'
                                    }`}
                                >
                                    {item.icon && (
                                        <span className="text-slate-500">
                                            {item.icon}
                                        </span>
                                    )}
                                    <span>{item.label}</span>
                                </a>
                            ) : (
                                <span
                                    aria-current={isLast ? 'page' : undefined}
                                    className={`flex items-center gap-2 text-slate-600 ${
                                        isLast ? 'font-semibold text-brand' : ''
                                    }`}
                                >
                                    {item.icon && (
                                        <span className="text-slate-500">
                                            {item.icon}
                                        </span>
                                    )}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
