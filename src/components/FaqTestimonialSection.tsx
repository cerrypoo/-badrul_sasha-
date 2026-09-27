import React, { useState } from 'react';
import { Sparkles, ChevronDown, Quote } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I submit my jobsheet?',
    a: 'Go to Jobsheet, pick your name, then upload the PDF and the live HTML file for each jobsheet card.',
  },
  {
    q: 'What counts as "complete"?',
    a: 'A jobsheet only shows up in the Library once both the PDF and the live file have been uploaded.',
  },
  {
    q: 'Can I replace a file after uploading?',
    a: 'Yes — delete it with the ✕ next to View PDF/Live, then upload again.',
  },
  {
    q: 'Does my progress get saved if I refresh?',
    a: 'Not yet — uploads live in this browser tab only for now. Ask about adding real storage if you need it to persist.',
  },
];

const TESTIMONIALS = [
  { name: 'Sasha', quote: "I uploaded 24 jobsheets and all I got was this Lion badge. Worth it. 🦁", emoji: '👩‍💻' },
  { name: 'Badrul', quote: "The paw prints in the background live rent-free in my head now.", emoji: '👨‍💻' },
];

export const FaqTestimonialSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* FAQ */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mb-6">
            How It Works
          </h2>
          <div className="flex flex-col gap-2">
            {FAQS.map((item, idx) => (
              <div key={item.q} className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIdx === idx && (
                  <p className="px-4 pb-3 text-xs text-slate-400 leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Word on the Street</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight mb-6">
            What They're Saying
          </h2>
          <div className="flex flex-col gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="tilt-hover bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
                <Quote className="w-4 h-4 text-teal-400 mb-2" />
                <p className="text-sm text-slate-300 leading-relaxed italic">"{t.quote}"</p>
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                  <span>{t.emoji}</span>
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
