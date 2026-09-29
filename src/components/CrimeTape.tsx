import React from 'react';

interface CrimeTapeProps {
  position: 'top' | 'bottom';
}

const REPEATS = Array.from({ length: 10 });

const hazardStripe: React.CSSProperties = {
  height: '6px',
  backgroundImage:
    'repeating-linear-gradient(135deg, #facc15 0 14px, #0f172a 14px 28px)',
};

export const CrimeTape: React.FC<CrimeTapeProps> = ({ position }) => (
  <div
    className={`absolute left-0 right-0 z-20 ${position === 'top' ? 'top-0' : 'bottom-0'}`}
  >
    <div className="shadow-xl">
      <div className="hazard-stripe" style={hazardStripe} />
      <div className="bg-slate-950 py-1.5 overflow-hidden">
        <div className="tape-marquee flex items-center gap-6 whitespace-nowrap w-max">
          {[...REPEATS, ...REPEATS].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-amber-400 font-black text-xs sm:text-sm tracking-[0.25em] uppercase shrink-0"
            >
              Cat Crime Scene <span aria-hidden="true">🐾</span>
            </span>
          ))}
        </div>
      </div>
      <div className="hazard-stripe" style={{ ...hazardStripe, animationDirection: 'reverse' }} />
    </div>
  </div>
);
