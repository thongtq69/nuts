'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, Sparkles } from 'lucide-react';

export default function LuckyWheelFloatingButton() {
    const pathname = usePathname();
    if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) return null;

    return <Link href="/lucky-wheel" aria-label="Mở bánh xe quà tặng" className="group fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full border-2 border-white bg-[linear-gradient(135deg,#5ac3dc,#49aece)] p-2.5 text-white shadow-[0_8px_0_#3188a6,0_14px_28px_rgba(49,136,166,.24)] transition hover:-translate-y-1 sm:bottom-7 sm:right-7 sm:pr-4"><span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#fff4ae] text-[#da8e1b]"><Gift size={24}/><Sparkles className="absolute -right-1 -top-1 text-[#ffe27a]" size={13}/></span><span className="hidden text-left sm:block"><small className="block text-[10px] font-bold uppercase tracking-widest text-[#e9fbff]">Mở quà vui</small><strong className="text-sm">Bánh xe GO NUTS</strong></span></Link>;
}
