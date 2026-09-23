'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, Sparkles } from 'lucide-react';

export default function LuckyWheelFloatingButton() {
    const pathname = usePathname();
    if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) return null;

    return <Link href="/lucky-wheel" aria-label="Mở vòng quay may mắn" className="group fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full border-2 border-white bg-[linear-gradient(135deg,#b98143,#70472a)] p-2.5 text-white shadow-[0_10px_26px_rgba(89,49,16,.3)] transition hover:-translate-y-1 sm:bottom-7 sm:right-7 sm:pr-4"><span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/15"><Gift size={24}/><Sparkles className="absolute -right-1 -top-1 text-[#f5dfad]" size={13}/></span><span className="hidden text-left sm:block"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#f5dfad]">Thử vận may</small><strong className="text-sm">Vòng quay Go Nuts</strong></span></Link>;
}
