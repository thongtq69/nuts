import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Icon className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
            {description && (
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">{description}</p>
            )}
            {action && (
                <a
                    href={action.href}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                    {action.label}
                </a>
            )}
        </div>
    );
}
