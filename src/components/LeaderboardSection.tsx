import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { Student, JobsheetItem } from '../types';
import { getRank } from '../utils/jobsheetHelpers';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

const TOTAL_JOBSHEETS = 24;

interface LeaderboardSectionProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ jobsheetsByStudent }) => {
  const rows = (Object.keys(STUDENT_NAMES) as Student[])
    .map((student) => {
      const checked = jobsheetsByStudent[student].filter((j) => j.status === 'checked').length;
      return { student, checked, rank: getRank(checked) };
    })
    .sort((a, b) => b.checked - a.checked);

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
      <div className="max-w-3xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Progress Race</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
            Leaderboard
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Who's closer to Lion status? Progress updates live as jobsheets get checked.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {rows.map((row, idx) => {
            const pct = Math.round((row.checked / TOTAL_JOBSHEETS) * 100);
            return (
              <div
                key={row.student}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-xs font-bold text-white">
                    {idx === 0 ? <Trophy className="w-3.5 h-3.5 text-amber-300" /> : idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white">{STUDENT_NAMES[row.student]}</h3>
                  <span className={`ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${row.rank.color}`}>
                    {row.rank.emoji} {row.rank.label}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 font-mono">
                  {row.checked}/{TOTAL_JOBSHEETS} checked ({pct}%)
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
