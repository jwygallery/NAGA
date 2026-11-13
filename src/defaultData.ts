import { NagaAppData, JoinNoticeItem, ProductItem, RecoveryContentBlock } from './types';

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
    "id": "join-from-act-02-1794286649535",
    "isActive": true,
    "tag": "OPEN RECRUITMENT · 2027.06",
    "title": "TRAINING DRILL 01: NAM-SAN",
    "sub": "남산 업힐 인터벌  (10km · +450m 누적고도)",
    "description": "남산 업힐 인터벌 훈련을 통한 심폐 지구력 강화 및 가파른 경사로 페이스 조절 능력 훈련.",
    "coursePhoto": "/images/activity_02_slide_1.jpg",
    "photoArchiveTag": "COURSE ARCHIVE",
    "photoTrailTag": "TRAINING DRILL 01: NAM-SAN · 10km",
    "targetSession": "TRAINING DRILL 01: NAM-SAN [2027.06] - 남산 업힐 인터벌 "
  },
  {
    "id": "join-from-act-03-1794286650719",
    "isActive": true,
    "tag": "OPEN RECRUITMENT · 2027.06",
    "title": "TRAINING DRILL 02: GWAN-AK-SAN",
    "sub": "야간 산행 연습 (15km · +1,280m 누적고도)",
    "description": "야간 산행 연습 및 시야가 제한된 어두운 야간 암릉 지형에서의 안전한 보행과 장비 적응 훈련.",
    "coursePhoto": "/images/activity_03_slide_1.jpg",
    "photoArchiveTag": "COURSE ARCHIVE",
    "photoTrailTag": "TRAINING DRILL 02: GWAN-AK-SAN · 15km",
    "targetSession": "TRAINING DRILL 02: GWAN-AK-SAN [2027.06] - 야간 산행 연습"
  },
  {
    "id": "join-from-act-04-1794286655367",
    "isActive": true,
    "tag": "OPEN RECRUITMENT · 2027.07",
    "title": "2027 SEOUL DO-BUK MAIN CHALLENGE",
    "sub": "서울 최고봉 북한산과 도봉산 등반 (45km · +3,850m 누적고도)",
    "description": "극대화된 내구력과 페이스 관리를 검증하는 메인 챌린지.",
    "coursePhoto": "/images/activity_04_slide_1.jpg",
    "photoArchiveTag": "COURSE ARCHIVE",
    "photoTrailTag": "2027 SEOUL DO-BUK MAIN CHALLENGE · 45km",
    "targetSession": "2027 SEOUL DO-BUK MAIN CHALLENGE [2027.07] - 서울 최고봉 북한산과 도봉산 등반"
  }
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    "id": "prod-01",
    "code": "[Product 01]",
    "name": "편의점 단백질 음료 비교",
    "category": "July, 06, 2026",
    "image": "/uploads/1794243418898_IMG_5445_jpeg.jpg",
    "spec": " 30g 단백질 / 휴대용 파우치 규격",
    "usage": "July, 06, 2026",
    "detailDescription": "급하게 단백질을 섭취해야할 때, 편의점에 들어가 어떤 쉐이크를 선택하는 게 좋을까?\n가장 성분이 클린한 쉐이크가 무엇인지 성분표를 분석해봤다.",
    "images": [
      "/uploads/1794243418898_IMG_5445_jpeg.jpg",
      "/images/product_02_alpine_shake.jpg",
      "/uploads/1794568209767_IMG_5483_jpeg.jpg"
    ],
    "subtitle": "July, 06, 2026",
    "blocks": [
      {
        "id": "prod-01-block-img-0",
        "type": "image",
        "content": "/uploads/1794243418898_IMG_5445_jpeg.jpg",
        "caption": ""
      },
      {
        "id": "prod-01-block-txt-0",
        "type": "text",
        "content": "급하게 단백질을 섭취해야할 때, 편의점에 들어가 어떤 쉐이크를 선택하는 게 좋을까?\n가장 성분이 클린한 쉐이크가 무엇인지 성분표를 분석해봤다.",
        "caption": ""
      },
      {
        "id": "prod-01-block-img-1",
        "type": "image",
        "content": "/images/product_02_alpine_shake.jpg",
        "caption": "물론 이렇게 먹으면 제일 좋다"
      },
      {
        "id": "prod-01-block-1794568213572-b0bv",
        "type": "image",
        "content": "/uploads/1794568209767_IMG_5483_jpeg.jpg",
        "caption": ""
      }
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
    "distance": "20km",
    "elevation": "+2,000m 누적고도",
    "location": "도봉산 ~ 북한산 종주 트레일",
    "keyPoints": "서울 최고봉 북한산과 도봉산 등반",
    "gearRequired": "트레킹 기어, 물병, 헤드랜턴 (필수), 비상 보온 의류",
    "recoveryProtocol": "운동 중 전해질 음료 & 운동 후 수제 그릭요거트 제공",
    "description": "서울의 아름다운 두 명산, 도봉산과 북한산을 한번에 등반하는 여정. ",
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
          const resolvedSubtitle =
            prod.subtitle !== undefined
              ? prod.subtitle
              : prod.usage || prod.category || '';
          const resolvedDetail =
            prod.detailDescription !== undefined
              ? prod.detailDescription
              : fallbackDefault?.detailDescription || prod.usage || '';
          const resolvedImages =
            rawImages && rawImages.length > 0
              ? rawImages
              : fallbackDefault && fallbackDefault.id === prod.id && fallbackDefault.images
              ? [mainImage, ...fallbackDefault.images.slice(1).map((img) => normalizeImageUrl(img))]
              : [mainImage];

          let resolvedBlocks: RecoveryContentBlock[];
          if (Array.isArray(prod.blocks) && prod.blocks.length > 0) {
            resolvedBlocks = prod.blocks.map((b, bIdx) => ({
              id: b.id || `${prod.id || 'prod'}-block-${bIdx}`,
              type: b.type === 'image' ? 'image' : 'text',
              content: b.type === 'image' ? normalizeImageUrl(b.content) : (b.content ?? ''),
              caption: b.caption ?? '',
            }));
          } else {
            resolvedBlocks = [];
            if (resolvedImages[0]) {
              resolvedBlocks.push({
                id: `${prod.id || 'prod'}-block-img-0`,
                type: 'image',
                content: resolvedImages[0],
              });
            }
            if (resolvedDetail.trim()) {
              resolvedBlocks.push({
                id: `${prod.id || 'prod'}-block-txt-0`,
                type: 'text',
                content: resolvedDetail,
              });
            }
            for (let i = 1; i < resolvedImages.length; i++) {
              resolvedBlocks.push({
                id: `${prod.id || 'prod'}-block-img-${i}`,
                type: 'image',
                content: resolvedImages[i],
              });
            }
          }

          return {
            ...prod,
            subtitle: resolvedSubtitle,
            usage: resolvedSubtitle,
            image: mainImage,
            detailDescription: resolvedDetail,
            images: resolvedImages,
            blocks: resolvedBlocks,
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
