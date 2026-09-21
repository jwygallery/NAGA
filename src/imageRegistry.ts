/**
 * ============================================================================
 * NAGA™ 웹 플랫폼 이미지 통합 관리 레지스트리 (IMAGE REGISTRY)
 * ============================================================================
 * 웹사이트에 사용되는 모든 이미지 경로를 한눈에 확인하고 손쉽게 변경할 수 있습니다.
 *
 * [사진 변경 방법 2가지]
 * 1. 초간단 덮어쓰기: public/images/ 폴더의 기존 파일명과 동일한 이름으로 새 사진을 업로드
 * 2. 경로 직접 수정: public/images/ 에 새 이미지를 넣고, 아래의 파일명을 원하는 파일로 변경
 * ============================================================================
 */

export const IMAGE_REGISTRY = {
  // [1] 브랜드 로고 (헤더 & 파비콘 & 공유 미리보기)
  logo: {
    primary: '/images/brand_logo.jpg',
    candidates: [
      '/images/brand_logo.jpg',
      '/images/brand_logo.png',
      '/images/brand_logo.svg',
      '/logo.svg',
    ],
  },

  // [2] 메인 화면 대형 와이드 배너 슬라이드 (가로 16:9 비율 권장, 1920x1080)
  heroSlides: [
    {
      id: 1,
      title: 'BUL-SU-SA-DO-BUK 45KM',
      tag: 'EXTREME ALPINE RIDGE TRAVERSE',
      image: '/images/hero_slide_01.jpg', // 1번 슬라이드: 45km 서울 5대 암릉 메인 챌린지
      caption: 'SEOUL GRANITE APEX RIDGE // 45KM CONTINUOUS DRILL',
    },
    {
      id: 2,
      title: 'TECHNICAL ALPINE GEAR',
      tag: 'HIGH-ALTITUDE RESISTANCE & GORPCORE SPEC',
      image: '/images/hero_slide_02.jpg', // 2번 슬라이드: 테크니컬 알파인 기어
      caption: 'NATIONAL ALPINE GUARD ASSOCIATION // PHARMACEUTICAL RECOVERY',
    },
    {
      id: 3,
      title: 'NIGHT RUN & PRE-DRILL',
      tag: 'SA-PAE & DO-BONG RIDGE RECON',
      image: '/images/hero_slide_03.jpg', // 3번 슬라이드: 야간 트레일 런 & 헤드랜턴
      caption: 'TECHNICAL TRAIL HEADLAMP SYSTEM // HYDROMETER TESTING',
    },
    {
      id: 4,
      title: 'NORTH HAN ROCK WALL',
      tag: 'STEEP GRANITE ADAPTATION',
      image: '/images/hero_slide_04.jpg', // 4번 슬라이드: 북한산 백운대 암벽 트래버스
      caption: 'PRECISION ROCK CLIMBING // ALPINE SHAKE PROTOTYPE',
    },
  ],

  // [3] 리커버리 제품 카탈로그 (가로 4:3 또는 1:1 비율 권장, 800x600)
  products: {
    hydrometer: '/images/product_01_hydrometer.jpg',    // [제품 01] NAGA Guard Hydrometer
    alpineShake: '/images/product_02_alpine_shake.jpg', // [제품 02] NAGA Alpine Shake
    greekBowl: '/images/product_03_greek_bowl.jpg',     // [제품 03] NAGA Balance Greek Bowl
  },

  // [4] 액티비티 상세 모달 슬라이드 (가로 4:3 비율 권장, 각 코스별 3장씩)
  activities: {
    // 4-1. 메인 챌린지: 2027 서울 불수사도북 45km
    mainChallenge: [
      '/images/activity_04_slide_1.jpg', // 슬라이드 1: 45km 불수사도북 능선 트래버스
      '/images/activity_04_slide_2.jpg', // 슬라이드 2: 알파인 암릉 트레일
      '/images/activity_04_slide_3.jpg', // 슬라이드 3: 고도 상승 및 정상 파노라마
    ],

    // 4-2. 드릴 03: 북한산 야간 산행 훈련
    drill03Bukhan: [
      '/images/activity_03_slide_1.jpg', // 슬라이드 1: 헤드랜턴 야간 암릉 주행
      '/images/activity_03_slide_2.jpg', // 슬라이드 2: 야간 능선 보행 테크닉
      '/images/activity_03_slide_3.jpg', // 슬라이드 3: 칠흑 트레일 및 도심 야경
    ],

    // 4-3. 드릴 02: 남산 업힐 인터벌 훈련
    drill02Namsan: [
      '/images/activity_02_slide_1.jpg', // 슬라이드 1: 남산 업힐 인터벌 러닝
      '/images/activity_02_slide_2.jpg', // 슬라이드 2: 남산 순환로 및 일몰 트레일
      '/images/activity_02_slide_3.jpg', // 슬라이드 3: 도심 산악 코스 경사로
    ],

    // 4-4. 드릴 01: 불암산 & 수락산 페이스 분석
    drill01BulamSurak: [
      '/images/activity_01_slide_1.jpg', // 슬라이드 1: 수락산 기차바위 암릉
      '/images/activity_01_slide_2.jpg', // 슬라이드 2: 불암-수락 연결 트레킹
      '/images/activity_01_slide_3.jpg', // 슬라이드 3: 바위 능선 페이스 측정
    ],
  },

  // [5] JOIN 페이지: 모집 안내 박스 내부 코스 사진 (가로 4:3 비율 권장)
  joinNotice: {
    coursePhoto: '/images/activity_04_slide_1.jpg', // 불수사도북 코스 대표 트레버스 사진
  },
};
