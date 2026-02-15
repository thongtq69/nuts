'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import '@/app/lunar-new-year.css';

// ===== TYPES =====
interface Petal {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  type: 'mai' | 'dao';
  drift: number;
  rotation: number;
}

interface Confetti {
  id: number;
  left: string;
  duration: string;
  delay: string;
  color: 'gold' | 'red' | 'orange';
  drift: number;
  rotation: number;
}

interface FireworkParticle {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
}

interface Firework {
  id: string;
  x: number;
  y: number;
  particles: FireworkParticle[];
  trailColor: string;
}

// ===== HELPER FUNCTIONS =====
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const FIREWORK_COLORS = [
  '#ff3333', '#ff6666', '#ffd700', '#ffec80',
  '#ff8c00', '#ff69b4', '#ff1493', '#ffa500',
  '#ff4500', '#dc143c', '#ffe066', '#ffb347',
];

const generatePetals = (count: number): Petal[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: randomBetween(0, 100) + '%',
    size: randomBetween(8, 16),
    duration: randomBetween(6, 14) + 's',
    delay: randomBetween(0, 10) + 's',
    type: Math.random() > 0.4 ? 'mai' : 'dao',
    drift: randomBetween(-60, 100),
    rotation: randomBetween(360, 1080),
  }));
};

const generateConfetti = (count: number): Confetti[] => {
  const colors: Confetti['color'][] = ['gold', 'red', 'orange'];
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: randomBetween(0, 100) + '%',
    duration: randomBetween(5, 12) + 's',
    delay: randomBetween(0, 8) + 's',
    color: colors[Math.floor(Math.random() * colors.length)],
    drift: randomBetween(-50, 50),
    rotation: randomBetween(360, 1440),
  }));
};

