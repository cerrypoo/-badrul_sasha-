export interface LogEntry {
  time: number;
  text: string;
}

const logKey = (student: string) => `jobsheet-log-${student}`;
const noteKey = (student: string, id: number) => `jobsheet-personal-note-${student}-${id}`;

export const readLog = (student: string): LogEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(logKey(student)) ?? '[]');
  } catch {
    return [];
  }
};

export const appendLog = (student: string, text: string) => {
  const entries = readLog(student);
  entries.push({ time: Date.now(), text });
  localStorage.setItem(logKey(student), JSON.stringify(entries.slice(-50)));
};

export const readPersonalNote = (student: string, id: number): string => {
  try {
    return localStorage.getItem(noteKey(student, id)) ?? '';
  } catch {
    return '';
  }
};

export const savePersonalNote = (student: string, id: number, value: string) => {
  try {
    localStorage.setItem(noteKey(student, id), value);
  } catch {
    // Ignore storage failures (private mode, quota).
  }
};

/** Consecutive-day streak ending today, based on log entry dates. */
export const computeStreak = (entries: LogEntry[]): number => {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map((e) => new Date(e.time).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
