'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProgressiveListControlsProps {
    total: number;
    visible: number;
    step?: number;
    onVisibleChange: (next: number) => void;
    className?: string;
}

export default function ProgressiveListControls({ total, visible, step = 6, onVisibleChange, className = '' }: ProgressiveListControlsProps) {
    if (total <= step) return null;

    const canShowMore = visible < total;
    const canCollapse = visible > step;

    return <div className={`flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 px-4 py-4 ${className}`}>
        {canShowMore && <button type="button" onClick={() => onVisibleChange(Math.min(total, visible + step))} className="inline-flex items-center gap-1.5 rounded-full border border-[#b98955] bg-white px-4 py-2 text-sm font-bold text-[#80562f] transition hover:bg-[#fff8ef]">
            Xem thêm <span className="text-xs font-medium text-slate-500">({Math.min(step, total - visible)})</span><ChevronDown size={16}/>
        </button>}
        {canCollapse && <button type="button" onClick={() => onVisibleChange(Math.max(step, visible - step))} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
            Thu gọn <ChevronUp size={16}/>
        </button>}
        <span className="w-full text-center text-xs text-slate-400">Đang hiển thị {Math.min(visible, total)}/{total}</span>
    </div>;
}
