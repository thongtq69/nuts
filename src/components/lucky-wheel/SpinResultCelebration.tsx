import type { CSSProperties } from 'react';
import { Gift, PartyPopper, Sparkles, X } from 'lucide-react';

interface SpinResultCelebrationProps {
    prize: number;
    isTest: boolean;
    onClose: () => void;
}

const colors = ['#f6bd4b', '#e96f65', '#73a9d8', '#8bbd75', '#b68ad6', '#ffffff'];
const confetti = Array.from({ length: 56 }, (_, index) => ({
    left: (index * 37) % 100,
    delay: (index % 14) * 0.08,
    duration: 2.1 + (index % 7) * 0.14,
    color: colors[index % colors.length],
    rotate: (index * 67) % 360,
}));
const sparks = Array.from({ length: 14 }, (_, index) => index * (360 / 14));
const fireworks = [
    { left: '12%', top: '25%', delay: '0s', color: '#ffd86e', size: 1.05 },
    { left: '87%', top: '21%', delay: '.18s', color: '#ff7a70', size: .9 },
    { left: '25%', top: '68%', delay: '.48s', color: '#7cc7ff', size: .78 },
    { left: '78%', top: '72%', delay: '.72s', color: '#9bea7f', size: 1.05 },
    { left: '50%', top: '14%', delay: '.95s', color: '#d9a9ff', size: .72 },
    { left: '8%', top: '82%', delay: '1.18s', color: '#ffba62', size: .68 },
    { left: '92%', top: '84%', delay: '1.42s', color: '#fff18a', size: .7 },
];

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

function Firework({ left, top, delay, color, size }: { left: string; top: string; delay: string; color: string; size: number }) {
    return <span className="firework" style={{ left, top, '--firework-delay': delay, '--firework-color': color, '--firework-size': size } as CSSProperties}>
        {sparks.map(angle => <i key={angle} style={{ '--spark-angle': `${angle}deg` } as CSSProperties} />)}
    </span>;
}

