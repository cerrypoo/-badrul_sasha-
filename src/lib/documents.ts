import { supabase } from './supabase';
import { JobsheetItem, Student } from '../types';

/*
 * Storage is the source of truth for uploaded jobsheets:
 *
 *   documents/{student}/jobsheet-{id}-{timestamp}-{filename}
 *
 * ponytail: the anon key can upload and list storage, but RLS blocks
 * deleting objects and writing the documents table. So removing a file
 * uploads an empty "tombstone" named jobsheet-{id}-{timestamp}-__removed__.{pdf|txt};
 * the newest file per jobsheet+kind wins. Add a storage DELETE policy in
 * Supabase to delete files for real instead.
 */

export type DocumentKind = 'pdf' | 'txt';

const BUCKET = 'documents';
const REMOVED = '__removed__';
const STUDENTS: Student[] = ['sasha', 'badrul'];
const NAME_PATTERN = /^jobsheet-(\d+)-(\d+)-(.+)$/;

export type JobsheetWithDocuments = JobsheetItem & {
  txtName?: string | null;
  txtUrl?: string | null;
  txtUploadedAt?: string | null;
};

interface StoredDocument {
  path: string;
  name: string;
  uploadedAt: string;
}

// student -> jobsheet id -> kind -> latest file (null when removed)
export type DocumentIndex = Record<
  Student,
  Record<number, Partial<Record<DocumentKind, StoredDocument | null>>>
>;

export const formatUploadedAt = (date: Date) =>
  date.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const loadDocuments = async (): Promise<DocumentIndex> => {
  const index: DocumentIndex = { sasha: {}, badrul: {} };

  for (const student of STUDENTS) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(student, { limit: 1000 });

    if (error) {
      throw error;
    }

    const latest: Record<string, { stamp: number; name: string; path: string }> = {};

    for (const file of data ?? []) {
      const match = file.name.match(NAME_PATTERN);
      if (!match) continue;

      const [, id, stamp, name] = match;
      const kind: DocumentKind = name.toLowerCase().endsWith('.txt') ? 'txt' : 'pdf';
      const key = `${id}:${kind}`;

      if (!latest[key] || Number(stamp) > latest[key].stamp) {
        latest[key] = { stamp: Number(stamp), name, path: `${student}/${file.name}` };
      }
    }

    for (const [key, file] of Object.entries(latest)) {
      const [id, kind] = key.split(':') as [string, DocumentKind];
      const slot = (index[student][Number(id)] ??= {});

      slot[kind] = file.name.startsWith(REMOVED)
        ? null
        : {
            path: file.path,
            name: file.name,
            uploadedAt: formatUploadedAt(new Date(file.stamp)),
          };
    }
  }

  return index;
};

/*
 * Apply a loaded index to jobsheets, creating signed URLs for the files.
 */
export const applyDocuments = async (
  jobsheets: JobsheetItem[],
  docs: DocumentIndex[Student]
): Promise<JobsheetItem[]> => {
  const files = Object.values(docs).flatMap((slot) =>
    [slot.pdf, slot.txt].filter((f): f is StoredDocument => !!f)
  );

  const urls: Record<string, string> = {};

  if (files.length > 0) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(
        files.map((f) => f.path),
        60 * 60 * 24
      );

    if (error) {
      throw error;
    }

    for (const item of data ?? []) {
      if (item.path && item.signedUrl) {
        urls[item.path] = item.signedUrl;
      }
    }
  }

  return jobsheets.map((jobsheet) => {
    const slot = docs[jobsheet.id];
    if (!slot) return jobsheet;

    const next = { ...jobsheet } as JobsheetWithDocuments;

    if (slot.pdf !== undefined) {
      next.pdfName = slot.pdf?.name ?? null;
      next.pdfUrl = slot.pdf ? urls[slot.pdf.path] ?? null : null;
      next.uploadedAt = slot.pdf?.uploadedAt ?? null;
    }

    if (slot.txt !== undefined) {
      next.txtName = slot.txt?.name ?? null;
      next.txtUrl = slot.txt ? urls[slot.txt.path] ?? null : null;
      next.txtUploadedAt = slot.txt?.uploadedAt ?? null;
    }

    if (next.status === 'not-started' && (next.pdfUrl || next.txtUrl)) {
      next.status = 'in-progress';
    }

    return next;
  });
};

/*
 * Lecturer review state (status + feedback note) per jobsheet.
 *
 * ponytail: same RLS limits as above, so each save uploads a new
 * state/{timestamp}.json and the newest one wins. Two people saving at
 * the same moment means the last save wins; move this to a table with
 * insert/update policies if that starts to matter.
 */

const STATE_FOLDER = 'state';

export type ReviewState = Record<
  Student,
  Record<number, Pick<JobsheetItem, 'status' | 'note'>>
>;

export const toReviewState = (
  byStudent: Record<Student, JobsheetItem[]>
): ReviewState => {
  const state = { sasha: {}, badrul: {} } as ReviewState;

  for (const student of STUDENTS) {
    for (const j of byStudent[student]) {
      state[student][j.id] = { status: j.status, note: j.note };
    }
  }

  return state;
};

export const applyReviewState = (
  jobsheets: JobsheetItem[],
  saved: ReviewState[Student] | undefined
): JobsheetItem[] =>
  jobsheets.map((j) =>
    saved?.[j.id] ? { ...j, ...saved[j.id] } : j
  );

export const loadReviewState = async (): Promise<ReviewState | null> => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(STATE_FOLDER, {
      limit: 5,
      sortBy: { column: 'name', order: 'desc' },
    });

  if (error) {
    throw error;
  }

  const latest = data?.find((f) => /^\d+\.json$/.test(f.name));
  if (!latest) return null;

  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(`${STATE_FOLDER}/${latest.name}`);

  if (downloadError) {
    throw downloadError;
  }

  return JSON.parse(await blob.text());
};

export const saveReviewState = async (state: ReviewState) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(
      `${STATE_FOLDER}/${Date.now()}.json`,
      new Blob([JSON.stringify(state)], { type: 'application/json' }),
      { contentType: 'application/json', upsert: false }
    );

  if (error) {
    throw error;
  }
};

export const removeDocument = async (
  student: Student,
  id: number,
  kind: DocumentKind
) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(
      `${student}/jobsheet-${id}-${Date.now()}-${REMOVED}.${kind}`,
      new Blob([''], { type: 'text/plain' }),
      { contentType: 'text/plain', upsert: false }
    );

  if (error) {
    throw error;
  }
};
