# NAGA™ Multi-Session Recruitment, Hero Slide Uploader & Aesthetic Refinement

This update decouples the Activity detail modal from the Join application flow, upgrades the Admin Console so organizers can directly upload new Hero Slide photos and manage multiple concurrent recruitment sessions, and introduces a top tab switcher on the Join page alongside subtle typographic and layout refinements.

> [!IMPORTANT]
> **Confirmed User Decisions**:
> 1. **Activity Modal Decoupling**: Remove the `APPLY FOR THIS DRILL` button from the Activity detail modal so `1. ACTIVITIES` serves strictly as a field archive and course protocol viewer.
> 2. **Hero Slide Photo Addition in Admin**: Add a direct local image file upload trigger (`+ 사진 업로드로 새 슬라이드 추가`) and slide order controls inside the Admin Console's Hero Slides tab.
> 3. **Concurrent Multi-Session Recruitment**: Upgrade the Join recruitment system to support multiple active recruitment sessions simultaneously. Visitors switch between open sessions via a top tab bar on the `3. JOIN` page, viewing each session's dedicated course notice, 4:3 photo, and application target.
> 4. **Subtle Aesthetic Polish**: Refine typographic hierarchy, add a minimal slide counter and indicator on the main Hero banner, and polish card spacing and border contrast without altering NAGA's signature monochrome identity.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Removes the join link button from the Activity popup modal.
  - Empowers admins in `NAGA™ MANAGEMENT CONSOLE` to add new Hero Banner slides directly by uploading photos from their device, reorder slides, and manage multiple open recruitment sessions (`JOIN RECRUITMENT`) at the same time.
  - Upgrades `3. JOIN` with an intuitive top session tab selector when two or more recruitment sessions are open, dynamically syncing the recruitment notice card, 4:3 course archive photo, and form submission target.
- **Target Audience / Persona**: NAGA crew organizers running overlapping pre-training drills and main challenges, and crew applicants browsing activities or registering for specific open sessions.
- **Key Value**: Full operational flexibility for multi-session recruitment and hero banner curation while keeping the public user journey clean and focused.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Pure Activity Protocol Modal (`1. ACTIVITIES`)**:
   - Clicking an activity card opens the detail modal showing specifications (Location, Elevation, Required Gear, Recovery), Drill Objective, and the 4:3 Course Photo Slider.
   - The bottom footer of the modal now contains only a clean `[ CLOSE ]` action—no `APPLY FOR THIS DRILL` redirect button.

2. **Hero Banner Slide Photo Addition (`ADMIN > 2. HERO SLIDES`)**:
   - At the top of the Hero Slides tab, admins have two instant actions:
     - **`[ + 사진 파일 업로드로 새 슬라이드 추가 ]`**: Selecting an image file from the device immediately uploads it to `/api/upload` and creates a new Hero Slide card with preview.
     - **`[ + 빈 슬라이드 추가 ]`**: Creates a template slide slot.
   - Each slide card also includes `▲ / ▼` reorder buttons, direct photo replacement, and a delete button.

3. **Multi-Session Recruitment Management (`ADMIN > 4. JOIN SESSIONS`)**:
   - Admins can register multiple recruitment sessions (e.g., *2027 GANGWON TAEBAEK*, *PRE-TRAINING DRILL 01: NAM-SAN*, *2027 SEOUL BUL-SU-SA-DO-BUK 45KM*).
   - Each session item has:
     - Active/Hidden toggle (`모집 활성화 / 숨김`)
     - Reorder controls (`▲ / ▼`)
     - Schedule Tag (e.g. `UPCOMING EXPEDITION · 2027.01`)
     - English Title & Korean Subtitle
     - Detailed Notice Description
     - 4:3 Course Photo (with local device file upload & preview)
     - Photo Archive & Trail captions

4. **Tabbed Session Selector on Public Join View (`3. JOIN`)**:
   - At the top of `3. JOIN`, all currently active recruitment sessions appear as a crisp segmented tab bar (`01. 2027 GANGWON TAEBAEK`, `02. DRILL 01: NAM-SAN`, etc.).
   - Clicking a tab immediately switches the **Active Recruitment Notice** box (title, subtitle, description, and 4:3 course photo) and locks the **Expedition Application** form below to the selected session.

5. **Subtle Aesthetic Improvements**:
   - **Main Hero Banner**: Adds a quiet tabular slide counter (`01 / 04`) and clickable progress bars on the bottom-right of the hero viewport to balance the left/right navigation arrows on the bottom-left.
   - **Card & Modal Hairlines**: Crisp 1px borders (`border-white/15` transitioning to `border-white/80` on hover), balanced internal padding, and refined optical spacing for Korean and English typography.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Backward-Compatible Multi-Session Schema (`joinNotices` + `joinNotice`)**:
  - *Chosen Approach*: Store `joinNotices: JoinNoticeItem[]` in `NagaAppData`. If existing `data/db.json` only has the legacy single `joinNotice` object, automatically migrate it into `joinNotices[0]` on load.
  - *Why*: Ensures zero data loss from previously saved admin states while unlocking unlimited concurrent recruitment sessions.
- **Decision 2: Top Tab Switching in `3. JOIN`**:
  - *Chosen Approach*: A horizontal segmented tab bar above the recruitment notice box that selects the active session (`selectedJoinSessionId`).
  - *Why*: Matches the user's confirmed preference ("상단 탭으로 모집 세션을 전환하며 선택한 세션에 신청하기") and keeps the page compact without vertical form clutter.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NAGA™ CLIENT & ADMIN FLOW                       │
│                                                                        │
│  ┌──────────────────────────┐    ┌──────────────────────────────────┐  │
│  │ 1. ACTIVITIES Modal      │    │ 3. JOIN View                     │  │
│  │ - Specs & Drill Copy     │    │ - Top Session Tabs (01, 02...)   │  │
│  │ - 4:3 Photo Carousel     │    │ - Dynamic Notice & 4:3 Photo     │  │
│  │ - [ CLOSE ] Only         │    │ - Form Bound to Selected Session │  │
│  └──────────────────────────┘    └─────────────────▲────────────────┘  │
│                                                    │                   │
│  ┌─────────────────────────────────────────────────┴────────────────┐  │
│  │ NAGA™ ADMIN CONSOLE (Discreet Footer Trigger -> Login)           │  │
│  │ - Tab 1: Activities (CRUD + Reorder + 3x Photo Upload)           │  │
│  │ - Tab 2: Hero Slides (Direct Photo Upload Add + Reorder + Edit)  │  │
│  │ - Tab 3: Recovery Products (CRUD + Photo Upload)                 │  │
│  │ - Tab 4: Join Sessions (Multi-Session CRUD + Active Toggle)      │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ POST /api/data & POST /api/upload
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER & PERSISTENT STORE                   │
│                  data/db.json  +  public/uploads/*                     │
└────────────────────────────────────────────────────────────────────────┘
```
