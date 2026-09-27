import React, { useState } from 'react';
import { Sparkles, FileText, Eye, Radio, PawPrint, CheckCircle2, Bell, MessageSquare } from 'lucide-react';
import { Student, JobsheetItem } from '../types';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

const CONFETTI = ['🐾', '🎉', '✨', '🐈'];

interface LibraryPageProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
  onUpdateStudentJobsheets: (student: Student, jobsheets: JobsheetItem[]) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  jobsheetsByStudent,
  onUpdateStudentJobsheets,
}) => {
  const [burstKey, setBurstKey] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const markChecked = (student: Student, id: number) => {
    const updated = jobsheetsByStudent[student].map((j) =>
      j.id === id ? { ...j, status: 'checked' as const } : j
    );
    onUpdateStudentJobsheets(student, updated);
    setBurstKey(`${student}-${id}`);
    setTimeout(() => setBurstKey(null), 900);
  };

  const saveNote = (student: Student, id: number) => {
    const key = `${student}-${id}`;
    const note = noteDrafts[key] ?? '';
    const updated = jobsheetsByStudent[student].map((j) =>
      j.id === id ? { ...j, note: note.trim() || null } : j
    );
    onUpdateStudentJobsheets(student, updated);
  };

  const pendingReviewCount = (Object.keys(STUDENT_NAMES) as Student[]).reduce(
    (acc, s) => acc + jobsheetsByStudent[s].filter((j) => j.pdfUrl && j.liveUrl && j.status !== 'checked').length,
    0
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
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Object.keys(STUDENT_NAMES) as Student[]).map((student) => {
            const complete = jobsheetsByStudent[student].filter((j) => j.pdfUrl && j.liveUrl);

            return (
              <div
                key={student}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
                  <PawPrint className="w-4 h-4 text-teal-400" />
                  <h2 className="text-base font-bold text-white">{STUDENT_NAMES[student]}</h2>
                  <span className="ml-auto text-xs font-mono text-slate-500">
                    {complete.length} complete
                  </span>
                </div>

                {complete.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-center">
                    <FileText className="w-6 h-6 text-slate-600" />
                    <p className="text-xs text-slate-500">
                      Nothing here yet — waiting for a PDF + live submission.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {complete.map((j) => {
                      const key = `${student}-${j.id}`;
                      return (
                        <div
                          key={j.id}
                          className="relative bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 transition-colors hover:border-teal-500/50"
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
                              <button
                                onClick={() => markChecked(student, j.id)}
                                disabled={j.status === 'checked'}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-full transition-colors ${
                                  j.status === 'checked'
                                    ? 'bg-emerald-500/15 text-emerald-300 cursor-default'
                                    : 'bg-teal-600/80 hover:bg-teal-500 text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                {j.status === 'checked' ? 'Checked' : 'Mark Checked'}
                              </button>
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
