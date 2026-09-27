import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { StudentDashboard } from './StudentDashboard';
import { Student, JobsheetItem } from '../types';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

interface JobsheetPageProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
  onUpdateStudentJobsheets: (student: Student, jobsheets: JobsheetItem[]) => void;
}

export const JobsheetPage: React.FC<JobsheetPageProps> = ({
  jobsheetsByStudent,
  onUpdateStudentJobsheets,
}) => {
  const [selected, setSelected] = useState<Student | null>(null);

  if (selected) {
    return (
      <StudentDashboard
        name={STUDENT_NAMES[selected]}
        jobsheets={jobsheetsByStudent[selected]}
        onChange={(jobsheets) => onUpdateStudentJobsheets(selected, jobsheets)}
        onBack={() => setSelected(null)}
      />
    );
  }

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

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(Object.keys(STUDENT_NAMES) as Student[]).map((student) => (
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
              <p className="mt-1 text-xs text-slate-400">View jobsheets</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
