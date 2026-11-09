import React, { useState, useEffect, useId } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowRight, Check } from 'lucide-react';
import { IMAGE_REGISTRY } from './imageRegistry';
import { DEFAULT_NAGA_DATA, DEFAULT_JOIN_NOTICES, normalizeNagaData } from './defaultData';
import { ActivityItem, ProductItem, HeroSlideItem, JoinNoticeData, JoinNoticeItem, NagaAppData } from './types';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';

// View type definition for SPA View Swap
type ViewMode = 'home' | 'activities' | 'recovery' | 'join';

function BrandLogo() {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const candidates = IMAGE_REGISTRY.logo.candidates;

  return (
    <div className="w-10 h-10 bg-black border border-white/30 flex items-center justify-center p-1 group-hover:border-white transition-colors overflow-hidden">
      {candidateIndex < candidates.length ? (
        <img
          src={candidates[candidateIndex]}
          alt="NAGA Logo"
          className="w-full h-full object-contain"
          onError={() => setCandidateIndex((prev) => prev + 1)}
        />
      ) : (
        <svg viewBox="0 0 500 500" className="w-full h-full" fill="none">
          <polyline
            points="158,248 200,188 214,208 255,134 332,248"
            stroke="#ffffff"
            strokeWidth="16"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path d="M 84,364 L 84,280 L 146,364 L 146,280" stroke="#ffffff" strokeWidth="13" />
          <path d="M 168,364 L 205,280 L 242,364" stroke="#ffffff" strokeWidth="13" />
          <path
            d="M 322,304 C 314,286 298,280 282,280 C 258,280 244,298 244,322 C 244,346 258,364 282,364 C 308,364 322,348 322,326 L 292,326"
            stroke="#ffffff"
            strokeWidth="13"
          />
          <path d="M 345,364 L 382,280 L 419,364" stroke="#ffffff" strokeWidth="13" />
        </svg>
      )}
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productPhotoIndex, setProductPhotoIndex] = useState(0);

  // Central Application Data with Server & Cache Sync
  const [appData, setAppData] = useState<NagaAppData>(() => {
    try {
      const cached = localStorage.getItem('naga_app_data_cache');
      if (cached) return normalizeNagaData(JSON.parse(cached));
    } catch {}
    return DEFAULT_NAGA_DATA;
  });

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const normalized = normalizeNagaData(resData.data);
          setAppData(normalized);
          try {
            localStorage.setItem('naga_app_data_cache', JSON.stringify(normalized));
          } catch {}
        }
      })
      .catch((err) => {
        console.log('[NAGA Client] Running in local/cache mode:', err);
      });
  }, []);

  const ACTIVITIES_DATA = appData.activities;
  const HERO_SLIDES = appData.heroSlides;
  const PRODUCTS_DATA = appData.products;
  const selectedProduct: ProductItem | null =
    PRODUCTS_DATA.find((p) => p.id === selectedProductId) || null;

  // Multi-Session Recruitment List (active sessions shown as tabs in 3. JOIN)
  const allJoinNotices: JoinNoticeItem[] =
    Array.isArray(appData.joinNotices) && appData.joinNotices.length > 0
      ? appData.joinNotices
      : DEFAULT_JOIN_NOTICES;
  const activeJoinSessions: JoinNoticeItem[] =
    allJoinNotices.filter((s) => s.isActive !== false).length > 0
      ? allJoinNotices.filter((s) => s.isActive !== false)
      : [allJoinNotices[0] || DEFAULT_JOIN_NOTICES[0]];

  const [selectedJoinSessionId, setSelectedJoinSessionId] = useState<string>(
    () => activeJoinSessions[0]?.id || 'join-session-taebaek'
  );

  // Keep selectedJoinSessionId valid when sessions are added/toggled
  const currentJoinSession: JoinNoticeItem =
    activeJoinSessions.find((s) => s.id === selectedJoinSessionId) || activeJoinSessions[0];

  // Keep activeSlide in bounds if slides are deleted
  useEffect(() => {
    if (HERO_SLIDES.length > 0 && activeSlide >= HERO_SLIDES.length) {
      setActiveSlide(0);
    }
  }, [HERO_SLIDES.length, activeSlide]);

  // Admin Management State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return !!sessionStorage.getItem('naga_admin_token');
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);

  const handleSaveAppData = async (updatedData: NagaAppData): Promise<boolean> => {
    const normalized = normalizeNagaData(updatedData);
    setAppData(normalized);
    try {
      localStorage.setItem('naga_app_data_cache', JSON.stringify(normalized));
    } catch {}

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      const resData = await res.json();
      return !!resData.success;
    } catch (err) {
      console.error('Server save error:', err);
      return true;
    }
  };

  const nextModalSlide = () => {
    if (!selectedActivity?.images?.length) return;
    setModalSlideIndex((prev) => (prev + 1) % selectedActivity.images.length);
  };

  const prevModalSlide = () => {
    if (!selectedActivity?.images?.length) return;
    setModalSlideIndex((prev) => (prev - 1 + selectedActivity.images.length) % selectedActivity.images.length);
  };

  // Selected Target Expedition for Join Form
  const TARGET_EXPEDITION_SESSION =
    currentJoinSession.targetSession ||
    `${currentJoinSession.title} - ${currentJoinSession.sub}`;

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formGearNote, setFormGearNote] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputId = useId();
  const phoneInputId = useId();
  const instagramInputId = useId();

  // Mobile Touch Swipe Support for Hero Slider
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Auto-slide effect for hero banner
  useEffect(() => {
    if (currentView !== 'home' || isPaused || HERO_SLIDES.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [currentView, isPaused, HERO_SLIDES.length]);

  const nextSlide = () => {
    if (HERO_SLIDES.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    if (HERO_SLIDES.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      setFormError('이름과 연락처는 필수 입력 항목입니다.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formspree.io/f/xzezejbr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formName.trim(),
          phone: formPhone.trim(),
          instagram: formInstagram.trim() || '(미기재)',
          gearNote: formGearNote.trim() || '(특이사항 없음)',
          targetExpedition: TARGET_EXPEDITION_SESSION,
          sessions: TARGET_EXPEDITION_SESSION,
          session: currentJoinSession.title,
          submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        }),
      });

      if (response.ok) {
        setFormSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({}));
        if (data && data.errors && data.errors.length > 0) {
          setFormError(data.errors.map((err: { message: string }) => err.message).join(', '));
        } else {
          setFormError('신청서 전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      }
    } catch {
      setFormError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormInstagram('');
    setFormGearNote('');
    setFormSubmitted(false);
    setFormError('');
    setIsSubmitting(false);
  };

  return (
    <div id="naga-app" className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden w-full">
      {/* 
        ========================================================================
        HEADER (Fixed at top, strictly maintained across all SPA view swaps)
        Left: NAGA Logo (Mountain Peak + NAGA Typographic Mark)
        Right: 1. ACTIVITIES | 2. RECOVERY | 3. JOIN
        ========================================================================
      */}
      <header
        id="naga-header"
        className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/20 transition-colors w-full"
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Logo (Clickable to return to Home View) */}
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none shrink-0"
            aria-label="NAGA Home"
          >
            {/* Dynamic Brand Logo supporting brand_logo.svg, .png, or .jpg */}
            <BrandLogo />

            <div className="flex flex-col min-w-0">
              <span className="font-syne font-bold tracking-[0.2em] sm:tracking-[0.25em] text-base sm:text-lg leading-none text-white flex items-center gap-1">
                NAGA<span className="text-[10px] tracking-normal font-sans align-top">™</span>
              </span>
              <span className="text-[8px] sm:text-[9px] text-white/60 tracking-[0.12em] sm:tracking-[0.18em] uppercase font-mono mt-0.5 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
                NATIONAL ALPINE GUARD ASSOSIATION
              </span>
            </div>
          </button>

          {/* Right Navigation Menu: 1. ACTIVITIES | 2. RECOVERY | 3. JOIN */}
          <nav id="naga-navigation" className="flex items-center font-mono text-[11px] sm:text-xs tracking-[0.1em] sm:tracking-[0.18em] shrink-0">
            <button
              id="nav-activities-btn"
              onClick={() => setCurrentView('activities')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 uppercase transition-all border border-transparent min-h-[38px] flex items-center ${
                currentView === 'activities'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'text-white/80 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="md:hidden">1. ACT</span>
              <span className="hidden md:inline">1. ACTIVITIES</span>
            </button>

            <span className="text-white/30 px-0.5 sm:px-1 select-none">|</span>

            <button
              id="nav-recovery-btn"
              onClick={() => {
                setCurrentView('recovery');
                setSelectedProductId(null);
                setProductPhotoIndex(0);
              }}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 uppercase transition-all border border-transparent min-h-[38px] flex items-center ${
                currentView === 'recovery'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'text-white/80 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="md:hidden">2. REC</span>
              <span className="hidden md:inline">2. RECOVERY</span>
            </button>

            <span className="text-white/30 px-0.5 sm:px-1 select-none">|</span>

            <button
              id="nav-join-btn"
              onClick={() => setCurrentView('join')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 uppercase transition-all border border-transparent min-h-[38px] flex items-center ${
                currentView === 'join'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'text-white/80 hover:text-white hover:border-white/30'
              }`}
            >
              3. JOIN
            </button>
          </nav>
        </div>
      </header>

      {/* 
        ========================================================================
        SPA VIEW SWAP CONTAINER (No smooth scroll down, complete view replacement)
        ========================================================================
      */}
      <main id="naga-main-stage" className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* ==================================================================== */}
        {/* VIEW 0: HOME VIEW (Hero Image Slider + Main Footer placed immediately below) */}
        {/* ==================================================================== */}
        {currentView === 'home' && (
          <div id="home-view" className="flex-1 flex flex-col w-full">
            {/* Hero Section (메인 배너) with touch swipe on mobile */}
            <section
              id="hero-banner-section"
              className="relative w-full h-[52vh] min-h-[340px] sm:h-[68vh] sm:min-h-[480px] max-h-[780px] bg-black overflow-hidden flex flex-col justify-between touch-pan-y"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Active Image Slider Layers */}
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`NAGA Exhibition Slide ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Slider Controls Bar: Left & Right Arrow Buttons + Slide Index & Progress */}
              <div className="relative z-20 w-full px-4 sm:px-12 pb-4 sm:pb-6 mt-auto flex items-end justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    id="hero-slider-prev-btn"
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-11 h-11 sm:w-10 sm:h-10 border border-white/40 bg-black/75 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white active:scale-95"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    id="hero-slider-next-btn"
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-11 h-11 sm:w-10 sm:h-10 border border-white/40 bg-black/75 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Subtle Slide Counter & Progress Bars */}
                {HERO_SLIDES.length > 0 && (
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="font-mono text-[11px] tabular-nums tracking-[0.2em] text-white/80">
                      <span>{String((activeSlide % HERO_SLIDES.length) + 1).padStart(2, '0')}</span>
                      <span className="text-white/40 mx-1">/</span>
                      <span className="text-white/50">{String(HERO_SLIDES.length).padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {HERO_SLIDES.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          aria-label={`Slide ${idx + 1}`}
                          className={`h-1 transition-all duration-300 ${
                            idx === activeSlide
                              ? 'w-6 bg-white'
                              : 'w-2 bg-white/35 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 
              ========================================================================
              MAIN FOOTER (배너 직하단 배치: 참고 이미지 레이아웃 반영)
              Left: "NAGA™" & "National Alpine Guard Association."
              Right: ORGANIZER, INSTAGRAM, SEOUL, KOREA, etc.
              ========================================================================
            */}
            <footer
              id="main-footer"
              className="w-full bg-black border-t border-white/20 px-4 sm:px-12 py-8 sm:py-14"
            >
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-6 sm:gap-8 lg:gap-16">
                {/* Left Side: Bold Brand Typography */}
                <div className="space-y-1.5 sm:space-y-2 max-w-xl">
                  <h2 className="text-3xl sm:text-5xl font-syne font-extrabold uppercase tracking-tight text-white leading-none">
                    NAGA<span className="text-xl sm:text-2xl font-sans align-top ml-1">™</span>
                  </h2>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-syne font-bold tracking-tight text-white leading-snug sm:leading-tight break-words">
                    National Alpine Guard Association.
                  </p>
                </div>

                {/* Right Side: Informational Column Right-Aligned */}
                <div className="font-mono text-xs sm:text-sm tracking-[0.14em] sm:tracking-[0.16em] text-white/80 uppercase pt-4 lg:pt-2 border-t border-white/10 lg:border-t-0 w-full lg:w-auto text-left lg:text-right lg:ml-auto">
                  <div className="space-y-2 sm:space-y-2.5">
                    <div>ORGANIZER: JWY</div>
                    <div className="break-words">
                      INSTAGRAM:{' '}
                      <a
                        href="https://instagram.com/nationalalpineguard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-white transition-colors"
                      >
                        @nationalalpineguard
                      </a>
                    </div>
                    <div>SEOUL, KOREA</div>
                    <div className="pt-0.5">
                      <button
                        id="footer-admin-trigger-btn"
                        onClick={() => {
                          if (isAdminLoggedIn) {
                            setIsAdminConsoleOpen(true);
                          } else {
                            setIsAdminLoginOpen(true);
                          }
                        }}
                        className="text-[9px] font-mono tracking-[0.25em] text-white/20 hover:text-white/60 transition-colors uppercase cursor-pointer"
                        title="ADMINISTRATION"
                      >
                        {isAdminLoggedIn ? '[ CONSOLE ]' : '[ ADMIN ]'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 1: 1. ACTIVITIES (시간순 활동 목록 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'activities' && (
          <div id="activities-view" className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-12">
            {/* View Header with 1px border */}
            <div className="border-b border-white/20 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white inline-flex items-baseline gap-2.5">
                  <span className="font-sans font-bold tabular-nums">1.</span>
                  <span>ACTIVITIES</span>
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* Chronological Card List */}
            <div className="space-y-3 sm:space-y-4">
              {ACTIVITIES_DATA.map((act) => (
                <div
                  key={act.id}
                  id={`activity-card-${act.id}`}
                  onClick={() => {
                    setSelectedActivity(act);
                    setModalSlideIndex(0);
                  }}
                  className="group cursor-pointer border border-white/20 hover:border-white bg-black p-4 sm:p-7 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 active:border-white/80"
                >
                  <div className="flex-1 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-white border border-white/40 px-2 sm:px-2.5 py-0.5 bg-white/5 tabular-nums">
                        {act.code}
                      </span>
                      <span className="font-mono text-xs text-white/60 tracking-[0.15em] uppercase tabular-nums">
                        {act.distance}
                      </span>
                      <span className="text-white/30">·</span>
                      <span className="font-mono text-xs text-white/50 tracking-[0.1em]">
                        {act.keyPoints}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-xl font-syne font-bold tracking-tight text-white group-hover:text-white/90">
                      {act.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center font-mono text-xs tracking-[0.18em] uppercase text-white/70 group-hover:text-white py-1">
                    <span>VIEW</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Detail Modal / Popup Layer */}
            {selectedActivity && (
              <div
                id="activity-modal"
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
                onClick={() => setSelectedActivity(null)}
              >
                <div
                  className="bg-black border border-white text-white w-full max-w-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 relative max-h-[92vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="border-b border-white/20 pb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-xs tracking-[0.18em] sm:tracking-[0.2em] text-white/60 block uppercase tabular-nums">
                        ACTIVITY PROTOCOL · {selectedActivity.code}
                      </span>
                      <h3 className="text-lg sm:text-2xl font-syne font-bold uppercase tracking-tight mt-1 text-white break-words">
                        {selectedActivity.title}
                      </h3>
                    </div>
                    <button
                      id="close-modal-btn"
                      onClick={() => setSelectedActivity(null)}
                      className="border border-white/40 p-2.5 text-white hover:bg-white hover:text-black transition-colors min-w-[42px] min-h-[42px] flex items-center justify-center shrink-0"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Specs Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-mono tracking-[0.14em] sm:tracking-[0.15em] border border-white/20 p-3.5 sm:p-4 bg-white/[0.02]">
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs mb-0.5">LOCATION</span>
                      <span className="text-white font-medium break-words">{selectedActivity.location}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs mb-0.5">ELEVATION</span>
                      <span className="text-white font-medium">{selectedActivity.elevation}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs mb-0.5">REQUIRED GEAR</span>
                      <span className="text-white font-medium break-words">{selectedActivity.gearRequired}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs mb-0.5">RECOVERY</span>
                      <span className="text-white font-medium break-words">{selectedActivity.recoveryProtocol}</span>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <span className="font-mono text-xs tracking-[0.18em] text-white/50 uppercase block">
                      DRILL OBJECTIVE
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-sans break-words">
                      {selectedActivity.description}
                    </p>
                  </div>

                  {/* Photo Slide Carousel (드릴 목적 아래 사진 슬라이드) */}
                  {selectedActivity.images && selectedActivity.images.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
                          FIELD VISUAL ARCHIVE
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.18em] text-white/70 tabular-nums">
                          [ 0{modalSlideIndex + 1} / 0{selectedActivity.images.length} ]
                        </span>
                      </div>

                      <div className="relative w-full aspect-[4/3] max-h-[440px] bg-black border border-white/20 overflow-hidden group mx-auto">
                        {/* Slide Images */}
                        {selectedActivity.images.map((imgSrc, idx) => (
                          <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-300 ${
                              idx === modalSlideIndex ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                            }`}
                          >
                            <img
                              src={imgSrc}
                              alt={`${selectedActivity.title} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          </div>
                        ))}

                        {/* Navigation Arrows */}
                        <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3 pointer-events-none">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              prevModalSlide();
                            }}
                            className="pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 bg-black/70 hover:bg-white hover:text-black border border-white/40 text-white flex items-center justify-center transition-colors active:scale-95"
                            aria-label="Previous Photo"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              nextModalSlide();
                            }}
                            className="pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 bg-black/70 hover:bg-white hover:text-black border border-white/40 text-white flex items-center justify-center transition-colors active:scale-95"
                            aria-label="Next Photo"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Slide Indicators / Dots at Bottom */}
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 border border-white/20">
                          {selectedActivity.images.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalSlideIndex(idx);
                              }}
                              aria-label={`Go to slide ${idx + 1}`}
                              className={`h-1.5 transition-all ${
                                idx === modalSlideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Actions (신청 연동 버튼 제거, 닫기 전용) */}
                  <div className="border-t border-white/20 pt-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.15em] text-white/40 uppercase">
                      NAGA™ FIELD ARCHIVE · {selectedActivity.distance}
                    </span>

                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="px-6 py-2.5 border border-white/40 hover:border-white hover:bg-white hover:text-black text-white font-mono text-xs tracking-[0.2em] uppercase transition-colors text-center"
                    >
                      [ CLOSE ]
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View Sub-footer */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.15em] sm:tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>ORGANIZER: JWY | SEOUL, KOREA</span>
                <button
                  onClick={() => {
                    if (isAdminLoggedIn) {
                      setIsAdminConsoleOpen(true);
                    } else {
                      setIsAdminLoginOpen(true);
                    }
                  }}
                  className="text-[9px] font-mono tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors uppercase cursor-pointer"
                  title="ADMINISTRATION"
                >
                  {isAdminLoggedIn ? '[CONSOLE]' : '[ADMIN]'}
                </button>
              </div>
              <div>2026 NAGA™. ALL RIGHTS RESERVED.</div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: 2. RECOVERY (2열 제품 카탈로그 & 상품 클릭 시 상세 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'recovery' && (
          <div id="recovery-view" className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-12">
            {selectedProduct ? (
              /* ============================================================== */
              /* RECOVERY PRODUCT DETAIL PAGE (상품 클릭 시 추가 사진 & 상세 설명) */
              /* ============================================================== */
              (() => {
                const productGallery =
                  Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
                    ? selectedProduct.images
                    : [selectedProduct.image];
                const safePhotoIndex =
                  productPhotoIndex < productGallery.length ? productPhotoIndex : 0;

                const nextProductPhoto = () => {
                  setProductPhotoIndex((prev) => (prev + 1) % productGallery.length);
                };
                const prevProductPhoto = () => {
                  setProductPhotoIndex(
                    (prev) => (prev - 1 + productGallery.length) % productGallery.length
                  );
                };

                return (
                  <div id="recovery-product-detail" className="flex-1 flex flex-col">
                    {/* Detail View Header */}
                    <div className="border-b border-white/20 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div>
                        <span className="text-[10px] sm:text-xs font-mono tracking-[0.22em] text-white/50 uppercase block mb-1">
                          2. RECOVERY // {selectedProduct.code} · {selectedProduct.category}
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white">
                          {selectedProduct.name}
                        </h2>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProductId(null);
                          setProductPhotoIndex(0);
                        }}
                        className="text-xs font-mono tracking-[0.2em] uppercase text-white/80 hover:text-black hover:bg-white border border-white/30 px-4 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
                      >
                        [ ← BACK TO RECOVERY ]
                      </button>
                    </div>

                    {/* Product Detail Main Content: Left Photo Gallery / Right Detailed Specs & Description */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
                      {/* Left 7 Cols: Interactive Photo Slider + Thumbnail Strip */}
                      <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
                          <span>PRODUCT VISUAL ARCHIVE</span>
                          <span className="tabular-nums">
                            [ {String(safePhotoIndex + 1).padStart(2, '0')} /{' '}
                            {String(productGallery.length).padStart(2, '0')} ]
                          </span>
                        </div>

                        {/* Main 4:3 Image Viewer */}
                        <div className="relative w-full aspect-[4/3] bg-black border border-white/25 overflow-hidden group">
                          {productGallery.map((imgSrc, idx) => (
                            <div
                              key={idx}
                              className={`absolute inset-0 transition-opacity duration-300 ${
                                idx === safePhotoIndex
                                  ? 'opacity-100 z-10'
                                  : 'opacity-0 pointer-events-none z-0'
                              }`}
                            >
                              <img
                                src={imgSrc}
                                alt={`${selectedProduct.name} photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                            </div>
                          ))}

                          <div className="absolute top-3 left-3 z-20 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.2em] text-white uppercase">
                            {selectedProduct.code}
                          </div>

                          {productGallery.length > 1 && (
                            <>
                              <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3 pointer-events-none">
                                <button
                                  type="button"
                                  onClick={prevProductPhoto}
                                  aria-label="Previous Product Photo"
                                  className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 bg-black/75 hover:bg-white hover:text-black border border-white/40 text-white flex items-center justify-center transition-colors active:scale-95"
                                >
                                  <ChevronLeft size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={nextProductPhoto}
                                  aria-label="Next Product Photo"
                                  className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 bg-black/75 hover:bg-white hover:text-black border border-white/40 text-white flex items-center justify-center transition-colors active:scale-95"
                                >
                                  <ChevronRight size={18} />
                                </button>
                              </div>

                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 border border-white/20">
                                {productGallery.map((_, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setProductPhotoIndex(idx)}
                                    aria-label={`Photo ${idx + 1}`}
                                    className={`h-1.5 transition-all ${
                                      idx === safePhotoIndex
                                        ? 'w-5 bg-white'
                                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Additional Photos Thumbnail Strip */}
                        {productGallery.length > 1 && (
                          <div className="space-y-2 pt-1">
                            <span className="block font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">
                              ADDITIONAL PHOTOS // 클릭하여 사진 전환 ({productGallery.length}장)
                            </span>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                              {productGallery.map((thumbUrl, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setProductPhotoIndex(idx)}
                                  className={`relative aspect-[4/3] bg-black border overflow-hidden transition-all ${
                                    idx === safePhotoIndex
                                      ? 'border-white ring-1 ring-white'
                                      : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/60'
                                  }`}
                                >
                                  <img
                                    src={thumbUrl}
                                    alt={`${selectedProduct.name} thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-[9px] font-mono text-white/80 tabular-nums">
                                    0{idx + 1}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right 5 Cols: Detailed Specifications & Description */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                          {/* Product Summary Box */}
                          <div className="border border-white/20 bg-white/[0.03] p-4 sm:p-6 space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-mono tracking-[0.22em] text-white/50 uppercase">
                                {selectedProduct.category}
                              </span>
                              <span className="text-[10px] font-mono tracking-[0.18em] px-2 py-0.5 bg-white text-black font-bold uppercase">
                                NAGA™ FORMULA
                              </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                              {selectedProduct.name}
                            </h3>
                            <p className="text-xs sm:text-sm font-sans text-white/85 leading-relaxed">
                              {selectedProduct.usage}
                            </p>
                          </div>

                          {/* Technical Specification */}
                          <div className="border border-white/20 bg-black p-4 sm:p-5 space-y-2">
                            <span className="block font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-white/50 uppercase">
                              TECH SPECIFICATION // 핵심 규격 및 배합
                            </span>
                            <p className="font-mono text-xs sm:text-sm text-white/90 leading-relaxed">
                              {selectedProduct.spec}
                            </p>
                          </div>

                          {/* Full Detailed Description */}
                          <div className="border border-white/20 bg-black p-4 sm:p-6 space-y-3">
                            <div className="border-b border-white/15 pb-2.5 flex items-center justify-between">
                              <span className="font-mono text-xs tracking-[0.2em] text-white font-bold uppercase">
                                DETAILED DESCRIPTION // 상세 설명
                              </span>
                              <span className="font-mono text-[10px] tracking-[0.15em] text-white/40 uppercase">
                                FIELD NUTRITION
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm font-sans text-white/85 leading-relaxed whitespace-pre-line break-words">
                              {selectedProduct.detailDescription || selectedProduct.usage}
                            </div>
                          </div>
                        </div>

                        {/* Back to Catalog Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductId(null);
                              setProductPhotoIndex(0);
                            }}
                            className="w-full py-3.5 px-5 border border-white/40 hover:border-white hover:bg-white hover:text-black text-white font-mono text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
                          >
                            <span>[ ← BACK TO RECOVERY CATALOG // 목록으로 돌아가기 ]</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* ============================================================== */
              /* RECOVERY 2-COLUMN CATALOG LIST (상품 클릭 시 상세 페이지 이동) */
              /* ============================================================== */
              <>
                {/* View Header */}
                <div className="border-b border-white/20 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white inline-flex items-baseline gap-2.5">
                      <span className="font-sans font-bold tabular-nums">2.</span>
                      <span>RECOVERY</span>
                    </h2>
                    <p className="text-xs font-mono tracking-[0.16em] text-white/50 mt-1.5 uppercase">
                      SELECT A PRODUCT TO VIEW ADDITIONAL PHOTOS & DETAILED SPECIFICATION
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
                  >
                    [ ← BACK TO HOME ]
                  </button>
                </div>

                {/* 2-Column Grid Layout: Clickable Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                  {PRODUCTS_DATA.map((prod) => {
                    const photoCount =
                      Array.isArray(prod.images) && prod.images.length > 0
                        ? prod.images.length
                        : 1;
                    return (
                      <div
                        key={prod.id}
                        id={`product-card-${prod.id}`}
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          setProductPhotoIndex(0);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="cursor-pointer border border-white/20 hover:border-white bg-black flex flex-col transition-all duration-300 group"
                      >
                        {/* Photo on Top (사진 상단 배치) */}
                        <div className="relative w-full aspect-[4/3] bg-black overflow-hidden border-b border-white/20">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.2em] text-white uppercase">
                            {prod.code}
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.15em] text-white/80 uppercase tabular-nums">
                            PHOTOS ({photoCount})
                          </div>
                        </div>

                        {/* Name and Details Below (명칭 하단 배치) */}
                        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <span className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase block mb-1">
                              {prod.category}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white group-hover:text-white/90">
                              {prod.name}
                            </h3>
                            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-sans text-white/80 leading-relaxed">
                              {prod.usage}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 sm:pt-4 border-t border-white/10">
                            <div className="font-mono text-[11px] tracking-[0.15em] text-white/60 space-y-1">
                              <span className="block text-white/40 uppercase text-[10px] sm:text-[11px]">
                                TECH SPECIFICATION
                              </span>
                              <span className="block text-white/90 line-clamp-2">{prod.spec}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-between font-mono text-xs tracking-[0.18em] uppercase text-white/70 group-hover:text-white">
                              <span>[ VIEW DETAILS & PHOTOS ]</span>
                              <ArrowRight
                                size={15}
                                className="group-hover:translate-x-1 transition-transform"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* View Sub-footer */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.15em] sm:tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>ORGANIZER: JWY | SEOUL, KOREA</span>
                <button
                  onClick={() => {
                    if (isAdminLoggedIn) {
                      setIsAdminConsoleOpen(true);
                    } else {
                      setIsAdminLoginOpen(true);
                    }
                  }}
                  className="text-[9px] font-mono tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors uppercase cursor-pointer"
                  title="ADMINISTRATION"
                >
                  {isAdminLoggedIn ? '[CONSOLE]' : '[ADMIN]'}
                </button>
              </div>
              <div>2026 NAGA™. ALL RIGHTS RESERVED.</div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 3: 3. JOIN (모집 안내 및 참가 신청서 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'join' && (
          <div id="join-view" className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-12">
            {/* View Header */}
            <div className="border-b border-white/20 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white inline-flex items-baseline gap-2.5">
                  <span className="font-sans font-bold tabular-nums">3.</span>
                  <span>JOIN</span>
                </h2>
                <p className="text-xs font-mono tracking-[0.18em] text-white/50 mt-1.5 uppercase">
                  EXPEDITION & PRE-TRAINING REGISTRATION // 참가 세션 선택 및 신청
                </p>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* Multi-Session Selector Tab Bar (동시 모집 세션 전환 탭) */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-[0.22em] text-white/50 uppercase">
                  SELECT ACTIVE SESSION // 모집 중인 세션 선택 ({activeJoinSessions.length})
                </span>
                <span className="text-[10px] font-mono tracking-[0.18em] text-white/40 uppercase hidden sm:inline">
                  TAB TO SWITCH SESSION
                </span>
              </div>
              <div
                role="tablist"
                aria-label="Active Recruitment Sessions"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              >
                {activeJoinSessions.map((session, idx) => {
                  const isSelected = session.id === currentJoinSession.id;
                  return (
                    <button
                      key={session.id}
                      role="tab"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => {
                        setSelectedJoinSessionId(session.id);
                        setFormSubmitted(false);
                        setFormError('');
                      }}
                      className={`text-left border p-3.5 sm:p-4 transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-white border-white/25 hover:border-white/70 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span
                          className={`text-[10px] font-mono tracking-[0.2em] uppercase tabular-nums ${
                            isSelected ? 'text-black/60 font-bold' : 'text-white/45'
                          }`}
                        >
                          SESSION {String(idx + 1).padStart(2, '0')} // {session.tag || 'OPEN'}
                        </span>
                        <span
                          className={`text-[9px] font-mono tracking-[0.18em] px-1.5 py-0.5 uppercase font-bold ${
                            isSelected
                              ? 'bg-black text-white'
                              : 'border border-white/25 text-white/60'
                          }`}
                        >
                          {isSelected ? 'SELECTED' : 'OPEN'}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <div
                          className={`text-sm sm:text-base font-syne font-bold uppercase tracking-tight leading-snug ${
                            isSelected ? 'text-black' : 'text-white'
                          }`}
                        >
                          {session.title}
                        </div>
                        <div
                          className={`text-[11px] font-mono tracking-[0.06em] mt-0.5 line-clamp-1 ${
                            isSelected ? 'text-black/75' : 'text-white/60'
                          }`}
                        >
                          {session.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content: 현재 선택된 모집 세션 안내 문구 */}
            <div className="border border-white/20 bg-white/[0.03] p-4 sm:p-6 mb-6 sm:mb-8 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase block">
                    {currentJoinSession.tag || 'UPCOMING EXPEDITION // 2027.01'}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase tabular-nums">
                    SESSION {String(activeJoinSessions.findIndex((s) => s.id === currentJoinSession.id) + 1).padStart(2, '0')} / {String(activeJoinSessions.length).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-syne font-bold uppercase tracking-tight text-white mt-1.5 leading-snug">
                  {currentJoinSession.title}
                </h3>
                <p className="text-xs sm:text-sm font-mono tracking-[0.12em] text-white/85 mt-1">
                  {currentJoinSession.sub}
                </p>
                <p className="mt-2.5 text-xs font-mono tracking-[0.08em] sm:tracking-[0.12em] text-white/60 uppercase leading-relaxed">
                  {currentJoinSession.description}
                </p>
              </div>

              {/* Course Photo (가로 4:3 비율 코스 사진) */}
              <div className="relative w-full aspect-[4/3] max-h-[440px] bg-black border border-white/20 overflow-hidden">
                <img
                  src={currentJoinSession.coursePhoto}
                  alt={currentJoinSession.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.2em] text-white uppercase">
                  {currentJoinSession.photoArchiveTag || 'EXPEDITION ARCHIVE'}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.15em] text-white/80 uppercase">
                  {currentJoinSession.photoTrailTag || 'TRAIL ARCHIVE'}
                </div>
              </div>
            </div>

            {/* Netlify Forms / Formspree Compatible Application Form */}
            {formSubmitted ? (
              <div
                id="submission-success-card"
                className="border border-white bg-black p-6 sm:p-8 text-center space-y-6"
              >
                <div className="w-12 h-12 border border-white mx-auto flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono tracking-[0.25em] text-white/50 uppercase block">
                    TRANSMISSION CONFIRMED
                  </span>
                  <h4 className="text-lg sm:text-xl font-syne font-bold uppercase tracking-tight text-white">
                    APPLICATION SUBMITTED SUCCESSFULLY
                  </h4>
                  <p className="text-xs font-mono tracking-[0.15em] text-white/80 max-w-md mx-auto leading-relaxed">
                    {formName} 님의 [{currentJoinSession.title} — {currentJoinSession.sub}] 참가 신청서가 접수되었습니다. 기재하신 연락처({formPhone})로 세부 일정 안내 및 장비 점검 지침이 발송됩니다.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <button
                    onClick={resetForm}
                    className="border border-white/40 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors"
                  >
                    SUBMIT ANOTHER APPLICATION
                  </button>
                  <button
                    onClick={() => setCurrentView('activities')}
                    className="bg-white text-black px-6 py-3 font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
                  >
                    CHECK ACTIVITIES
                  </button>
                </div>
              </div>
            ) : (
              <form
                name="apply"
                action="https://formspree.io/f/xzezejbr"
                method="POST"
                onSubmit={handleFormSubmit}
                className="border border-white/20 p-4 sm:p-8 space-y-5 sm:space-y-6 bg-black"
              >
                {/* Form Header (영어 타이틀 / 선택된 세션 한글 소제목) */}
                <div className="border-b border-white/20 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                      EXPEDITION APPLICATION
                    </h3>
                    <p className="text-xs font-mono tracking-[0.15em] text-white/60 mt-1 uppercase">
                      {currentJoinSession.title} — {currentJoinSession.sub} 참가 신청서
                    </p>
                  </div>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase">
                    * REQUIRED FIELDS
                  </span>
                </div>

                {formError && (
                  <div className="border border-white bg-white/10 px-4 py-2.5 text-xs font-mono tracking-[0.15em] text-white uppercase">
                    ※ {formError}
                  </div>
                )}

                {/* 이름 (Input Text, 필수) */}
                <div className="space-y-1.5">
                  <label htmlFor={nameInputId} className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      FULL NAME <span className="text-white">*</span>
                    </span>
                    <span className="block text-[11px] font-mono tracking-[0.1em] text-white/50">
                      이름
                    </span>
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    name="name"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="홍길동 (Hong Gildong)"
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
                  />
                </div>

                {/* 연락처 (Input Tel, 필수) */}
                <div className="space-y-1.5">
                  <label htmlFor={phoneInputId} className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      CONTACT NUMBER <span className="text-white">*</span>
                    </span>
                    <span className="block text-[11px] font-mono tracking-[0.1em] text-white/50">
                      연락처
                    </span>
                  </label>
                  <input
                    id={phoneInputId}
                    type="tel"
                    name="phone"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
                  />
                </div>

                {/* 인스타그램 계정 (Input Text, 선택) */}
                <div className="space-y-1.5">
                  <label htmlFor={instagramInputId} className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      INSTAGRAM / SOCIAL
                    </span>
                    <span className="block text-[11px] font-mono tracking-[0.1em] text-white/50">
                      인스타그램 계정 (선택)
                    </span>
                  </label>
                  <input
                    id={instagramInputId}
                    type="text"
                    name="instagram"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="@your_account"
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
                  />
                </div>

                {/* 선택된 신청 세션 확인 박스 */}
                <div className="border border-white/25 bg-white/[0.04] p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase block">
                      TARGET EXPEDITION // 선택된 신청 세션
                    </span>
                    <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 bg-white text-black font-bold uppercase">
                      ACTIVE REGISTRATION
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-syne font-bold uppercase tracking-tight text-white">
                      {currentJoinSession.title}
                    </h4>
                    <p className="text-xs font-mono tracking-[0.05em] text-white/80 mt-0.5">
                      {currentJoinSession.sub}
                    </p>
                  </div>
                  <div className="pt-1 text-[11px] font-mono text-white/50">
                    ※ 상단 탭에서 다른 모집 세션을 선택하면 신청 대상 세션이 즉시 전환됩니다.
                  </div>
                  <input
                    type="hidden"
                    name="sessions"
                    value={TARGET_EXPEDITION_SESSION}
                  />
                  <input
                    type="hidden"
                    name="targetExpedition"
                    value={currentJoinSession.title}
                  />
                </div>

                {/* 장비 및 건강 특이사항 (Textarea, 선택) */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-notes-input" className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      GEAR & PHYSICAL NOTES
                    </span>
                    <span className="block text-[11px] font-mono tracking-[0.1em] text-white/50">
                      필수 장비 보유 여부 및 산행/건강 특이사항 (선택)
                    </span>
                  </label>
                  <textarea
                    id="gear-notes-input"
                    rows={2}
                    value={formGearNote}
                    onChange={(e) => setFormGearNote(e.target.value)}
                    placeholder="예: 필수 산행 장비 보유 여부, 산행 경험 및 컨디션 특이사항 등"
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* 제출 버튼: [ SUBMIT APPLICATION ➔ ] */}
                <div className="pt-3 sm:pt-4">
                  <button
                    type="submit"
                    id="submit-application-btn"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 bg-white text-black font-mono text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-white min-h-[46px]"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">[ TRANSMITTING DATA... ]</span>
                    ) : (
                      <span>[ SUBMIT APPLICATION // {currentJoinSession.title} 참가 신청하기 ➔ ]</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* View Sub-footer */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.15em] sm:tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>ORGANIZER: JWY | SEOUL, KOREA</span>
                <button
                  onClick={() => {
                    if (isAdminLoggedIn) {
                      setIsAdminConsoleOpen(true);
                    } else {
                      setIsAdminLoginOpen(true);
                    }
                  }}
                  className="text-[9px] font-mono tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors uppercase cursor-pointer"
                  title="ADMINISTRATION"
                >
                  {isAdminLoggedIn ? '[CONSOLE]' : '[ADMIN]'}
                </button>
              </div>
              <div>2026 NAGA™. ALL RIGHTS RESERVED.</div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* ADMIN AUTHENTICATION MODAL (ID: admin, PW: 1q2w3e4r!!) */}
      {/* ==================================================================== */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(token) => {
          setIsAdminLoggedIn(true);
          try {
            sessionStorage.setItem('naga_admin_token', token);
          } catch {}
          setIsAdminConsoleOpen(true);
        }}
      />

      {/* ==================================================================== */}
      {/* ADMIN MANAGEMENT CONSOLE MODAL */}
      {/* ==================================================================== */}
      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          try {
            sessionStorage.removeItem('naga_admin_token');
          } catch {}
          setIsAdminConsoleOpen(false);
        }}
        initialData={appData}
        onSaveData={handleSaveAppData}
      />
    </div>
  );
}
