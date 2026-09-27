import React, { useEffect, useRef, useState } from 'react';

interface Paw {
  id: number;
  x: number;
  y: number;
}

let nextId = 0;

export const PawCursorTrail: React.FC = () => {
  const [paws, setPaws] = useState<Paw[]>([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current < 180) return;
      lastSpawn.current = now;
      const id = nextId++;
      setPaws((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setPaws((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {paws.map((p) => (
        <span
          key={p.id}
          className="absolute text-sm animate-ping"
          style={{
            left: p.x - 8,
            top: p.y - 8,
            animationDuration: '0.7s',
            animationIterationCount: 1,
          }}
        >
          🐾
        </span>
      ))}
    </div>
  );
};
