import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Home, FileText, Library, HelpCircle, Trophy } from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

interface CommandPaletteProps {
  onNavigateSection: (id: string) => void;
  onNavigateJobsheet: () => void;
  onNavigateLibrary: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onNavigateSection,
  onNavigateJobsheet,
  onNavigateLibrary,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const actions: CommandAction[] = useMemo(
    () => [
      { id: 'home', label: 'Go to Home', icon: <Home className="w-4 h-4" />, run: () => onNavigateSection('hero') },
      { id: 'about', label: 'Go to About Us', icon: <Home className="w-4 h-4" />, run: () => onNavigateSection('book') },
      { id: 'leaderboard', label: 'Go to Leaderboard', icon: <Trophy className="w-4 h-4" />, run: () => onNavigateSection('leaderboard') },
      { id: 'faq', label: 'Go to FAQ', icon: <HelpCircle className="w-4 h-4" />, run: () => onNavigateSection('faq') },
      { id: 'jobsheet', label: 'Open Jobsheet Portal', icon: <FileText className="w-4 h-4" />, run: onNavigateJobsheet },
      { id: 'library', label: 'Open Library', icon: <Library className="w-4 h-4" />, run: onNavigateLibrary },
    ],
    [onNavigateSection, onNavigateJobsheet, onNavigateLibrary]
  );

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  const runAndClose = (action: CommandAction) => {
    action.run();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 flex items-start justify-center pt-24 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500">No matches.</p>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => runAndClose(a)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors text-left"
              >
                {a.icon}
                {a.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
