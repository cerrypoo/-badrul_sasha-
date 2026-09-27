import React, { useEffect, useMemo, useState } from 'react';

const TAGLINES = [
  'Fetching jobsheets...',
  'Waking up the cats...',
  'Herding paw prints...',
  'Warming up the litter box...',
  'Sharpening claws...',
];

interface PageLoadingScreenProps {
  destination: string;
  duration: number;
}

export const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({ destination, duration }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const tagline = useMemo(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)], []);

  useEffect(() => {
    // Fade in
    const raf = requestAnimationFrame(() => setVisible(true));

    // Progress bar synced to duration
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const pct = Math.min(((now - start) / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // Fade out shortly before unmount
    const fadeOutTimer = setTimeout(() => setVisible(false), Math.max(duration - 300, 0));

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
      clearTimeout(fadeOutTimer);
    };
  }, [duration]);

  return (
    <div
      className={`fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "url('images/paw_trail.jpg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '220px',
          filter: 'invert(1)',
        }}
      />

      <div className="relative flex items-end h-16 gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="paw-step text-3xl"
            style={{
              animationDelay: `${i * 0.35}s`,
              ['--paw-ty' as string]: i % 2 === 0 ? '0px' : '14px',
              ['--paw-rot' as string]: i % 2 === 0 ? '-8deg' : '8deg',
            } as React.CSSProperties}
          >
            🐾
          </span>
        ))}
      </div>

      <p className="relative mt-6 text-sm text-white/80">
        {tagline}
      </p>
      <p className="relative text-xs text-teal-400 uppercase tracking-widest mt-1">
        Loading {destination}...
      </p>

      <div className="relative mt-4 w-40 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-400 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
