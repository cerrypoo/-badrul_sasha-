// NOTE: this is a client-side deterrent only, not real security — anyone who
// reads the bundled JS can see these PINs. There is no backend on this static
// site to enforce real access control. Good enough to stop casual snooping
// between Sasha and Badrul (and the admin/lecturer view), not a substitute
// for real auth.
const PINS: Record<string, string> = {
  sasha: '0448',
  badrul: '2468',
  admin: '0000',
};

const unlockedKey = (id: string) => `jobsheet-unlocked-${id}`;

export const checkPin = (id: string, pin: string) => PINS[id] === pin;

export const isUnlocked = (id: string): boolean => {
  try {
    return localStorage.getItem(unlockedKey(id)) === 'true';
  } catch {
    return false;
  }
};

export const unlock = (id: string) => {
  try {
    localStorage.setItem(unlockedKey(id), 'true');
  } catch {
    // Ignore storage failures.
  }
};

export const lock = (id: string) => {
  try {
    localStorage.removeItem(unlockedKey(id));
  } catch {
    // Ignore storage failures.
  }
};
