import React from 'react';

export const PageLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center overflow-hidden">
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
    </div>
  );
};
