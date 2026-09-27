import React from 'react';
import { Sparkles } from 'lucide-react';
import { Reveal } from './Reveal';

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Piece',
    description: 'Head to the Library, pick your builder name, attach your jobsheet file, and snap it into place.',
  },
  {
    number: '02',
    title: 'Track The Build',
    description: 'Watch your progress bar fill on the Workspace dashboard as every submission adds to the tower.',
  },
  {
    number: '03',
    title: 'Get Certified',
    description: 'Complete every jobsheet and unlock your finished-build certificate — proof the set is complete.',
  },
];

export const GallerySection: React.FC = () => {
  return (
    <section id="gallery" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
            Assembly Instructions
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Three simple steps from upload to certified completion.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="tilt-hover bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-4 font-bold text-sm font-mono">
                {step.number}
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
