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
    keyPoints: '45km 종주 풀코스 & 전해질 음료, 수제 그릭요거트',
    location: '불암산 ~ 북한산 종주 트레일',
    elevation: '+3,850m 누적고도',
    gearRequired: '트레킹 기어, 물병, 헤드랜턴 (필수), 비상 보온 의류',
    recoveryProtocol: 'NAGA™ 전해질 음료 & 운동 후 수제 그릭요거트 제공',
    description: '서울의 5대 암릉 명산을 잇는 총 45km 고난도 알파인 트레버스. 극대화된 내구력과 페이스 관리, 테크니컬 암릉 주파 능력을 검증하는 메인 챌린지.',
  },
  {
    id: 'act-03',
    code: '[2027.06]',
    date: '2027.06',
    title: 'PRE-TRAINING DRILL 03: BUK-HAN',
    distance: '15km',
    keyPoints: '야간 산행 연습 & 헤드랜턴 적응',
    location: '북한산 백운대 - 의상능선 테크니컬 암릉',
    elevation: '+1,280m 누적고도',
    gearRequired: '트레킹 기어, 물병, 헤드랜턴',
    recoveryProtocol: '운동 후 프로틴 쉐이크 지급',
    description: '야간 산행 연습 및 시야가 제한된 어두운 야간 암릉 지형에서의 안전한 보행과 장비 적응 훈련.',
  },
  {
    id: 'act-02',
    code: '[2027.06]',
    date: '2027.06',
    title: 'PRE-TRAINING DRILL 02: NAM-SAN',
    distance: '10km',
    keyPoints: '남산 업힐 인터벌 & 프로틴 쉐이크',
    location: '남산 순환로 및 업힐 트레일 코스',
    elevation: '+450m 누적고도',
    gearRequired: '트레킹 기어, 물병',
    recoveryProtocol: '운동 후 프로틴 쉐이크 지급',
    description: '남산 업힐 인터벌 훈련을 통한 심폐 지구력 강화 및 가파른 경사로 페이스 조절 능력 훈련.',
  },
  {
    id: 'act-01',
    code: '[2027.06]',
    date: '2027.06',
    title: 'PRE-TRAINING DRILL 01: BUL-AM & SU-RAK',
    distance: '15km',
    keyPoints: '페이스 분석 & 프로틴 쉐이크',
    location: '불암산 - 수락산 기차바위 암릉 코스',
    elevation: '+1,020m 누적고도',
    gearRequired: '트레킹 기어, 물병',
    recoveryProtocol: '운동 후 프로틴 쉐이크 지급',
    description: '메인 챌린지 1단계 페이스 분석과 심폐능력 테스트.',
  },
];

const PRODUCTS_DATA: ProductItem[] = [
  {
    id: 'prod-01',
    code: '[Product 01]',
    name: 'NAGA Guard Hydrometer',
    category: 'TECHNICAL DIAGNOSTICS & HYDRATION',
    image: '/images/product_01_hydrometer.jpg',
    spec: '정밀 전해질 침투압 농도 측정기 / 내한성 티타늄 하우징 / IP68 완전 방수',
    usage: '극한의 알파인 트레일 및 45km 연속 주행 중 체내 수분 손실 및 전해질 밸런스를 측정하는 휴대용 정밀 하이드로미터.',
  },
  {
    id: 'prod-02',
    code: '[Product 02]',
    name: 'NAGA Alpine Shake',
    category: 'RAPID METABOLIC RECOVERY',
    image: '/images/product_02_alpine_shake.jpg',
    spec: 'BCAA & 전해질 복합 알파인 포뮬러 / 30g 고밀도 단백질 / 휴대용 파우치 규격',
    usage: '고도 상승 및 암릉 기동 직후 급성 근육 피로를 중화하고 글리코겐을 신속 재충전하는 전문 산악 포뮬러 쉐이크.',
  },
  {
    id: 'prod-03',
    code: '[Product 03]',
    name: 'NAGA Balance Greek Bowl',
    category: 'POST-EXPEDITION NUTRITION',
    image: '/images/product_03_greek_bowl.jpg',
    spec: '유청 분리 고농축 그릭 요거트 / 고단백 슈퍼푸드 너트 믹스 / 천연 아카시아 꿀',
    usage: '장거리 알파인 활동 후 위장 부담 없이 장시간 단백질을 공급하는 고영양 밸런스 리커버리 볼.',
  },
];

