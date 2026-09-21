import React, { useState, useEffect, useId } from 'react';
import { ChevronLeft, ChevronRight, X, ArrowRight, Check } from 'lucide-react';

// View type definition for SPA View Swap
type ViewMode = 'home' | 'activities' | 'recovery' | 'join';

interface ActivityItem {
  id: string;
  code: string;
  date: string;
  title: string;
  distance: string;
  keyPoints: string;
  location: string;
  elevation: string;
  gearRequired: string;
  recoveryProtocol: string;
  description: string;
}

interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  image: string;
  spec: string;
  usage: string;
}

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: 'act-04',
    code: '[2027.07]',
    date: '2027.07',
    title: '2027 SEOUL BUL-SU-SA-DO-BUK 45KM MAIN CHALLENGE',
    distance: '45km',
    keyPoints: '불암산 - 수락산 - 사패산 - 도봉산 - 북한산 종주 풀코스',
    location: '불암산 ~ 북한산 종주 트레일',
    elevation: '+3,850m 누적고도',
    gearRequired: 'NAGA 알파인 테크니컬 팩, 트레일러닝화, 헤드랜턴, 비상 쉘 재킷',
    recoveryProtocol: 'NAGA Guard Hydrometer 전해질 체크 & Alpine Shake 회복 급식',
    description: '서울의 5대 암릉 명산을 잇는 총 45km 고난도 알파인 트레버스. 극대화된 내구력과 페이스 관리, 테크니컬 암릉 주파 능력을 검증하는 메인 챌린지.',
  },
  {
    id: 'act-03',
    code: '[2027.06]',
    date: '2027.06',
    title: 'PRE-TRAINING DRILL 03: NORTH HAN MOUNTAIN (15km / 암릉 적응 & Alpine Shake)',
    distance: '15km',
    keyPoints: '암릉 적응 & Alpine Shake',
    location: '북한산 백운대 - 의상능선 테크니컬 암릉',
    elevation: '+1,280m 누적고도',
    gearRequired: '알파인 릿지 슈즈, 접지 글러브, 경량 윈드쉘',
    recoveryProtocol: 'Alpine Shake 단백질 & 필수 아미노산 즉각 보충',
    description: '북한산 주능선의 고난도 암릉 구간 적응 훈련 및 세션 직후 Alpine Shake 포뮬러를 통한 근육 회복 주기 테스트.',
  },
  {
    id: 'act-02',
    code: '[2027.06]',
    date: '2027.06',
    title: 'PRE-TRAINING DRILL 02: SA-PAE & DO-BONG (15km / 야간 트레일 & Hydrometer)',
    distance: '15km',
    keyPoints: '야간 트레일 & Hydrometer',
    location: '사패산 - 도봉산 Y계곡 및 능선',
    elevation: '+1,150m 누적고도',
    gearRequired: '300 루멘 이상 헤드랜턴, 리플렉티브 기어, NAGA 전해질 팩',
    recoveryProtocol: 'NAGA Guard Hydrometer 수분 및 전해질 균형 실시간 측정',
    description: '심야 트레일 기동성 확보를 위한 야간 주행 훈련 및 Guard Hydrometer 센서를 활용한 체내 탈수/전해질 손실도 정밀 계측 세션.',
  },
  {
    id: 'act-01',
    code: '[2027.06]',
    date: '2027.06',
    title: 'PRE-TRAINING DRILL 01: BUL-AM & SU-RAK (15km / 페이스 측정 & 업사이클링 스탬핑)',
    distance: '15km',
    keyPoints: '페이스 측정 & 업사이클링 스탬핑',
    location: '불암산 - 수락산 기차바위 암릉 코스',
    elevation: '+1,020m 누적고도',
    gearRequired: '고프코어 경량 트레킹 기어, 친환경 텀블러',
    recoveryProtocol: '불암-수락 1차 구간 타임 스탬프 측정 및 업사이클링 태그 발급',
    description: '메인 챌린지 1단계 구간 페이스 분석과 테크니컬 패브릭 재활용 업사이클링 스탬핑 세션 병행 훈련.',
  },
];

