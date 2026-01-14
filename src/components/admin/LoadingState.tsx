export default function LoadingState({ message = 'Đang tải...' }: { message?: string }) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-slate-600 font-medium">{message}</div>
            </div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
                <div className="w-24 h-4 bg-slate-200 rounded"></div>
                <div className="w-32 h-8 bg-slate-200 rounded"></div>
                <div className="w-20 h-3 bg-slate-200 rounded"></div>
            </div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
                <div className="w-48 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="divide-y divide-slate-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                            <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                        </div>
                        <div className="w-24 h-8 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
