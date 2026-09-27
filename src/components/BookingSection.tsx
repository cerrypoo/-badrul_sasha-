import React, { useState } from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';

const STUDENTS = [
  {
    photo: 'images/sasha.jpg',
    name: 'Sasha',
    tag: 'Student 01',
    bio: "Hello! I'm Sasha, a student exploring the world of mobile app development. I enjoy designing clean interfaces and bringing ideas to life through code. Always learning, always curious!",
    course: 'DFD40143 • Mobile App Dev',
    funFact: 'Favorite cat breed: British Shorthair 🐾',
  },
  {
    photo: 'images/badrul.jpg',
    name: 'Badrul',
    tag: 'Student 02',
    bio: "Hi there! I'm Badrul, passionate about building things that work. I love solving problems and turning concepts into working applications. Let's build something awesome together!",
    course: 'DFD40143 • Mobile App Dev',
    funFact: 'Favorite cat breed: Maine Coon 🐾',
  },
];

const MAX_TILT = 10;

export const BookingSection: React.FC = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [tilt, setTilt] = useState<Record<string, { x: number; y: number }>>({});

  const handleMouseMove = (name: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt((prev) => ({ ...prev, [name]: { x: relX * MAX_TILT, y: -relY * MAX_TILT } }));
  };

  const handleMouseEnter = (name: string) => {
    setFlipped((prev) => ({ ...prev, [name]: true }));
  };

  const handleMouseLeave = (name: string) => {
    setFlipped((prev) => ({ ...prev, [name]: false }));
    setTilt((prev) => ({ ...prev, [name]: { x: 0, y: 0 } }));
  };

  return (
    <section id="book" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "url('images/paw_trail.jpg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '220px',
          filter: 'invert(1)',
        }}
      />
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Meet The Humans Behind The Meow</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight flex items-center justify-center gap-2">
          Who Lives in the Cat House?
          <img src="images/cat_box_icon.jpg" alt="Cat in a box" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg" />
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Meet the two students behind this portal — Sasha and Badrul
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {STUDENTS.map((s) => {
            const t = tilt[s.name] ?? { x: 0, y: 0 };
            return (
            <div
              key={s.name}
              onMouseMove={handleMouseMove(s.name)}
              onMouseEnter={() => handleMouseEnter(s.name)}
              onMouseLeave={() => handleMouseLeave(s.name)}
              className="h-[420px] cursor-pointer [perspective:1200px]"
            >
              <div
                className="relative w-full h-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
                style={{
                  transform: `rotateX(${t.y}deg) rotateY(${(flipped[s.name] ? 180 : 0) + t.x}deg)`,
                }}
              >
                {/* Front: full photo */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl [backface-visibility:hidden]">
                  <img
                    src={s.photo}
                    alt={s.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <h3 className="text-lg font-bold text-white">{s.name}</h3>
                    <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-teal-600/80 text-white">
                      {s.tag}
                    </span>
                  </div>
                </div>

                {/* Back: description */}
                <div className="absolute inset-0 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl overflow-hidden p-8 flex flex-col justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="absolute -top-2 -right-2 text-5xl opacity-10 rotate-12 select-none">🐾</span>

                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <span className="inline-block mt-2 mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-teal-600/80 text-white w-fit">
                    {s.tag}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{s.bio}</p>

                  <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-1.5 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 font-mono">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                      {s.course}
                    </span>
                    <span className="text-teal-300">{s.funFact}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
