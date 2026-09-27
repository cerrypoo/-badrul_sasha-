import React from 'react';

export const PageLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center">
      <video
        src="videos/page_loading.mp4"
        autoPlay
        muted
        playsInline
        className="w-40 h-40 sm:w-56 sm:h-56 object-contain"
      />
    </div>
  );
};
