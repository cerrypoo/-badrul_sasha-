import React, { useEffect, useRef, useState } from 'react';
import { CatsLogo } from './CatsLogo';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeroSectionProps {
  themeMode: ThemeMode;
  onBookNowClick: () => void;
  totalChecked: number;
  totalJobsheets: number;
}

const useCountUp = (target: number) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duration = 900;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.round(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return { value, ref };
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  themeMode,
  onBookNowClick,
  totalChecked,
  totalJobsheets,
}) => {
  const counter = useCountUp(totalChecked);
  const scrollToBooking = () => {
    const el = document.getElementById('book');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onBookNowClick();
    }
  };

  return (
    <div id="hero" className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 md:py-16">
      {/* Top subtle ambient hint */}
      <div className="mb-4 inline-flex items-center gap-2 text-xs md:text-sm font-medium tracking-widest uppercase text-white/90 drop-shadow-md">
        <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-spin [animation-duration:8s]" />
        <span>Welcome To The Cat Space</span>
        <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-spin [animation-duration:8s]" />
      </div>

      {/* Stylized CATS Silhouette Logo - exact match from reference screenshot */}
      <div className="my-2 md:my-4 transition-transform duration-500 hover:scale-[1.03]">
        <CatsLogo className="w-64 sm:w-80 md:w-[420px] max-w-full cursor-pointer" onClick={scrollToBooking} />
      </div>

      {/* Subtitle / Promise */}
      <p className="max-w-xl text-xs sm:text-sm md:text-base text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] font-light tracking-wide px-4 mt-1 mb-8">
        {themeMode === 'day'
          ? 'Sun-drenched seaside suites, peaceful ocean views, and bespoke holistic care for your beloved cats.'
          : 'Peaceful starry nights, gentle tidal lulls, and climate-controlled nocturnal sanctuary for restful slumber.'}
      </p>

      {/* Signature "BOOK NOW" Button with Chevron as shown in screenshot */}
      <div className="flex flex-col items-center gap-1 group">
        <button
          onClick={scrollToBooking}
          className="px-8 py-3 text-sm md:text-base font-bold tracking-[0.25em] uppercase text-white hover:text-teal-200 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 focus:outline-none"
        >
          MEOW SPACE
        </button>

        {/* Downward Chevron matching the screenshot */}
        <button
          onClick={scrollToBooking}
          aria-label="Scroll to booking section"
          className="text-white/80 hover:text-white transition-colors animate-bounce p-1 focus:outline-none"
        >
          <ChevronDown className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Unboxed Metadata / Highlights (Zero-Pill discipline) */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-white/85 drop-shadow-md">
        <span>Centralized Jobsheet Uploads</span>
        <span aria-hidden="true" className="text-white/50">·</span>
        <span>Direct From Lecturers</span>
        <span aria-hidden="true" className="text-white/50">·</span>
        <span>Organized By Course</span>
        <span aria-hidden="true" className="text-white/50">·</span>
        <span>Instant Student Access</span>
      </div>

      {/* Animated stats counter */}
      <div ref={counter.ref} className="mt-6 flex items-center gap-2 text-white/90 drop-shadow-md">
        <span className="text-2xl font-bold font-mono">{counter.value}</span>
        <span className="text-xs uppercase tracking-widest">/ {totalJobsheets} jobsheets checked</span>
      </div>
    </div>
  );
};
