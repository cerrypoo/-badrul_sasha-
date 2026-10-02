import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Search,
  BookOpen,
  Upload,
  Eye,
  Radio,
  PawPrint,
  X,
  Printer,
  CalendarClock,
  MessageSquare,
  ArrowUpDown,
  FileText,
  History,
  Flame,
  Link2,
  RotateCcw,
  Lock,
} from 'lucide-react';

import {
  JobsheetStatus,
  JobsheetItem,
  Student,
} from '../types';

import {
  getRank,
  formatDeadline,
  isOverdue,
  TOTAL_JOBSHEETS,
} from '../utils/jobsheetHelpers';

import {
  readLog,
  appendLog,
  readPersonalNote,
  savePersonalNote,
  computeStreak,
} from '../utils/localLog';

import {
  lock as lockStudent,
} from '../utils/auth';

import { useToast } from './ToastProvider';

import { supabase } from '../lib/supabase';
import { removeDocument } from '../lib/documents';

const STATUS_META: Record<
  JobsheetStatus,
  {
    label: string;
    dot: string;
    text: string;
  }
> = {
  'not-started': {
    label: 'Not Started',
    dot: 'bg-slate-500',
    text: 'text-slate-400',
  },

  'in-progress': {
    label: 'In Progress',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
  },

  checked: {
    label: 'Checked',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
  },
};

const STATUS_FILTERS: Array<{
  value: 'all' | JobsheetStatus;
  label: string;
}> = [
  {
    value: 'all',
    label: 'All Status',
  },
  {
    value: 'not-started',
    label: 'Not Started',
  },
  {
    value: 'in-progress',
    label: 'In Progress',
  },
  {
    value: 'checked',
    label: 'Checked',
  },
];

type SortBy =
  | 'id'
  | 'status'
  | 'deadline';

type DocumentKind =
  | 'pdf'
  | 'txt';

type JobsheetWithDocuments = JobsheetItem & {
  txtName?: string | null;
  txtUrl?: string | null;
  txtUploadedAt?: string | null;
};

interface StudentDashboardProps {
  student: Student;
  name: string;
  jobsheets: JobsheetItem[];
  onChange: (
    jobsheets: JobsheetItem[]
  ) => void;
  onReset: () => void;
  onBack: () => void;
}

export const StudentDashboard: React.FC<
  StudentDashboardProps
