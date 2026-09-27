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

      <video
        src="videos/page_loading.mp4"
        autoPlay
        muted
        playsInline
        className="relative w-40 h-40 sm:w-56 sm:h-56 object-contain"
      />

      <div className="relative flex items-center gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="text-lg animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            🐾
          </span>
        ))}
      </div>

      <p className="relative mt-3 text-sm text-white/80">
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
