import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { checkPin, unlock } from '../utils/auth';
import { Student } from '../types';

interface PinGateProps {
  student: Student;
  name: string;
  onUnlocked: () => void;
  onCancel: () => void;
}

export const PinGate: React.FC<PinGateProps> = ({ student, name, onUnlocked, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPin(student, pin)) {
      unlock(student);
      onUnlocked();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <section className="relative w-full min-h-[70vh] py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-white">This is {name}'s Jobsheet</h1>
          <p className="mt-1 text-xs text-slate-400">Enter {name}'s PIN to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="PIN"
              className={`w-full text-center tracking-[0.4em] bg-slate-950/60 border rounded-xl px-4 py-3 text-lg text-white placeholder:text-slate-600 focus:outline-none ${
                error ? 'border-red-500' : 'border-slate-800 focus:border-teal-500'
              }`}
            />
            {error && <p className="mt-2 text-xs text-red-400">Wrong PIN — try again.</p>}
            <button
              type="submit"
              className="mt-4 w-full py-2.5 text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
