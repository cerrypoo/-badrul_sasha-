import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, GraduationCap, Search, BookOpen, Upload, Eye, Radio, PawPrint, X, Loader2 } from 'lucide-react';
import { JobsheetStatus, JobsheetItem, Student } from '../types';
import { uploadPdf, uploadLive, deletePdf, deleteLive } from '../services/jobsheetService';

const TOTAL_JOBSHEETS = 24;

const STATUS_META: Record<JobsheetStatus, { label: string; dot: string; text: string }> = {
  'not-started': { label: 'Not Started', dot: 'bg-slate-500', text: 'text-slate-400' },
  'in-progress': { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-300' },
  checked: { label: 'Checked', dot: 'bg-emerald-400', text: 'text-emerald-300' },
};

const STATUS_FILTERS: Array<{ value: 'all' | JobsheetStatus; label: string }> = [
  { value: 'all', label: 'All Status' },
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'checked', label: 'Checked' },
];

interface StudentDashboardProps {
  student: Student;
  name: string;
  jobsheets: JobsheetItem[];
  onBack: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  name,
  jobsheets,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobsheetStatus>('all');
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const liveInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const setBusy = (id: number, busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const checkedCount = jobsheets.filter((j) => j.status === 'checked').length;
  const withPdfCount = jobsheets.filter((j) => j.pdfUrl).length;

  const filtered = useMemo(() => {
    return jobsheets.filter((j) => {
      const matchesSearch = `jobsheet ${j.id}`.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobsheets, search, statusFilter]);

  const handleFileChange = async (id: number, file: File | null) => {
    if (!file) return;
    setBusy(id, true);
    try {
      await uploadPdf(student, id, file);
    } finally {
      setBusy(id, false);
    }
  };

  const handleLiveFileChange = async (id: number, file: File | null) => {
    if (!file) return;
    setBusy(id, true);
    try {
      await uploadLive(student, id, file);
    } finally {
      setBusy(id, false);
    }
  };

  const handleDeletePdf = async (id: number) => {
    setBusy(id, true);
    try {
      await deletePdf(student, id);
    } finally {
      setBusy(id, false);
    }
  };

  const handleDeleteLive = async (id: number) => {
    setBusy(id, true);
    try {
      await deleteLive(student, id);
    } finally {
      setBusy(id, false);
    }
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
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Welcome banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">
              <PawPrint className="w-5 h-5 text-teal-400" />
              Welcome back, {name}!
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage your jobsheets and upload your PDF submissions here.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            Student
          </span>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
            <div className="text-3xl font-bold font-mono text-white">
              {checkedCount}/{TOTAL_JOBSHEETS}
            </div>
            <p className="mt-1 text-xs text-slate-400">Checked Jobsheets</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
            <div className="text-3xl font-bold font-mono text-white">
              {withPdfCount}/{TOTAL_JOBSHEETS}
            </div>
            <p className="mt-1 text-xs text-slate-400">Jobsheets with PDF</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobsheets..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value} className="bg-slate-900">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Jobsheet list */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white mb-4">
            <BookOpen className="w-4 h-4 text-teal-400" />
            My Jobsheets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((j) => {
              const meta = STATUS_META[j.status];
              return (
                <div
                  key={j.id}
                  className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 text-left transition-transform hover:scale-[1.02]"
                >
                  <h3 className="text-sm font-bold text-white">Jobsheet {j.id}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className={meta.text}>{meta.label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 truncate">
                    {j.pdfName ? j.pdfName : 'No PDF uploaded'}
                  </p>
                  {j.uploadedAt && (
                    <p className="mt-0.5 text-[11px] text-slate-600">Uploaded: {j.uploadedAt}</p>
                  )}
                  {busyIds.has(j.id) && (
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-teal-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading…
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[j.id] = el;
                      }}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(j.id, e.target.files?.[0] ?? null)}
                    />
                    <input
                      ref={(el) => {
                        liveInputRefs.current[j.id] = el;
                      }}
                      type="file"
                      accept=".html,.htm,text/html"
                      className="hidden"
                      onChange={(e) => handleLiveFileChange(j.id, e.target.files?.[0] ?? null)}
                    />

                    {j.pdfUrl ? (
                      <span className="inline-flex items-center rounded-full bg-slate-800 overflow-hidden">
                        <a
                          href={j.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-semibold hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View PDF
                        </a>
                        <button
                          onClick={() => handleDeletePdf(j.id)}
                          disabled={busyIds.has(j.id)}
                          aria-label="Delete PDF"
                          className="px-2 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[j.id]?.click()}
                        disabled={busyIds.has(j.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-teal-600/80 hover:bg-teal-500 text-white transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload PDF
                      </button>
                    )}

                    {j.liveUrl ? (
                      <span className="inline-flex items-center rounded-full bg-slate-800 overflow-hidden">
                        <a
                          href={j.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-semibold hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          View Live
                        </a>
                        <button
                          onClick={() => handleDeleteLive(j.id)}
                          disabled={busyIds.has(j.id)}
                          aria-label="Delete live recording"
                          className="px-2 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => liveInputRefs.current[j.id]?.click()}
                        disabled={busyIds.has(j.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-600/80 hover:bg-amber-500 text-white transition-colors disabled:opacity-50"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        Upload Live
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
