# NAGA™ Admin Management System & Server Persistence

A secure, high-utility administrative console integrated seamlessly into the NAGA™ web platform. Enables authorized crew managers to authenticate via a discreet bottom-right access point, upload local image files with instant previews, and edit or register activities, main hero banners, and recovery catalog items with permanent server-side database persistence.

> [!IMPORTANT]
> **Confirmed Specifications from Planning Phase**:
> 1. **Data Storage & Persistence**: Server database persistent storage (`/api/data` backed by server-side structured database storage and local file cache with fallback).
> 2. **Management Scope**: Full coverage across **Activities (일정 및 코스 상세)**, **Hero Banner Slides (메인 배너 슬라이드)**, and **Recovery Products (리커버리 상품 전체)**.
> 3. **Image Replacement Method**: Direct file upload from the admin's device with instantaneous image preview and server-side asset handling (`/api/upload` storing to `/public/uploads/`).
> 4. **Authentication Credentials**: Fixed initial administrative credentials (`ID: admin` / `PW: 1q2w3e4r!!`) with secure session token validation.

---

### 1. Overview & Core Concept

- **What It Does**: Adds an unobtrusive administrative trigger in the bottom-right corner of the interface. When an organizer logs in using the specified credentials (`admin` / `1q2w3e4r!!`), a comprehensive technical management console appears. From this console, administrators can create new mountaineering activities, update dates and gear lists, replace slide imagery, modify recovery product details, and upload high-resolution images directly from their desktop or mobile device.
- **Target Audience / Persona**: NAGA crew leads, field organizers, and content managers who need to post upcoming alpine drills, update recruitment banners, and refresh gear requirements without manually editing code or image directories.
- **Key Value**: Eliminates hardcoded content maintenance bottlenecks. Any changes saved by the admin immediately reflect across the public SPA views (Home, Activities, Recovery, and Join) and persist permanently across server restarts and client reloads.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Discovery & Discreet Login**:
   - At the bottom-right of every view, a sleek, minimalist floating admin button `[ ⬡ ADMIN ]` is fixed above the layout margin (`fixed bottom-6 right-6 z-40`).
   - Clicking it summons the **Admin Authentication Modal** featuring high-contrast typography, an ID input, a password input, and an authenticated status indicator.
   - On entering `admin` and `1q2w3e4r!!`, the session is verified against `/api/auth/login`. An admin badge `[ ADMIN MODE ACTIVE ]` appears, and the management dashboard opens.

2. **Management Dashboard Experience**:
   - Structured in NAGA's signature brutalist-alpine aesthetic (deep obsidian `#000000`, crisp alpine white borders, tabular monospace metadata).
   - **Segmented View Tabs**:
     - **01. ACTIVITIES**: Chronological activity list with quick "Edit", "Delete", and "Register New Activity" actions.
     - **02. HERO SLIDES**: Reorder, add, or edit banner titles, subtitles, and uploaded photography.
     - **03. RECOVERY**: Edit nutritional supplements, shake formulas, and gear protocols.
     - **04. RECRUITMENT NOTICE**: Update active expedition notice copy and course archive photo.
   - **Direct File Upload with Real-time Preview**:
     - Custom drag-and-drop or file selector zone.
     - Instant thumbnail preview upon selection.
     - Uploads asynchronously to the server, generating optimized static URLs.

3. **Save, Review & Public Synchronization**:
   - A sticky bottom action dock within the admin console displays "SAVE ALL CHANGES", "DISCARD CHANGES", and "LOGOUT".
   - Saving dispatches the updated payload to the server database. All client views instantly re-render the refreshed state without requiring a page reload.

#### Visual Identity & Theme Tokens

- **Palette**: Monochromatic technical luxury.
  - Neutral Canvas: `#000000` (Obsidian Black)
  - Surface Containers: `rgba(255, 255, 255, 0.04)` with `1px solid rgba(255, 255, 255, 0.2)`
  - Active & Focus States: Pure White `#FFFFFF` with inverted high-contrast black typography
  - Alert / Destructive: `#DC2626` (Refined Crimson) for delete confirmations
- **Typography**:
  - Headings & Brand Mark: `Syne` (Bold, uppercase, tracking-tight)
  - Data Labels, Badges & Code: Monospace with `tabular-nums`
  - Body & Form Placeholders: Sans-serif (`Plus Jakarta Sans` / System clean fallback)
