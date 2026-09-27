import React, { useState } from 'react';
import { Sparkles, Search, Clock } from 'lucide-react';
import { StudentDashboard } from './StudentDashboard';
import { Student, JobsheetItem } from '../types';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

const lastActive = (jobsheets: JobsheetItem[]): string | null => {
  const timestamps = jobsheets.map((j) => j.uploadedAt).filter((t): t is string => !!t);
  return timestamps.length ? timestamps[timestamps.length - 1] : null;
};

interface JobsheetPageProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
  onUpdateStudentJobsheets: (student: Student, jobsheets: JobsheetItem[]) => void;
  onResetStudentJobsheets: (student: Student) => void;
  initialStudent?: Student | null;
}

export const JobsheetPage: React.FC<JobsheetPageProps> = ({
  jobsheetsByStudent,
  onUpdateStudentJobsheets,
  onResetStudentJobsheets,
  initialStudent,
}) => {
  const [selected, setSelected] = useState<Student | null>(initialStudent ?? null);
  const [search, setSearch] = useState('');

  if (selected) {
    return (
      <StudentDashboard
        student={selected}
        name={STUDENT_NAMES[selected]}
        jobsheets={jobsheetsByStudent[selected]}
        onChange={(jobsheets) => onUpdateStudentJobsheets(selected, jobsheets)}
        onReset={() => onResetStudentJobsheets(selected)}
        onBack={() => setSelected(null)}
      />
    );
  }

  const students = (Object.keys(STUDENT_NAMES) as Student[]).filter((s) =>
    STUDENT_NAMES[s].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="relative w-full min-h-[70vh] py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "url('images/paw_trail.jpg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '220px',
          filter: 'invert(1)',
        }}
      />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Jobsheet Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
          Whose Jobsheet?
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Pick a student to view their jobsheets.
        </p>

        <div className="mt-6 max-w-xs mx-auto relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {students.map((student) => {
            const jobsheets = jobsheetsByStudent[student];
            const checked = jobsheets.filter((j) => j.status === 'checked').length;
            const active = lastActive(jobsheets);
            return (
              <button
                key={student}
                onClick={() => setSelected(student)}
                className="group bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/60 rounded-2xl p-8 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="cat-eye w-3 h-3 rounded-full bg-teal-400" />
                  <span className="cat-eye w-3 h-3 rounded-full bg-teal-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">{STUDENT_NAMES[student]}</h3>
                <p className="mt-1 text-xs text-slate-400">{checked}/{jobsheets.length} checked</p>
                {active && (
                  <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    Last upload: {active}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
