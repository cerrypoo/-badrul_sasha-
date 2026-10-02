import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  FileText,
  Eye,
  Radio,
  PawPrint,
  Lock,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCheck,
  Undo2,
  Download,
} from 'lucide-react';

import { Student, JobsheetItem } from '../types';
import { playPurr } from '../utils/meow';
import { logReview, countReviewedToday } from '../utils/localLog';
import { TOTAL_JOBSHEETS } from '../utils/jobsheetHelpers';
import { useToast } from './ToastProvider';

const STUDENT_NAMES: Record<Student, string> = {
  sasha: 'Sasha',
  badrul: 'Badrul',
};

const STUDENT_PHOTOS: Record<Student, string> = {
  sasha: 'images/sasha.jpg',
  badrul: 'images/badrul.jpg',
};

type ReviewFilter = 'all' | 'pending' | 'checked';
type ViewMode = 'grid' | 'list';

/**
 * Extend the existing JobsheetItem
 * with TXT document information.
 */
type JobsheetWithDocuments = JobsheetItem & {
  txtName?: string | null;
  txtUrl?: string | null;
  txtUploadedAt?: string | null;
};

interface LibraryPageProps {
  jobsheetsByStudent: Record<Student, JobsheetItem[]>;
  onUpdateStudentJobsheets: (
    student: Student,
    jobsheets: JobsheetItem[]
  ) => void;
  onRefresh: () => Promise<void>;
  onLock: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  jobsheetsByStudent,
  onUpdateStudentJobsheets,
  onRefresh,
  onLock,
}) => {
  const { showToast } = useToast();

  const [activeStudent, setActiveStudent] =
    useState<Student>('sasha');

  const [filter, setFilter] =
    useState<ReviewFilter>('all');

  const [viewMode, setViewMode] =
    useState<ViewMode>('grid');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [loadingDocuments, setLoadingDocuments] =
    useState(false);

  /**
   * Refresh button: re-read uploads from Supabase Storage.
   */
  const handleRefresh = async () => {
    setLoadingDocuments(true);
    await onRefresh();
    setLoadingDocuments(false);

    showToast(
      'Library refreshed.'
    );
  };

  /**
   * Uploaded jobsheets.
   *
   * A jobsheet is considered uploaded if it
   * has either PDF OR TXT.
   */
  const allComplete = useMemo(
    () =>
      (
        Object.keys(
          STUDENT_NAMES
        ) as Student[]
      ).flatMap((student) =>
        (
          jobsheetsByStudent[
            student
          ] || []
        ).filter(
          (jobsheet) =>
            !!jobsheet.pdfUrl ||
            !!(
              jobsheet as JobsheetWithDocuments
            ).txtUrl
        )
      ),
    [jobsheetsByStudent]
  );

  /**
   * Total checked.
   */
  const totalChecked =
    allComplete.filter(
      (jobsheet) =>
        jobsheet.status === 'checked'
    ).length;

  /**
   * Class percentage.
   */
  const classPct =
    allComplete.length > 0
      ? Math.round(
          (totalChecked /
            allComplete.length) *
            100
        )
      : 0;

  /**
   * Pending review count.
   */
  const pendingReviewCount =
    allComplete.filter(
      (jobsheet) =>
        jobsheet.status !== 'checked'
    ).length;

  /**
   * Current student's jobsheets.
   */
  const studentJobsheets =
    jobsheetsByStudent[
      activeStudent
    ] || [];

  /**
   * Filter current student's uploaded jobsheets.
   *
   * PDF OR TXT is enough.
   */
  const filteredJobsheets =
    studentJobsheets.filter(
      (jobsheet) => {
        const extended =
          jobsheet as JobsheetWithDocuments;

        /**
         * Must have PDF or TXT.
         */
        if (
          !jobsheet.pdfUrl &&
          !extended.txtUrl
        ) {
          return false;
        }

        /**
         * Review filter.
         */
        if (
          filter === 'pending' &&
          jobsheet.status === 'checked'
        ) {
          return false;
        }

        if (
          filter === 'checked' &&
          jobsheet.status !== 'checked'
        ) {
          return false;
        }

        /**
         * Search.
         */
        if (
          searchQuery.trim()
        ) {
          const query =
            searchQuery
              .trim()
              .toLowerCase();

          const searchableText = [
            String(jobsheet.id),

            jobsheet.pdfName || '',

            extended.txtName || '',

            jobsheet.uploadedAt || '',

            extended.txtUploadedAt || '',
          ]
            .join(' ')
            .toLowerCase();

          if (
            !searchableText.includes(
              query
            )
          ) {
            return false;
          }
        }

        return true;
      }
    );

  /**
   * Check jobsheet.
   */
  const checkJobsheet = (
    student: Student,
    id: number
  ) => {
    const updated =
      (
        jobsheetsByStudent[
          student
        ] || []
      ).map(
        (jobsheet) =>
          jobsheet.id === id
            ? {
                ...jobsheet,
                status:
                  'checked' as const,
              }
            : jobsheet
      );

    onUpdateStudentJobsheets(
      student,
      updated
    );

    logReview();

    playPurr();

    showToast(
      `Jobsheet ${id} marked as checked.`
    );
  };

  /**
   * Undo check.
   */
  const undoCheck = (
    student: Student,
    id: number
  ) => {
    const updated =
      (
        jobsheetsByStudent[
          student
        ] || []
      ).map(
        (jobsheet) =>
          jobsheet.id === id
            ? {
                ...jobsheet,
                status:
                  'in-progress' as const,
              }
            : jobsheet
      );

    onUpdateStudentJobsheets(
      student,
      updated
    );

    showToast(
      `Jobsheet ${id} moved back to pending.`
    );
  };

  /**
   * Check all uploaded jobsheets.
   */
  const checkAll = () => {
    const current =
      jobsheetsByStudent[
        activeStudent
      ] || [];

    const pending =
      current.filter(
        (jobsheet) => {
          const extended =
            jobsheet as JobsheetWithDocuments;

          return (
            (
              !!jobsheet.pdfUrl ||
              !!extended.txtUrl
            ) &&
            jobsheet.status !==
              'checked'
          );
        }
      );

    if (
      pending.length === 0
    ) {
      showToast(
        'There are no pending submissions.'
      );

      return;
    }

    const updated =
      current.map(
        (jobsheet) => {
          const extended =
            jobsheet as JobsheetWithDocuments;

          return (
            (
              !!jobsheet.pdfUrl ||
              !!extended.txtUrl
            ) &&
            jobsheet.status !==
              'checked'
          )
            ? {
                ...jobsheet,
                status:
                  'checked' as const,
              }
            : jobsheet;
        }
      );

    onUpdateStudentJobsheets(
      activeStudent,
      updated
    );

    pending.forEach(
      () => {
        logReview();
      }
    );

    playPurr();

    showToast(
      `${pending.length} jobsheet(s) marked as checked.`
    );
  };

  /**
   * Download PDF.
   */
  const downloadPdf = async (
    jobsheet: JobsheetItem
  ) => {
    if (!jobsheet.pdfUrl) {
      showToast(
        'PDF is not available.'
      );

      return;
    }

    try {
      const response =
        await fetch(
          jobsheet.pdfUrl
        );

      if (!response.ok) {
        throw new Error(
          'PDF download failed'
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        jobsheet.pdfName ||
        `jobsheet-${jobsheet.id}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

    } catch (error) {
      console.error(
        'PDF DOWNLOAD ERROR:',
        error
      );

      showToast(
        'Unable to download PDF.'
      );
    }
  };

  /**
   * Download TXT.
   */
  const downloadTxt = async (
    jobsheet: JobsheetItem
  ) => {
    const extended =
      jobsheet as JobsheetWithDocuments;

    if (!extended.txtUrl) {
      showToast(
        'TXT file is not available.'
      );

      return;
    }

    try {
      const response =
        await fetch(
          extended.txtUrl
        );

      if (!response.ok) {
        throw new Error(
          'TXT download failed'
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        extended.txtName ||
        `jobsheet-${jobsheet.id}.txt`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

    } catch (error) {
      console.error(
        'TXT DOWNLOAD ERROR:',
        error
      );

      showToast(
        'Unable to download TXT.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <div className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-500/20 p-3">
                <Sparkles
                  size={24}
                  className="text-indigo-300"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Library
                </h1>

                <p className="text-sm text-slate-400">
                  Review uploaded student jobsheets
                </p>
              </div>

            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={handleRefresh}
                disabled={
                  loadingDocuments
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    loadingDocuments
                      ? 'animate-spin'
                      : ''
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={onLock}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                <Lock size={16} />

                Lock
              </button>

            </div>

          </div>

          {/* STATS */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <div className="text-sm text-slate-400">
                Uploaded Files
              </div>

              <div className="mt-2 text-2xl font-bold">
                {allComplete.length}
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <div className="text-sm text-slate-400">
                Checked
              </div>

              <div className="mt-2 text-2xl font-bold">
                {totalChecked}
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <div className="text-sm text-slate-400">
                Pending
              </div>

              <div className="mt-2 text-2xl font-bold">
                {pendingReviewCount}
              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

              <div className="text-sm text-slate-400">
                Progress
              </div>

              <div className="mt-2 text-2xl font-bold">
                {classPct}%
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* STUDENTS */}
        <div className="mb-6 flex flex-wrap gap-3">

          {(Object.keys(
            STUDENT_NAMES
          ) as Student[]).map(
            (student) => {

              const count =
                (
                  jobsheetsByStudent[
                    student
                  ] || []
                ).filter(
                  (jobsheet) => {
                    const extended =
                      jobsheet as JobsheetWithDocuments;

                    return (
                      !!jobsheet.pdfUrl ||
                      !!extended.txtUrl
                    );
                  }
                ).length;

              return (
                <button
                  key={student}
                  type="button"
                  onClick={() =>
                    setActiveStudent(
                      student
                    )
                  }
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    activeStudent ===
                    student
                      ? 'border-indigo-400/50 bg-indigo-500/15'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >

                  <img
                    src={
                      STUDENT_PHOTOS[
                        student
                      ]
                    }
                    alt={
                      STUDENT_NAMES[
                        student
                      ]
                    }
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <div className="text-left">

                    <div className="font-semibold">
                      {
                        STUDENT_NAMES[
                          student
                        ]
                      }
                    </div>

                    <div className="text-xs text-slate-400">
                      {count} uploaded
                    </div>

                  </div>

                </button>
              );
            }
          )}

        </div>

        {/* TOOLBAR */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-wrap gap-2">

            {(
              [
                'all',
                'pending',
                'checked',
              ] as ReviewFilter[]
            ).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(
                      item
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-sm ${
                    filter === item
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  {item ===
                  'all'
                    ? 'All'
                    : item ===
                        'pending'
                      ? 'Pending'
                      : 'Checked'}
                </button>
              )
            )}

          </div>

          <div className="flex flex-wrap gap-2">

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search jobsheet..."
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'grid'
                )
              }
              className={`rounded-xl p-2.5 ${
                viewMode ===
                'grid'
                  ? 'bg-indigo-500'
                  : 'bg-white/5'
              }`}
            >
              <LayoutGrid
                size={18}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'list'
                )
              }
              className={`rounded-xl p-2.5 ${
                viewMode ===
                'list'
                  ? 'bg-indigo-500'
                  : 'bg-white/5'
              }`}
            >
              <List size={18} />
            </button>

            <button
              type="button"
              onClick={checkAll}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300"
            >
              <CheckCheck
                size={16}
              />

              Check All
            </button>

          </div>

        </div>

        {/* LOADING */}
        {loadingDocuments && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-indigo-300">

            <RefreshCw
              size={17}
              className="animate-spin"
            />

            Loading uploaded files...

          </div>
        )}

        {/* EMPTY */}
        {!loadingDocuments &&
          filteredJobsheets.length ===
            0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">

              <FileText
                size={32}
                className="mx-auto text-slate-600"
              />

              <h2 className="mt-4 text-lg font-semibold">
                Nothing here yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">

                {studentJobsheets.some(
                  (jobsheet) => {
                    const extended =
                      jobsheet as JobsheetWithDocuments;

                    return (
                      !!jobsheet.pdfUrl ||
                      !!extended.txtUrl
                    );
                  }
                )
                  ? 'Nothing matches this filter.'
                  : 'Waiting for a PDF or TXT submission.'}

              </p>

            </div>
          )}

        {/* GRID */}
        {viewMode === 'grid' &&
          filteredJobsheets.length >
            0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredJobsheets.map(
                (jobsheet) => {

                  const extended =
                    jobsheet as JobsheetWithDocuments;

                  const checked =
                    jobsheet.status ===
                    'checked';

                  return (
                    <div
                      key={
                        jobsheet.id
                      }
                      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
                    >

                      {/* JOBSHEET HEADER */}
                      <div className="border-b border-white/10 p-5">

                        <div className="flex items-start justify-between">

                          <div>

                            <div className="text-xs uppercase tracking-wider text-slate-500">
                              Jobsheet
                            </div>

                            <div className="mt-1 text-xl font-bold">
                              #
                              {
                                jobsheet.id
                              }
                            </div>

                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-xs ${
                              checked
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : 'bg-amber-500/10 text-amber-300'
                            }`}
                          >
                            {checked
                              ? 'Checked'
                              : 'Pending'}
                          </div>

                        </div>

                      </div>

                      {/* FILES */}
                      <div className="space-y-3 p-5">

                        {/* PDF */}
                        {jobsheet.pdfUrl && (
                          <a
                            href={
                              jobsheet.pdfUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                          >

                            <div className="flex items-center gap-3">

                              <FileText
                                size={20}
                                className="text-red-300"
                              />

                              <div>

                                <div className="text-sm font-medium">
                                  PDF
                                </div>

                                <div className="max-w-[220px] truncate text-xs text-slate-500">
                                  {
                                    jobsheet.pdfName
                                  }
                                </div>

                              </div>

                            </div>

                            <Eye
                              size={17}
                              className="text-slate-400"
                            />

                          </a>
                        )}

                        {/* TXT */}
                        {extended.txtUrl && (
                          <a
                            href={
                              extended.txtUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                          >

                            <div className="flex items-center gap-3">

                              <FileText
                                size={20}
                                className="text-sky-300"
                              />

                              <div>

                                <div className="text-sm font-medium">
                                  TXT
                                </div>

                                <div className="max-w-[220px] truncate text-xs text-slate-500">
                                  {
                                    extended.txtName
                                  }
                                </div>

                              </div>

                            </div>

                            <Eye
                              size={17}
                              className="text-slate-400"
                            />

                          </a>
                        )}

                        {/* LIVE */}
                        {jobsheet.liveUrl ? (
                          <a
                            href={
                              jobsheet.liveUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                          >

                            <div className="flex items-center gap-3">

                              <Radio
                                size={20}
                                className="text-cyan-300"
                              />

                              <div>

                                <div className="text-sm font-medium">
                                  Live
                                </div>

                                <div className="text-xs text-slate-500">
                                  Open live submission
                                </div>

                              </div>

                            </div>

                            <Eye
                              size={17}
                              className="text-slate-400"
                            />

                          </a>
                        ) : (
                          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 p-4">

                            <Radio
                              size={20}
                              className="text-slate-600"
                            />

                            <div>

                              <div className="text-sm text-slate-400">
                                Live
                              </div>

                              <div className="text-xs text-slate-600">
                                Not uploaded yet
                              </div>

                            </div>

                          </div>
                        )}

                        {/* UPLOAD DATE */}
                        {(jobsheet.uploadedAt ||
                          extended.txtUploadedAt) && (
                          <div className="text-xs text-slate-500">

                            Uploaded:{' '}

                            {jobsheet.uploadedAt ||
                              extended.txtUploadedAt}

                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-2 border-t border-white/10 p-5">

                        {/* DOWNLOAD PDF */}
                        {jobsheet.pdfUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadPdf(
                                jobsheet
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-300"
                          >

                            <Download
                              size={16}
                            />

                            PDF

                          </button>
                        )}

                        {/* DOWNLOAD TXT */}
                        {extended.txtUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadTxt(
                                jobsheet
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-slate-300"
                          >

                            <Download
                              size={16}
                            />

                            TXT

                          </button>
                        )}

                        {/* CHECK / UNDO */}
                        {checked ? (
                          <button
                            type="button"
                            onClick={() =>
                              undoCheck(
                                activeStudent,
                                jobsheet.id
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2.5 text-sm text-amber-300"
                          >

                            <Undo2
                              size={16}
                            />

                            Undo

                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              checkJobsheet(
                                activeStudent,
                                jobsheet.id
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300"
                          >

                            <CheckCheck
                              size={16}
                            />

                            Check

                          </button>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* LIST */}
        {viewMode === 'list' &&
          filteredJobsheets.length >
            0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">

              {filteredJobsheets.map(
                (jobsheet) => {

                  const extended =
                    jobsheet as JobsheetWithDocuments;

                  const checked =
                    jobsheet.status ===
                    'checked';

                  return (
                    <div
                      key={
                        jobsheet.id
                      }
                      className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >

                      {/* JOBSHEET INFO */}
                      <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">

                          <FileText
                            size={20}
                            className="text-indigo-300"
                          />

                        </div>

                        <div>

                          <div className="font-semibold">
                            Jobsheet #
                            {
                              jobsheet.id
                            }
                          </div>

                          <div className="max-w-[350px] truncate text-sm text-slate-500">

                            {jobsheet.pdfName ||
                              extended.txtName ||
                              'Uploaded file'}

                          </div>

                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-wrap gap-2">

                        {/* PDF */}
                        {jobsheet.pdfUrl && (
                          <a
                            href={
                              jobsheet.pdfUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300"
                          >

                            <FileText
                              size={15}
                            />

                            PDF

                          </a>
                        )}

                        {/* TXT */}
                        {extended.txtUrl && (
                          <a
                            href={
                              extended.txtUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-500/10 px-3 py-2 text-sm text-sky-300"
                          >

                            <FileText
                              size={15}
                            />

                            TXT

                          </a>
                        )}

                        {/* LIVE */}
                        {jobsheet.liveUrl && (
                          <a
                            href={
                              jobsheet.liveUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300"
                          >

                            <Radio
                              size={15}
                            />

                            Live

                          </a>
                        )}

                        {/* PDF DOWNLOAD */}
                        {jobsheet.pdfUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadPdf(
                                jobsheet
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300"
                          >

                            <Download
                              size={15}
                            />

                            PDF

                          </button>
                        )}

                        {/* TXT DOWNLOAD */}
                        {extended.txtUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadTxt(
                                jobsheet
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300"
                          >

                            <Download
                              size={15}
                            />

                            TXT

                          </button>
                        )}

                        {/* CHECK / UNDO */}
                        {checked ? (
                          <button
                            type="button"
                            onClick={() =>
                              undoCheck(
                                activeStudent,
                                jobsheet.id
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-300"
                          >

                            <Undo2
                              size={15}
                            />

                            Undo

                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              checkJobsheet(
                                activeStudent,
                                jobsheet.id
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
                          >

                            <CheckCheck
                              size={15}
                            />

                            Check

                          </button>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* FOOTER */}
        <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500 md:flex-row md:justify-between">

          <div className="flex items-center gap-2">

            <PawPrint size={16} />

            Reviewed today:{' '}
            {countReviewedToday()}

          </div>

          <div>
            Total jobsheets:{' '}
            {TOTAL_JOBSHEETS}
          </div>

        </div>

      </main>
    </div>
  );
};

export default LibraryPage;