import React, { useState } from 'react';
import {
  Sparkles, FileText, Eye, Radio, PawPrint, Bell, MessageSquare,
  LayoutGrid, List, Undo2, CheckCheck, Download, ClipboardCheck,
} from 'lucide-react';
import { Student, JobsheetItem } from '../types';
import { playPurr } from '../utils/meow';
import { logReview, countReviewedToday } from '../utils/localLog';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

const STUDENT_PHOTOS: Record<Student, string> = {
  sasha: 'images/sasha.jpg',
  badrul: 'images/badrul.jpg',
};

const CONFETTI = ['🐾', '🎉', '✨', '🐈'];

type ReviewFilter = 'all' | 'pending' | 'checked';
type ViewMode = 'grid' | 'list';

interface LibraryPageProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
  onUpdateStudentJobsheets: (student: Student, jobsheets: JobsheetItem[]) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  jobsheetsByStudent,
  onUpdateStudentJobsheets,
}) => {
  const [burstKey, setBurstKey] = useState<string | null>(null);
  const [classBurst, setClassBurst] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [reviewedToday, setReviewedToday] = useState(countReviewedToday);

  const allComplete = (Object.keys(STUDENT_NAMES) as Student[]).flatMap((s) =>
    jobsheetsByStudent[s].filter((j) => j.pdfUrl && j.liveUrl)
  );
  const totalChecked = allComplete.filter((j) => j.status === 'checked').length;
  const classPct = allComplete.length ? Math.round((totalChecked / allComplete.length) * 100) : 0;

  const setChecked = (student: Student, id: number, checked: boolean) => {
    const updated = jobsheetsByStudent[student].map((j) =>
      j.id === id ? { ...j, status: checked ? ('checked' as const) : ('in-progress' as const) } : j
    );
    onUpdateStudentJobsheets(student, updated);
  };

  const markChecked = (student: Student, id: number) => {
    setChecked(student, id, true);
    playPurr();
    logReview();
    setReviewedToday(countReviewedToday());
    setBurstKey(`${student}-${id}`);
    setTimeout(() => setBurstKey(null), 900);

    const willAllBeChecked = allComplete.every((j) => (j.id === id ? true : j.status === 'checked'));
    if (willAllBeChecked) {
      setClassBurst(true);
      setTimeout(() => setClassBurst(false), 2200);
    }
  };

  const unmarkChecked = (student: Student, id: number) => {
    setChecked(student, id, false);
  };

  const checkAll = (student: Student) => {
    const updated = jobsheetsByStudent[student].map((j) =>
      j.pdfUrl && j.liveUrl && j.status !== 'checked' ? { ...j, status: 'checked' as const } : j
    );
    const changedCount = updated.filter((j, i) => j.status !== jobsheetsByStudent[student][i].status).length;
    onUpdateStudentJobsheets(student, updated);
    for (let i = 0; i < changedCount; i++) logReview();
    setReviewedToday(countReviewedToday());
    playPurr();
  };

  const saveNote = (student: Student, id: number) => {
    const key = `${student}-${id}`;
    const note = noteDrafts[key] ?? '';
    const updated = jobsheetsByStudent[student].map((j) =>
      j.id === id ? { ...j, note: note.trim() || null } : j
    );
    onUpdateStudentJobsheets(student, updated);
  };

  const exportReport = () => {
    const lines: string[] = ['The Cat\'s Space — Jobsheet Review Summary', new Date().toLocaleString(), ''];
    (Object.keys(STUDENT_NAMES) as Student[]).forEach((student) => {
      lines.push(`== ${STUDENT_NAMES[student]} ==`);
      jobsheetsByStudent[student].forEach((j) => {
        if (!j.pdfUrl && !j.liveUrl) return;
        lines.push(`Jobsheet ${j.id}: ${j.status}${j.note ? ` — note: ${j.note}` : ''}`);
      });
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobsheet-review-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingReviewCount = allComplete.filter((j) => j.status !== 'checked').length;

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

      {classBurst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">🏆🐾🎉 All Reviewed!</div>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resource Library</span>
          </div>
          <h1 className="flex items-center justify-center gap-3 text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
            Library
            {pendingReviewCount > 0 && (
              <span className="relative inline-flex items-center" title={`${pendingReviewCount} awaiting review`}>
                <Bell className="w-5 h-5 text-amber-300" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {pendingReviewCount}
                </span>
              </span>
            )}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Jobsheets appear here once both the PDF and live file are submitted.
          </p>
        </div>

        {/* Class-wide progress + reviewed-today stat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Class Progress</span>
              <span className="font-mono text-teal-300">{totalChecked}/{allComplete.length} ({classPct}%)</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${classPct}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-white">{reviewedToday}</div>
              <p className="text-xs text-slate-400">Reviewed today</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobsheet ID..."
            className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
          <div className="flex gap-1 p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
            {(['all', 'pending', 'checked'] as ReviewFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  filter === f ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 bg-slate-900/50 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={exportReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 hover:border-teal-500 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>

        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'flex flex-col gap-6'}>
          {(Object.keys(STUDENT_NAMES) as Student[]).map((student) => {
            const complete = jobsheetsByStudent[student]
              .filter((j) => j.pdfUrl && j.liveUrl)
              .filter((j) => {
                if (filter === 'pending') return j.status !== 'checked';
                if (filter === 'checked') return j.status === 'checked';
                return true;
              })
              .filter((j) => `${j.id}`.includes(search));
            const pendingCount = jobsheetsByStudent[student].filter(
              (j) => j.pdfUrl && j.liveUrl && j.status !== 'checked'
            ).length;

            return (
              <div key={student} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
                  <img
                    src={STUDENT_PHOTOS[student]}
                    alt={STUDENT_NAMES[student]}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-teal-500/50"
                  />
                  <PawPrint className="w-4 h-4 text-teal-400" />
                  <h2 className="text-base font-bold text-white">{STUDENT_NAMES[student]}</h2>
                  <span className="ml-auto text-xs font-mono text-slate-500">
                    {complete.filter((j) => j.status === 'checked').length}/{complete.length} shown
                  </span>
                  {pendingCount > 0 && (
                    <button
                      onClick={() => checkAll(student)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-teal-600/80 hover:bg-teal-500 text-white transition-colors"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Check All
                    </button>
                  )}
                </div>

                {complete.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-center">
                    <FileText className="w-6 h-6 text-slate-600" />
                    <p className="text-xs text-slate-500">
                      {jobsheetsByStudent[student].some((j) => j.pdfUrl && j.liveUrl)
                        ? 'Nothing matches this filter.'
                        : 'Nothing here yet — waiting for a PDF + live submission.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {complete.map((j) => {
                      const key = `${student}-${j.id}`;
                      const isChecked = j.status === 'checked';
                      return (
                        <div
                          key={j.id}
                          className={`relative bg-slate-950/60 border rounded-xl p-4 transition-colors ${
                            isChecked ? 'border-emerald-500/40' : 'border-amber-500/40'
                          }`}
                        >
                          {burstKey === key && (
                            <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none z-10">
                              {CONFETTI.map((emoji, i) => (
                                <span
                                  key={i}
                                  className="text-xl animate-ping"
                                  style={{ animationDuration: '0.9s', animationDelay: `${i * 0.08}s` }}
                                >
                                  {emoji}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white">Jobsheet {j.id}</h3>
                              {j.uploadedAt && (
                                <p className="text-[11px] text-slate-500">Uploaded {j.uploadedAt}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={j.pdfUrl!}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                PDF
                              </a>
                              <a
                                href={j.liveUrl!}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                              >
                                <Radio className="w-3 h-3" />
                                Live
                              </a>
                              {isChecked ? (
                                <button
                                  onClick={() => unmarkChecked(student, j.id)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                                >
                                  <Undo2 className="w-3 h-3" />
                                  Undo
                                </button>
                              ) : (
                                <button
                                  onClick={() => markChecked(student, j.id)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-full bg-teal-600/80 hover:bg-teal-500 text-white transition-colors"
                                >
                                  <PawPrint className="w-3 h-3" />
                                  Mark Checked
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <input
                              type="text"
                              defaultValue={j.note ?? ''}
                              onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                              placeholder="Leave feedback for this jobsheet..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500"
                            />
                            <button
                              onClick={() => saveNote(student, j.id)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
