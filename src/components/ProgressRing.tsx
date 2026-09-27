import React from 'react';

interface ProgressRingProps {
  pct: number;
  size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ pct, size = 56 }) => {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
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
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white text-xs font-bold rotate-90"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {pct}%
      </text>
    </svg>
  );
};
