import { Student } from '../types';

// NOTE: this is a client-side deterrent only, not real security — anyone who
// reads the bundled JS can see these PINs. There is no backend on this static
// site to enforce real access control. Good enough to stop casual snooping
// between Sasha and Badrul, not a substitute for real auth.
const STUDENT_PINS: Record<Student, string> = {
  sasha: '1794',
  badrul: '2468',
};

const unlockedKey = (student: Student) => `jobsheet-unlocked-${student}`;

export const checkPin = (student: Student, pin: string) => STUDENT_PINS[student] === pin;

export const isUnlocked = (student: Student): boolean => {
  try {
    return localStorage.getItem(unlockedKey(student)) === 'true';
  } catch {
    return false;
  }
};

export const unlock = (student: Student) => {
  try {
    localStorage.setItem(unlockedKey(student), 'true');
  } catch {
    // Ignore storage failures.
  }
};

export const lock = (student: Student) => {
  try {
    localStorage.removeItem(unlockedKey(student));
  } catch {
    // Ignore storage failures.
  }
};
