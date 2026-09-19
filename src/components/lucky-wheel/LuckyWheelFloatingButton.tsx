'use client';

import Link from 'next/link';
import { Gift, Sparkles } from 'lucide-react';

export default function LuckyWheelFloatingButton() {
    return <Link href="/lucky-wheel" aria-label="Mở vòng quay may mắn" className="group fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full border-2 border-white bg-[linear-gradient(135deg,#d9a441,#9c5f2d)] p-2.5 pr-4 text-white shadow-[0_10px_30px_rgba(89,49,16,.38)] transition hover:-translate-y-1 sm:bottom-7 sm:right-7"><span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/20"><Gift size={25}/><Sparkles className="absolute -right-1 -top-1 text-[#fff0a6]" size={14}/></span><span className="hidden text-left sm:block"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#ffe9ac]">Thử vận may</small><strong className="text-sm">Vòng quay Go Nuts</strong></span></Link>;
}
