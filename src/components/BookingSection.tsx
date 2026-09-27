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

const MAX_TILT = 14;

export const BookingSection: React.FC = () => {
  const [tilt, setTilt] = useState<Record<string, { x: number; y: number }>>({});

  const handleMouseMove = (name: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt((prev) => ({ ...prev, [name]: { x: relX * MAX_TILT, y: -relY * MAX_TILT } }));
  };

  const handleMouseLeave = (name: string) => {
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

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {STUDENTS.map((s) => {
            const t = tilt[s.name] ?? { x: 0, y: 0 };
            return (
              <div key={s.name}>
                {/* 3D hover-pop card */}
                <div
                  onMouseMove={handleMouseMove(s.name)}
                  onMouseLeave={() => handleMouseLeave(s.name)}
                  className="h-[380px] [perspective:1200px]"
                >
                  <div
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 ease-out [transform-style:preserve-3d]"
                    style={{ transform: `rotateX(${t.y}deg) rotateY(${t.x}deg)` }}
                  >
                    <img
                      src={s.photo}
                      alt={s.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300"
                      style={{ transform: 'translateZ(10px) scale(1.02)' }}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-transform duration-300"
                      style={{ transform: 'translateZ(20px)' }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 p-6 text-left transition-transform duration-300"
                      style={{ transform: `translateZ(80px) translate(${t.x * 1.5}px, ${-t.y * 1.5}px)` }}
                    >
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">{s.name}</h3>
                      <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-teal-600/90 text-white shadow-lg">
                        {s.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Static caption below the card */}
                <div className="mt-4 text-left">
                  <p className="text-sm text-slate-300 leading-relaxed">{s.bio}</p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-1.5 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 font-mono">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                      {s.course}
                    </span>
                    <span className="text-teal-300">{s.funFact}</span>
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
