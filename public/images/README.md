# NAGA™ Web Image Asset Guide (이미지 파일 목록 및 교체 가이드)

웹사이트에 사용되는 모든 사진의 명칭, 사용 위치, 권장 규격 및 교체 방법 안내입니다.

---

## 📸 전체 이미지 파일 레이블 및 매핑 목록

### 1. 브랜드 로고 & 파비콘 (Header & Share Card)
| 파일 경로 | 권장 비율 & 해상도 | 사용 위치 및 설명 |
| :--- | :--- | :--- |
| `public/images/brand_logo.jpg` | 1:1 정사각형 (500×500) | 상단 헤더 로고, 파비콘, 카톡/SNS 링크 공유 미리보기 |
| *(선택 사항)* `.png`, `.svg` | 1:1 정사각형 | 투명 배경 PNG 또는 SVG 벡터 로고도 파일명 유지 시 자동 지원 |

---

### 2. 메인 배너 슬라이드 (Hero Section 4장)
| 파일 경로 | 권장 비율 & 해상도 | 슬라이드 설명 |
| :--- | :--- | :--- |
| `public/images/hero_slide_01.jpg` | 16:9 와이드 (1920×1080) | [슬라이드 1] 45KM 서울 5대 암릉 메인 챌린지 |
| `public/images/hero_slide_02.jpg` | 16:9 와이드 (1920×1080) | [슬라이드 2] 테크니컬 알파인 기어 |
| `public/images/hero_slide_03.jpg` | 16:9 와이드 (1920×1080) | [슬라이드 3] 야간 트레일 런 & 헤드랜턴 |
| `public/images/hero_slide_04.jpg` | 16:9 와이드 (1920×1080) | [슬라이드 4] 북한산 백운대 암벽 트래버스 |

---

### 3. 리커버리 제품 사진 (2. RECOVERY Catalog 2종)
*(수분/전해질 측정기 하이드로미터 제외)*
| 파일 경로 | 권장 비율 & 해상도 | 제품명 및 설명 |
| :--- | :--- | :--- |
| `public/images/product_02_alpine_shake.jpg` | 4:3 가로 (800×600) | [제품 01] NAGA Alpine Shake (알파인 리커버리 쉐이크) |
| `public/images/product_03_greek_bowl.jpg` | 4:3 가로 (800×600) | [제품 02] NAGA Balance Greek Bowl (원기 회복 그릭 요거트 볼) |

---

### 4. 액티비티 상세 모달 슬라이드 (1. ACTIVITIES 각 3장씩, 일정 가까운 순)
모달 팝업의 [드릴 목적] 아래 슬라이더에 표시됩니다. (가로 4:3 비율)

#### 4-1. [신규/가장 빠른 일정] 2027 강원 태백: 태백산 신년 일출 산행 [2027.01] (사전 훈련 없음)
- `public/images/activity_taebaek_slide_1.jpg` : 태백산 설화 능선과 황금빛 일출
- `public/images/activity_taebaek_slide_2.jpg` : 천제단 정상과 운해 파노라마
- `public/images/activity_taebaek_slide_3.jpg` : 동계 설산 아이젠 보행 트레일

#### 4-2. [드릴 01] 남산 업힐 인터벌 훈련 [2027.06]
- `public/images/activity_02_slide_1.jpg` : 남산 업힐 인터벌 러닝
- `public/images/activity_02_slide_2.jpg` : 남산 순환로 및 일몰 트레일
- `public/images/activity_02_slide_3.jpg` : 도심 산악 코스 경사로

#### 4-3. [드릴 02] 북한산 야간 산행 훈련 [2027.06]
- `public/images/activity_03_slide_1.jpg` : 헤드랜턴 야간 암릉 주행
- `public/images/activity_03_slide_2.jpg` : 야간 능선 보행 테크닉
- `public/images/activity_03_slide_3.jpg` : 칠흑 트레일 및 도심 야경

#### 4-4. [메인 챌린지] 2027 서울 불수사도북 45km [2027.07]
- `public/images/activity_04_slide_1.jpg` : 45km 불수사도북 능선 트래버스
- `public/images/activity_04_slide_2.jpg` : 알파인 암릉 트레일
- `public/images/activity_04_slide_3.jpg` : 고도 상승 및 정상 파노라마

---

### 5. JOIN 페이지 및 메인 팝업 코스 사진
| 파일 경로 | 권장 비율 & 해상도 | 사용 위치 및 설명 |
| :--- | :--- | :--- |
| `public/images/activity_taebaek_slide_1.jpg` | 4:3 가로 (1200×900) | 3. JOIN 상단 ACTIVE RECRUITMENT NOTICE 박스 및 메인 태백 프로모션 팝업 |

---

## 🛠️ 사진 바꾸는 방법 (2가지 방법)

### 방법 A: 깃허브(GitHub)에서 파일 덮어쓰기 (가장 추천)
1. 변경하고 싶은 사진의 파일명(예: `activity_taebaek_slide_1.jpg`)을 위 표에서 확인합니다.
2. 새 사진 파일명을 해당 이름과 **완전히 동일하게** 변경합니다.
3. GitHub의 `public/images/` 폴더에 업로드(Add file ➔ Upload files)하여 덮어쓰기(Overwrite) 후 커밋하면 끝납니다!

### 방법 B: 코드 파일 `src/imageRegistry.ts`에서 수정하기
1. 새 사진을 `public/images/` 폴더에 원하는 이름으로 넣습니다.
2. `src/imageRegistry.ts` 파일을 열어 해당 항목의 경로만 변경하면 즉시 반영됩니다.
