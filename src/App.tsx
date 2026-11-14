import React, { useState, useEffect, useId, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowRight, Check } from 'lucide-react';
import { IMAGE_REGISTRY } from './imageRegistry';
import { DEFAULT_NAGA_DATA, DEFAULT_JOIN_NOTICES, normalizeNagaData } from './defaultData';
import { ActivityItem, ProductItem, HeroSlideItem, JoinNoticeData, JoinNoticeItem, NagaAppData } from './types';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminConsoleModal, SaveDataResult } from './components/AdminConsoleModal';

// View type definition for SPA View Swap
type ViewMode = 'home' | 'activities' | 'recovery' | 'join';

interface ParsedHashRoute {
  view: ViewMode;
  activityId: string | null;
  productId: string | null;
  joinSessionId: string | null;
}

function parseHashRoute(rawHash: string): ParsedHashRoute {
  const clean = (rawHash || '').replace(/^#\/?/, '').split('?')[0].trim();
  if (!clean) {
    return { view: 'home', activityId: null, productId: null, joinSessionId: null };
  }

  const segments = clean
    .split('/')
    .map((seg) => {
      try {
        return decodeURIComponent(seg.trim());
      } catch {
        return seg.trim();
      }
    })
    .filter(Boolean);

  const section = (segments[0] || '').toLowerCase();
  const itemId = segments[1] || null;

  if (section === 'activities') {
    return { view: 'activities', activityId: itemId, productId: null, joinSessionId: null };
  }
  if (section === 'recovery') {
    return { view: 'recovery', activityId: null, productId: itemId, joinSessionId: null };
  }
  if (section === 'join') {
    return { view: 'join', activityId: null, productId: null, joinSessionId: itemId };
  }

  return { view: 'home', activityId: null, productId: null, joinSessionId: null };
}

function normalizeHashTarget(hash: string): string {
  if (!hash || hash === '#') return '#/';
  return hash.startsWith('#') ? hash : `#${hash}`;
}

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
  const [initialRoute] = useState<ParsedHashRoute>(() =>
    typeof window !== 'undefined'
      ? parseHashRoute(window.location.hash)
      : { view: 'home', activityId: null, productId: null, joinSessionId: null }
  );

  const [currentView, setCurrentView] = useState<ViewMode>(initialRoute.view);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(initialRoute.activityId);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialRoute.productId);
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
    let isMounted = true;
    const loadRemoteData = async () => {
      try {
        const res = await fetch(`/api/data?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const resData = await res.json();
          if (resData?.success && resData?.data && isMounted) {
            const normalized = normalizeNagaData(resData.data);
            setAppData(normalized);
            try {
              localStorage.setItem('naga_app_data_cache', JSON.stringify(normalized));
            } catch {}
            return;
          }
        }
      } catch {
        // Fallback to static /data/db.json if deployed on static hosting (e.g. Netlify / GitHub Pages)
      }

      try {
        const staticRes = await fetch(`/data/db.json?t=${Date.now()}`, { cache: 'no-store' });
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          if (staticData && typeof staticData === 'object' && isMounted) {
            const normalized = normalizeNagaData(staticData);
            setAppData(normalized);
            try {
              localStorage.setItem('naga_app_data_cache', JSON.stringify(normalized));
            } catch {}
          }
        }
      } catch (err) {
        console.log('[NAGA Client] Running in local/cache mode:', err);
      }
    };

    loadRemoteData();
    return () => {
      isMounted = false;
    };
  }, []);

  const ACTIVITIES_DATA = appData.activities;
  const HERO_SLIDES = appData.heroSlides;
  const PRODUCTS_DATA = appData.products;
  const selectedActivity: ActivityItem | null =
    ACTIVITIES_DATA.find((a) => a.id === selectedActivityId) || null;
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

  const defaultJoinSessionIdRef = useRef<string>(
    activeJoinSessions[0]?.id || 'join-session-taebaek'
  );
  defaultJoinSessionIdRef.current = activeJoinSessions[0]?.id || 'join-session-taebaek';

  const [selectedJoinSessionId, setSelectedJoinSessionId] = useState<string>(
    () => initialRoute.joinSessionId || activeJoinSessions[0]?.id || 'join-session-taebaek'
  );

  // Keep selectedJoinSessionId valid when sessions are added/toggled
  const currentJoinSession: JoinNoticeItem =
    activeJoinSessions.find((s) => s.id === selectedJoinSessionId) || activeJoinSessions[0];

  // Bidirectional Hash Routing Synchronization
  const syncStateFromHash = useCallback(() => {
    const route = parseHashRoute(window.location.hash);
    setCurrentView(route.view);
    setSelectedActivityId(route.activityId);
    setModalSlideIndex(0);
    setSelectedProductId(route.productId);
    setProductPhotoIndex(0);
    if (route.view === 'join') {
      setSelectedJoinSessionId(route.joinSessionId || defaultJoinSessionIdRef.current);
      setFormSubmitted(false);
      setFormError('');
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', syncStateFromHash);
    return () => {
      window.removeEventListener('hashchange', syncStateFromHash);
    };
  }, [syncStateFromHash]);

  const navigateToHash = (targetHash: string) => {
    const normalizedTarget = normalizeHashTarget(targetHash);
    const currentNormalized = normalizeHashTarget(window.location.hash);
    if (currentNormalized === normalizedTarget) {
      syncStateFromHash();
      return;
    }
    window.location.hash = normalizedTarget;
  };

  // Keep activeSlide in bounds if slides are deleted
  useEffect(() => {
    if (HERO_SLIDES.length > 0 && activeSlide >= HERO_SLIDES.length) {
      setActiveSlide(0);
    }
  }, [HERO_SLIDES.length, activeSlide]);

  // Background preload remaining hero slide images after mount
  useEffect(() => {
    if (!HERO_SLIDES || HERO_SLIDES.length <= 1) return;
    const preloadedImages: HTMLImageElement[] = [];
    HERO_SLIDES.slice(1).forEach((slide) => {
      if (!slide?.image) return;
      const img = new Image();
      img.src = slide.image;
      preloadedImages.push(img);
    });
    return () => {
      preloadedImages.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [HERO_SLIDES]);

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

  const handleSaveAppData = async (updatedData: NagaAppData): Promise<SaveDataResult> => {
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
      return {
        success: !!resData.success,
        githubSynced: !!resData.githubSynced,
        githubConfigured: !!resData.githubConfigured,
        githubCommitUrl: resData.githubCommitUrl || null,
        message: resData.message,
      };
    } catch (err) {
      console.error('Server save error:', err);
      return {
        success: true,
        githubSynced: false,
        githubConfigured: false,
        message: '로컬 브라우저 캐시에 저장되었습니다.',
      };
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
    <div id="naga-app" className="min-h-[100dvh] bg-black text-white flex flex-col font-sans break-keep selection:bg-white selection:text-black overflow-x-hidden w-full">
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
            onClick={() => navigateToHash('#/')}
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
                NATIONAL ALPINE GUARD ASSOCIATION
              </span>
            </div>
          </button>

          {/* Right Navigation Menu: 1. ACTIVITIES | 2. RECOVERY | 3. JOIN */}
          <nav id="naga-navigation" className="flex items-center font-mono text-[11px] sm:text-xs tracking-[0.1em] sm:tracking-[0.18em] shrink-0">
            <button
              id="nav-activities-btn"
              onClick={() => navigateToHash('#/activities')}
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
              onClick={() => navigateToHash('#/recovery')}
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
              onClick={() => navigateToHash('#/join')}
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
          <div id="home-view" className="flex-1 flex flex-col w-full justify-between">
            {/* Hero Section (메인 배너): 모바일에서도 가로 4:3 비율 유지 + 하단 배너 한눈에 노출 */}
            <section
              id="hero-banner-section"
              className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[64dvh] sm:min-h-[420px] max-h-[760px] bg-zinc-900 overflow-hidden flex flex-col justify-between touch-pan-y shrink-0"
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
                  className={`absolute inset-0 bg-zinc-900 transition-opacity duration-700 ease-in-out ${
                    index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`NAGA Exhibition Slide ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding={index === 0 ? 'sync' : 'async'}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Slider Controls Bar: Left & Right Arrow Buttons + Slide Index & Progress */}
              <div className="relative z-20 w-full px-3.5 sm:px-12 pb-3 sm:pb-6 mt-auto flex items-end justify-between gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="hero-slider-prev-btn"
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-white/40 bg-black/75 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white active:scale-95"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    id="hero-slider-next-btn"
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-white/40 bg-black/75 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white active:scale-95"
                  >
                    <ChevronRight size={17} />
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
              MAIN FOOTER (배너 직하단 배치: 모바일에서 4:3 히어로 배너와 한 화면에 노출)
              Left: "NAGA™" & "National Alpine Guard Association."
              Right: ORGANIZER, INSTAGRAM, SEOUL, KOREA, etc.
              ========================================================================
            */}
            <footer
              id="main-footer"
              className="w-full bg-black border-t border-white/20 px-4 sm:px-12 py-5 sm:py-12 flex-1 flex items-center"
            >
              <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-8 lg:gap-16">
                {/* Left Side: Bold Brand Typography */}
                <div className="space-y-1 sm:space-y-2 max-w-xl">
                  <h2 className="text-2xl sm:text-5xl font-syne font-extrabold uppercase tracking-tight text-white leading-none">
                    NAGA<span className="text-base sm:text-2xl font-sans align-top ml-1">™</span>
                  </h2>
                  <p className="text-base sm:text-2xl lg:text-3xl font-syne font-bold tracking-tight text-white leading-snug sm:leading-tight break-words">
                    National Alpine Guard Association.
                  </p>
                </div>

                {/* Right Side: Informational Column Right-Aligned */}
                <div className="font-mono text-[11px] sm:text-sm tracking-[0.14em] sm:tracking-[0.16em] text-white/80 uppercase pt-3 lg:pt-2 border-t border-white/10 lg:border-t-0 w-full lg:w-auto text-left lg:text-right lg:ml-auto">
                  <div className="space-y-1.5 sm:space-y-2.5">
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
                onClick={() => navigateToHash('#/')}
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
                  onClick={() => navigateToHash(`#/activities/${encodeURIComponent(act.id)}`)}
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
                onClick={() => navigateToHash('#/activities')}
              >
                <div
                  className="bg-black border border-white text-white w-full max-w-2xl px-5 pt-5 sm:px-8 sm:pt-8 space-y-5 sm:space-y-6 relative max-h-[85dvh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="border-b border-white/20 pb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-xs tracking-[0.18em] sm:tracking-[0.2em] text-white/60 block uppercase tabular-nums">
                        {selectedActivity.code}
                      </span>
                      <h3 className="text-lg sm:text-2xl font-syne font-bold uppercase tracking-tight mt-1 text-white break-words">
                        {selectedActivity.title}
                      </h3>
                    </div>
                    <button
                      id="close-modal-btn"
                      onClick={() => navigateToHash('#/activities')}
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
                      DESCRIPTION
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-sans break-words">
                      {selectedActivity.description}
                    </p>
                  </div>

                  {/* Photo Slide Carousel */}
                  {selectedActivity.images && selectedActivity.images.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
                          PHOTOS
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.18em] text-white/70 tabular-nums">
                          [ {String((modalSlideIndex % selectedActivity.images.length) + 1).padStart(2, '0')} /{' '}
                          {String(selectedActivity.images.length).padStart(2, '0')} ]
                        </span>
                      </div>

                      <div className="relative w-full aspect-[4/3] max-h-[440px] bg-zinc-900 border border-white/20 overflow-hidden group mx-auto">
                        {/* Slide Images */}
                        {selectedActivity.images.map((imgSrc, idx) => (
                          <div
                            key={idx}
                            className={`absolute inset-0 bg-zinc-900 transition-opacity duration-300 ${
                              idx === modalSlideIndex ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                            }`}
                          >
                            <img
                              src={imgSrc}
                              alt={`${selectedActivity.title} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          </div>
                        ))}

                        {/* Navigation Arrows */}
                        {selectedActivity.images.length > 1 && (
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
                        )}

                        {/* Slide Indicators / Dots at Bottom */}
                        {selectedActivity.images.length > 1 && (
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 border border-white/20 max-w-[90%] overflow-x-auto no-scrollbar">
                            {selectedActivity.images.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalSlideIndex(idx);
                                }}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-1.5 shrink-0 transition-all ${
                                  idx === modalSlideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Strip for Quick Photo Selection */}
                      {selectedActivity.images.length > 1 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                          {selectedActivity.images.map((imgSrc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setModalSlideIndex(idx)}
                              className={`relative aspect-[4/3] bg-zinc-900 border overflow-hidden transition-all ${
                                idx === modalSlideIndex
                                  ? 'border-white ring-1 ring-white opacity-100'
                                  : 'border-white/20 opacity-50 hover:opacity-85'
                              }`}
                            >
                              <img
                                src={imgSrc}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sticky Modal Footer */}
                  <div className="sticky bottom-0 z-30 bg-black border-t border-white/20 py-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] tracking-[0.15em] text-white/40 uppercase">
                      {selectedActivity.distance} · {selectedActivity.elevation}
                    </span>

                    <button
                      onClick={() => navigateToHash('#/activities')}
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
        {/* VIEW 2: 2. RECOVERY (블로그형 미리보기 목록 & 스크롤형 본문 포스트 뷰) */}
        {/* ==================================================================== */}
        {currentView === 'recovery' && (
          <div id="recovery-view" className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-6 sm:py-12">
            {selectedProduct ? (
              /* ============================================================== */
              /* RECOVERY BLOG POST VIEW (스크롤하며 배치한 사진과 글을 읽는 블로그 본문) */
              /* ============================================================== */
              (() => {
                const postSubtitle =
                  selectedProduct.subtitle !== undefined
                    ? selectedProduct.subtitle
                    : selectedProduct.usage || selectedProduct.category || '';

                const postBlocks =
                  Array.isArray(selectedProduct.blocks) && selectedProduct.blocks.length > 0
                    ? selectedProduct.blocks
                    : [
                        ...(selectedProduct.image
                          ? [
                              {
                                id: 'fallback-img-0',
                                type: 'image' as const,
                                content: selectedProduct.image,
                                caption: '',
                              },
                            ]
                          : []),
                        ...(selectedProduct.detailDescription || selectedProduct.usage
                          ? [
                              {
                                id: 'fallback-txt-0',
                                type: 'text' as const,
                                content: selectedProduct.detailDescription || selectedProduct.usage || '',
                              },
                            ]
                          : []),
                      ];

                return (
                  <article
                    id="recovery-blog-post"
                    className="flex-1 flex flex-col max-w-3xl w-full mx-auto"
                  >
                    {/* Top Back Navigation */}
                    <div className="mb-6 sm:mb-8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigateToHash('#/recovery')}
                        className="text-xs font-mono tracking-[0.2em] uppercase text-white/70 hover:text-black hover:bg-white border border-white/30 px-4 py-2 hover:border-white transition-colors min-h-[38px] flex items-center"
                      >
                        [ ← BACK TO RECOVERY ]
                      </button>
                    </div>

                    {/* Blog Post Header: 제목 (Title) & 부제목 (Subtitle) */}
                    <header className="border-b border-white/25 pb-6 sm:pb-8 mb-8 sm:mb-10 space-y-2.5 sm:space-y-3">
                      <h1 className="text-2xl sm:text-4xl font-syne font-bold tracking-tight text-white leading-tight break-keep">
                        {selectedProduct.name}
                      </h1>
                      {postSubtitle && (
                        <p className="text-sm sm:text-lg font-sans text-white/65 leading-relaxed break-keep">
                          {postSubtitle}
                        </p>
                      )}
                    </header>

                    {/* Blog Post Body: 사용자가 배치한 순서대로 사진과 글이 스크롤되며 노출 */}
                    <div className="space-y-7 sm:space-y-9">
                      {postBlocks.map((block, idx) => {
                        if (block.type === 'image') {
                          if (!block.content) return null;
                          return (
                            <figure key={block.id || idx} className="space-y-2">
                              <div className="w-full min-h-[180px] border border-white/20 bg-zinc-900 overflow-hidden">
                                <img
                                  src={block.content}
                                  alt={
                                    block.caption ||
                                    `${selectedProduct.name} 본문 사진 ${idx + 1}`
                                  }
                                  className="w-full h-auto max-h-[720px] object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              {block.caption && (
                                <figcaption className="text-xs font-mono text-white/50 tracking-wider text-center pt-0.5 break-keep">
                                  {block.caption}
                                </figcaption>
                              )}
                            </figure>
                          );
                        }

                        return (
                          <div
                            key={block.id || idx}
                            className="text-sm sm:text-base font-sans text-white/90 leading-relaxed sm:leading-loose whitespace-pre-line break-keep"
                          >
                            {block.content}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Back Button */}
                    <div className="mt-12 sm:mt-16 pt-8 border-t border-white/20">
                      <button
                        type="button"
                        onClick={() => navigateToHash('#/recovery')}
                        className="w-full sm:w-auto px-6 py-3.5 border border-white/40 hover:border-white hover:bg-white hover:text-black text-white font-mono text-xs font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2"
                      >
                        <span>[ ← BACK TO RECOVERY ]</span>
                      </button>
                    </div>
                  </article>
                );
              })()
            ) : (
              /* ============================================================== */
              /* RECOVERY BLOG PREVIEW LIST (대표사진 + 제목 + 부제목 미리보기 카드) */
              /* ============================================================== */
              <>
                {/* View Header */}
                <div className="border-b border-white/20 pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white inline-flex items-baseline gap-2.5">
                      <span className="font-sans font-bold tabular-nums">2.</span>
                      <span>RECOVERY</span>
                    </h2>
                  </div>
                  <button
                    onClick={() => navigateToHash('#/')}
                    className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
                  >
                    [ ← BACK TO HOME ]
                  </button>
                </div>

                {/* 2-Column Blog Preview Grid: 대표사진 + 제목 + 부제목 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                  {PRODUCTS_DATA.map((prod) => {
                    const previewSubtitle =
                      prod.subtitle !== undefined
                        ? prod.subtitle
                        : prod.usage || prod.category || '';
                    return (
                      <article
                        key={prod.id}
                        id={`product-card-${prod.id}`}
                        onClick={() => navigateToHash(`#/recovery/${encodeURIComponent(prod.id)}`)}
                        className="cursor-pointer border border-white/20 hover:border-white bg-black flex flex-col transition-all duration-300 group"
                      >
                        {/* 대표사진 (Cover Photo on Top) */}
                        <div className="relative w-full aspect-[4/3] bg-zinc-900 overflow-hidden border-b border-white/20">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* 제목 (Title) & 부제목 (Subtitle) */}
                        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <h3 className="text-xl sm:text-2xl font-syne font-bold tracking-tight text-white group-hover:text-white/90 break-keep">
                              {prod.name}
                            </h3>
                            {previewSubtitle && (
                              <p className="text-xs sm:text-sm font-sans text-white/70 leading-relaxed break-keep">
                                {previewSubtitle}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs tracking-[0.18em] uppercase text-white/70 group-hover:text-white">
                            <span>[ READ POST ]</span>
                            <ArrowRight
                              size={15}
                              className="group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </div>
                      </article>
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
                <p className="text-xs font-mono tracking-[0.12em] text-white/60 mt-1.5">
                  참가 세션 선택 및 신청
                </p>
              </div>
              <button
                onClick={() => navigateToHash('#/')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3.5 py-2 self-start sm:self-auto hover:border-white transition-colors min-h-[38px] flex items-center"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* Multi-Session Selector Tab Bar (모바일: 세로 스택 / 데스크톱: 가로 스크롤 탭) */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono tracking-[0.15em] text-white/50 uppercase">
                  SESSIONS ({activeJoinSessions.length})
                </span>
              </div>
              <div
                role="tablist"
                aria-label="Active Sessions"
                className="flex flex-col sm:flex-row sm:overflow-x-auto no-scrollbar gap-2.5"
              >
                {activeJoinSessions.map((session, idx) => {
                  const isSelected = session.id === currentJoinSession.id;
                  return (
                    <button
                      key={session.id}
                      role="tab"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => navigateToHash(`#/join/${encodeURIComponent(session.id)}`)}
                      className={`text-left border p-3.5 sm:p-4 transition-all flex flex-col justify-between gap-1.5 sm:min-w-[240px] sm:flex-1 ${
                        isSelected
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-white border-white/25 hover:border-white/70 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span
                          className={`text-[10px] font-mono tracking-[0.18em] uppercase tabular-nums ${
                            isSelected ? 'text-black/60 font-bold' : 'text-white/45'
                          }`}
                        >
                          {session.tag || `SESSION ${String(idx + 1).padStart(2, '0')}`}
                        </span>
                        <span
                          className={`text-[9px] font-mono tracking-[0.18em] px-1.5 py-0.5 uppercase font-bold shrink-0 ${
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
                          className={`text-sm sm:text-base font-syne font-bold uppercase tracking-tight leading-snug break-keep ${
                            isSelected ? 'text-black' : 'text-white'
                          }`}
                        >
                          {session.title}
                        </div>
                        <div
                          className={`text-[11px] font-mono tracking-[0.04em] mt-0.5 line-clamp-1 ${
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

            {/* Content: 현재 선택된 모집 세션 안내 */}
            <div className="border border-white/20 bg-white/[0.03] p-4 sm:p-6 mb-6 sm:mb-8 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-mono tracking-[0.22em] text-white/50 uppercase block">
                    {currentJoinSession.tag || 'UPCOMING SESSION'}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase tabular-nums">
                    SESSION {String(activeJoinSessions.findIndex((s) => s.id === currentJoinSession.id) + 1).padStart(2, '0')} / {String(activeJoinSessions.length).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-syne font-bold uppercase tracking-tight text-white mt-1.5 leading-snug break-keep">
                  {currentJoinSession.title}
                </h3>
                <p className="text-xs sm:text-sm font-mono tracking-[0.08em] text-white/85 mt-1 break-keep">
                  {currentJoinSession.sub}
                </p>
                <p className="mt-2.5 text-xs font-mono tracking-[0.06em] text-white/60 leading-relaxed break-keep">
                  {currentJoinSession.description}
                </p>
              </div>

              {/* Course Photo (가로 4:3 비율 코스 사진 · 사진 위 불필요한 텍스트 오버레이 제거) */}
              <div className="relative w-full aspect-[4/3] max-h-[440px] bg-zinc-900 border border-white/20 overflow-hidden">
                <img
                  src={currentJoinSession.coursePhoto}
                  alt={currentJoinSession.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Application Form */}
            {formSubmitted ? (
              <div
                id="submission-success-card"
                className="border border-white bg-black p-6 sm:p-8 text-center space-y-6"
              >
                <div className="w-12 h-12 border border-white mx-auto flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg sm:text-xl font-syne font-bold uppercase tracking-tight text-white">
                    APPLICATION SUBMITTED
                  </h4>
                  <p className="text-xs font-mono tracking-[0.1em] text-white/80 max-w-md mx-auto leading-relaxed break-keep">
                    {formName} 님의 [{currentJoinSession.title}] 참가 신청서가 접수되었습니다. 기재하신 연락처({formPhone})로 세부 일정 안내가 발송됩니다.
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
                    onClick={() => navigateToHash('#/activities')}
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
                {/* Form Header (단순화: APPLICATION 타이틀만 표시, 하단 설명 제거) */}
                <div className="border-b border-white/20 pb-3 sm:pb-4 flex items-center justify-between gap-2">
                  <h3 className="text-lg sm:text-2xl font-syne font-bold uppercase tracking-tight text-white">
                    APPLICATION
                  </h3>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase">
                    * REQUIRED
                  </span>
                </div>

                {formError && (
                  <div className="border border-white bg-white/10 px-4 py-2.5 text-xs font-mono tracking-[0.15em] text-white uppercase">
                    ※ {formError}
                  </div>
                )}

                {/* 선택된 신청 세션 표시 */}
                <div className="border border-white/25 bg-white/[0.04] p-3.5 sm:p-4 space-y-1">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase block">
                    SELECTED SESSION
                  </span>
                  <div className="text-sm sm:text-base font-syne font-bold uppercase tracking-tight text-white break-keep">
                    {currentJoinSession.title}
                  </div>
                  <p className="text-xs font-mono text-white/75 break-keep">
                    {currentJoinSession.sub}
                  </p>
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

                {/* 이름 (Input Text, 필수) */}
                <div className="space-y-1.5">
                  <label htmlFor={nameInputId} className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      NAME <span className="text-white">*</span>
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
                    placeholder="홍길동"
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
                  />
                </div>

                {/* 연락처 (Input Tel, 필수) */}
                <div className="space-y-1.5">
                  <label htmlFor={phoneInputId} className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      PHONE <span className="text-white">*</span>
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
                      INSTAGRAM
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

                {/* 장비 및 건강 특이사항 (Textarea, 선택) */}
                <div className="space-y-1.5">
                  <label htmlFor="gear-notes-input" className="block">
                    <span className="block text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
                      NOTES
                    </span>
                    <span className="block text-[11px] font-mono tracking-[0.1em] text-white/50">
                      장비 보유 여부 및 특이사항 (선택)
                    </span>
                  </label>
                  <textarea
                    id="gear-notes-input"
                    rows={2}
                    value={formGearNote}
                    onChange={(e) => setFormGearNote(e.target.value)}
                    placeholder="장비 보유 여부 및 특이사항 등"
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-2.5 text-xs font-mono text-white placeholder-white/30 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* 제출 버튼 */}
                <div className="pt-3 sm:pt-4">
                  <button
                    type="submit"
                    id="submit-application-btn"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 bg-white text-black font-mono text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-white min-h-[46px]"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">[ SUBMITTING... ]</span>
                    ) : (
                      <span>[ SUBMIT APPLICATION ➔ ]</span>
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
