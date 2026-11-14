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
    "sub": "서울 최고봉 북한산과 도봉산 등반 (20km · +2,000m 누적고도)",
    "description": "서울의 아름다운 두 명산, 도봉산과 북한산을 한번에 등반하는 여정.",
    "coursePhoto": "/images/activity_04_slide_1.jpg",
    "photoArchiveTag": "COURSE ARCHIVE",
    "photoTrailTag": "2027 SEOUL DO-BUK MAIN CHALLENGE · 20km",
    "targetSession": "2027 SEOUL DO-BUK MAIN CHALLENGE [2027.07] - 서울 최고봉 북한산과 도봉산 등반"
  }
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    "id": "prod-01",
    "code": "[Product 01]",
    "name": "편의점 단백질 음료 비교",
    "category": "July, 06, 2026",
    "image": "/uploads/1794631257893_____jpg.jpg",
    "spec": " 30g 단백질 / 휴대용 파우치 규격",
    "usage": "July, 06, 2026",
    "detailDescription": "급하게 단백질을 섭취해야할 때, 편의점에 들어가 어떤 쉐이크를 선택하는 게 좋을까?\n가장 성분이 클린한 쉐이크가 무엇인지 성분표를 분석해봤다.\n\n01. 흡수 속도: 유청(WPI)인가, 우유단백(MPI/MPC)인가?\n시중 편의점 팩 음료의 대다수(더:단백, 닥터유 프로, 랩노쉬 등)는 원가 절감과 묵직한 목넘김을 위해 MPI(분리우유단백)와 MPC(농축우유단백)를 주원료로 사용합니다. 우유단백질은 약 80%가 위산과 만나 응고되는 '카제인'이고, 20%만이 빠르게 흡수되는 '유청'입니다. 카제인은 4~6시간에 걸쳐 아미노산을 서서히 공급하므로 일상 간식이나 취침 전에는 유리하지만, 운동 직후 30분(골든타임)에 찢어진 근섬유로 아미노산을 폭발적으로 밀어 넣기에는 한계가 있습니다. 반면 셀렉스 프로핏은 100% WPI(분리유청단백)만을 사용하여 위장 체류 시간을 최소화하고 가장 빠른 혈중 아미노산 농도 상승을 유도합니다.\n\n02. 위장 부담(GI Distress): 탈수 직후의 유당과 삼투압\n장시간 산행 중에는 혈액이 근육과 피부로 몰리면서 위장관 혈류량이 급감합니다. 이 상태에서 유당이 일부 남아있는 MPC 기반 음료를 급하게 마시면 삼투압 현상으로 인해 복부 팽만이나 설사를 겪기 쉽습니다. 고강도 필드 활동 직후에는 유당과 지방을 정제한 WPI 단일 원료 제품이나 유당분해 공정을 거친 제품을 선택하는 것이 안전합니다.\n\n03. 합성 증점제와 첨가물의 역설\n상온 유통과 부드러운 질감을 유지하기 위해 대부분의 시판 RTD 음료에는 셀룰로스검, 카라기난, 젤란검 같은 합성 증점제·유화제와 인공 감미료(수크랄로스, 아세설팜칼륨)가 배합됩니다. 평소에는 문제가 되지 않지만, 극심한 탈수와 체온 상승을 겪은 아웃도어 활동 직후에는 이러한 합성 첨가물이 장 점막을 자극하고 불필요한 갈증을 유발할 수 있습니다.\n\n1. SELEX PRO-FIT (셀렉스 프로핏 초코)\n   - VOL / KCAL : 330ml / 100kcal\n   - MACRO      : PRO 20g | SUGAR 0g | FAT 0.8g\n   - SOURCE     : 100% WPI (분리유청단백)\n   - NOTE       : 유당 제거 및 최고속 흡수. 고강도 훈련 직후 최적화.\n\n2. BINGGRAE THE:DANBAEK (빙그레 더:단백 초코)\n   - VOL / KCAL : 250ml / 105kcal\n   - MACRO      : PRO 20g | SUGAR 0.8g | FAT 0.6g\n   - SOURCE     : MPI, MPC (우유단백질: 카제인 80% + 유청 20%)\n   - NOTE       : 높은 기호성. 카제인 비중이 높아 느린 흡수 패턴.\n\n3. TAKEFIT MAX (테이크핏 맥스 초코)\n   - VOL / KCAL : 250ml / 105kcal\n   - MACRO      : PRO 21g | SUGAR 1g | FAT 1.1g\n   - SOURCE     : ISP (분리대두단백) + MPI, MPC (우유단백) 혼합\n   - NOTE       : 동·식물성 복합 배합 및 유당분해우유 사용으로 소화 보완.\n\n4. DR.YOU PRO (닥터유 프로 초코)\n   - VOL / KCAL : 250ml / 150kcal\n   - MACRO      : PRO 24g | SUGAR 1g | FAT 3.9g\n   - SOURCE     : MPI, MPC (우유단백) + ISP (대두단백)\n   - NOTE       : 높은 단백질 함량. (※ 일반 '닥터유 드링크'는 당류 20g 내외로 주의)\n\n5. LABNOSH PROTEIN (랩노쉬 프로틴 라떼)\n   - VOL / KCAL : 350ml / 170kcal\n   - MACRO      : PRO 27g | SUGAR 5g | FAT 0.9g\n   - SOURCE     : MPC, MPI (농축·분리우유단백)\n   - NOTE       : 대용량 식사 대용 스펙. 상대적으로 높은 당류 및 카페인(라떼 기준) 체크.",
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
        "caption": "얘네는 잘생겼다"
      },
      {
        "id": "prod-01-block-1794631282904-moc2",
        "type": "text",
        "content": "01. 흡수 속도: 유청(WPI)인가, 우유단백(MPI/MPC)인가?\n시중 편의점 팩 음료의 대다수(더:단백, 닥터유 프로, 랩노쉬 등)는 원가 절감과 묵직한 목넘김을 위해 MPI(분리우유단백)와 MPC(농축우유단백)를 주원료로 사용합니다. 우유단백질은 약 80%가 위산과 만나 응고되는 '카제인'이고, 20%만이 빠르게 흡수되는 '유청'입니다. 카제인은 4~6시간에 걸쳐 아미노산을 서서히 공급하므로 일상 간식이나 취침 전에는 유리하지만, 운동 직후 30분(골든타임)에 찢어진 근섬유로 아미노산을 폭발적으로 밀어 넣기에는 한계가 있습니다. 반면 셀렉스 프로핏은 100% WPI(분리유청단백)만을 사용하여 위장 체류 시간을 최소화하고 가장 빠른 혈중 아미노산 농도 상승을 유도합니다.\n\n02. 위장 부담(GI Distress): 탈수 직후의 유당과 삼투압\n장시간 산행 중에는 혈액이 근육과 피부로 몰리면서 위장관 혈류량이 급감합니다. 이 상태에서 유당이 일부 남아있는 MPC 기반 음료를 급하게 마시면 삼투압 현상으로 인해 복부 팽만이나 설사를 겪기 쉽습니다. 고강도 필드 활동 직후에는 유당과 지방을 정제한 WPI 단일 원료 제품이나 유당분해 공정을 거친 제품을 선택하는 것이 안전합니다.\n\n03. 합성 증점제와 첨가물의 역설\n상온 유통과 부드러운 질감을 유지하기 위해 대부분의 시판 RTD 음료에는 셀룰로스검, 카라기난, 젤란검 같은 합성 증점제·유화제와 인공 감미료(수크랄로스, 아세설팜칼륨)가 배합됩니다. 평소에는 문제가 되지 않지만, 극심한 탈수와 체온 상승을 겪은 아웃도어 활동 직후에는 이러한 합성 첨가물이 장 점막을 자극하고 불필요한 갈증을 유발할 수 있습니다.",
        "caption": ""
      },
      {
        "id": "prod-01-block-1794631268298-c0qp",
        "type": "text",
        "content": "1. SELEX PRO-FIT (셀렉스 프로핏 초코)\n   - VOL / KCAL : 330ml / 100kcal\n   - MACRO      : PRO 20g | SUGAR 0g | FAT 0.8g\n   - SOURCE     : 100% WPI (분리유청단백)\n   - NOTE       : 유당 제거 및 최고속 흡수. 고강도 훈련 직후 최적화.\n\n2. BINGGRAE THE:DANBAEK (빙그레 더:단백 초코)\n   - VOL / KCAL : 250ml / 105kcal\n   - MACRO      : PRO 20g | SUGAR 0.8g | FAT 0.6g\n   - SOURCE     : MPI, MPC (우유단백질: 카제인 80% + 유청 20%)\n   - NOTE       : 높은 기호성. 카제인 비중이 높아 느린 흡수 패턴.\n\n3. TAKEFIT MAX (테이크핏 맥스 초코)\n   - VOL / KCAL : 250ml / 105kcal\n   - MACRO      : PRO 21g | SUGAR 1g | FAT 1.1g\n   - SOURCE     : ISP (분리대두단백) + MPI, MPC (우유단백) 혼합\n   - NOTE       : 동·식물성 복합 배합 및 유당분해우유 사용으로 소화 보완.\n\n4. DR.YOU PRO (닥터유 프로 초코)\n   - VOL / KCAL : 250ml / 150kcal\n   - MACRO      : PRO 24g | SUGAR 1g | FAT 3.9g\n   - SOURCE     : MPI, MPC (우유단백) + ISP (대두단백)\n   - NOTE       : 높은 단백질 함량. (※ 일반 '닥터유 드링크'는 당류 20g 내외로 주의)\n\n5. LABNOSH PROTEIN (랩노쉬 프로틴 라떼)\n   - VOL / KCAL : 350ml / 170kcal\n   - MACRO      : PRO 27g | SUGAR 5g | FAT 0.9g\n   - SOURCE     : MPC, MPI (농축·분리우유단백)\n   - NOTE       : 대용량 식사 대용 스펙. 상대적으로 높은 당류 및 카페인(라떼 기준) 체크.",
        "caption": ""
      }
    ]
  }
];

