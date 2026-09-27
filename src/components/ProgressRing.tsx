import React from 'react';

interface ProgressRingProps {
  pct: number;
  size?: number;
  stroke?: number;
  className?: string;
}

/** A ring-only progress indicator, meant to sit as an absolute overlay around a photo. */
export const ProgressRing: React.FC<ProgressRingProps> = ({ pct, size = 72, stroke = 4, className = '' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className={`-rotate-90 ${className}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-slate-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-teal-400 transition-all duration-700"
      />
    </svg>
  );
};
