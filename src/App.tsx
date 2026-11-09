import React, { useState, useEffect, useId } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowRight, Check } from 'lucide-react';
import { IMAGE_REGISTRY } from './imageRegistry';
import { DEFAULT_NAGA_DATA } from './defaultData';
import { ActivityItem, ProductItem, HeroSlideItem, JoinNoticeData, NagaAppData } from './types';
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

  // Central Application Data with Server & Cache Sync
  const [appData, setAppData] = useState<NagaAppData>(() => {
    try {
      const cached = localStorage.getItem('naga_app_data_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_NAGA_DATA;
  });

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setAppData(resData.data);
          try {
            localStorage.setItem('naga_app_data_cache', JSON.stringify(resData.data));
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
  const joinNotice = appData.joinNotice;

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
    setAppData(updatedData);
    try {
      localStorage.setItem('naga_app_data_cache', JSON.stringify(updatedData));
    } catch {}

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const resData = await res.json();
      return !!resData.success;
    } catch (err) {
      console.error('Server save error:', err);
      return true; // Still saved to local state and cache
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

  // Target Expedition for Join Form (현재 강원 태백 단일 세션 전용 접수)
  const TARGET_EXPEDITION_SESSION = joinNotice.targetSession || '2027 GANGWON TAEBAEK [2027.01] - 2027 강원 태백 신년 일출 산행 (단일 세션)';

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
    if (currentView !== 'home' || isPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [currentView, isPaused]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
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
          session: '2027 GANGWON TAEBAEK',
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
              onClick={() => setCurrentView('recovery')}
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
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}

              {/* Slider Controls Bar: Left & Right Arrow Buttons */}
              <div className="relative z-20 w-full px-4 sm:px-12 pb-4 sm:pb-6 mt-auto flex items-end justify-between">
                <div className="flex items-center gap-2">
                  <button
                    id="hero-slider-prev-btn"
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-11 h-11 sm:w-10 sm:h-10 border border-white/40 bg-black/70 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white active:scale-95"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    id="hero-slider-next-btn"
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-11 h-11 sm:w-10 sm:h-10 border border-white/40 bg-black/70 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
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
        {/* VIEW 1: 1. ACTIVITIES (시간 역순 활동 목록 페이지) */}
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

            {/* Reverse Chronological Card List */}
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
                      <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-white border border-white/40 px-2 sm:px-2.5 py-0.5 bg-white/5">
                        {act.code}
                      </span>
                      <span className="font-mono text-xs text-white/50 tracking-[0.15em] uppercase">
                        {act.distance}
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
                      <span className="font-mono text-xs tracking-[0.18em] sm:tracking-[0.2em] text-white/60 block uppercase">
                        ACTIVITY PROTOCOL // {selectedActivity.code}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-mono tracking-[0.14em] sm:tracking-[0.15em] border border-white/20 p-3.5 sm:p-4">
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs">LOCATION</span>
                      <span className="text-white font-medium break-words">{selectedActivity.location}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs">ELEVATION</span>
                      <span className="text-white font-medium">{selectedActivity.elevation}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs">REQUIRED GEAR</span>
                      <span className="text-white font-medium break-words">{selectedActivity.gearRequired}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block text-[10px] sm:text-xs">RECOVERY</span>
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
                        <span className="font-mono text-[11px] tracking-[0.18em] text-white/70">
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

                  {/* Modal Actions */}
                  <div className="border-t border-white/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <button
                      onClick={() => {
                        setSelectedActivity(null);
                        setCurrentView('join');
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>APPLY FOR THIS DRILL</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="w-full sm:w-auto px-5 py-3 border border-white/30 text-white font-mono text-xs tracking-[0.2em] uppercase hover:border-white transition-colors text-center"
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
        {/* VIEW 2: 2. RECOVERY (2열 제품 카탈로그 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'recovery' && (
          <div id="recovery-view" className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-12">
            {/* View Header */}
            <div className="border-b border-white/20 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white inline-flex items-baseline gap-2.5">
                  <span className="font-sans font-bold tabular-nums">2.</span>
                  <span>RECOVERY</span>
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* 2-Column Grid Layout: Photo on top, Name below */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              {PRODUCTS_DATA.map((prod) => (
                <div
                  key={prod.id}
                  id={`product-card-${prod.id}`}
                  className="border border-white/20 hover:border-white bg-black flex flex-col transition-all duration-300 group"
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
                  </div>

                  {/* Name and Details Below (명칭 하단 배치) */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                        {prod.name}
                      </h3>
                      <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-sans text-white/80 leading-relaxed">
                        {prod.usage}
                      </p>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-white/10 font-mono text-[11px] tracking-[0.15em] text-white/60 space-y-1">
                      <span className="block text-white/40 uppercase text-[10px] sm:text-[11px]">TECH SPECIFICATION</span>
                      <span className="block text-white/90">{prod.spec}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* Content: 현재 모집 중인 안내 문구 */}
            <div className="border border-white/20 bg-white/5 p-4 sm:p-6 mb-6 sm:mb-8 space-y-4">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase block">
                  {joinNotice.tag || 'UPCOMING EXPEDITION // 2027.01'}
                </span>
                <h3 className="text-xl sm:text-3xl font-syne font-bold uppercase tracking-tight text-white mt-1 leading-snug">
                  {joinNotice.title}
                </h3>
                <p className="text-xs sm:text-sm font-mono tracking-[0.12em] text-white/80 mt-1">
                  {joinNotice.sub}
                </p>
                <p className="mt-2 text-xs font-mono tracking-[0.08em] sm:tracking-[0.12em] text-white/60 uppercase leading-relaxed">
                  {joinNotice.description}
                </p>
              </div>

              {/* Course Photo (가로 4:3 비율 코스 사진) */}
              <div className="relative w-full aspect-[4/3] max-h-[440px] bg-black border border-white/20 overflow-hidden">
                <img
                  src={joinNotice.coursePhoto}
                  alt={joinNotice.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.2em] text-white uppercase">
                  {joinNotice.photoArchiveTag || 'EXPEDITION ARCHIVE'}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.15em] text-white/80 uppercase">
                  {joinNotice.photoTrailTag || 'TRAIL ARCHIVE'}
                </div>
              </div>
            </div>

            {/* Netlify Forms Compatible Application Form */}
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
                    {formName} 님의 2027 강원 태백 신년 일출 산행 참가 신청서가 접수되었습니다. 기재하신 연락처({formPhone})로 세부 일정 안내 및 동계 장비 점검 지침이 발송됩니다.
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
                {/* Form Header (영어 타이틀 / 한글 소제목) */}
                <div className="border-b border-white/20 pb-3 sm:pb-4">
                  <h3 className="text-lg sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                    EXPEDITION APPLICATION
                  </h3>
                  <p className="text-xs font-mono tracking-[0.15em] text-white/60 mt-1 uppercase">
                    2027 강원 태백 신년 일출 산행 참가 신청서
                  </p>
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

                {/* 고정 신청 세션 안내 박스 (단일 세션 접수) */}
                <div className="border border-white/20 bg-white/5 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase block">
                      TARGET EXPEDITION // 신청 대상 세션
                    </span>
                    <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 bg-white text-black font-bold uppercase">
                      ACTIVE REGISTRATION
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-syne font-bold uppercase tracking-tight text-white">
                      {joinNotice.title}
                    </h4>
                    <p className="text-xs font-mono tracking-[0.05em] text-white/80 mt-0.5">
                      {joinNotice.sub}
                    </p>
                  </div>
                  <div className="pt-1 text-[11px] font-mono text-white/50">
                    ※ 현재 {joinNotice.title} 단일 세션에 대한 참가 신청을 접수하고 있습니다.
                  </div>
                  <input
                    type="hidden"
                    name="sessions"
                    value={TARGET_EXPEDITION_SESSION}
                  />
                  <input
                    type="hidden"
                    name="targetExpedition"
                    value={joinNotice.title}
                  />
                </div>

                {/* 동계 장비 및 건강 특이사항 (Textarea, 선택) */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-notes-input" className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      GEAR & PHYSICAL NOTES
                    </span>
                    <span className="block text-[11px] font-mono tracking-[0.1em] text-white/50">
                      동계 장비(아이젠/스패츠/헤드랜턴) 보유 여부 및 건강 특이사항 (선택)
                    </span>
                  </label>
                  <textarea
                    id="gear-notes-input"
                    rows={2}
                    value={formGearNote}
                    onChange={(e) => setFormGearNote(e.target.value)}
                    placeholder="예: 아이젠/스패츠 보유 중, 겨울 설산 산행 3회 유경험 등"
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
                      <span>[ SUBMIT APPLICATION // 참가 신청하기 ➔ ]</span>
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
