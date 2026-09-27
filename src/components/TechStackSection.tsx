import React from 'react';
import { Sparkles } from 'lucide-react';
import { Reveal } from './Reveal';

const STACK = ['React', 'TypeScript', 'Vite', 'Tailwind CSS'];

export const TechStackSection: React.FC = () => {
  return (
    <section className="w-full py-10 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
      <Reveal className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Under The Hood</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mb-5">
          Built With
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
};
