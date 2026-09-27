import React, { useMemo, useRef, useState } from 'react';
import { Sparkles, Search, Clock, ArrowRight } from 'lucide-react';
import { StudentDashboard } from './StudentDashboard';
import { ProgressRing } from './ProgressRing';
import { PinGate } from './PinGate';
import { Student, JobsheetItem } from '../types';
import { getRank } from '../utils/jobsheetHelpers';
import { playMeow } from '../utils/meow';
import { isUnlocked } from '../utils/auth';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

const STUDENT_PHOTOS: Record<Student, string> = {
  sasha: 'images/sasha.jpg',
  badrul: 'images/badrul.jpg',
};

const CAT_FACTS = [
  "Cats spend nearly 70% of their lives sleeping — which is also how most jobsheets get graded.",
  "A group of cats is called a clowder. A group of overdue jobsheets is called a problem.",
  "Cats can't taste sweetness. They also can't taste the sweet relief of an early submission.",
  "A cat's purr vibrates at a frequency that promotes healing — sadly it doesn't fix missing jobsheets.",
];

const LAST_STUDENT_KEY = 'jobsheet-last-student';

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
  const [selected, setSelected] = useState<Student | null>(
    initialStudent && isUnlocked(initialStudent) ? initialStudent : null
  );
  const [pendingAuth, setPendingAuth] = useState<Student | null>(
    initialStudent && !isUnlocked(initialStudent) ? initialStudent : null
  );
  const [search, setSearch] = useState('');
  const lastHover = useRef(0);
  const catFact = useMemo(() => CAT_FACTS[Math.floor(Math.random() * CAT_FACTS.length)], []);

  const lastStudent = (typeof window !== 'undefined'
    ? (localStorage.getItem(LAST_STUDENT_KEY) as Student | null)
    : null);

  const selectStudent = (student: Student) => {
    localStorage.setItem(LAST_STUDENT_KEY, student);
    if (isUnlocked(student)) {
      setSelected(student);
    } else {
      setPendingAuth(student);
    }
  };

  const handleHoverMeow = () => {
    const now = performance.now();
    if (now - lastHover.current < 800) return;
    lastHover.current = now;
    playMeow();
  };

  if (pendingAuth) {
    return (
      <PinGate
        student={pendingAuth}
        name={STUDENT_NAMES[pendingAuth]}
        onUnlocked={() => {
          setSelected(pendingAuth);
          setPendingAuth(null);
        }}
        onCancel={() => setPendingAuth(null)}
      />
    );
  }

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

  const students = (Object.keys(STUDENT_NAMES) as Student[])
    .filter((s) => STUDENT_NAMES[s].toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const ca = jobsheetsByStudent[a].filter((j) => j.status === 'checked').length;
      const cb = jobsheetsByStudent[b].filter((j) => j.status === 'checked').length;
      return cb - ca;
    });

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

        {lastStudent && STUDENT_NAMES[lastStudent] && (
          <button
            onClick={() => selectStudent(lastStudent)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30 transition-colors"
          >
            Continue as {STUDENT_NAMES[lastStudent]}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

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
            const pct = Math.round((checked / jobsheets.length) * 100);
            const rank = getRank(checked);
            const active = lastActive(jobsheets);
            return (
              <button
                key={student}
                onClick={() => selectStudent(student)}
                onMouseEnter={handleHoverMeow}
                className="group relative overflow-hidden bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/60 rounded-2xl p-8 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <img
                    src={STUDENT_PHOTOS[student]}
                    alt={STUDENT_NAMES[student]}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-teal-500/50"
                  />
                  <div className="text-teal-400">
                    <ProgressRing pct={pct} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white">{STUDENT_NAMES[student]}</h3>
                <span className={`mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${rank.color}`}>
                  {rank.emoji} {rank.label}
                </span>
                <p className="mt-2 text-xs text-slate-400">{checked}/{jobsheets.length} checked</p>
                {active && (
                  <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    Last upload: {active}
                  </p>
                )}

                {/* Hover CTA overlay */}
                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300">
                    View Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            );
          })}

        </div>

        <p className="mt-12 text-xs text-slate-600 italic max-w-md mx-auto">🐾 {catFact}</p>
      </div>
    </section>
  );
};