export default function SpinResultCelebration({ prize, isTest, onClose }: SpinResultCelebrationProps) {
    const won = prize > 0;
    return <div className="fixed inset-0 z-[140] grid place-items-center overflow-hidden bg-[#160f0a]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="spin-result-title">
        {won && <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="celebration-glow" />
            {fireworks.map(item => <Firework key={`${item.left}-${item.top}`} {...item} />)}
            {confetti.map((item, index) => <i key={index} className="confetti" style={{ left: `${item.left}%`, backgroundColor: item.color, animationDelay: `${item.delay}s`, animationDuration: `${item.duration}s`, transform: `rotate(${item.rotate}deg)` }} />)}
        </div>}

        <div className="result-card relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(160deg,#fffdf7,#fff4d8)] p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,.45)] sm:p-10">
            <button onClick={onClose} aria-label="Đóng kết quả" className="absolute right-4 top-4 z-10 rounded-full bg-black/5 p-2 text-[#5e432c] transition hover:bg-black/10"><X size={20}/></button>
            <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_50%_0%,rgba(246,189,75,.35),transparent_72%)]" />
            <div className={`relative mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-white shadow-xl ${won ? 'bg-[linear-gradient(145deg,#ffd86e,#c9872f)] text-white' : 'bg-[linear-gradient(145deg,#f4eadc,#d7bea1)] text-[#755232]'}`}>
                {won ? <PartyPopper size={44}/> : <Gift size={42}/>} 
                {won && <Sparkles className="absolute -right-3 -top-2 animate-pulse text-[#d49732]" size={28}/>} 
            </div>
            <p className="relative mt-5 text-xs font-black uppercase tracking-[.28em] text-[#a46c2f]">Kết quả vòng quay</p>
            <h2 id="spin-result-title" className="relative mt-2 text-3xl font-black text-[#302218]">{won ? 'Chúc mừng!' : 'Chúc bạn may mắn!'}</h2>
            {won ? <><p className="relative mt-4 text-sm font-semibold text-[#7b6048]">Bạn đã quay trúng</p><p className="prize-glow relative mt-1 text-5xl font-black tracking-tight text-[#b56e20] sm:text-6xl">{money(prize)}</p></> : <p className="relative mx-auto mt-4 max-w-xs text-base leading-7 text-[#7b6048]">Chưa có phần thưởng ở lượt này. Chúc bạn gặp nhiều may mắn ở lượt quay tiếp theo!</p>}
            <div className={`relative mt-6 rounded-2xl border p-3 text-sm font-semibold ${isTest ? 'border-blue-200 bg-blue-50 text-blue-800' : won ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                {isTest ? 'Đây là lượt TEST Admin — không trừ lượt và không cộng tiền thật.' : won ? 'Tiền thưởng đã được cộng vào số dư của bạn.' : 'Kết quả đã được lưu trong lịch sử vòng quay.'}
            </div>
            <button onClick={onClose} className="relative mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#3b291c,#1f1711)] px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">Quay tiếp</button>
        </div>

        <style jsx>{`
            .result-card { animation: result-pop .48s cubic-bezier(.2,.9,.25,1.2) both; }
            .prize-glow { animation: prize-pulse 1.15s ease-in-out infinite alternate; text-shadow: 0 8px 28px rgba(181,110,32,.25); }
            .celebration-glow { position: absolute; inset: 0; background: radial-gradient(circle at 50% 46%, rgba(255,210,93,.22), transparent 33%); animation: celebration-glow 1.3s ease-in-out infinite alternate; }
            .confetti { position: absolute; top: -8%; width: 9px; height: 18px; border-radius: 2px; opacity: 0; animation-name: confetti-fall; animation-timing-function: cubic-bezier(.15,.75,.35,1); animation-iteration-count: 3; }
            .firework { position: absolute; width: 8px; height: 8px; scale: var(--firework-size); animation: firework-flash 1.55s ease-out var(--firework-delay) 3 both; }
            .firework::after { content: ''; position: absolute; inset: -5px; border-radius: 999px; background: var(--firework-color); box-shadow: 0 0 20px 6px var(--firework-color); animation: firework-core 1.55s ease-out var(--firework-delay) 3 both; }
            .firework i { position: absolute; left: 50%; top: 50%; width: 4px; height: 22px; border-radius: 999px; background: linear-gradient(to bottom,var(--firework-color),rgba(255,255,255,.9),transparent); transform-origin: 50% 0; animation: spark-burst 1.55s ease-out var(--firework-delay) 3 both; transform: rotate(var(--spark-angle)); filter: drop-shadow(0 0 5px var(--firework-color)); }
            @keyframes result-pop { from { opacity: 0; transform: translateY(24px) scale(.82); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes prize-pulse { from { transform: scale(.98); } to { transform: scale(1.035); } }
            @keyframes confetti-fall { 0% { opacity: 0; translate: 0 -20px; rotate: 0deg; } 12% { opacity: 1; } 100% { opacity: .9; translate: 45px 112vh; rotate: 760deg; } }
            @keyframes celebration-glow { from { opacity: .45; scale: .92; } to { opacity: 1; scale: 1.08; } }
            @keyframes firework-flash { 0%, 8% { opacity: 0; } 16%, 68% { opacity: 1; } 100% { opacity: 0; } }
            @keyframes firework-core { 0%, 10% { opacity: 0; scale: .1; } 16% { opacity: 1; scale: 1; } 38%, 100% { opacity: 0; scale: 2.5; } }
            @keyframes spark-burst { 0%, 10% { height: 3px; translate: 0 0; opacity: 0; } 17% { opacity: 1; } 72% { opacity: .95; } 100% { height: 2px; translate: 0 -118px; opacity: 0; } }
            @media (max-width: 640px) { .firework { scale: .65; } }
            @media (prefers-reduced-motion: reduce) { .result-card, .prize-glow, .confetti, .firework, .firework::after, .firework i, .celebration-glow { animation: none !important; } }
        `}</style>
    </div>;
}
