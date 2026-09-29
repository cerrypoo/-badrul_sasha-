import React from 'react';
import { Heart } from 'lucide-react';
import { CrimeTape } from './CrimeTape';

interface FooterProps {
  onNavigateSection: (id: string) => void;
  onNavigateJobsheet: () => void;
  onNavigateLibrary: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onNavigateJobsheet,
  onNavigateLibrary,
}) => {
  const currentYear = 2026;

  return (
    <footer className="relative w-full bg-slate-950 border-t border-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs overflow-hidden">
      <CrimeTape position="top" />
      <div className="max-w-6xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-slate-200 tracking-wide">
            The Cat's Space
          </span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span>A student portal for uploading, tracking, and organizing lecturer jobsheets</span>
        </div>

        {/* Links & Copyright */}
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigateSection('hero')} className="hover:text-slate-300 transition-colors">
            Home
          </button>
          <button onClick={onNavigateJobsheet} className="hover:text-slate-300 transition-colors">
            Jobsheet
          </button>
          <button onClick={onNavigateLibrary} className="hover:text-slate-300 transition-colors">
            Library
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 text-[11px]">
        <p>© {currentYear} The Cat's Space LLC. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <span>Crafted with devotion for cats</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>at Ocean Bluff Coast</span>
        </p>
      </div>
    </footer>
  );
};