const PRODUCTS_DATA: ProductItem[] = [
  {
    id: 'prod-01',
    code: '[Product 01]',
    name: 'NAGA Guard Hydrometer',
    category: 'TECHNICAL DIAGNOSTICS & HYDRATION',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop',
    spec: '정밀 전해질 침투압 농도 측정기 / 내한성 티타늄 하우징 / IP68 완전 방수',
    usage: '극한의 알파인 트레일 및 45km 연속 주행 중 체내 수분 손실 및 전해질 밸런스를 측정하는 휴대용 정밀 하이드로미터.',
  },
  {
    id: 'prod-02',
    code: '[Product 02]',
    name: 'NAGA Alpine Shake',
    category: 'RAPID METABOLIC RECOVERY',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop',
    spec: 'BCAA & 전해질 복합 알파인 포뮬러 / 30g 고밀도 단백질 / 휴대용 파우치 규격',
    usage: '고도 상승 및 암릉 기동 직후 급성 근육 피로를 중화하고 글리코겐을 신속 재충전하는 전문 산악 포뮬러 쉐이크.',
  },
  {
    id: 'prod-03',
    code: '[Product 03]',
    name: 'NAGA Balance Greek Bowl',
    category: 'POST-EXPEDITION NUTRITION',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
    spec: '유청 분리 고농축 그릭 요거트 / 고단백 슈퍼푸드 너트 믹스 / 천연 아카시아 꿀',
    usage: '장거리 알파인 활동 후 위장 부담 없이 장시간 단백질을 공급하는 고영양 밸런스 리커버리 볼.',
  },
];

