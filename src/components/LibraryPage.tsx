import React from 'react';
import { Sparkles, FileText, Eye, Radio, PawPrint, CheckCircle2 } from 'lucide-react';
import { Student, JobsheetItem } from '../types';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

interface LibraryPageProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
  onUpdateStudentJobsheets: (student: Student, jobsheets: JobsheetItem[]) => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  jobsheetsByStudent,
  onUpdateStudentJobsheets,
}) => {
  const markChecked = (student: Student, id: number) => {
    const updated = jobsheetsByStudent[student].map((j) =>
      j.id === id ? { ...j, status: 'checked' as const } : j
    );
    onUpdateStudentJobsheets(student, updated);
  };
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight">
            Library
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
                    {complete.map((j) => (
                      <div
                        key={j.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between gap-3 transition-colors hover:border-teal-500/50"
                      >
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
                    ))}
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
