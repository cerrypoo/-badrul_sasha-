export type ThemeMode = 'day' | 'night';

export type Student = 'sasha' | 'badrul';

export type JobsheetStatus = 'not-started' | 'in-progress' | 'checked';

export interface JobsheetItem {
  id: number;
  status: JobsheetStatus;
  pdfName: string | null;
  pdfUrl: string | null;
  uploadedAt: string | null;
  liveName: string | null;
  liveUrl: string | null;
  note: string | null;
}
