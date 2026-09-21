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

### 3. 리커버리 제품 사진 (2. RECOVERY Catalog 3종)
| 파일 경로 | 권장 비율 & 해상도 | 제품명 및 설명 |
| :--- | :--- | :--- |
| `public/images/product_01_hydrometer.jpg` | 4:3 가로 (800×600) | [제품 01] NAGA Guard Hydrometer (정밀 수분/전해질 측정기) |
| `public/images/product_02_alpine_shake.jpg` | 4:3 가로 (800×600) | [제품 02] NAGA Alpine Shake (알파인 리커버리 쉐이크) |
| `public/images/product_03_greek_bowl.jpg` | 4:3 가로 (800×600) | [제품 03] NAGA Balance Greek Bowl (원기 회복 그릭 요거트 볼) |

---

### 4. 액티비티 상세 모달 슬라이드 (1. ACTIVITIES 각 3장씩)
모달 팝업의 [드릴 목적] 아래 슬라이더에 표시됩니다. (가로 4:3 비율 권장)

#### [메인 챌린지] 2027 서울 불수사도북 45km
- `public/images/activity_04_slide_1.jpg` : 45km 불수사도북 능선 트래버스
- `public/images/activity_04_slide_2.jpg` : 알파인 암릉 트레일
- `public/images/activity_04_slide_3.jpg` : 고도 상승 및 정상 파노라마

#### [드릴 03] 북한산 야간 산행 훈련
- `public/images/activity_03_slide_1.jpg` : 헤드랜턴 야간 암릉 주행
- `public/images/activity_03_slide_2.jpg` : 야간 능선 보행 테크닉
- `public/images/activity_03_slide_3.jpg` : 칠흑 트레일 및 도심 야경

#### [드릴 02] 남산 업힐 인터벌 훈련
- `public/images/activity_02_slide_1.jpg` : 남산 업힐 인터벌 러닝
- `public/images/activity_02_slide_2.jpg` : 남산 순환로 및 일몰 트레일
- `public/images/activity_02_slide_3.jpg` : 도심 산악 코스 경사로

#### [드릴 01] 불암산 & 수락산 페이스 분석
- `public/images/activity_01_slide_1.jpg` : 수락산 기차바위 암릉
- `public/images/activity_01_slide_2.jpg` : 불암-수락 연결 트레킹
- `public/images/activity_01_slide_3.jpg` : 바위 능선 페이스 측정

---

### 5. JOIN 페이지 모집 안내 코스 사진 (3. JOIN)
| 파일 경로 | 권장 비율 & 해상도 | 사용 위치 및 설명 |
| :--- | :--- | :--- |
| `public/images/activity_04_slide_1.jpg` | 4:3 가로 (1200×900) | 3. JOIN 상단 ACTIVE RECRUITMENT NOTICE 박스 내 대표 코스 사진 |

---

## 🛠️ 사진 바꾸는 방법 (2가지 방법)

### 방법 A: 깃허브(GitHub)에서 파일 덮어쓰기 (가장 추천)
1. 변경하고 싶은 사진의 파일명(예: `activity_01_slide_1.jpg`)을 위 표에서 확인합니다.
2. 새 사진 파일명을 해당 이름과 **완전히 동일하게** 변경합니다.
3. GitHub의 `public/images/` 폴더에 업로드(Add file ➔ Upload files)하여 덮어쓰기(Overwrite) 후 커밋하면 끝납니다!

### 방법 B: 코드 파일 `src/imageRegistry.ts`에서 수정하기
1. 새 사진을 `public/images/` 폴더에 원하는 이름(예: `my_new_photo.jpg`)으로 넣습니다.
2. `src/imageRegistry.ts` 파일을 열어 해당 항목의 경로만 `'/images/my_new_photo.jpg'`로 변경하면 즉시 반영됩니다.
