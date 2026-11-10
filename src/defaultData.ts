import { NagaAppData, JoinNoticeItem, ProductItem } from './types';

export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const ghRawMatch = trimmed.match(
    /^https?:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(?:public\/)?uploads\/([^?#]+)(?:\?.*)?$/i
  );
  if (ghRawMatch && ghRawMatch[1]) {
    return `/uploads/${decodeURIComponent(ghRawMatch[1])}`;
  }
  const ghBlobMatch = trimmed.match(
    /^https?:\/\/github\.com\/[^/]+\/[^/]+\/(?:raw|blob)\/[^/]+\/(?:public\/)?uploads\/([^?#]+)(?:\?.*)?$/i
  );
  if (ghBlobMatch && ghBlobMatch[1]) {
    return `/uploads/${decodeURIComponent(ghBlobMatch[1])}`;
  }
  return trimmed;
}

export const DEFAULT_JOIN_NOTICES: JoinNoticeItem[] = [
  {
    "id": "join-from-act-03-1794243474799",
    "isActive": true,
    "tag": "OPEN RECRUITMENT · 2027.06",
    "title": "PRE-TRAINING DRILL 02: BUK-HAN-SAN",
    "sub": "야간 산행 연습 & 헤드랜턴 적응 (15km · +1,280m 누적고도)",
    "description": "야간 산행 연습 및 시야가 제한된 어두운 야간 암릉 지형에서의 안전한 보행과 장비 적응 훈련.",
    "coursePhoto": "/images/activity_03_slide_1.jpg",
    "photoArchiveTag": "COURSE ARCHIVE",
    "photoTrailTag": "PRE-TRAINING DRILL 02: BUK-HAN-SAN · 15km",
    "targetSession": "PRE-TRAINING DRILL 02: BUK-HAN-SAN [2027.06] - 야간 산행 연습 & 헤드랜턴 적응"
  },
  {
    "id": "join-from-act-04-1794243622900",
    "isActive": true,
    "tag": "OPEN RECRUITMENT · 2027.07",
    "title": "2027 SEOUL DO-BUK MAIN CHALLENGE",
    "sub": "종주 풀코스 & 전해질 음료, 수제 그릭요거트 (45km · +3,850m 누적고도)",
    "description": "극대화된 내구력과 페이스 관리, 테크니컬 암릉 주파 능력을 검증하는 메인 챌린지.",
    "coursePhoto": "/images/activity_04_slide_1.jpg",
    "photoArchiveTag": "COURSE ARCHIVE",
    "photoTrailTag": "2027 SEOUL DO-BUK MAIN CHALLENGE · 45km",
    "targetSession": "2027 SEOUL DO-BUK MAIN CHALLENGE [2027.07] - 종주 풀코스 & 전해질 음료, 수제 그릭요거트"
  }
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    "id": "prod-01",
    "code": "[Product 01]",
    "name": "NAGA Alpine Shake",
    "category": "RAPID METABOLIC RECOVERY",
    "image": "/uploads/1794243418898_IMG_5445_jpeg.jpg",
    "spec": "BCAA & 전해질 복합 알파인 포뮬러 / 30g 고밀도 단백질 / 휴대용 파우치 규격",
    "usage": "고도 상승 및 암릉 기동 직후 급성 근육 피로를 중화하고 글리코겐을 신속 재충전하는 전문 산악 포뮬러 쉐이크.",
    "detailDescription": "브루클린 버거",
    "images": [
      "/uploads/1794243418898_IMG_5445_jpeg.jpg",
      "/images/product_02_alpine_shake.jpg",
      "/images/hero_slide_02.jpg"
    ]
  },
  {
    "id": "prod-02",
    "code": "[Product 02]",
    "name": "NAGA Balance Greek Bowl",
    "category": "POST-EXPEDITION NUTRITION",
    "image": "/images/product_03_greek_bowl.jpg",
    "spec": "유청 분리 고농축 그릭 요거트 / 고단백 슈퍼푸드 너트 믹스 / 천연 아카시아 꿀",
    "usage": "장거리 알파인 활동 후 위장 부담 없이 장시간 단백질을 공급하는 고영양 밸런스 리커버리 볼.",
    "detailDescription": "45km 종주 및 장시간 야간 산행 완료 후 지친 소화기관에 부담을 주지 않으면서 서방형(Slow-Release) 단백질과 항산화 영양소를 공급하는 수제 그릭 요거트 리커버리 볼입니다.\n\n• 핵심 배합: 3단계 유청 분리 공정을 거친 꾸덕한 고농축 카제인·유청 그릭 요거트 + 로스팅 아몬드·호두·호박씨·치아씨드 슈퍼푸드 토핑 + 천연 아카시아 벌꿀\n• 리커버리 효능: 산행 중 고갈된 근육 글리코겐을 완만하게 회복시키며, 유산균과 식이섬유가 장시간 산행 후 신체 컨디션 정상화를 돕습니다.\n• 제공 세션: 메인 종주 챌린지 및 특별 리커버리 세션 완주 대원에게 베이스캠프에서 신선 냉장 상태로 즉시 제공됩니다.",
    "images": [
      "/images/product_03_greek_bowl.jpg",
      "/images/activity_taebaek_slide_1.jpg"
    ]
  }
];

export const DEFAULT_NAGA_DATA: NagaAppData = {
  activities: [
  {
    "id": "act-02",
    "code": "[2027.06]",
    "date": "2027.06",
    "title": "TRAINING DRILL 01: NAM-SAN",
    "distance": "10km",
    "elevation": "+450m 누적고도",
    "location": "남산 순환로 및 업힐 트레일 코스",
    "keyPoints": "남산 업힐 인터벌 ",
    "gearRequired": "트레킹 기어, 물병",
    "recoveryProtocol": "운동 후 프로틴 쉐이크 지급",
    "description": "남산 업힐 인터벌 훈련을 통한 심폐 지구력 강화 및 가파른 경사로 페이스 조절 능력 훈련.",
    "images": [
      "/images/activity_02_slide_1.jpg",
      "/images/activity_02_slide_2.jpg",
      "/images/activity_02_slide_3.jpg"
    ]
  },
  {
    "id": "act-03",
    "code": "[2027.06]",
    "date": "2027.06",
    "title": "TRAINING DRILL 02: GWAN-AK-SAN",
    "distance": "15km",
    "elevation": "+1,280m 누적고도",
    "location": "관악산",
    "keyPoints": "야간 산행 연습",
    "gearRequired": "트레킹 기어, 물병, 헤드랜턴",
    "recoveryProtocol": "운동 후 프로틴 쉐이크 지급",
    "description": "야간 산행 연습 및 시야가 제한된 어두운 야간 암릉 지형에서의 안전한 보행과 장비 적응 훈련.",
    "images": [
      "/images/activity_03_slide_1.jpg",
      "/images/activity_03_slide_2.jpg",
      "/images/activity_03_slide_3.jpg"
    ]
  },
  {
    "id": "act-04",
    "code": "[2027.07]",
    "date": "2027.07",
    "title": "2027 SEOUL DO-BUK MAIN CHALLENGE",
    "distance": "45km",
    "elevation": "+3,850m 누적고도",
    "location": "도봉산 ~ 북한산 종주 트레일",
    "keyPoints": "서울 최고봉 북한산과 도봉산 등반",
    "gearRequired": "트레킹 기어, 물병, 헤드랜턴 (필수), 비상 보온 의류",
    "recoveryProtocol": "운동 중 전해질 음료 & 운동 후 수제 그릭요거트 제공",
    "description": "극대화된 내구력과 페이스 관리를 검증하는 메인 챌린지.",
    "images": [
      "/images/activity_04_slide_1.jpg",
      "/images/activity_04_slide_2.jpg",
      "/images/activity_04_slide_3.jpg"
    ]
  }
],
  heroSlides: [
  {
    "id": "slide-01",
    "image": "/images/hero_slide_01.jpg"
  },
  {
    "id": "slide-02",
    "image": "/images/hero_slide_02.jpg"
  },
  {
    "id": "slide-03",
    "image": "/images/hero_slide_03.jpg"
  },
  {
    "id": "slide-1794243198810",
    "image": "/uploads/1794243196785_IMG_3224_jpeg.jpg"
  }
],
  products: DEFAULT_PRODUCTS,
  joinNotice: DEFAULT_JOIN_NOTICES[0],
  joinNotices: DEFAULT_JOIN_NOTICES,
};

export function normalizeNagaData(raw: Partial<NagaAppData> | null | undefined): NagaAppData {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_NAGA_DATA;
  }

  let joinNotices: JoinNoticeItem[] = [];

  if (Array.isArray(raw.joinNotices) && raw.joinNotices.length > 0) {
    joinNotices = raw.joinNotices.map((item, idx) => ({
      id: item.id || `join-session-${idx + 1}`,
      isActive: item.isActive !== undefined ? item.isActive : true,
      tag: item.tag ?? 'UPCOMING EXPEDITION',
      title: item.title ?? 'NAGA EXPEDITION',
      sub: item.sub ?? '',
      description: item.description ?? '',
      coursePhoto: normalizeImageUrl(item.coursePhoto) || '/images/activity_taebaek_slide_1.jpg',
      photoArchiveTag: item.photoArchiveTag ?? 'EXPEDITION ARCHIVE',
      photoTrailTag: item.photoTrailTag ?? 'TRAIL ARCHIVE',
      targetSession: item.targetSession ?? item.title ?? 'NAGA EXPEDITION',
    }));
  } else if (raw.joinNotice && typeof raw.joinNotice === 'object') {
    const primaryFromLegacy: JoinNoticeItem = {
      id: raw.joinNotice.id || 'join-session-taebaek',
      isActive: true,
      tag: raw.joinNotice.tag ?? DEFAULT_JOIN_NOTICES[0].tag,
      title: raw.joinNotice.title ?? DEFAULT_JOIN_NOTICES[0].title,
      sub: raw.joinNotice.sub ?? DEFAULT_JOIN_NOTICES[0].sub,
      description: raw.joinNotice.description ?? DEFAULT_JOIN_NOTICES[0].description,
      coursePhoto: normalizeImageUrl(raw.joinNotice.coursePhoto) || DEFAULT_JOIN_NOTICES[0].coursePhoto,
      photoArchiveTag: raw.joinNotice.photoArchiveTag ?? DEFAULT_JOIN_NOTICES[0].photoArchiveTag,
      photoTrailTag: raw.joinNotice.photoTrailTag ?? DEFAULT_JOIN_NOTICES[0].photoTrailTag,
      targetSession: raw.joinNotice.targetSession ?? DEFAULT_JOIN_NOTICES[0].targetSession,
    };
    joinNotices = [primaryFromLegacy, ...DEFAULT_JOIN_NOTICES.slice(1)];
  } else {
    joinNotices = DEFAULT_JOIN_NOTICES;
  }

  const firstActive = joinNotices.find((n) => n.isActive) || joinNotices[0] || DEFAULT_JOIN_NOTICES[0];

  const normalizedProducts: ProductItem[] =
    Array.isArray(raw.products) && raw.products.length > 0
      ? raw.products.map((prod, idx) => {
          const fallbackDefault =
            DEFAULT_PRODUCTS.find((dp) => dp.id === prod.id) || DEFAULT_PRODUCTS[idx] || DEFAULT_PRODUCTS[0];
          const rawImages =
            Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images.map((img) => normalizeImageUrl(img)).filter(Boolean)
              : undefined;
          const mainImage = normalizeImageUrl(prod.image) || fallbackDefault.image;
          return {
            ...prod,
            image: mainImage,
            detailDescription:
              prod.detailDescription !== undefined
                ? prod.detailDescription
                : fallbackDefault?.detailDescription || prod.usage || '',
            images: rawImages && rawImages.length > 0
              ? rawImages
              : fallbackDefault && fallbackDefault.id === prod.id && fallbackDefault.images
              ? [mainImage, ...fallbackDefault.images.slice(1).map((img) => normalizeImageUrl(img))]
              : [mainImage],
          };
        })
      : DEFAULT_PRODUCTS;

  const normalizedActivities =
    Array.isArray(raw.activities) && raw.activities.length > 0
      ? raw.activities.map((act) => ({
          ...act,
          images: Array.isArray(act.images)
            ? act.images.map((img) => normalizeImageUrl(img)).filter(Boolean)
            : [],
        }))
      : DEFAULT_NAGA_DATA.activities;

  const normalizedHeroSlides =
    Array.isArray(raw.heroSlides) && raw.heroSlides.length > 0
      ? raw.heroSlides.map((slide) => ({
          ...slide,
          image: normalizeImageUrl(slide.image),
        }))
      : DEFAULT_NAGA_DATA.heroSlides;

  return {
    activities: normalizedActivities,
    heroSlides: normalizedHeroSlides,
    products: normalizedProducts,
    joinNotice: firstActive,
    joinNotices,
  };
}
