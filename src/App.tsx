import { useState, useEffect } from 'react';
import { ThemeMode, Student, JobsheetItem } from './types';
import { preloadVideos } from './services/videoCache';
import { Navbar } from './components/Navbar';
import { HeroVideoBackground } from './components/HeroVideoBackground';
import { HeroSection } from './components/HeroSection';
import { BookingSection } from './components/BookingSection';
import { GallerySection } from './components/GallerySection';
import { Footer } from './components/Footer';
import { JobsheetPage } from './components/JobsheetPage';
import { LibraryPage } from './components/LibraryPage';
import { LeaderboardSection } from './components/LeaderboardSection';
import { FaqTestimonialSection } from './components/FaqTestimonialSection';
import { RecentActivitySection } from './components/RecentActivitySection';
import { TechStackSection } from './components/TechStackSection';
import { PawCursorTrail } from './components/PawCursorTrail';
import { CommandPalette } from './components/CommandPalette';
import { BackToTop } from './components/BackToTop';
import { ToastProvider } from './components/ToastProvider';
import { PageLoadingScreen } from './components/PageLoadingScreen';
import { PinGate } from './components/PinGate';
import { playMeow } from './utils/meow';
import { createEmptyJobsheets } from './utils/jobsheetHelpers';
import { isUnlocked, lock } from './utils/auth';
import { applyDocuments, loadDocuments } from './lib/documents';
import { useToast } from './components/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('day');
  const [page, setPage] = useState<'home' | 'about' | 'jobsheet' | 'library'>('home');
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [jobsheetsByStudent, setJobsheetsByStudent] = useState<Record<Student, JobsheetItem[]>>({
    sasha: createEmptyJobsheets(),
    badrul: createEmptyJobsheets(),
  });

  const [scrollPct, setScrollPct] = useState(0);
  const { showToast } = useToast();

  const updateStudentJobsheets = (student: Student, jobsheets: JobsheetItem[]) => {
    setJobsheetsByStudent((prev) => ({ ...prev, [student]: jobsheets }));
  };

  const resetStudentJobsheets = (student: Student) => {
    setJobsheetsByStudent((prev) => ({ ...prev, [student]: createEmptyJobsheets() }));
  };

  // Uploaded PDFs/TXTs live in Supabase Storage; pull them in so they survive a refresh
  const reloadDocuments = async () => {
    try {
      const docs = await loadDocuments();
      const [sasha, badrul] = await Promise.all([
        applyDocuments(jobsheetsByStudent.sasha, docs.sasha),
        applyDocuments(jobsheetsByStudent.badrul, docs.badrul),
      ]);
      setJobsheetsByStudent({ sasha, badrul });
    } catch (error) {
      console.error('LOAD DOCUMENTS ERROR:', error);
      showToast('Could not load uploaded jobsheets.');
    }
  };

  useEffect(() => {
    reloadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep link: #jobsheet-<student>-<id> opens the Jobsheet page for that student
  const [deepLinkStudent, setDeepLinkStudent] = useState<Student | null>(null);
  const [adminUnlocked, setAdminUnlocked] = useState(() => isUnlocked('admin'));
  useEffect(() => {
    const match = window.location.hash.match(/^#jobsheet-(sasha|badrul)/);
    if (match) {
      setPage('jobsheet');
      setDeepLinkStudent(match[1] as Student);
    }
  }, []);

  // One-shot reset of Library's "Reviewed today" counter via ?resetReviews=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resetReviews') === '1') {
      localStorage.removeItem('library-review-log');
      localStorage.removeItem('jobsheet-log-sasha');
      localStorage.removeItem('jobsheet-log-badrul');
      params.delete('resetReviews');
      const newSearch = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash);
    }
  }, []);

  const totalChecked =
    jobsheetsByStudent.sasha.filter((j) => j.status === 'checked').length +
    jobsheetsByStudent.badrul.filter((j) => j.status === 'checked').length;
  const totalJobsheets = jobsheetsByStudent.sasha.length + jobsheetsByStudent.badrul.length;

  // Scroll progress bar
  useEffect(() => {
    const handle = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(height > 0 ? (window.scrollY / height) * 100 : 0);
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  // Play a tiny meow chirp on any button click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('button')) playMeow();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Scroll to a section once its page has mounted (needed when navigating from another page)
  useEffect(() => {
    if (!pendingScrollId) return;
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

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'day' ? 'night' : 'day'));
  };

  const [transitioning, setTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<'home' | 'about' | 'jobsheet' | 'library'>('home');
  const [transitionDuration, setTransitionDuration] = useState(4000);
  const [hasShownLoading, setHasShownLoading] = useState(false);

  const PAGE_LABELS: Record<'home' | 'about' | 'jobsheet' | 'library', string> = {
    home: 'Home',
    about: 'About Us',
    jobsheet: 'Jobsheet Portal',
    library: 'Library',
  };

  const goToPage = (target: 'home' | 'about' | 'jobsheet' | 'library', after: () => void) => {
    if (page === target) {
      after();
      return;
    }
    const duration = hasShownLoading ? 1500 : 4000;
    setTransitionTarget(target);
    setTransitionDuration(duration);
    setTransitioning(true);
    setTimeout(() => {
      setPage(target);
      after();
      setTransitioning(false);
      setHasShownLoading(true);
    }, duration);
  };

  const handleNavigateSection = (id: string) => {
    goToPage(id === 'hero' ? 'home' : 'about', () => setPendingScrollId(id));
  };

  const handleNavigateJobsheet = () => {
    goToPage('jobsheet', () => window.scrollTo({ top: 0 }));
  };

  const handleNavigateLibrary = () => {
    goToPage('library', () => window.scrollTo({ top: 0 }));
  };

  if (transitioning) {
    return <PageLoadingScreen destination={PAGE_LABELS[transitionTarget]} duration={transitionDuration} />;
  }

  if (page === 'about') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="fixed top-0 left-0 h-0.5 bg-teal-400 z-[60] transition-all" style={{ width: `${scrollPct}%` }} />
        <PawCursorTrail />
        <BackToTop />
        <CommandPalette
          onNavigateSection={handleNavigateSection}
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
        />
        <Navbar
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          activeSection={page}
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
          onNavigateSection={handleNavigateSection}
        />
        <BookingSection />
        <GallerySection />
        <LeaderboardSection jobsheetsByStudent={jobsheetsByStudent} />
        <RecentActivitySection jobsheetsByStudent={jobsheetsByStudent} />
        <FaqTestimonialSection />
        <TechStackSection />
        <Footer onNavigateSection={handleNavigateSection} onNavigateJobsheet={handleNavigateJobsheet} onNavigateLibrary={handleNavigateLibrary} />
      </div>
    );
  }

  if (page === 'jobsheet' || page === 'library') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="fixed top-0 left-0 h-0.5 bg-teal-400 z-[60] transition-all" style={{ width: `${scrollPct}%` }} />
        <PawCursorTrail />
        <BackToTop />
        <CommandPalette
          onNavigateSection={handleNavigateSection}
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
        />
        <Navbar
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          activeSection={page}
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
          onNavigateSection={handleNavigateSection}
        />
        {page === 'jobsheet' ? (
          <JobsheetPage
            jobsheetsByStudent={jobsheetsByStudent}
            onUpdateStudentJobsheets={updateStudentJobsheets}
            onResetStudentJobsheets={resetStudentJobsheets}
            initialStudent={deepLinkStudent}
          />
        ) : adminUnlocked ? (
          <LibraryPage
            jobsheetsByStudent={jobsheetsByStudent}
            onUpdateStudentJobsheets={updateStudentJobsheets}
            onRefresh={reloadDocuments}
            onLock={() => { lock('admin'); setAdminUnlocked(false); }}
          />
        ) : (
          <PinGate
            id="admin"
            name="Lecturer"
            label="Workspace"
            onUnlocked={() => setAdminUnlocked(true)}
            onCancel={() => handleNavigateSection('hero')}
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
      <div className="fixed top-0 left-0 h-0.5 bg-teal-400 z-[60] transition-all" style={{ width: `${scrollPct}%` }} />
      <PawCursorTrail />
      <BackToTop />
      <CommandPalette
        onNavigateSection={handleNavigateSection}
        onNavigateJobsheet={handleNavigateJobsheet}
        onNavigateLibrary={handleNavigateLibrary}
      />

      {/* 1. Hero Section with cat-tree photo background */}
      <HeroVideoBackground themeMode={themeMode} onToggleTheme={handleToggleTheme}>
        {/* Navigation Bar matching reference photo */}
        <Navbar
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          activeSection="hero"
          onNavigateJobsheet={handleNavigateJobsheet}
          onNavigateLibrary={handleNavigateLibrary}
          onNavigateSection={handleNavigateSection}
        />

        {/* Hero Body: Stylized CATS wordmark & Book Now CTA */}
        <HeroSection
          themeMode={themeMode}
          onBookNowClick={() => handleNavigateSection('book')}
          totalChecked={totalChecked}
          totalJobsheets={totalJobsheets}
        />
      </HeroVideoBackground>
    </div>
  );
}
