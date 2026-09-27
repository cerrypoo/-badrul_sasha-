import React, { useState } from 'react';
import { Sun, Moon, Calendar, Menu, X, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface NavbarProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onOpenBooking: () => void;
  activeSection: string;
  onNavigateJobsheet: () => void;
  onNavigateLibrary: () => void;
  onNavigateSection: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  themeMode,
  onToggleTheme,
  onOpenBooking,
  activeSection,
  onNavigateJobsheet,
  onNavigateLibrary,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showThemeToggle = activeSection !== 'jobsheet' && activeSection !== 'library';

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  const goToJobsheet = () => {
    setMobileMenuOpen(false);
    onNavigateJobsheet();
  };

  const goToLibrary = () => {
    setMobileMenuOpen(false);
    onNavigateLibrary();
  };

  return (
    <header className="sticky top-0 w-full z-50 transition-all duration-300">
      {/* Top Brand Banner matching the screenshot */}
      <div className="w-full text-center py-2.5 px-4 bg-slate-950/90 border-b border-white/10">
        <h1 className="text-sm md:text-base font-semibold tracking-wider text-white drop-shadow-md">
          The Cat's Space
        </h1>
      </div>

      {/* Main Navigation Row */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
        {/* Center: Pill Nav + Theme Toggle, side by side, not merged */}
        <div className="hidden md:flex items-center gap-1 backdrop-blur-xl bg-black/35 px-4 py-1.5 rounded-full border border-white/15 shadow-xl">
          <button
            onClick={() => scrollToSection('hero')}
            className={`px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition-all rounded-full ${
              activeSection === 'hero'
                ? 'text-white bg-white/20 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('book')}
            className={`px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition-all rounded-full ${
              activeSection === 'book'
                ? 'text-white bg-white/20 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            About Us
          </button>

          <button
            onClick={goToJobsheet}
            className={`px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition-all rounded-full ${
              activeSection === 'jobsheet'
                ? 'text-white bg-white/20 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Jobsheet
          </button>

          <button
            onClick={goToLibrary}
            className={`px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase transition-all rounded-full ${
              activeSection === 'library'
                ? 'text-white bg-white/20 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Library
          </button>
        </div>

        {/* Day / Night Theme Button, beside the pill but not part of it */}
        {showThemeToggle && (
          <button
            onClick={onToggleTheme}
            aria-label={`Toggle mode, currently ${themeMode}`}
            title={`Switch to ${themeMode === 'day' ? 'Night Mode' : 'Day Mode'}`}
            className="hidden md:inline-flex p-2 text-white/90 hover:text-white backdrop-blur-md bg-black/35 hover:bg-black/55 active:scale-95 transition-all rounded-full border border-white/20 shadow-md"
          >
            {themeMode === 'day' ? (
              <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-sky-200 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white backdrop-blur-md bg-black/35 rounded-full border border-white/20"
          aria-label="Open mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 mx-4 mb-2 rounded-2xl backdrop-blur-2xl bg-slate-900/90 border border-white/15 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-left text-white/90 hover:bg-white/10 rounded-lg"
          >
            <span>Home</span>
          </button>
          {showThemeToggle && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-2 text-sm text-left text-white/90 hover:bg-white/10 rounded-lg"
            >
              {themeMode === 'day' ? (
                <Moon className="w-4 h-4 text-teal-400" />
              ) : (
                <Sun className="w-4 h-4 text-teal-400" />
              )}
              <span>Switch to {themeMode === 'day' ? 'Night' : 'Day'} Mode</span>
            </button>
          )}
          <button
            onClick={() => scrollToSection('book')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-left text-white/90 hover:bg-white/10 rounded-lg"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>About Us</span>
          </button>
          <button
            onClick={goToJobsheet}
            className="flex items-center gap-2 px-3 py-2 text-sm text-left text-white/90 hover:bg-white/10 rounded-lg"
          >
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Jobsheet</span>
          </button>
          <button
            onClick={goToLibrary}
            className="flex items-center gap-2 px-3 py-2 text-sm text-left text-white/90 hover:bg-white/10 rounded-lg"
          >
            <span>Library</span>
          </button>
        </div>
      )}
    </header>
  );
};