const generateFirework = (canvasWidth: number, canvasHeight: number): Firework => {
  const x = randomBetween(canvasWidth * 0.15, canvasWidth * 0.85);
  const y = randomBetween(canvasHeight * 0.1, canvasHeight * 0.45);
  const particleCount = Math.floor(randomBetween(25, 45));
  const mainColor = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
  const id = `fw-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const particles: FireworkParticle[] = Array.from({ length: particleCount }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / particleCount + randomBetween(-0.2, 0.2);
    const distance = randomBetween(40, 120);
    return {
      id: `${id}-p-${i}`,
      x: 0,
      y: 0,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      color: Math.random() > 0.3 ? mainColor : FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      size: randomBetween(3, 6),
    };
  });

  return { id, x, y, particles, trailColor: mainColor };
};

// ===== COMPONENT CHÍNH =====
export default function LunarNewYearEffect() {
  const [enabled, setEnabled] = useState(true);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [showBanner, setShowBanner] = useState(true);
  const fireworkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo cánh hoa và confetti
  useEffect(() => {
    setPetals(generatePetals(25));
    setConfetti(generateConfetti(15));
  }, []);

  // Pháo hoa định kỳ
  const launchFirework = useCallback(() => {
    if (typeof window === 'undefined') return;
    const fw = generateFirework(window.innerWidth, window.innerHeight);
    setFireworks((prev) => [...prev, fw]);

    // Dọn dẹp pháo hoa cũ sau 2 giây
    setTimeout(() => {
      setFireworks((prev) => prev.filter((f) => f.id !== fw.id));
    }, 2000);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (fireworkTimerRef.current) clearInterval(fireworkTimerRef.current);
      return;
    }

    // Bắn pháo hoa ngay khi load
    setTimeout(() => launchFirework(), 500);
    setTimeout(() => launchFirework(), 1200);
    setTimeout(() => launchFirework(), 2000);

    // Sau đó bắn định kỳ
    fireworkTimerRef.current = setInterval(() => {
      launchFirework();
      // Đôi khi bắn 2-3 phát liên tiếp
      if (Math.random() > 0.5) {
        setTimeout(() => launchFirework(), 300);
      }
      if (Math.random() > 0.7) {
        setTimeout(() => launchFirework(), 600);
      }
    }, randomBetween(3000, 6000));

    return () => {
      if (fireworkTimerRef.current) clearInterval(fireworkTimerRef.current);
    };
  }, [enabled, launchFirework]);

  const toggleEffect = () => {
    setEnabled((prev) => !prev);
  };

  if (!enabled) {
    return (
      <button
        className={`lunar-toggle off`}
        onClick={toggleEffect}
        title="Bật hiệu ứng Tết"
        aria-label="Bật hiệu ứng Tết"
      >
        🧧
      </button>
    );
  }

  return (
    <>
      {/* Banner chúc mừng năm mới trên cùng */}
      <div className="tet-greeting">
        <span className="greeting-sparkle">✨</span>
        <span className="greeting-text">
          🧧 Chúc Mừng Năm Mới 2026 - Bính Ngọ 🐴
        </span>
        <span className="greeting-sparkle">✨</span>
        <span className="greeting-text" style={{ marginLeft: 16 }}>
          🎋 An Khang Thịnh Vượng - Vạn Sự Như Ý
        </span>
        <span className="greeting-sparkle">✨</span>
      </div>

      {/* Container hiệu ứng chính */}
      <div className="lunar-container">
        {/* Cánh hoa mai / đào rơi */}
        {petals.map((p) => (
          <div
            key={`petal-${p.id}`}
            className={`petal ${p.type === 'mai' ? 'petal-mai' : 'petal-dao'}`}
            style={{
              left: p.left,
              width: p.size + 'px',
              height: p.size * (p.type === 'dao' ? 1.3 : 1) + 'px',
              animationDuration: p.duration,
              animationDelay: p.delay,
              ['--drift' as any]: p.drift + 'px',
              ['--rotation' as any]: p.rotation + 'deg',
            }}
          />
        ))}

        {/* Confetti vàng đỏ */}
        {confetti.map((c) => (
          <div
            key={`confetti-${c.id}`}
            className={`confetti confetti-${c.color}`}
            style={{
              left: c.left,
              animationDuration: c.duration,
              animationDelay: c.delay,
              ['--drift' as any]: c.drift + 'px',
              ['--rotation' as any]: c.rotation + 'deg',
            }}
          />
        ))}

        {/* Pháo hoa */}
        {fireworks.map((fw) => (
          <div
            key={fw.id}
            style={{ position: 'absolute', left: fw.x, top: fw.y }}
          >
            {/* Vệt pháo bay lên */}
            <div
              className="firework-trail"
              style={{
                left: 0,
                bottom: '100%',
                ['--trail-color' as any]: fw.trailColor,
              }}
            />
            {/* Các hạt nổ */}
            {fw.particles.map((p) => (
              <div
                key={p.id}
                className="firework-particle"
                style={{
                  width: p.size + 'px',
                  height: p.size + 'px',
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}`,
                  ['--tx' as any]: p.tx + 'px',
                  ['--ty' as any]: p.ty + 'px',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Lồng đèn trái */}
      <div className="lantern-wrapper left" style={{ animationDelay: '0.2s' }}>
        <div className="lantern-string" />
        <div className="lantern">
          <div className="lantern-cap" />
          <span className="lantern-text">福</span>
          <div className="lantern-tassel">
            <div className="tassel-knot" />
            <div className="tassel-threads">
              <div className="tassel-thread" />
              <div className="tassel-thread" />
              <div className="tassel-thread" />
            </div>
          </div>
        </div>
      </div>

      {/* Lồng đèn phải */}
      <div className="lantern-wrapper right" style={{ animationDelay: '0.5s' }}>
        <div className="lantern-string" />
        <div className="lantern" style={{ animationDelay: '0.5s' }}>
          <div className="lantern-cap" />
          <span className="lantern-text">春</span>
          <div className="lantern-tassel">
            <div className="tassel-knot" />
            <div className="tassel-threads">
              <div className="tassel-thread" />
              <div className="tassel-thread" />
              <div className="tassel-thread" />
            </div>
          </div>
        </div>
      </div>

      {/* Câu đối bên trái */}
      <div className="cau-doi-wrapper left">
        <div className="cau-doi">
          Xuân sang phú quý đến
        </div>
      </div>

      {/* Câu đối bên phải */}
      <div className="cau-doi-wrapper right">
        <div className="cau-doi">
          Tết đến lộc vào nhà
        </div>
      </div>

      {/* Banner Mã Đáo Thành Công */}
      {showBanner && (
        <div className="lunar-banner" onClick={() => setShowBanner(false)}>
          <Image
            src="/ma_dao_thanh_cong_gonuts.png"
            alt="Mã Đáo Thành Công - Go Nuts 2026"
            width={200}
            height={200}
            className="shadow-2xl"
            priority={false}
          />
        </div>
      )}

      {/* Nút tắt/bật hiệu ứng */}
      <button
        className="lunar-toggle"
        onClick={toggleEffect}
        title="Tắt hiệu ứng Tết"
        aria-label="Tắt hiệu ứng Tết"
      >
        🧧
      </button>
    </>
  );
}