const HERO_SLIDES = [
  {
    id: 1,
    title: 'BUL-SU-SA-DO-BUK 45KM',
    tag: 'EXTREME ALPINE RIDGE TRAVERSE',
    image: '/images/hero_slide_01.jpg',
    caption: 'SEOUL GRANITE APEX RIDGE // 45KM CONTINUOUS DRILL',
  },
  {
    id: 2,
    title: 'TECHNICAL ALPINE GEAR',
    tag: 'HIGH-ALTITUDE RESISTANCE & GORPCORE SPEC',
    image: '/images/hero_slide_02.jpg',
    caption: 'NATIONAL ALPINE GUARD ASSOCIATION // PHARMACEUTICAL RECOVERY',
  },
  {
    id: 3,
    title: 'NIGHT RUN & PRE-DRILL',
    tag: 'SA-PAE & DO-BONG RIDGE RECON',
    image: '/images/hero_slide_03.jpg',
    caption: 'TECHNICAL TRAIL HEADLAMP SYSTEM // HYDROMETER TESTING',
  },
  {
    id: 4,
    title: 'NORTH HAN ROCK WALL',
    tag: 'STEEP GRANITE ADAPTATION',
    image: '/images/hero_slide_04.jpg',
    caption: 'PRECISION ROCK CLIMBING // ALPINE SHAKE PROTOTYPE',
  },
];

function BrandLogo() {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const candidates = [
    '/images/brand_logo.jpg',
    '/images/brand_logo.png',
    '/images/brand_logo.svg',
    '/logo.svg',
  ];

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

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
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

  const handleSessionToggle = (sessionName: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionName) ? prev.filter((s) => s !== sessionName) : [...prev, sessionName]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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
          sessions: selectedSessions.join(', '),
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
    setSelectedSessions([]);
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
                  onClick={() => setSelectedActivity(act)}
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
              <div>ORGANIZER: JWY | SEOUL, KOREA</div>
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
              <div>ORGANIZER: JWY | SEOUL, KOREA</div>
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
            <div className="border border-white/20 bg-white/5 p-4 sm:p-6 mb-6 sm:mb-8">
              <span className="text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase block">
                ACTIVE RECRUITMENT NOTICE
              </span>
              <h3 className="text-base sm:text-xl font-syne font-bold uppercase tracking-tight text-white mt-1 leading-snug">
                2027 서울 불수사도북 챌린지 및 사전 훈련 세션
              </h3>
              <p className="mt-2 text-xs font-mono tracking-[0.12em] sm:tracking-[0.15em] text-white/70 uppercase leading-relaxed">
                고려대학교 약학대학 산악단체 NAGA™ 공식 필드 챌린지 및 사전 훈련 등록
              </p>
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
                    {formName} 님의 참가 신청서가 접수되었습니다. 기재하신 연락처({formPhone})로 세션별
                    안내 및 장비 점검 지침이 발송됩니다.
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
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
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
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
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
                    className="w-full bg-black border border-white/30 focus:border-white px-3.5 sm:px-4 py-3 text-sm font-mono text-white placeholder-white/30 focus:outline-none transition-colors min-h-[44px]"
                  />
                </div>

                {/* 신청 세션 선택 (Checkbox, 필수 중복 선택) */}
                <div className="space-y-3 pt-1">
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
                          className={`flex items-center gap-3 p-3 sm:p-3.5 border transition-all cursor-pointer min-h-[44px] ${
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
                            className={`w-4 h-4 border flex items-center justify-center transition-colors shrink-0 ${
                              isChecked ? 'border-white bg-white text-black' : 'border-white/40'
                            }`}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-mono text-xs sm:text-sm tracking-[0.12em] sm:tracking-[0.15em] uppercase select-none">
                            [ {isChecked ? 'X' : ' '} ] {session}
                          </span>
                        </label>
                      );
                    })}
                  </div>
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
                      <span>[ SUBMIT APPLICATION ➔ ]</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* View Sub-footer */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-white/20 text-xs font-mono tracking-[0.15em] sm:tracking-[0.18em] text-white/50 flex flex-col sm:flex-row justify-between gap-2">
              <div>ORGANIZER: JWY | SEOUL, KOREA</div>
              <div>2026 NAGA™. ALL RIGHTS RESERVED.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
