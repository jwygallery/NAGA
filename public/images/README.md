# NAGA™ Web Image Asset Guide (이미지 교체 가이드)

깃허브(GitHub) 저장소에서 아래 파일명의 이미지를 동일한 이름으로 업로드(Overwrite)하면 웹사이트에 실시간 반영됩니다.

---

### 1. 브랜드 로고 (Header & Favicon)
| 파일 경로 | 추천 규격 | 용도 및 설명 |
| :--- | :--- | :--- |
| `public/images/brand_logo.svg` (또는 `public/logo.svg`) | 500x500 (1:1 정사각형) | 상단 헤더 및 파비콘에 사용되는 NAGA™ 공식 로고 |

---

### 2. 메인 배너 슬라이더 (Hero Section Slider)
메인 화면 상단 대형 와이드 배너 슬라이드 이미지입니다. 고화질 가로형 아웃도어/필드 액션 사진을 권장합니다.

| 파일 경로 | 추천 해상도 & 비율 | 설명 및 기본 테마 |
| :--- | :--- | :--- |
| `public/images/hero_slide_01.jpg` | 1920x1080 (16:9) | 슬라이드 1: BUL-SU-SA-DO-BUK 45KM 메인 챌린지 암릉 능선 |
| `public/images/hero_slide_02.jpg` | 1920x1080 (16:9) | 슬라이드 2: 테크니컬 알파인 기어 & 쉘 재킷 |
| `public/images/hero_slide_03.jpg` | 1920x1080 (16:9) | 슬라이드 3: 심야 트레일 런 & 헤드랜턴 기동 |
| `public/images/hero_slide_04.jpg` | 1920x1080 (16:9) | 슬라이드 4: 북한산 백운대/의상능선 암벽 트레버스 |

---

### 3. 리커버리 제품 카탈로그 (2. RECOVERY Catalog)
2열 그리드(2-Column Grid) 카탈로그에 표시되는 테크니컬 제품 사진입니다. 사진이 상단에 배치되므로 깔끔한 4:3 또는 1:1 비율을 권장합니다.

| 파일 경로 | 추천 해상도 & 비율 | 설명 및 제품명 |
| :--- | :--- | :--- |
| `public/images/product_01_hydrometer.jpg` | 800x600 (4:3) | [Product 01] NAGA Guard Hydrometer (수분/전해질 측정기) |
| `public/images/product_02_alpine_shake.jpg` | 800x600 (4:3) | [Product 02] NAGA Alpine Shake (알파인 리커버리 쉐이크) |
| `public/images/product_03_greek_bowl.jpg` | 800x600 (4:3) | [Product 03] NAGA Balance Greek Bowl (원기 회복 그릭 요거트 볼) |

---

### 깃허브(GitHub)에서 이미지 교체하는 방법:
1. GitHub 저장소에서 `public/images/` 폴더로 이동합니다.
2. 교체하고자 하는 파일명(예: `hero_slide_01.jpg`)을 확인합니다.
3. 우측 상단의 **Add file** ➔ **Upload files**를 클릭하여 내 컴퓨터의 새 사진을 드래그 앤 드롭합니다.
4. 파일명이 위 표의 파일명과 동일해야 바로 교체(Overwrite)됩니다.
5. 하단의 **Commit changes**를 누르면 즉시 변경이 반영됩니다.
