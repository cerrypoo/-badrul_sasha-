import React from 'react';
import { Sparkles, Upload, CheckCircle2, Radio } from 'lucide-react';
import { Student, JobsheetItem } from '../types';
import { Reveal } from './Reveal';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

interface ActivityEntry {
  key: string;
  icon: React.ReactNode;
  text: string;
  time: string | null;
}

interface RecentActivitySectionProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ jobsheetsByStudent }) => {
  const entries: ActivityEntry[] = [];

  (Object.keys(STUDENT_NAMES) as Student[]).forEach((student) => {
    jobsheetsByStudent[student].forEach((j) => {
      if (j.pdfUrl) {
        entries.push({
          key: `${student}-${j.id}-pdf`,
          icon: <Upload className="w-3.5 h-3.5 text-teal-400" />,
          text: `${STUDENT_NAMES[student]} uploaded Jobsheet ${j.id}`,
          time: j.uploadedAt,
        });
      }
      if (j.liveUrl) {
        entries.push({
          key: `${student}-${j.id}-live`,
          icon: <Radio className="w-3.5 h-3.5 text-amber-400" />,
          text: `${STUDENT_NAMES[student]} went live on Jobsheet ${j.id}`,
          time: null,
        });
      }
      if (j.status === 'checked') {
        entries.push({
          key: `${student}-${j.id}-checked`,
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          text: `Jobsheet ${j.id} (${STUDENT_NAMES[student]}) got checked`,
          time: null,
        });
      }
    });
  });

  if (entries.length === 0) return null;

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Feed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
            Recent Activity
          </h2>
        </Reveal>

        <div className="flex flex-col gap-2">
          {entries.slice(-8).reverse().map((entry) => (
            <div
              key={entry.key}
              className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/80 rounded-xl px-4 py-3"
            >
              {entry.icon}
              <span className="text-sm text-slate-300">{entry.text}</span>
              {entry.time && <span className="ml-auto text-[11px] text-slate-500 font-mono">{entry.time}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