> = ({
  student,
  name,
  jobsheets,
  onChange,
  onReset,
  onBack,
}) => {
  /*
   * JobsheetItem currently contains the PDF fields.
   *
   * We extend it locally with TXT fields so you do not
   * have to break the existing JobsheetItem structure.
   */
  const jobsheetsWithDocuments =
    jobsheets as JobsheetWithDocuments[];

  const setJobsheets = (
    updater: (
      prev: JobsheetItem[]
    ) => JobsheetItem[]
  ) => {
    onChange(updater(jobsheets));
  };

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<'all' | JobsheetStatus>('all');

  const [sortBy, setSortBy] =
    useState<SortBy>('id');

  const [showLog, setShowLog] =
    useState(false);

  const [milestoneBurst, setMilestoneBurst] =
    useState(false);

  const { showToast } =
    useToast();

  const [personalNotes, setPersonalNotes] =
    useState<Record<number, string>>({});

  const fileInputRefs =
    useRef<
      Record<
        number,
        HTMLInputElement | null
      >
    >({});

  const txtInputRefs =
    useRef<
      Record<
        number,
        HTMLInputElement | null
      >
    >({});

  const liveInputRefs =
    useRef<
      Record<
        number,
        HTMLInputElement | null
      >
    >({});

  const bulkInputRef =
    useRef<HTMLInputElement | null>(null);

  const prevJobsheetsRef =
    useRef<JobsheetItem[] | null>(null);

  const prevPdfCountRef =
    useRef<number | null>(null);

  const [log, setLog] =
    useState(() =>
      readLog(student)
    );

  /*
   * Statistics
   */

  const checkedCount =
    jobsheets.filter(
      (j) => j.status === 'checked'
    ).length;

  const withPdfCount =
    jobsheetsWithDocuments.filter(
      (j) => !!j.pdfUrl
    ).length;

  const withTxtCount =
    jobsheetsWithDocuments.filter(
      (j) => !!j.txtUrl
    ).length;

  const rank =
    getRank(checkedCount);

  const progressPct =
    Math.round(
      (checkedCount /
        TOTAL_JOBSHEETS) *
        100
    );

  const streak =
    computeStreak(log);

  /*
   * Load personal notes
   */

  useEffect(() => {
    const notes: Record<
      number,
      string
    > = {};

    jobsheets.forEach((j) => {
      const value =
        readPersonalNote(
          student,
          j.id
        );

      if (value) {
        notes[j.id] = value;
      }
    });

    setPersonalNotes(notes);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  /*
   * Milestone celebration
   */

  useEffect(() => {
    if (
      checkedCount ===
        TOTAL_JOBSHEETS &&
      checkedCount > 0
    ) {
      setMilestoneBurst(true);

      const timer =
        setTimeout(() => {
          setMilestoneBurst(false);
        }, 2000);

      return () =>
        clearTimeout(timer);
    }
  }, [checkedCount]);

  /*
   * First PDF upload celebration
   */

  useEffect(() => {
    if (
      prevPdfCountRef.current ===
        0 &&
      withPdfCount === 1
    ) {
      showToast(
        'First jobsheet uploaded! 🐾'
      );
    }

    prevPdfCountRef.current =
      withPdfCount;
  }, [
    withPdfCount,
    showToast,
  ]);

  /*
   * Lecturer feedback notification
   */

  useEffect(() => {
    const previous =
      prevJobsheetsRef.current;

    if (previous) {
      for (const j of jobsheets) {
        const previousItem =
          previous.find(
            (p) => p.id === j.id
          );

        if (
          j.note &&
          j.note !==
            previousItem?.note
        ) {
          showToast(
            `New feedback on Jobsheet ${j.id}`
          );

          break;
        }
      }
    }

    prevJobsheetsRef.current =
      jobsheets;
  }, [
    jobsheets,
    showToast,
  ]);

  /*
   * Escape key
   */

  useEffect(() => {
    const handler = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === 'Escape'
      ) {
        onBack();
      }
    };

    window.addEventListener(
      'keydown',
      handler
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handler
      );
  }, [onBack]);

  /*
   * Search / filtering
   */

  const filtered =
    useMemo(() => {
      let list =
        jobsheetsWithDocuments.filter(
          (j) => {
            const searchText =
              [
                `jobsheet ${j.id}`,
                j.pdfName ?? '',
                j.txtName ?? '',
              ]
                .join(' ')
                .toLowerCase();

            const matchesSearch =
              searchText.includes(
                search.toLowerCase()
              );

            const matchesStatus =
              statusFilter ===
                'all' ||
              j.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );

      list = [...list];

      if (
        sortBy === 'status'
      ) {
        const order: Record<
          JobsheetStatus,
          number
        > = {
          'not-started': 0,
          'in-progress': 1,
          checked: 2,
        };

        list.sort(
          (a, b) =>
            order[a.status] -
            order[b.status]
        );
      } else if (
        sortBy === 'deadline'
      ) {
        list.sort(
          (a, b) =>
            a.id - b.id
        );
      }

      return list;
    }, [
      jobsheetsWithDocuments,
      search,
      statusFilter,
      sortBy,
    ]);

  /*
   * Upload PDF / TXT to Supabase
   *
   * Storage:
   *
   * documents/
   *   {student}/
   *     jobsheet-{id}-{timestamp}-{filename}
   *
   * Database:
   * public.documents
   */

  const uploadDocumentToSupabase =
    async (
      id: number,
      file: File,
      kind: DocumentKind
    ): Promise<
      string | null
    > => {
      try {
        const safeStudent =
          student
            .toString()
            .replace(
              /[^a-zA-Z0-9_-]/g,
              '_'
            );

        const safeFileName =
          file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '_'
          );

        const filePath =
          `${safeStudent}/jobsheet-${id}-${Date.now()}-${safeFileName}`;

        const isTxt =
          kind === 'txt';

        const contentType =
          isTxt
            ? 'text/plain'
            : 'application/pdf';

        showToast(
          `Uploading Jobsheet ${id} ${isTxt ? 'TXT' : 'PDF'}...`
        );

        /*
         * 1. Upload file to Storage
         */

        const {
          data: uploadData,
          error: uploadError,
        } =
          await supabase.storage
            .from('documents')
            .upload(
              filePath,
              file,
              {
                contentType,
                upsert: false,
              }
            );

        if (uploadError) {
          console.error(
            'SUPABASE STORAGE UPLOAD ERROR:',
            uploadError
          );

          showToast(
            `Upload failed: ${uploadError.message}`
          );

          return null;
        }

        console.log(
          'SUPABASE STORAGE UPLOAD SUCCESS:',
          uploadData
        );

        const actualFilePath =
          uploadData?.path ||
          filePath;

        console.log(
          'ACTUAL STORAGE PATH:',
          actualFilePath
        );

        /*
         * 2. Create signed URL
         */

        const {
          data: signedUrlData,
          error: signedUrlError,
        } =
          await supabase.storage
            .from('documents')
            .createSignedUrl(
              actualFilePath,
              60 * 60 * 24
            );

        if (
          signedUrlError ||
          !signedUrlData?.signedUrl
        ) {
          console.error(
            'SIGNED URL ERROR:',
            signedUrlError
          );

          showToast(
            'File uploaded, but the file link could not be created.'
          );

          return null;
        }

        console.log(
          'SIGNED URL SUCCESS:',
          signedUrlData
        );

        showToast(
          `Jobsheet ${id} ${isTxt ? 'TXT' : 'PDF'} uploaded successfully!`
        );

        return (
          signedUrlData.signedUrl
        );
      } catch (error) {
        console.error(
          'UPLOAD ERROR:',
          error
        );

        showToast(
          'An unexpected error occurred during upload.'
        );

        return null;
      }
    };

  /*
   * Upload PDF / TXT / Live
   */

  const logAndUpload =
    async (
      id: number,
      file: File,
      kind:
        | 'pdf'
        | 'txt'
        | 'live'
    ) => {
      /*
       * PDF
       */

      if (
        kind === 'pdf'
      ) {
        const url =
          await uploadDocumentToSupabase(
            id,
            file,
            'pdf'
          );

        if (!url) {
          return;
        }

        appendLog(
          student,
          `Uploaded PDF for Jobsheet ${id}`
        );

        setLog(
          readLog(student)
        );

        const uploadedAt =
          new Date().toLocaleString(
            'en-US',
            {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }
          );

        setJobsheets(
          (prev) =>
            prev.map((j) =>
              j.id === id
                ? {
                    ...j,
                    pdfName:
                      file.name,
                    pdfUrl:
                      url,
                    uploadedAt,
                    status:
                      j.status ===
                      'not-started'
                        ? 'in-progress'
                        : j.status,
                  }
                : j
            )
        );

        return;
      }

      /*
       * TXT
       */

      if (
        kind === 'txt'
      ) {
        const url =
          await uploadDocumentToSupabase(
            id,
            file,
            'txt'
          );

        if (!url) {
          return;
        }

        appendLog(
          student,
          `Uploaded TXT for Jobsheet ${id}`
        );

        setLog(
          readLog(student)
        );

        const uploadedAt =
          new Date().toLocaleString(
            'en-US',
            {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }
          );

        setJobsheets(
          (prev) =>
            prev.map((j) =>
              j.id === id
                ? {
                    ...j,
                    txtName:
                      file.name,
                    txtUrl:
                      url,
                    txtUploadedAt:
                      uploadedAt,
                    status:
                      j.status ===
                      'not-started'
                        ? 'in-progress'
                        : j.status,
                  }
                : j
            )
        );

        return;
      }

      /*
       * Live uploads remain local.
       */

      const url =
        URL.createObjectURL(
          file
        );

      appendLog(
        student,
        `Uploaded Live for Jobsheet ${id}`
      );

      setLog(
        readLog(student)
      );

      setJobsheets(
        (prev) =>
          prev.map((j) =>
            j.id === id
              ? {
                  ...j,
                  liveName:
                    file.name,
                  liveUrl:
                    url,
                }
              : j
          )
      );
    };

  /*
   * Individual PDF / TXT file selection
   */

  const handleFileChange =
    (
      id: number,
      file: File | null
    ) => {
      if (!file) {
        return;
      }

      const isPdf =
        file.type ===
          'application/pdf' ||
        file.name
          .toLowerCase()
          .endsWith('.pdf');

      const isTxt =
        file.type ===
          'text/plain' ||
        file.name
          .toLowerCase()
          .endsWith('.txt');

      if (
        !isPdf &&
        !isTxt
      ) {
        showToast(
          'Please select a PDF or TXT file.'
        );

        return;
      }

      void logAndUpload(
        id,
        file,
        isTxt
          ? 'txt'
          : 'pdf'
      );
    };

  /*
   * Live file
   */

  const handleLiveFileChange =
    (
      id: number,
      file: File | null
    ) => {
      if (!file) {
        return;
      }

      void logAndUpload(
        id,
        file,
        'live'
      );
    };

  /*
   * Bulk PDF + TXT upload
   *
   * PDFs go to the next jobsheet without a PDF.
   * TXTs go to the next jobsheet without a TXT.
   */

  const handleBulkFiles =
    async (
      files: FileList | null
    ) => {
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

      const allFiles =
        Array.from(files);

      const pdfFiles =
        allFiles
          .filter(
            (file) =>
              file.type ===
                'application/pdf' ||
              file.name
                .toLowerCase()
                .endsWith('.pdf')
          )
          .sort((a, b) =>
            a.name.localeCompare(
              b.name
            )
          );

      const txtFiles =
        allFiles
          .filter(
            (file) =>
              file.type ===
                'text/plain' ||
              file.name
                .toLowerCase()
                .endsWith('.txt')
          )
          .sort((a, b) =>
            a.name.localeCompare(
              b.name
            )
          );

      if (
        pdfFiles.length === 0 &&
        txtFiles.length === 0
      ) {
        showToast(
          'Please select PDF or TXT files only.'
        );

        return;
      }

      /*
       * Upload PDFs
       */

      const pdfTargets =
        jobsheetsWithDocuments
          .filter(
            (j) => !j.pdfUrl
          )
          .sort(
            (a, b) =>
              a.id - b.id
          );

      for (
        let index = 0;
        index < pdfFiles.length;
        index++
      ) {
        const file =
          pdfFiles[index];

        const target =
          pdfTargets[index];

        if (!target) {
          break;
        }

        await logAndUpload(
          target.id,
          file,
          'pdf'
        );
      }

      /*
       * Upload TXTs
       */

      const txtTargets =
        jobsheetsWithDocuments
          .filter(
            (j) => !j.txtUrl
          )
          .sort(
            (a, b) =>
              a.id - b.id
          );

      for (
        let index = 0;
        index < txtFiles.length;
        index++
      ) {
        const file =
          txtFiles[index];

        const target =
          txtTargets[index];

        if (!target) {
          break;
        }

        await logAndUpload(
          target.id,
          file,
          'txt'
        );
      }
    };

  /*
   * Delete PDF
   */

  const handleDeletePdf =
    async (
      id: number
    ) => {
      const job =
        jobsheetsWithDocuments.find(
          (j) => j.id === id
        );

      if (!job?.pdfUrl) {
        return;
      }

      try {
        await removeDocument(
          student,
          id,
          'pdf'
        );
      } catch (error) {
        console.error(
          'DELETE PDF ERROR:',
          error
        );

        showToast(
          `Could not remove PDF from Jobsheet ${id}`
        );

        return;
      }

      appendLog(
        student,
        `Removed PDF from Jobsheet ${id}`
      );

      setLog(
        readLog(student)
      );

      setJobsheets(
        (prev) =>
          prev.map((j) => {
            if (
              j.id !== id
            ) {
              return j;
            }

            const current =
              j as JobsheetWithDocuments;

            const stillHasTxt =
              !!current.txtUrl;

            return {
              ...current,
              pdfName:
                null,
              pdfUrl:
                null,
              uploadedAt:
                null,
              status:
                j.status ===
                  'in-progress' &&
                !stillHasTxt
                  ? 'not-started'
                  : j.status,
            };
          })
      );

      showToast(
        `PDF removed from Jobsheet ${id}`
      );
    };

  /*
   * Delete TXT
   */

  const handleDeleteTxt =
    async (
      id: number
    ) => {
      const job =
        jobsheetsWithDocuments.find(
          (j) => j.id === id
        );

      if (!job?.txtUrl) {
        return;
      }

      try {
        await removeDocument(
          student,
          id,
          'txt'
        );
      } catch (error) {
        console.error(
          'DELETE TXT ERROR:',
          error
        );

        showToast(
          `Could not remove TXT from Jobsheet ${id}`
        );

        return;
      }

      appendLog(
        student,
        `Removed TXT from Jobsheet ${id}`
      );

      setLog(
        readLog(student)
      );

      setJobsheets(
        (prev) =>
          prev.map((j) => {
            if (
              j.id !== id
            ) {
              return j;
            }

            const current =
              j as JobsheetWithDocuments;

            const stillHasPdf =
              !!current.pdfUrl;

            return {
              ...current,
              txtName:
                null,
              txtUrl:
                null,
              txtUploadedAt:
                null,
              status:
                j.status ===
                  'in-progress' &&
                !stillHasPdf
                  ? 'not-started'
                  : j.status,
            };
          })
      );

      showToast(
        `TXT removed from Jobsheet ${id}`
      );
    };

  /*
   * Delete Live
   */

  const handleDeleteLive =
    (
      id: number
    ) => {
      appendLog(
        student,
        `Removed Live file from Jobsheet ${id}`
      );

      setLog(
        readLog(student)
      );

      setJobsheets(
        (prev) =>
          prev.map((j) =>
            j.id === id
              ? {
                  ...j,
                  liveName:
                    null,
                  liveUrl:
                    null,
                }
              : j
          )
      );
    };

  /*
   * Personal notes
   */

  const handlePersonalNoteChange =
    (
      id: number,
      value: string
    ) => {
      setPersonalNotes(
        (prev) => ({
          ...prev,
          [id]: value,
        })
      );
    };

  const handlePersonalNoteBlur =
    (
      id: number
    ) => {
      savePersonalNote(
        student,
        id,
        personalNotes[id] ??
          ''
      );
    };

  /*
   * Copy jobsheet link
   */

  const handleCopyLink =
    (
      id: number
    ) => {
      const url =
        `${window.location.origin}` +
        `${window.location.pathname}` +
        `#jobsheet-${student}-${id}`;

      navigator.clipboard
        ?.writeText(url)
        .then(() => {
          showToast(
            'Link copied!'
          );
        });
    };

  /*
   * Reset
   */

  const handleReset =
    () => {
      if (
        window.confirm(
          `Reset all ${TOTAL_JOBSHEETS} jobsheets for ${name}? This can't be undone.`
        )
      ) {
        onReset();

        appendLog(
          student,
          'Reset all jobsheets'
        );

        setLog(
          readLog(student)
        );
      }
    };

  return (
    <section className="relative w-full min-h-[70vh] py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">

      {/* Background */}

      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url('images/paw_trail.jpg')",
          backgroundRepeat:
            'repeat',
          backgroundSize:
            '220px',
          filter:
            'invert(1)',
        }}
      />

      {/* Milestone */}

      {milestoneBurst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">
            🏆🦁🎉
          </div>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto">

        {/* Header */}

        <div className="flex items-center justify-between mb-6">

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />

            <span>
              Back{' '}
              <span className="text-slate-600">
                (Esc)
              </span>
            </span>
          </button>

          <div className="flex items-center gap-4">

            <button
              onClick={() => {
                lockStudent(
                  student
                );

                onBack();
              }}
              title="Lock this dashboard on this device"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />

              Lock
            </button>

            <button
              onClick={
                handleReset
              }
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />

              Reset All
            </button>

          </div>
        </div>

        {/* Welcome banner */}

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">

          <div>

            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">

              <PawPrint className="w-5 h-5 text-teal-400" />

              Welcome back, {name}!

            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage your jobsheets and upload your PDF or TXT submissions here.
            </p>

          </div>

          <div className="flex items-center gap-2 flex-wrap">

            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">

                <Flame className="w-3.5 h-3.5" />

                {streak}-day streak

              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${rank.color}`}
            >
              <span>
                {rank.emoji}
              </span>

              {rank.label}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">

              <GraduationCap className="w-3.5 h-3.5" />

              Student

            </span>

            <button
              onClick={() =>
                setShowLog(
                  (value) =>
                    !value
                )
              }
              title="Activity log"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full border border-slate-700 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                window.print()
              }
              title="Print progress report"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

        {/* Activity log */}

        {showLog && (
          <div className="mt-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 max-h-48 overflow-y-auto">

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Activity Log
            </h3>

            {log.length === 0 ? (
              <p className="text-xs text-slate-500">
                No activity yet.
              </p>
            ) : (
              <ul className="space-y-1.5">

                {[...log]
                  .reverse()
                  .map(
                    (
                      entry,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                        className="text-xs text-slate-400 flex items-center justify-between gap-2"
                      >
                        <span>
                          {
                            entry.text
                          }
                        </span>

                        <span className="text-slate-600 shrink-0">
                          {new Date(
                            entry.time
                          ).toLocaleString()}
                        </span>
                      </li>
                    )
                  )}

              </ul>
            )}

          </div>
        )}

        {/* Stats */}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Checked */}

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">

            <div className="text-3xl font-bold font-mono text-white">
              {checkedCount}/
              {TOTAL_JOBSHEETS}
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Checked Jobsheets
            </p>

          </div>

          {/* PDF */}

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">

            <div className="text-3xl font-bold font-mono text-white">
              {withPdfCount}/
              {TOTAL_JOBSHEETS}
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Jobsheets with PDF
            </p>

          </div>

          {/* TXT */}

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">

            <div className="text-3xl font-bold font-mono text-white">
              {withTxtCount}/
              {TOTAL_JOBSHEETS}
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Jobsheets with TXT
            </p>

          </div>

        </div>

        {/* Progress */}

        <div className="mt-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">

          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">

            <span>
              Overall Progress
            </span>

            <span className="font-mono text-teal-300">
              {progressPct}%
            </span>

          </div>

          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
              }}
            />

          </div>

        </div>

        {/* Bulk upload */}

        <div
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={(event) => {
            event.preventDefault();

            void handleBulkFiles(
              event.dataTransfer
                .files
            );
          }}
          className="mt-4 border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs text-slate-400 transition-colors cursor-pointer"
          onClick={() =>
            bulkInputRef.current?.click()
          }
        >

          <Upload className="w-4 h-4 text-teal-400" />

          Drag & drop multiple PDF/TXT files here, or click to bulk upload

          <input
            ref={
              bulkInputRef
            }
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleBulkFiles(
                event.target.files
              );

              /*
               * Reset the input so the same file
               * can be selected again later.
               */
              event.currentTarget.value =
                '';
            }}
          />

        </div>

        {/* Search / filter / sort */}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">

            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search jobsheets..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />

          </div>

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as typeof statusFilter
              )
            }
            className="bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
          >

            {STATUS_FILTERS.map(
              (filter) => (
                <option
                  key={
                    filter.value
                  }
                  value={
                    filter.value
                  }
                  className="bg-slate-900"
                >
                  {
                    filter.label
                  }
                </option>
              )
            )}

          </select>

          <button
            onClick={() =>
              setSortBy(
                (previous) =>
                  previous ===
                  'id'
                    ? 'status'
                    : previous ===
                        'status'
                      ? 'deadline'
                      : 'id'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 hover:border-teal-500 transition-colors"
          >

            <ArrowUpDown className="w-3.5 h-3.5" />

            Sort:{' '}
            {sortBy === 'id'
              ? 'ID'
              : sortBy ===
                  'status'
                ? 'Status'
                : 'Deadline'}

          </button>

        </div>

        {/* Jobsheets */}

        <div className="mt-8">

          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white mb-4">

            <BookOpen className="w-4 h-4 text-teal-400" />

            My Jobsheets

          </h2>

          {filtered.length ===
          0 ? (

            <div className="py-16 flex flex-col items-center gap-2 text-center">

              <FileText className="w-8 h-8 text-slate-700" />

              <p className="text-sm text-slate-500">
                No jobsheets match your filters.
              </p>

              <button
                onClick={() => {
                  setSearch(
                    ''
                  );

                  setStatusFilter(
                    'all'
                  );
                }}
                className="text-xs text-teal-400 hover:text-teal-300 underline"
              >
                Clear filters
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {filtered.map(
                (j) => {
                  const meta =
                    STATUS_META[
                      j.status
                    ];

                  const overdue =
                    isOverdue(
                      j.id,
                      j.status !==
                        'not-started'
                    );

                  const hasPdf =
                    !!j.pdfUrl;

                  const hasTxt =
                    !!j.txtUrl;

                  return (
                    <div
                      key={
                        j.id
                      }
                      className={`bg-slate-900/50 border rounded-2xl p-5 text-left transition-transform hover:scale-[1.02] ${
                        overdue
                          ? 'border-red-500/50'
                          : 'border-slate-800/80'
                      }`}
                    >

                      {/* Jobsheet header */}

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              hasPdf ||
                              hasTxt
                                ? 'bg-teal-500/15 text-teal-400'
                                : 'bg-slate-800 text-slate-600'
                            }`}
                          >

                            <FileText className="w-4 h-4" />

                          </span>

                          <h3 className="text-sm font-bold text-white">
                            Jobsheet{' '}
                            {j.id}
                          </h3>

                        </div>

                        <span
                          className={`flex items-center gap-1 text-[10px] font-mono ${
                            overdue
                              ? 'text-red-400'
                              : 'text-slate-500'
                          }`}
                        >

                          <CalendarClock className="w-3 h-3" />

                          {formatDeadline(
                            j.id
                          )}

                        </span>

                      </div>

                      {/* Status */}

                      <div className="mt-2 flex items-center gap-1.5 text-xs">

                        <span
                          className={`w-2 h-2 rounded-full ${meta.dot}`}
                        />

                        <span
                          className={
                            meta.text
                          }
                        >
                          {
                            meta.label
                          }
                        </span>

                        {overdue && (
                          <span className="text-[10px] text-red-400 font-semibold">
                            OVERDUE
                          </span>
                        )}

                      </div>

                      {/* PDF filename */}

                      <p className="mt-2 text-xs text-slate-500 truncate">

                        {j.pdfName
                          ? `PDF: ${j.pdfName}`
                          : 'No PDF uploaded'}

                      </p>

                      {/* TXT filename */}

                      <p className="mt-1 text-xs text-slate-500 truncate">

                        {j.txtName
                          ? `TXT: ${j.txtName}`
                          : 'No TXT uploaded'}

                      </p>

                      {/* PDF uploaded time */}

                      {j.uploadedAt && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          PDF uploaded:{' '}
                          {
                            j.uploadedAt
                          }
                        </p>
                      )}

                      {/* TXT uploaded time */}

                      {j.txtUploadedAt && (
                        <p className="mt-0.5 text-[11px] text-slate-600">
                          TXT uploaded:{' '}
                          {
                            j.txtUploadedAt
                          }
                        </p>
                      )}

                      {/* Lecturer note */}

                      {j.note && (
                        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">

                          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />

                          {
                            j.note
                          }

                        </p>
                      )}

                      {/* Personal note */}

                      <input
                        type="text"
                        value={
                          personalNotes[
                            j.id
                          ] ??
                          ''
                        }
                        onChange={(
                          event
                        ) =>
                          handlePersonalNoteChange(
                            j.id,
                            event
                              .target
                              .value
                          )
                        }
                        onBlur={() =>
                          handlePersonalNoteBlur(
                            j.id
                          )
                        }
                        placeholder="Personal reminder (only you see this)"
                        className="mt-2 w-full bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-600"
                      />

                      {/* Hidden inputs */}

                      <div className="mt-3 flex flex-wrap items-center gap-2">

                        {/* PDF input */}

                        <input
                          ref={(element) => {
                            fileInputRefs.current[
                              j.id
                            ] =
                              element;
                          }}
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(
                            event
                          ) => {
                            handleFileChange(
                              j.id,
                              event
                                .target
                                .files?.[0] ??
                                null
                            );

                            event.currentTarget.value =
                              '';
                          }}
                        />

                        {/* TXT input */}

                        <input
                          ref={(element) => {
                            txtInputRefs.current[
                              j.id
                            ] =
                              element;
                          }}
                          type="file"
                          accept=".txt,text/plain"
                          className="hidden"
                          onChange={(
                            event
                          ) => {
                            const file =
                              event
                                .target
                                .files?.[0] ??
                              null;

                            if (
                              !file
                            ) {
                              return;
                            }

                            void logAndUpload(
                              j.id,
                              file,
                              'txt'
                            );

                            event.currentTarget.value =
                              '';
                          }}
                        />

                        {/* Live input */}

                        <input
                          ref={(element) => {
                            liveInputRefs.current[
                              j.id
                            ] =
                              element;
                          }}
                          type="file"
                          accept=".html,.htm,text/html"
                          className="hidden"
                          onChange={(
                            event
                          ) => {
                            handleLiveFileChange(
                              j.id,
                              event
                                .target
                                .files?.[0] ??
                                null
                            );

                            event.currentTarget.value =
                              '';
                          }}
                        />

                        {/* PDF controls */}

                        {hasPdf ? (

                          <span className="inline-flex items-center rounded-full bg-slate-800 overflow-hidden">

                            <a
                              href={
                                j.pdfUrl!
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-semibold hover:bg-slate-700 text-slate-200 transition-colors"
                            >

                              <Eye className="w-3.5 h-3.5" />

                              View PDF

                            </a>

                            <button
                              onClick={() =>
                                void handleDeletePdf(
                                  j.id
                                )
                              }
                              aria-label="Delete PDF"
                              className="px-2 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            >

                              <X className="w-3.5 h-3.5" />

                            </button>

                          </span>

                        ) : (

                          <button
                            onClick={() =>
                              fileInputRefs.current[
                                j.id
                              ]?.click()
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-teal-600/80 hover:bg-teal-500 text-white transition-colors"
                          >

                            <Upload className="w-3.5 h-3.5" />

                            Upload PDF

                          </button>

                        )}

                        {/* TXT controls */}

                        {hasTxt ? (

                          <span className="inline-flex items-center rounded-full bg-slate-800 overflow-hidden">

                            <a
                              href={
                                j.txtUrl!
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-semibold hover:bg-slate-700 text-slate-200 transition-colors"
                            >

                              <Eye className="w-3.5 h-3.5" />

                              View TXT

                            </a>

                            <button
                              onClick={() =>
                                void handleDeleteTxt(
                                  j.id
                                )
                              }
                              aria-label="Delete TXT"
                              className="px-2 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            >

                              <X className="w-3.5 h-3.5" />

                            </button>

                          </span>

                        ) : (

                          <button
                            onClick={() =>
                              txtInputRefs.current[
                                j.id
                              ]?.click()
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-600/80 hover:bg-blue-500 text-white transition-colors"
                          >

                            <Upload className="w-3.5 h-3.5" />

                            Upload TXT

                          </button>

                        )}

                        {/* Live controls */}

                        {j.liveUrl ? (

                          <span className="inline-flex items-center rounded-full bg-slate-800 overflow-hidden">

                            <a
                              href={
                                j.liveUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-semibold hover:bg-slate-700 text-slate-200 transition-colors"
                            >

                              <Radio className="w-3.5 h-3.5" />

                              View Live

                            </a>

                            <button
                              onClick={() =>
                                handleDeleteLive(
                                  j.id
                                )
                              }
                              aria-label="Delete live recording"
                              className="px-2 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            >

                              <X className="w-3.5 h-3.5" />

                            </button>

                          </span>

                        ) : (

                          <button
                            onClick={() =>
                              liveInputRefs.current[
                                j.id
                              ]?.click()
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-600/80 hover:bg-amber-500 text-white transition-colors"
                          >

                            <Radio className="w-3.5 h-3.5" />

                            Upload Live

                          </button>

                        )}

                        {/* Copy link */}

                        <button
                          onClick={() =>
                            handleCopyLink(
                              j.id
                            )
                          }
                          title="Copy link to this jobsheet"
                          className="p-1.5 text-slate-500 hover:text-teal-400 bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
                        >

                          <Link2 className="w-3.5 h-3.5" />

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </section>
  );
};

export default StudentDashboard;