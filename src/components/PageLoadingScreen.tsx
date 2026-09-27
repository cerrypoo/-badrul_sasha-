import React from 'react';

export const PageLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[300] bg-slate-950">
      <video
        src="videos/page_loading.mp4"
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
};
