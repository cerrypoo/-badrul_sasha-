import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode } from '../types';
import { getCachedVideoUrl } from '../services/videoCache';
import { Volume2, VolumeX, Sun, Moon, Play, Pause, Zap } from 'lucide-react';
import { audioAmbiance } from '../services/audioAmbiance';

// Swap flag: true plays the uploaded prank_sound.mp3 instead of the synthesized
// wave/purr ambiance below. Set back to false to restore the original sound.
const USE_PRANK_MP3 = true;

interface HeroVideoBackgroundProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  children?: React.ReactNode;
}

export const HeroVideoBackground: React.FC<HeroVideoBackgroundProps> = ({
  themeMode,
  onToggleTheme,
  children,
}) => {
  const [dayVideoBlob, setDayVideoBlob] = useState<string>('videos/cats-day.webm');
  const [nightVideoBlob, setNightVideoBlob] = useState<string>('videos/cats-night.webm');
  const [isDayVideoReady, setIsDayVideoReady] = useState(false);
  const [isNightVideoReady, setIsNightVideoReady] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const dayVideoRef = useRef<HTMLVideoElement | null>(null);
  const nightVideoRef = useRef<HTMLVideoElement | null>(null);
  const prankAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize caching and blob resolution
  useEffect(() => {
    let isMounted = true;

    async function loadCachedVideos() {
      try {
        const [dayCached, nightCached] = await Promise.all([
          getCachedVideoUrl('videos/cats-day.webm'),
          getCachedVideoUrl('videos/cats-night.webm'),
        ]);

        if (isMounted) {
          setDayVideoBlob(dayCached);
          setNightVideoBlob(nightCached);
          setIsCached(true);
        }
      } catch {
        // Direct static path fallback
      }
    }

    loadCachedVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle video playback synchronization
  useEffect(() => {
    const activeRef = themeMode === 'day' ? dayVideoRef.current : nightVideoRef.current;
    if (activeRef) {
      if (isVideoPaused) {
        activeRef.pause();
      } else {
        activeRef.play().catch(() => {
          // Autoplay blocked by browser policy until interaction
        });
      }
    }
  }, [themeMode, isVideoPaused]);

  const toggleSound = () => {
    if (USE_PRANK_MP3) {
      const audio = prankAudioRef.current;
      if (!audio) return;
      if (audio.paused) {
        audio.play().catch(() => {});
        setIsSoundPlaying(true);
      } else {
        audio.pause();
        setIsSoundPlaying(false);
      }
      return;
    }
    const active = audioAmbiance.toggle();
    setIsSoundPlaying(active);
  };

  const toggleVideoPause = () => {
    setIsVideoPaused((prev) => !prev);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between">
      {USE_PRANK_MP3 && <audio ref={prankAudioRef} src="audio/prank_sound.mp3" loop />}

      {/* 0. Loading screen while the active video hydrates */}
      {!(themeMode === 'day' ? isDayVideoReady : isNightVideoReady) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-slate-950">
          <span className="paw-spinner text-4xl">🐾</span>
          <p className="text-xs text-white/70 tracking-widest uppercase">Loading...</p>
        </div>
      )}

      {/* 1. Ultra-fast Tiny Blur Placeholder (< 500 bytes) */}
      <div
        className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 filter blur-xl scale-105 pointer-events-none ${
          themeMode === 'day' ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('videos/cats-day-tiny.jpg')` }}
      />
      <div
        className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 filter blur-xl scale-105 pointer-events-none ${
          themeMode === 'night' ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url('videos/cats-night-tiny.jpg')` }}
      />

      {/* 2. Crisp Poster Images (Instant responsive view while video hydrates) */}
      <img
        src="videos/cats-day-poster.jpg"
        alt="Day seaside cats poster"
        className={`absolute inset-0 w-full h-full object-cover object-center z-1 transition-opacity duration-700 pointer-events-none ${
          themeMode === 'day' && !isDayVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <img
        src="videos/cats-night-poster.jpg"
        alt="Night starry cats poster"
        className={`absolute inset-0 w-full h-full object-cover object-center z-1 transition-opacity duration-700 pointer-events-none ${
          themeMode === 'night' && !isNightVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 3. Smooth Day Mode Video (WebM + MP4 fallback) */}
      <video
        ref={dayVideoRef}
        key="cats-day-video"
        src={dayVideoBlob}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsDayVideoReady(true)}
        onCanPlayThrough={() => setIsDayVideoReady(true)}
        className={`absolute inset-0 w-full h-full object-cover object-center z-2 transition-opacity duration-1000 ease-in-out pointer-events-none ${
          themeMode === 'day' && isDayVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 4. Smooth Night Mode Video (WebM + MP4 fallback) */}
      <video
        ref={nightVideoRef}
        key="cats-night-video"
        src={nightVideoBlob}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsNightVideoReady(true)}
        onCanPlayThrough={() => setIsNightVideoReady(true)}
        className={`absolute inset-0 w-full h-full object-cover object-center z-2 transition-opacity duration-1000 ease-in-out pointer-events-none ${
          themeMode === 'night' && isNightVideoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 5. Ambient Atmospheric Shimmer Overlay */}
      {themeMode === 'day' ? (
        <div className="absolute inset-0 z-3 pointer-events-none overflow-hidden">
          {/* Subtle sun glint particles on the sea */}
          <div className="absolute top-[62%] left-[25%] w-1.5 h-1.5 bg-white/70 rounded-full animate-glint" />
          <div className="absolute top-[68%] left-[45%] w-2 h-2 bg-amber-100/80 rounded-full animate-glint [animation-delay:0.8s]" />
          <div className="absolute top-[65%] left-[70%] w-1 h-1 bg-white/90 rounded-full animate-glint [animation-delay:1.5s]" />
          <div className="absolute top-[72%] left-[82%] w-2 h-2 bg-sky-100/70 rounded-full animate-glint [animation-delay:0.3s]" />
        </div>
      ) : (
        <div className="absolute inset-0 z-3 pointer-events-none overflow-hidden">
          {/* Soft moon glow & twinkling night stars */}
          <div className="absolute top-[12%] right-[28%] w-48 h-48 bg-amber-100/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute top-[18%] left-[18%] w-1 h-1 bg-white/90 rounded-full animate-twinkle" />
          <div className="absolute top-[28%] left-[32%] w-1.5 h-1.5 bg-blue-100/90 rounded-full animate-twinkle [animation-delay:0.7s]" />
          <div className="absolute top-[14%] right-[15%] w-1 h-1 bg-white/80 rounded-full animate-twinkle [animation-delay:1.2s]" />
          <div className="absolute top-[22%] right-[40%] w-1.5 h-1.5 bg-amber-50/80 rounded-full animate-twinkle [animation-delay:1.8s]" />
          {/* Silver moon river light on ocean */}
          <div className="absolute top-[60%] right-[24%] w-32 h-36 bg-cyan-100/10 filter blur-2xl pointer-events-none" />
        </div>
      )}

      {/* 6. Subtle Vignette Scrim for maximum text legibility & contrast */}
      <div className="absolute inset-0 z-4 pointer-events-none bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60" />

      {/* 7. Foreground Content (Navbar, Cats Logo, Book Now CTA) */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between">
        {children}
      </div>

      {/* 8. Floating Ambient Controls & Caching Status in Bottom Bar */}
      <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between pointer-events-auto">
        {/* Left: Performance & Caching Indicator */}
        <div className="flex items-center gap-2 text-xs text-white/80 backdrop-blur-md bg-black/35 px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <Zap className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-medium tracking-wide">
            {isCached ? 'Fast WebM · Local Cache Ready' : 'Optimized WebM Stream'}
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/70">{themeMode === 'day' ? 'Daylight Coastal View' : 'Moonlit Starry View'}</span>
        </div>

        {/* Right: Sound Ambiance & Video Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Waves & Purr Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isSoundPlaying ? 'Mute ocean waves and purr sound' : 'Play relaxing seaside sound'}
            title={isSoundPlaying ? 'Mute relaxing seaside waves & cat purr' : 'Play relaxing seaside waves & cat purr'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md bg-black/40 hover:bg-black/60 active:scale-95 transition-all rounded-full border border-white/15 shadow-md"
          >
            {isSoundPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
                <span className="hidden sm:inline">Sound: Waves & Purr (On)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-white/70" />
                <span className="hidden sm:inline">Seaside Audio</span>
              </>
            )}
          </button>

          {/* Pause / Play Video */}
          <button
            onClick={toggleVideoPause}
            aria-label={isVideoPaused ? 'Play background video' : 'Pause background video'}
            title={isVideoPaused ? 'Play background video' : 'Pause background video'}
            className="p-1.5 text-white/90 backdrop-blur-md bg-black/40 hover:bg-black/60 active:scale-95 transition-all rounded-full border border-white/15 shadow-md"
          >
            {isVideoPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Theme Switcher Sun/Moon quick action */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${themeMode === 'day' ? 'night' : 'day'} scenery`}
            title={`Switch to ${themeMode === 'day' ? 'Night mode (Moon & Stars)' : 'Day mode (Bright Sun & Ocean)'}`}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md bg-teal-600/70 hover:bg-teal-600 active:scale-95 transition-all rounded-full border border-teal-400/30 shadow-md"
          >
            {themeMode === 'day' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">Moonlight</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Daylight</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