- **Zero-Pill Discipline**: All status indicators, date ranges, and category tags are rendered as clean, unboxed typographic metadata separated by `//` or `·`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express Server Integration (`server.ts`)**:
  - *Chosen Approach*: Implement an Express backend running via `tsx server.ts` that mounts Vite middlewares in development and serves API routes (`/api/data`, `/api/upload`, `/api/auth`).
  - *Why*: Satisfies the user's explicit preference for "서버 데이터베이스 영구 저장 연동" while enabling authentic local file uploads saved directly to `/public/uploads/`.
  - *Alternative Considered*: Client-only `localStorage`. Rejected because data would be lost across different devices or cleared caches.
- **Decision 2: File Upload Strategy**:
  - *Chosen Approach*: Server-side file persistence using Express `express.json({ limit: '25mb' })` and standard file system (`fs/promises`) writes into `/public/uploads/`.
  - *Why*: Zero third-party cloud storage dependencies, fast local execution, instant preview rendering, and reliable zero-broken-image guarantees.
- **Decision 3: Seamless Dual State (Default Seed + Server Overrides)**:
  - *Chosen Approach*: On first launch, the server initializes `data/db.json` from the current rich `ACTIVITIES_DATA`, `HERO_SLIDES`, and `PRODUCTS_DATA`.
  - *Why*: Guarantees that the site never starts empty and that existing high-quality alpine photography and copywriting are fully preserved.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NAGA™ CLIENT APPLICATION                       │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ Public SPA Views      │   │ Floating Admin Trigger [⬡ ADMIN]     │  │
│  │ (Home/Act/Rec/Join)   │   └──────────────────┬───────────────────┘  │
│  └───────────▲───────────┘                      │ Click                │
│              │                       ┌──────────▼───────────────────┐  │
│              │ State Sync            │ Admin Auth Modal             │  │
│              │                       │ (admin / 1q2w3e4r!!)         │  │
│  ┌───────────┴───────────┐           └──────────┬───────────────────┘  │
│  │ React Data Provider / │                      │ Verified Session     │
│  │ Central App State     │◄─────────────────────┼───────────────────┐  │
│  └───────────▲───────────┘           ┌──────────▼────────────────┐  │  │
│              │                       │ NAGA™ Admin Console       │  │  │
│              │                       │ - Activities Manager      │  │  │
│              │                       │ - Hero Slides Manager     │  │  │
│              │                       │ - Products Manager        │  │  │
│              │                       │ - File Upload & Previews  │  │  │
│              │                       └──────────┬────────────────┘  │  │
└──────────────┼──────────────────────────────────┼───────────────────┼──┘
               │ GET /api/data                    │ POST /api/data    │ POST /api/upload
               ▼                                  ▼                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS SERVER (server.ts)                      │
│                                                                        │
│  ┌───────────────────────┐   ┌───────────────────┐   ┌──────────────┐  │
│  │ /api/auth/login       │   │ /api/data         │   │ /api/upload  │  │
│  │ Password Validation   │   │ Read/Write DB     │   │ File Storage │  │
│  └───────────────────────┘   └─────────┬─────────┘   └──────┬───────┘  │
│                                        │                    │          │
│                                        ▼                    ▼          │
│                             ┌────────────────────┐   ┌──────────────┐  │
│                             │ server/db.json     │   │ /public/     │  │
│                             │ (Persistent Store) │   │ uploads/     │  │
│                             └────────────────────┘   └──────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Key Components to Build

1. `server.ts`:
   - Express server configuring Vite middleware in development mode (`npm run dev`).
   - Authentication endpoint (`/api/auth/login`).
   - Data endpoints (`GET /api/data`, `POST /api/data`, `POST /api/data/reset`).
   - File upload endpoint (`POST /api/upload`) saving to `public/uploads/` with mime-type checking and safe file naming.
2. `src/components/AdminTrigger.tsx`:
   - Subtle, fixed bottom-right button with smooth hover animation and indicator dot.
3. `src/components/AdminLoginModal.tsx`:
   - Modal prompt with ID and password fields, error feedback, and keypress submission (`Enter`).
4. `src/components/AdminConsoleModal.tsx`:
   - Full management console with tab navigation (Activities, Hero Slides, Products, Notice).
   - Activity editor form (Title, Code, Date, Distance, Elevation, Location, Gear, Recovery, Description, 3 course photos).
   - Image upload dropzone with instant client preview and server upload integration.
   - Delete confirmation dialog.
5. Integration in `src/App.tsx`:
   - Dynamic data fetch from `/api/data` with graceful fallback to initial constants.
   - Global save notifications and seamless re-render.