const HERO_SLIDES = [
  {
    id: 1,
    title: 'BUL-SU-SA-DO-BUK 45KM',
    tag: 'EXTREME ALPINE RIDGE TRAVERSE',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2400&auto=format&fit=crop',
    caption: 'SEOUL GRANITE APEX RIDGE // 45KM CONTINUOUS DRILL',
  },
  {
    id: 2,
    title: 'TECHNICAL ALPINE GEAR',
    tag: 'HIGH-ALTITUDE RESISTANCE & GORPCORE SPEC',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2400&auto=format&fit=crop',
    caption: 'NATIONAL ALPINE GUARD ASSOCIATION // PHARMACEUTICAL RECOVERY',
  },
  {
    id: 3,
    title: 'NIGHT RUN & PRE-DRILL',
    tag: 'SA-PAE & DO-BONG RIDGE RECON',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2400&auto=format&fit=crop',
    caption: 'TECHNICAL TRAIL HEADLAMP SYSTEM // HYDROMETER TESTING',
  },
  {
    id: 4,
    title: 'NORTH HAN ROCK WALL',
    tag: 'STEEP GRANITE ADAPTATION',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2400&auto=format&fit=crop',
    caption: 'PRECISION ROCK CLIMBING // ALPINE SHAKE PROTOTYPE',
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const nameInputId = useId();
  const phoneInputId = useId();
  const instagramInputId = useId();

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

  const handleSessionToggle = (sessionName: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionName) ? prev.filter((s) => s !== sessionName) : [...prev, sessionName]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      setFormError('이름과 연락처는 필수 입력 항목입니다.');
      return;
    }
    if (selectedSessions.length === 0) {
      setFormError('신청 세션을 최소 1개 이상 선택해 주세요.');
      return;
    }

    setFormError('');
    setFormSubmitted(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormInstagram('');
    setSelectedSessions([]);
    setFormSubmitted(false);
    setFormError('');
  };

  return (
    <div id="naga-app" className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* 
        ========================================================================
        HEADER (Fixed at top, strictly maintained across all SPA view swaps)
        Left: NAGA Logo (Mountain Peak + NAGA Typographic Mark)
        Right: 1. ACTIVITIES | 2. RECOVERY | 3. JOIN
        ========================================================================
      */}
      <header
        id="naga-header"
        className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/20 transition-colors"
      >
        <div className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Logo (Clickable to return to Home View) */}
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
            aria-label="NAGA Home"
          >
            {/* Minimalist Mountain Peak + NAGA Mark SVG matching logo.jpg */}
            <div className="w-10 h-10 bg-black border border-white/30 flex items-center justify-center p-1 group-hover:border-white transition-colors">
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
            </div>

            <div className="flex flex-col">
              <span className="font-syne font-bold tracking-[0.25em] text-lg leading-none text-white flex items-center gap-1">
                NAGA<span className="text-[10px] tracking-normal font-sans align-top">™</span>
              </span>
              <span className="text-[9px] text-white/60 tracking-[0.18em] uppercase font-mono mt-0.5">
                NATL ALPINE GUARD ASSN
              </span>
            </div>
          </button>

          {/* Right Navigation Menu: 1. ACTIVITIES | 2. RECOVERY | 3. JOIN */}
          <nav id="naga-navigation" className="flex items-center text-xs tracking-[0.18em] font-mono">
            <button
              id="nav-activities-btn"
              onClick={() => setCurrentView('activities')}
              className={`px-3 sm:px-4 py-2 uppercase transition-all border border-transparent ${
                currentView === 'activities'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'text-white/80 hover:text-white hover:border-white/30'
              }`}
            >
              1. ACTIVITIES
            </button>

            <span className="text-white/30 px-1 select-none">|</span>

            <button
              id="nav-recovery-btn"
              onClick={() => setCurrentView('recovery')}
              className={`px-3 sm:px-4 py-2 uppercase transition-all border border-transparent ${
                currentView === 'recovery'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'text-white/80 hover:text-white hover:border-white/30'
              }`}
            >
              2. RECOVERY
            </button>

            <span className="text-white/30 px-1 select-none">|</span>

            <button
              id="nav-join-btn"
              onClick={() => setCurrentView('join')}
              className={`px-3 sm:px-4 py-2 uppercase transition-all border border-transparent ${
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
      <main id="naga-main-stage" className="flex-1 flex flex-col">
        {/* ==================================================================== */}
        {/* VIEW 0: HOME VIEW (Hero Image Slider + Main Footer placed immediately below) */}
        {/* ==================================================================== */}
        {currentView === 'home' && (
          <div id="home-view" className="flex-1 flex flex-col">
            {/* Hero Section (메인 배너) */}
            <section
              id="hero-banner-section"
              className="relative w-full h-[72vh] min-h-[480px] max-h-[780px] bg-black overflow-hidden flex flex-col justify-between"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
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
                    className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-90"
                  />
                  {/* Subtle technical gradient overlay for stark wireframe text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60" />
                </div>
              ))}

              {/* Top Banner Tag / Technical Index */}
              <div className="relative z-20 px-6 sm:px-12 pt-8 flex items-center justify-between text-[11px] font-mono tracking-[0.25em] text-white/70">
                <span className="border border-white/20 px-2.5 py-1 bg-black/60 backdrop-blur-sm">
                  {HERO_SLIDES[activeSlide].tag}
                </span>
                <span className="border border-white/20 px-2.5 py-1 bg-black/60 backdrop-blur-sm">
                  NAGA // 2026 FIELD DEPLOYMENT
                </span>
              </div>

              {/* Center Content overlay matching Arc'teryx technical vibe */}
              <div className="relative z-20 px-6 sm:px-12 my-auto max-w-4xl">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-syne font-extrabold uppercase tracking-tight text-white drop-shadow-md">
                  {HERO_SLIDES[activeSlide].title}
                </h1>
                <p className="mt-3 text-xs sm:text-sm font-mono tracking-[0.2em] text-white/80 uppercase">
                  {HERO_SLIDES[activeSlide].caption}
                </p>
              </div>

              {/* Slider Controls Bar: Left/Right Arrow Buttons + '• • o • •' Slide Indicator */}
              <div className="relative z-20 w-full px-6 sm:px-12 pb-8 flex items-end justify-between">
                {/* Left & Right Arrow Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id="hero-slider-prev-btn"
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-10 h-10 border border-white/40 bg-black/70 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    id="hero-slider-next-btn"
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-10 h-10 border border-white/40 bg-black/70 hover:bg-white hover:text-black transition-colors flex items-center justify-center text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* 
                  Bottom '• • o • •' Slide Indicator:
                  Formatted strictly according to specification:
                  Active slide is 'o', inactive slides are '•'
                */}
                <div
                  id="hero-slide-indicator"
                  className="flex items-center gap-3 px-4 py-2 border border-white/30 bg-black/80 backdrop-blur-sm font-mono text-sm tracking-[0.3em]"
                >
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`transition-all duration-200 focus:outline-none ${
                        idx === activeSlide
                          ? 'text-white font-bold scale-125'
                          : 'text-white/40 hover:text-white/80'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    >
                      {idx === activeSlide ? 'o' : '•'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 
              ========================================================================
              MAIN FOOTER (메인 배너 직하단 배치: 다른 여백이나 본문 없이 FOOTER가 붙어서 배치됨)
              Col 1: ORGANIZER: JWY | SEOUL, KOREA
              Col 2: INSTAGRAM: @nationalalpineguard
              Bottom: 2026 NAGA™. ALL RIGHTS RESERVED. (※ No copyright symbol)
              ========================================================================
            */}
            <footer
              id="main-footer"
              className="w-full bg-black border-t border-white/20 p-0 m-0"
            >
              {/* 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/20 border-b border-white/20">
                {/* Col 1 */}
                <div id="footer-col-1" className="p-6 sm:p-8 flex items-center">
                  <span className="font-mono text-xs sm:text-sm tracking-[0.15em] text-white uppercase">
                    ORGANIZER: JWY | SEOUL, KOREA
                  </span>
                </div>

                {/* Col 2 */}
                <div id="footer-col-2" className="p-6 sm:p-8 flex items-center justify-between">
                  <span className="font-mono text-xs sm:text-sm tracking-[0.15em] text-white uppercase">
                    INSTAGRAM:{' '}
                    <a
                      href="https://instagram.com/nationalalpineguard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-white/70 transition-colors"
                    >
                      @nationalalpineguard
                    </a>
                  </span>
                </div>
              </div>

              {/* Bottom Row */}
              <div id="footer-bottom-row" className="px-6 sm:px-8 py-5 flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.18em] text-white/80 uppercase">
                  2026 NAGA™. ALL RIGHTS RESERVED.
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase hidden sm:inline">
                  KOREA UNIVERSITY COLLEGE OF PHARMACY
                </span>
              </div>
            </footer>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 1: 1. ACTIVITIES (시간 역순 활동 목록 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'activities' && (
          <div id="activities-view" className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
            {/* View Header with 1px border */}
            <div className="border-b border-white/20 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono tracking-[0.25em] text-white/60 uppercase block">
                  TIMELINE ARCHIVE // REVERSE CHRONOLOGICAL
                </span>
                <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white mt-1">
                  1. ACTIVITIES
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3 py-1.5 self-start sm:self-auto hover:border-white transition-colors"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* Reverse Chronological Card List */}
            <div className="space-y-4">
              {ACTIVITIES_DATA.map((act) => (
                <div
                  key={act.id}
                  id={`activity-card-${act.id}`}
                  onClick={() => setSelectedActivity(act)}
                  className="group cursor-pointer border border-white/20 hover:border-white bg-black p-5 sm:p-7 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.2em] text-white border border-white/40 px-2.5 py-0.5 bg-white/5">
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

                  <div className="flex items-center gap-3 self-end md:self-center font-mono text-xs tracking-[0.18em] uppercase text-white/70 group-hover:text-white">
                    <span>VIEW PROTOCOL</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Detail Modal / Popup Layer */}
            {selectedActivity && (
              <div
                id="activity-modal"
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setSelectedActivity(null)}
              >
                <div
                  className="bg-black border border-white text-white w-full max-w-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="border-b border-white/20 pb-4 flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs tracking-[0.2em] text-white/60 block uppercase">
                        ACTIVITY PROTOCOL // {selectedActivity.code}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight mt-1 text-white">
                        {selectedActivity.title}
                      </h3>
                    </div>
                    <button
                      id="close-modal-btn"
                      onClick={() => setSelectedActivity(null)}
                      className="border border-white/40 p-2 text-white hover:bg-white hover:text-black transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Specs Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono tracking-[0.15em] border border-white/20 p-4">
                    <div>
                      <span className="text-white/50 uppercase block">LOCATION</span>
                      <span className="text-white font-medium">{selectedActivity.location}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block">ELEVATION</span>
                      <span className="text-white font-medium">{selectedActivity.elevation}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block">REQUIRED GEAR</span>
                      <span className="text-white font-medium">{selectedActivity.gearRequired}</span>
                    </div>
                    <div>
                      <span className="text-white/50 uppercase block">RECOVERY / SCI-TECH</span>
                      <span className="text-white font-medium">{selectedActivity.recoveryProtocol}</span>
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <span className="font-mono text-xs tracking-[0.2em] text-white/50 uppercase block">
                      DRILL OBJECTIVE
                    </span>
                    <p className="text-sm leading-relaxed text-white/90 font-sans">
                      {selectedActivity.description}
                    </p>
                  </div>

                  {/* Modal Actions */}
                  <div className="border-t border-white/20 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        setSelectedActivity(null);
                        setCurrentView('join');
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-white text-black font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>APPLY FOR THIS DRILL</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="w-full sm:w-auto px-5 py-3 border border-white/30 text-white font-mono text-xs tracking-[0.2em] uppercase hover:border-white transition-colors"
                    >
                      [ CLOSE ]
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View Sub-footer */}
            <div className="mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <span>ORGANIZER: JWY | SEOUL, KOREA</span>
              <span>2026 NAGA™. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: 2. RECOVERY (2열 제품 카탈로그 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'recovery' && (
          <div id="recovery-view" className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
            {/* View Header */}
            <div className="border-b border-white/20 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono tracking-[0.25em] text-white/60 uppercase block">
                  TECHNICAL NUTRITION & GEAR CATALOG // 2-COLUMN GRID
                </span>
                <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white mt-1">
                  2. RECOVERY
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3 py-1.5 self-start sm:self-auto hover:border-white transition-colors"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* 2-Column Grid Layout: Photo on top, Name below */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
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
                      className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 border border-white/30 px-2.5 py-1 text-[10px] font-mono tracking-[0.2em] text-white uppercase">
                      {prod.code}
                    </div>
                  </div>

                  {/* Name and Details Below (명칭 하단 배치) */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase block">
                        {prod.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-syne font-bold uppercase tracking-tight text-white mt-1">
                        {prod.name}
                      </h3>
                      <p className="mt-3 text-xs sm:text-sm font-sans text-white/80 leading-relaxed">
                        {prod.usage}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 font-mono text-[11px] tracking-[0.15em] text-white/60 space-y-1">
                      <span className="block text-white/40 uppercase">TECH SPECIFICATION</span>
                      <span className="block text-white/90">{prod.spec}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View Sub-footer */}
            <div className="mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <span>ORGANIZER: JWY | SEOUL, KOREA</span>
              <span>2026 NAGA™. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 3: 3. JOIN (모집 안내 및 참가 신청서 페이지) */}
        {/* ==================================================================== */}
        {currentView === 'join' && (
          <div id="join-view" className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
            {/* View Header */}
            <div className="border-b border-white/20 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono tracking-[0.25em] text-white/60 uppercase block">
                  EXPEDITION RECRUITMENT // REGISTRATION FORM
                </span>
                <h2 className="text-2xl sm:text-4xl font-syne font-bold uppercase tracking-tight text-white mt-1">
                  3. JOIN
                </h2>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-mono tracking-[0.2em] uppercase text-white/60 hover:text-white border border-white/20 px-3 py-1.5 self-start sm:self-auto hover:border-white transition-colors"
              >
                [ ← BACK TO HOME ]
              </button>
            </div>

            {/* Content: 현재 모집 중인 안내 문구 */}
            <div className="border border-white/20 bg-white/5 p-6 mb-8">
              <span className="text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase block">
                ACTIVE RECRUITMENT NOTICE
              </span>
              <h3 className="text-lg sm:text-xl font-syne font-bold uppercase tracking-tight text-white mt-1">
                2027 서울 불수사도북 챌린지 및 사전 훈련 세션
              </h3>
              <p className="mt-2 text-xs font-mono tracking-[0.15em] text-white/70 uppercase">
                고려대학교 약학대학 산악단체 NAGA™ 공식 필드 챌린지 및 사전 훈련 등록
              </p>
            </div>

            {/* Netlify Forms Compatible Application Form */}
            {formSubmitted ? (
              <div
                id="submission-success-card"
                className="border border-white bg-black p-8 text-center space-y-6"
              >
                <div className="w-12 h-12 border border-white mx-auto flex items-center justify-center">
                  <Check size={24} className="text-white" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-mono tracking-[0.25em] text-white/50 uppercase block">
                    TRANSMISSION CONFIRMED
                  </span>
                  <h4 className="text-xl font-syne font-bold uppercase tracking-tight text-white">
                    APPLICATION SUBMITTED SUCCESSFULLY
                  </h4>
                  <p className="text-xs font-mono tracking-[0.15em] text-white/80 max-w-md mx-auto">
                    {formName} 님의 참가 신청서가 접수되었습니다. 기재하신 연락처({formPhone})로 세션별
                    안내 및 장비 점검 지침이 발송됩니다.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={resetForm}
                    className="border border-white/40 px-6 py-2.5 font-mono text-xs tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors"
                  >
                    SUBMIT ANOTHER APPLICATION
                  </button>
                  <button
                    onClick={() => setCurrentView('activities')}
                    className="bg-white text-black px-6 py-2.5 font-mono text-xs font-bold tracking-[0.2em] uppercase hover:bg-white/90 transition-colors"
                  >
                    CHECK ACTIVITIES
                  </button>
                </div>
              </div>
            ) : (
              <form
                name="apply"
                method="POST"
                data-netlify="true"
                onSubmit={handleFormSubmit}
                className="border border-white/20 p-6 sm:p-8 space-y-6 bg-black"
              >
                {/* Netlify Forms hidden input */}
                <input type="hidden" name="form-name" value="apply" />

                {formError && (
                  <div className="border border-white bg-white/10 px-4 py-2.5 text-xs font-mono tracking-[0.15em] text-white uppercase">
                    ※ {formError}
                  </div>
                )}

                {/* 이름 (Input Text, 필수) */}
                <div className="space-y-2">
                  <label htmlFor={nameInputId} className="block text-xs font-mono tracking-[0.2em] uppercase text-white">
                    이름 <span className="text-white">*</span>
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    name="name"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="홍길동 (Hong Gildong)"
                    className="w-full bg-black border border-white/30 focus:border-white px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>

                {/* 연락처 (Input Tel, 필수) */}
                <div className="space-y-2">
                  <label htmlFor={phoneInputId} className="block text-xs font-mono tracking-[0.2em] uppercase text-white">
                    연락처 <span className="text-white">*</span>
                  </label>
                  <input
                    id={phoneInputId}
                    type="tel"
                    name="phone"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full bg-black border border-white/30 focus:border-white px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>

                {/* 인스타그램 계정 (Input Text, 선택) */}
                <div className="space-y-2">
                  <label htmlFor={instagramInputId} className="block text-xs font-mono tracking-[0.2em] uppercase text-white/80">
                    인스타그램 계정 (선택)
                  </label>
                  <input
                    id={instagramInputId}
                    type="text"
                    name="instagram"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="@your_account"
                    className="w-full bg-black border border-white/30 focus:border-white px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors"
                  />
                </div>

                {/* 신청 세션 선택 (Checkbox, 필수 중복 선택) */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-mono tracking-[0.2em] uppercase text-white">
                    신청 세션 선택 (필수 중복 선택) <span className="text-white">*</span>
                  </span>

                  <div className="space-y-2.5">
                    {[
                      '6월 1차 사전 훈련',
                      '6월 2차 사전 훈련',
                      '6월 3차 사전 훈련',
                      '7월 메인 챌린지',
                    ].map((session) => {
                      const isChecked = selectedSessions.includes(session);
                      return (
                        <label
                          key={session}
                          className={`flex items-center gap-3 p-3.5 border transition-all cursor-pointer ${
                            isChecked
                              ? 'border-white bg-white/10 text-white font-semibold'
                              : 'border-white/20 hover:border-white/50 text-white/80'
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="sessions"
                            value={session}
                            checked={isChecked}
                            onChange={() => handleSessionToggle(session)}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                              isChecked ? 'border-white bg-white text-black' : 'border-white/40'
                            }`}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-mono text-xs sm:text-sm tracking-[0.15em] uppercase">
                            [ {isChecked ? 'X' : ' '} ] {session}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 제출 버튼: [ SUBMIT APPLICATION ➔ ] */}
                <div className="pt-4">
                  <button
                    type="submit"
                    id="submit-application-btn"
                    className="w-full py-4 bg-white text-black font-mono text-xs sm:text-sm font-bold tracking-[0.25em] uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-3 border border-white"
                  >
                    <span>[ SUBMIT APPLICATION ➔ ]</span>
                  </button>
                </div>
              </form>
            )}

            {/* View Sub-footer */}
            <div className="mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <span>ORGANIZER: JWY | SEOUL, KOREA</span>
              <span>2026 NAGA™. ALL RIGHTS RESERVED.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
