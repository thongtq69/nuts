import { useEffect, useRef } from 'react';
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
const fireworkColors = ['#ffd866', '#ff766f', '#73c8ff', '#8bea7e', '#d7a0ff', '#ffad5c', '#fff28a'];

const money = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

interface FireworkParticle {
    x: number;
    y: number;
    previousX: number;
    previousY: number;
    velocityX: number;
    velocityY: number;
    gravity: number;
    alpha: number;
    decay: number;
    size: number;
    color: string;
}

function FireworksCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        let width = 0;
        let height = 0;
        let animationFrame = 0;
        let burstIndex = 0;
        const particles: FireworkParticle[] = [];
        const burstPositions = [
            [.12, .22], [.88, .2], [.2, .68], [.82, .72], [.5, .12], [.3, .34], [.7, .36], [.08, .82], [.92, .84],
        ];

        const resize = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        };

        const createBurst = () => {
            const [positionX, positionY] = burstPositions[burstIndex % burstPositions.length];
            const originX = width * positionX;
            const originY = height * positionY;
            const color = fireworkColors[burstIndex % fireworkColors.length];
            const particleCount = width < 640 ? 42 : 62;
            burstIndex += 1;
            for (let index = 0; index < particleCount; index += 1) {
                const angle = (Math.PI * 2 * index) / particleCount + Math.random() * .08;
                const speed = 2.4 + Math.random() * 4.8;
                particles.push({
                    x: originX,
                    y: originY,
                    previousX: originX,
                    previousY: originY,
                    velocityX: Math.cos(angle) * speed,
                    velocityY: Math.sin(angle) * speed,
                    gravity: .045 + Math.random() * .035,
                    alpha: 1,
                    decay: .009 + Math.random() * .009,
                    size: 1.1 + Math.random() * 2.2,
                    color,
                });
            }
        };

        const draw = () => {
            context.clearRect(0, 0, width, height);
            context.globalCompositeOperation = 'lighter';
            for (let index = particles.length - 1; index >= 0; index -= 1) {
                const particle = particles[index];
                particle.previousX = particle.x;
                particle.previousY = particle.y;
                particle.velocityX *= .988;
                particle.velocityY = particle.velocityY * .988 + particle.gravity;
                particle.x += particle.velocityX;
                particle.y += particle.velocityY;
                particle.alpha -= particle.decay;

                if (particle.alpha <= 0) {
                    particles.splice(index, 1);
                    continue;
                }

                context.globalAlpha = particle.alpha;
                context.strokeStyle = particle.color;
                context.lineWidth = particle.size;
                context.lineCap = 'round';
                context.shadowColor = particle.color;
                context.shadowBlur = 12;
                context.beginPath();
                context.moveTo(particle.previousX, particle.previousY);
                context.lineTo(particle.x, particle.y);
                context.stroke();
                context.beginPath();
                context.arc(particle.x, particle.y, particle.size * .55, 0, Math.PI * 2);
                context.fillStyle = '#ffffff';
                context.fill();
            }
            context.globalAlpha = 1;
            context.shadowBlur = 0;
            animationFrame = window.requestAnimationFrame(draw);
        };

        resize();
        createBurst();
        const openingBurstTimer = window.setTimeout(createBurst, 120);
        const burstTimer = window.setInterval(createBurst, 520);
        const stopTimer = window.setTimeout(() => window.clearInterval(burstTimer), 8_500);
        const animationStopTimer = window.setTimeout(() => window.cancelAnimationFrame(animationFrame), 11_000);
        animationFrame = window.requestAnimationFrame(draw);
        window.addEventListener('resize', resize);

        return () => {
            window.clearTimeout(openingBurstTimer);
            window.clearInterval(burstTimer);
            window.clearTimeout(stopTimer);
            window.clearTimeout(animationStopTimer);
            window.cancelAnimationFrame(animationFrame);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} data-fireworks-canvas className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export default function SpinResultCelebration({ prize, isTest, onClose }: SpinResultCelebrationProps) {
    const won = prize > 0;
    return <div className="fixed inset-0 z-[140] grid place-items-center overflow-hidden bg-[#160f0a]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="spin-result-title">
        {won && <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="celebration-glow" />
            <FireworksCanvas />
            {confetti.map((item, index) => <i key={index} className="confetti" style={{ left: `${item.left}%`, backgroundColor: item.color, animationDelay: `${item.delay}s`, animationDuration: `${item.duration}s`, transform: `rotate(${item.rotate}deg)` }} />)}
        </div>}

        <div className="result-card relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(160deg,#fffdf7,#fff4d8)] p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,.45)] sm:p-10">
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
            @keyframes result-pop { from { opacity: 0; transform: translateY(24px) scale(.82); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes prize-pulse { from { transform: scale(.98); } to { transform: scale(1.035); } }
            @keyframes confetti-fall { 0% { opacity: 0; translate: 0 -20px; rotate: 0deg; } 12% { opacity: 1; } 100% { opacity: .9; translate: 45px 112vh; rotate: 760deg; } }
            @keyframes celebration-glow { from { opacity: .45; scale: .92; } to { opacity: 1; scale: 1.08; } }
            @media (prefers-reduced-motion: reduce) { .result-card, .prize-glow, .confetti, .celebration-glow { animation: none !important; } }
        `}</style>
    </div>;
}
