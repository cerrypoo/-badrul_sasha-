import { useState, useEffect } from 'react';
import { ThemeMode, ConfirmedBooking, Student, JobsheetItem } from './types';
import { preloadVideos } from './services/videoCache';
import { Navbar } from './components/Navbar';
import { HeroVideoBackground } from './components/HeroVideoBackground';
import { HeroSection } from './components/HeroSection';
import { BookingSection } from './components/BookingSection';
import { GallerySection } from './components/GallerySection';
import { Footer } from './components/Footer';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { JobsheetPage } from './components/JobsheetPage';
import { LibraryPage } from './components/LibraryPage';

const TOTAL_JOBSHEETS = 24;

const createInitialJobsheets = (): JobsheetItem[] =>
  Array.from({ length: TOTAL_JOBSHEETS }, (_, i) => ({
    id: i + 1,
    status: 'not-started',
    pdfName: null,
    pdfUrl: null,
    uploadedAt: null,
    liveName: null,
    liveUrl: null,
  }));


export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('day');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);
  const [page, setPage] = useState<'home' | 'jobsheet' | 'library'>('home');
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [jobsheetsByStudent, setJobsheetsByStudent] = useState<Record<Student, JobsheetItem[]>>({
    sasha: createInitialJobsheets(),
    badrul: createInitialJobsheets(),
  });

  const updateStudentJobsheets = (student: Student, jobsheets: JobsheetItem[]) => {
    setJobsheetsByStudent((prev) => ({ ...prev, [student]: jobsheets }));
  };

  // Scroll to a section once the home page has mounted (needed when navigating from Jobsheet)
  useEffect(() => {
    if (page !== 'home' || !pendingScrollId) return;
    const el = document.getElementById(pendingScrollId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setPendingScrollId(null);
  }, [page, pendingScrollId]);

  // Preload videos into cache immediately on launch
  useEffect(() => {
    preloadVideos([
      'videos/cats-day.webm',
      'videos/cats-night.webm',
      'videos/cats-day.mp4',
      'videos/cats-night.mp4',
    ]);
  }, []);

  // Update active section on scroll
  useEffect(() => {
    const sections = ['hero', 'book', 'gallery'];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }

      // Default to hero if near top
      if (scrollY < windowHeight * 0.4) {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'day' ? 'night' : 'day'));
  };

  const handleOpenBooking = () => {
    const el = document.getElementById('book');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSuccess = (booking: ConfirmedBooking) => {
    setConfirmedBooking(booking);
  };

  const handleNavigateSection = (id: string) => {
    setPage('home');
    setPendingScrollId(id);
  };

  const handleNavigateJobsheet = () => {
    setPage('jobsheet');
    window.scrollTo({ top: 0 });
  };

  const handleNavigateLibrary = () => {
    setPage('library');
    window.scrollTo({ top: 0 });
  };

  if (page === 'jobsheet' || page === 'library') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onOpenBooking={handleOpenBooking}
          activeSection={page}
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
          onNavigateSection={handleNavigateSection}
        />
        {page === 'jobsheet' ? (
          <JobsheetPage
            jobsheetsByStudent={jobsheetsByStudent}
            onUpdateStudentJobsheets={updateStudentJobsheets}
          />
        ) : (
          <LibraryPage
            jobsheetsByStudent={jobsheetsByStudent}
            onUpdateStudentJobsheets={updateStudentJobsheets}
          />
        )}
        <Footer onNavigateSection={handleNavigateSection} onNavigateJobsheet={handleNavigateJobsheet} onNavigateLibrary={handleNavigateLibrary} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        themeMode === 'day' ? 'bg-slate-950 text-slate-100' : 'bg-[#080d1a] text-slate-100'
      }`}
    >
      {/* 1. Hero Section with Optimized Dual-Video Background */}
      <HeroVideoBackground themeMode={themeMode} onToggleTheme={handleToggleTheme}>
        {/* Navigation Bar matching reference photo */}
        <Navbar
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onOpenBooking={handleOpenBooking}
          activeSection={activeSection}
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
          onNavigateSection={handleNavigateSection}
        />

        {/* Hero Body: Stylized CATS wordmark & Book Now CTA */}
        <HeroSection
          themeMode={themeMode}
          onBookNowClick={handleOpenBooking}
        />
      </HeroVideoBackground>

      {/* 2. Interactive Booking Section ("Book") */}
      <BookingSection />

      {/* 4. Gallery Section ("Gallery") */}
      <GallerySection />

      {/* 6. Footer */}
      <Footer onNavigateSection={handleNavigateSection} onNavigateJobsheet={handleNavigateJobsheet} onNavigateLibrary={handleNavigateLibrary} />

      {/* 7. Booking Confirmation Modal */}
      <BookingConfirmationModal
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
}
