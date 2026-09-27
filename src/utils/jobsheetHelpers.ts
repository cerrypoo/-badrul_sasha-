const COURSE_START = new Date('2026-09-01T00:00:00');

/** Deterministic demo deadline: one jobsheet due every 5 days from course start. */
export const getDeadline = (id: number): Date => {
  const d = new Date(COURSE_START);
  d.setDate(d.getDate() + id * 5);
  return d;
};

export const formatDeadline = (id: number) =>
  getDeadline(id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const isOverdue = (id: number, done: boolean) => !done && getDeadline(id).getTime() < Date.now();

export interface RankInfo {
  label: string;
  emoji: string;
  color: string;
}

export const getRank = (checkedCount: number): RankInfo => {
  if (checkedCount >= 16) return { label: 'Lion', emoji: '🦁', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' };
  if (checkedCount >= 8) return { label: 'Cat', emoji: '🐈', color: 'text-teal-300 bg-teal-500/15 border-teal-500/30' };
  return { label: 'Kitten', emoji: '🐾', color: 'text-slate-300 bg-slate-500/15 border-slate-500/30' };
};