export const DEFAULT_NAGA_DATA: NagaAppData = {
  activities: [
  {
    "id": "act-04",
    "code": "[UPCOMING]",
    "date": "JUL, 07, 2027",
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
      "/images/activity_04_slide_3.jpg"
    ]
  },
  {
    "id": "act-03",
    "code": "[ARCHIVE]",
    "date": "NOV, 23, 2027",
    "title": "TRAINING DRILL 01: BUK-HAN-SAN",
    "distance": "15km",
    "elevation": "+1,280m 누적고도",
    "location": "백운대탐방지원센터",
    "keyPoints": "야간 산행 연습",
    "gearRequired": "트레킹 기어, 물병, 헤드랜턴",
    "recoveryProtocol": "운동 후 프로틴 쉐이크 지급",
    "description": "야간 산행 연습 및 시야가 제한된 어두운 야간 암릉 지형에서의 안전한 보행과 장비 적응 훈련.",
    "images": [
      "/images/activity_03_slide_1.jpg",
      "/images/activity_03_slide_2.jpg"
    ]
  }
],
  heroSlides: [
  {
    "id": "slide-01",
    "image": "/images/hero_slide_01.jpg"
  },
  {
    "id": "slide-03",
    "image": "/images/hero_slide_03.jpg"
  },
  {
    "id": "slide-02",
    "image": "/uploads/1794630964989_1_jpg.jpg"
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
