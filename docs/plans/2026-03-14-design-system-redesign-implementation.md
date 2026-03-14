# Design System + Trip.com 스타일 리디자인 - 구현 계획서

## 개요

| 항목 | 값 |
|------|-----|
| **논리 모델** | `docs/plans/2026-03-14-design-system-redesign.md` |
| **작성일** | 2026-03-14 |
| **복잡도** | 대규모 (6개 Phase, 약 2-3주) |
| **범위** | Capacitor 제거, 디자인 토큰, 탭 재구성, 홈 리디자인, AI 드로어, 전체 스타일링 |

---

## Phase 1: Capacitor 제거 + 클린업 (1일)

### 목표
Capacitor 관련 코드/패키지를 완전히 제거하고 웹 전용 앱으로 정리한다.

### 작업 목록

#### 1-1. 패키지 제거 — 규모: S
```bash
cd app && npm uninstall @capacitor/core @capacitor/ios @capacitor/splash-screen @capacitor/status-bar @capacitor/cli
```
- 파일: `app/package.json`
- 완료 조건: `npm ls @capacitor` 에서 결과 0개

#### 1-2. Capacitor 파일 삭제 — 규모: S
- 삭제: `app/src/lib/capacitor.ts` (전체)
- 삭제: `app/src/components/CapacitorInit.tsx` (전체)
- 삭제: `app/capacitor.config.ts` (전체)
- 삭제: `app/ios/` 폴더 (로컬, gitignore됨)
- 완료 조건: 해당 파일 존재하지 않음

#### 1-3. layout.tsx에서 Capacitor 참조 제거 — 규모: S
- 파일: `app/src/app/layout.tsx`
- 변경 내용:
  - **라인 4**: `import { CapacitorInit }` 삭제
  - **라인 30**: `viewportFit: "cover"` 삭제
  - **라인 42**: `<CapacitorInit />` 삭제
- 완료 조건: `layout.tsx`에 "capacitor", "CapacitorInit", "viewportFit" 문자열 없음

#### 1-4. Header.tsx Safe Area 제거 — 규모: S
- 파일: `app/src/components/layout/Header.tsx`
- 변경: `pt-[calc(0.75rem+var(--safe-area-top,0px))]` -> `pt-3`
- 완료 조건: `--safe-area-top` 참조 없음

#### 1-5. TabBar.tsx Safe Area 제거 — 규모: S
- 파일: `app/src/components/viewer/TabBar.tsx`
- 변경: `pt-[var(--safe-area-top,0px)]` 제거
- 완료 조건: `--safe-area-top` 참조 없음

#### 1-6. HeroSection.tsx Safe Area 제거 — 규모: S
- 파일: `app/src/components/viewer/HeroSection.tsx`
- 변경: `pt-[calc(2rem+var(--safe-area-top,0px))]` -> `pt-8`
- 완료 조건: `--safe-area-top` 참조 없음

#### 1-7. map-utils.ts 웹 전용으로 단순화 — 규모: S
- 파일: `app/src/lib/map-utils.ts`
- 변경:
  - `import { Capacitor }` 삭제
  - `isNative` 분기 모두 제거
  - 항상 Google Maps URL만 사용 (`window.open(url, '_blank')`)
  - `openUrl` 헬퍼 함수 제거 (인라인)
- 변경 후 코드 골격:
  ```typescript
  import type { MapSpot } from '@/types/trip';

  export function openInMapsApp(spots: MapSpot[]): void {
    if (spots.length === 0) return;
    if (spots.length === 1) {
      const spot = spots[0];
      window.open(`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`, '_blank');
      return;
    }
    window.open(`https://www.google.com/maps/dir/${spots.map((s) => `${s.lat},${s.lng}`).join('/')}`, '_blank');
  }
  ```
- 완료 조건: `@capacitor` import 없음, `isNative` 없음

### Phase 1 완료 조건 (DoD)
- [ ] `npm run build` 성공 (빌드 에러 없음)
- [ ] 프로젝트 전체에서 `@capacitor` import 0건 (`grep -r "@capacitor" app/src/`)
- [ ] `--safe-area-top` CSS 변수 참조 0건
- [ ] `viewportFit` 참조 0건
- [ ] 기존 기능(홈, 여행 상세, 채팅) 정상 동작

### Phase 1 위험
- **낮음**: `map-utils.ts`를 참조하는 컴포넌트(DayCard)에서 Apple Maps 분기가 사라지지만, 이미 웹 전용이므로 영향 없음

---

## Phase 2: 디자인 토큰 시스템 구축 (1-2일)

### 목표
`globals.css`의 `@theme inline` 블록을 논리 모델에 정의된 체계적 토큰 시스템으로 재구성한다. Playfair Display 폰트를 복원한다.

### 작업 목록

#### 2-1. Playfair Display 폰트 추가 — 규모: S
- 파일: `app/src/app/layout.tsx`
- 변경:
  - `import { Playfair_Display } from 'next/font/google'` 추가
  - 폰트 인스턴스 생성: `subsets: ['latin'], weight: ['400','700','900'], variable: '--font-display', display: 'swap'`
  - `<body>` className에 `${playfairDisplay.variable}` 추가
- 완료 조건: `--font-display`가 Playfair Display로 설정됨

#### 2-2. globals.css @theme inline 재구성 — 규모: L
- 파일: `app/src/app/globals.css`
- 변경 범위: `@theme inline { ... }` 블록 전체 교체

**2-2a. 색상 토큰 재정의**:
```
기존                          → 변경
--color-bg: #ffffff           → 유지
--color-card: #fafafa         → --color-surface: #ffffff
--color-card-secondary        → --color-bg-tertiary: #f3f4f6
--color-glass                 → 삭제 (미사용)
--color-accent: #f97316       → --color-primary: #f97316
--color-accent-light          → --color-primary-400: #fb923c
--color-accent-warm           → --color-primary-600: #ea580c
--color-accent-bg             → --color-primary-50: #fff7ed
--color-accent-bg-hover       → --color-primary-100: #ffedd5
(신규)                        → --color-primary-200 ~ 900 (오렌지 스케일)
(신규)                        → --color-secondary: #0d9488 (틸)
(신규)                        → --color-secondary-50 ~ 900 (틸 스케일)
--color-trip-*                → --color-cat-* (카테고리)
--color-text                  → --color-text-primary: #111827
--color-text-secondary        → 유지
--color-text-tertiary         → 유지
(신규)                        → --color-text-inverse: #ffffff
(신규)                        → --color-bg-secondary: #f9fafb
(신규)                        → --color-surface-hover: #f9fafb
(신규)                        → --color-border-light: #f3f4f6
(신규)                        → --color-success/warning/error/info
(신규)                        → --color-overlay-light/dark
```

**2-2b. Shadow 토큰 확장**:
```
기존 2개 → 6개로 확장
--shadow-card      → --shadow-sm
--shadow-card-hover → --shadow-md
(신규) --shadow-xs, --shadow-lg, --shadow-xl, --shadow-float
```

**2-2c. Border Radius 재정의**:
```
기존 (shadcn 기반 calc)      → 고정값으로 교체
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px (기존 --radius-card 대체)
--radius-2xl: 20px
--radius-full: 9999px
```

**2-2d. 폰트 토큰**:
```
--font-display: 'Noto Sans KR' → 'Playfair Display', serif
--font-sans: 유지
```

**2-2e. 레이아웃 토큰 추가**:
```
--max-width: 1100px  (기존 하드코딩 대체)
--page-px: 20px
--page-px-lg: 32px
```

- 완료 조건: 새 토큰 체계가 정의됨, shadcn/ui 매핑은 유지

#### 2-3. 기존 토큰명 참조를 새 토큰명으로 일괄 변경 — 규모: XL
- 대상 파일: `app/src/` 전체 (약 30+ 파일)
- 주요 변환 매핑:

| 기존 클래스/변수 | 신규 클래스/변수 | 영향 파일 수 (추정) |
|-----------------|-----------------|-------------------|
| `text-accent` | `text-primary` | ~15 |
| `bg-accent` | `bg-primary` | ~8 |
| `bg-accent-bg` | `bg-primary-50` | ~5 |
| `bg-accent-bg-hover` | `bg-primary-100` | ~3 |
| `text-accent-light` | `text-primary-400` | ~2 |
| `bg-accent-warm` | `bg-primary-600` | ~2 |
| `border-accent` | `border-primary` | ~8 |
| `hover:text-accent` | `hover:text-primary` | ~5 |
| `hover:bg-accent` | `hover:bg-primary` | ~3 |
| `text-text` | `text-text-primary` | ~10 |
| `bg-card` | `bg-surface` | ~8 |
| `text-trip-blue` | `text-cat-transport` | ~3 |
| `bg-trip-blue` | `bg-cat-transport` | ~2 |
| `text-trip-pink` | `text-cat-food` | ~2 |
| `text-trip-green` | `text-cat-sightseeing` | ~2 |
| `shadow-[var(--shadow-card)]` | `shadow-sm` | ~5 |
| `shadow-[var(--shadow-card-hover)]` | `shadow-md` | ~3 |
| `rounded-[16px]` | `rounded-xl` | ~10 |
| `max-w-[1100px]` | `max-w-[var(--max-width)]` | ~5 |

**주의**: 이 변환은 반드시 Phase 2-2 이후에 진행. 한 파일씩 변환하고 빌드 확인.

- 완료 조건: 기존 토큰명(`--color-accent`, `--shadow-card` 등) 참조 0건

#### 2-4. globals.css timeline 스타일 토큰 적용 — 규모: S
- 파일: `app/src/app/globals.css`
- 변경: `.tl-item::before`의 `var(--color-accent)` -> `var(--color-primary)`
- 변경: `.tl-item.food::before`의 `var(--color-trip-pink)` -> `var(--color-cat-food)` 등
- 완료 조건: globals.css 내 기존 토큰명 참조 없음

### Phase 2 완료 조건 (DoD)
- [ ] `npm run build` 성공
- [ ] Playfair Display 폰트가 로드됨 (DevTools Network 확인)
- [ ] `--color-accent` 등 구 토큰명 참조 0건
- [ ] 모든 컴포넌트의 색상/그림자/반지름이 정상 렌더링
- [ ] 시각적으로 기존과 동일 (색상값 자체는 변경 없으므로)

### Phase 2 위험
- **높음**: 토큰 리네이밍 과정에서 누락된 참조가 있을 수 있음
  - 대응: `grep -r "color-accent\|color-trip-\|shadow-card\|color-text[^-]" app/src/` 로 전수 검사
- **보통**: shadcn/ui 컴포넌트 내부에서 `--primary`, `--accent` 등을 사용하는데, 프로젝트 커스텀 토큰과 이름 충돌 가능
  - 대응: shadcn 토큰(`--primary` oklch)은 `:root`에서 정의, 프로젝트 토큰(`--color-primary`)은 `@theme inline`에서 정의 -- 네임스페이스가 다르므로 충돌 없음. 단, Tailwind 클래스에서 `text-primary`가 어느 토큰을 참조하는지 확인 필요. Tailwind v4는 `@theme` 토큰 우선. `--color-primary`를 정의하면 `text-primary`는 이 값을 사용함.

---

## Phase 3: 4탭 재구성 (2-3일)

### 목표
7탭(개요/일정/맛집/교통/예산/준비물/사전 준비)을 4탭(요약/일정/가이드/체크리스트)으로 재구성한다.

### 작업 목록

#### 3-1. TAB_CONFIG 변경 — 규모: S
- 파일: `app/src/lib/constants.ts`
- 변경:
  ```typescript
  // AS-IS: 7탭 이모지 기반
  // TO-BE: 4탭 (아이콘은 lucide-react로 변경 -- Phase 6에서 적용)
  export const TAB_CONFIG = [
    { id: 'summary',   label: '요약',       icon: '📋' },
    { id: 'schedule',  label: '일정',       icon: '📅' },
    { id: 'guide',     label: '가이드',     icon: '🧭' },
    { id: 'checklist', label: '체크리스트', icon: '✅' },
  ] as const;

  export type TabId = (typeof TAB_CONFIG)[number]['id'];
  ```
- 의존성: 없음
- 완료 조건: `TabId` 타입이 `'summary' | 'schedule' | 'guide' | 'checklist'`

#### 3-2. GuideTab 신규 생성 — 규모: L
- 파일: `app/src/components/viewer/tabs/GuideTab.tsx` (신규)
- 역할: 맛집 + 교통 + 예산 정보를 하나의 탭에 통합 표시
- 구현 내용:
  - Props: `{ restaurants: Restaurant[], transport: TransportSection, budget: BudgetSection }`
  - 3개 서브 섹션을 Accordion으로 구성 (기본 모두 열림)
  - 각 섹션은 기존 `RestaurantTab`, `TransportTab`, `BudgetTab`의 렌더링 로직을 재사용
  - 섹션 헤더에 아이콘 + 건수/합계 표시
- 참고: 기존 탭 코드
  - `app/src/components/viewer/tabs/RestaurantTab.tsx`
  - `app/src/components/viewer/tabs/TransportTab.tsx`
  - `app/src/components/viewer/tabs/BudgetTab.tsx`
- 완료 조건: 맛집/교통/예산 데이터가 하나의 탭에서 올바르게 표시됨

#### 3-3. ChecklistTab 신규 생성 — 규모: L
- 파일: `app/src/components/viewer/tabs/ChecklistTab.tsx` (신규)
- 역할: 준비물 + 사전 할 일 통합 + 전체 진행률 표시
- 구현 내용:
  - Props: `{ tripId: string, packing: PackingItem[], preTodos: PreTodoItem[] }`
  - 최상단에 전체 진행률 바 (준비물 체크 + 사전 할 일 완료 합산)
  - 서브 섹션 2개: "준비물" (기존 PackingTab 로직), "사전 할 일" (기존 PreTodoTab 로직)
  - Accordion 또는 세로 배치
- 참고: 기존 탭 코드
  - `app/src/components/viewer/tabs/PackingTab.tsx`
  - `app/src/components/viewer/tabs/PreTodoTab.tsx`
- 완료 조건: 준비물 체크/언체크 동작, 진행률 바 정확

#### 3-4. OverviewTab -> SummaryTab 리네이밍 — 규모: S
- 파일: `app/src/components/viewer/tabs/OverviewTab.tsx`
  - 컴포넌트명: `OverviewTab` -> `SummaryTab`
  - 파일명: `OverviewTab.tsx` -> `SummaryTab.tsx`
- 또는: 파일명 유지하고 export만 변경 (import 측에서 변경)
- **권장**: 파일명도 변경 (일관성)
- 완료 조건: `OverviewTab` 참조 0건

#### 3-5. TripViewer.tsx 4탭 반영 — 규모: M
- 파일: `app/src/components/viewer/TripViewer.tsx`
- 변경:
  - import: `OverviewTab` -> `SummaryTab`, 새로 `GuideTab`, `ChecklistTab` 추가
  - import 제거: `RestaurantTab`, `TransportTab`, `BudgetTab`, `PackingTab`, `PreTodoTab`
  - `useState<TabId>('overview')` -> `useState<TabId>('summary')`
  - 탭 콘텐츠 렌더링:
    ```tsx
    {activeTab === 'summary' && <SummaryTab trip={trip} />}
    {activeTab === 'schedule' && <ScheduleTab days={trip.days} />}
    {activeTab === 'guide' && <GuideTab restaurants={trip.restaurants} transport={trip.transport} budget={trip.budget} />}
    {activeTab === 'checklist' && <ChecklistTab tripId={trip.id} packing={trip.packing} preTodos={trip.preTodos} />}
    ```
- 완료 조건: 4개 탭 전환이 정상 동작

#### 3-6. 기존 탭 파일 삭제 (또는 보존) — 규모: S
- **삭제 대상** (GuideTab/ChecklistTab에 로직 통합 완료 후):
  - `app/src/components/viewer/tabs/RestaurantTab.tsx`
  - `app/src/components/viewer/tabs/TransportTab.tsx`
  - `app/src/components/viewer/tabs/BudgetTab.tsx`
  - `app/src/components/viewer/tabs/PackingTab.tsx`
  - `app/src/components/viewer/tabs/PreTodoTab.tsx`
- **판단 기준**: GuideTab/ChecklistTab이 기존 코드를 import해서 사용하면 유지, 코드를 복사-통합하면 삭제
- **권장**: 기존 탭을 "섹션 컴포넌트"로 리네이밍하여 GuideTab/ChecklistTab에서 import
  - `RestaurantTab.tsx` -> `RestaurantSection.tsx` (export명 변경)
  - `TransportTab.tsx` -> `TransportSection.tsx`
  - `BudgetTab.tsx` -> `BudgetSection.tsx`
  - `PackingTab.tsx` -> `PackingSection.tsx`
  - `PreTodoTab.tsx` -> `PreTodoSection.tsx`
- 완료 조건: TripViewer에서 기존 5개 탭 import 없음

#### 3-7. TabBar.tsx 뒤로가기 버튼 위치 변경 준비 — 규모: S
- 파일: `app/src/components/viewer/TabBar.tsx`
- 변경:
  - "← 홈" 뒤로가기 버튼 제거 (Phase 4에서 Header로 이동)
  - 또는 이 Phase에서 미리 제거하고 임시로 Header showBack 활용
- **권장**: 이 Phase에서 뒤로가기 제거하고, 여행 상세 페이지(`app/src/app/trips/[tripId]/page.tsx`)에서 `<Header showBack title={trip.title} />` 추가
- 파일: `app/src/app/trips/[tripId]/page.tsx` (확인 필요)
- 완료 조건: TabBar에 뒤로가기 버튼 없음, 여행 상세에서 뒤로가기 가능

### Phase 3 완료 조건 (DoD)
- [ ] `npm run build` 성공
- [ ] 4탭 전환 정상 (요약/일정/가이드/체크리스트)
- [ ] 가이드 탭: 맛집/교통/예산 데이터 모두 표시
- [ ] 체크리스트 탭: 준비물 체크 동작, 사전 할 일 표시, 진행률 바
- [ ] 기존 7탭 관련 코드 참조 없음
- [ ] 기존 TabId('overview','restaurant','transport','budget','packing','pretodo') 타입 에러 없음

### Phase 3 위험
- **보통**: 기존 탭의 로직을 통합하면서 props 구조가 달라질 수 있음
  - 대응: 기존 탭을 Section 컴포넌트로 유지하고 GuideTab/ChecklistTab에서 조합
- **낮음**: PackingTab의 체크 상태 관리(`useTripStore.togglePackingItem`)가 ChecklistTab에서도 동작하는지
  - 대응: 동일한 store 함수 사용, props로 tripId 전달

---

## Phase 4: 홈 리디자인 (2-3일)

### 목표
홈 화면을 Trip.com 스타일로 리디자인. 히어로 카드 + 수평 스크롤 카드 + 시간 기준 그룹핑.

### 작업 목록

#### 4-1. trip-utils.ts에 그룹핑 함수 추가 — 규모: S
- 파일: `app/src/lib/trip-utils.ts`
- 추가:
  ```typescript
  type TripGroup = {
    upcoming: TripSummary[];   // startDate > today
    ongoing: TripSummary[];    // startDate <= today <= endDate
    past: TripSummary[];       // endDate < today
  };

  export function groupTrips(summaries: TripSummary[]): TripGroup { ... }
  ```
- 정렬 규칙:
  - upcoming: startDate 오름차순 (가까운 것 먼저)
  - past: endDate 내림차순 (최근 것 먼저)
- 완료 조건: 그룹핑 로직 정확

#### 4-2. HorizontalScroll 컴포넌트 신규 — 규모: M
- 파일: `app/src/components/shared/HorizontalScroll.tsx` (신규)
- 역할: 수평 스크롤 컨테이너 + CSS scroll-snap
- Props: `{ children, className? }`
- 구현:
  - `overflow-x: auto`, `scroll-snap-type: x mandatory`
  - 자식에 `scroll-snap-align: start`
  - `scrollbar-hide` 클래스 적용
  - 좌우 여백(padding) 처리
- 완료 조건: 모바일/데스크탑에서 수평 스크롤 동작

#### 4-3. TripHeroCard 컴포넌트 신규 — 규모: L
- 파일: `app/src/components/home/TripHeroCard.tsx` (신규)
- 역할: 다가오는/진행 중 여행을 크게 표시하는 히어로 카드
- Props: `{ trip: TripSummary, packingProgress?: {...} }`
- 디자인:
  - 그라데이션 배경 (primary-50 -> white)
  - D-day 뱃지 (좌상단)
  - 여행 제목 (큰 폰트, Playfair Display for display font)
  - 날짜 + 인원
  - 준비물 진행률 바
  - 클릭 -> 여행 상세로 이동
  - 반지름: `rounded-2xl` (20px)
  - 그림자: `shadow-lg`
- 완료 조건: 카드 렌더링, 클릭 네비게이션 동작

#### 4-4. TripCard 수정 (수평 스크롤 대응) — 규모: M
- 파일: `app/src/components/home/TripCard.tsx`
- 변경:
  - 세로 리스트형 -> 수직 카드형 (고정 너비, 세로 레이아웃)
  - `min-w-[200px]` 또는 `w-[220px]` 고정
  - 이니셜 아이콘 상단, 아래에 제목/날짜
  - chevron 제거
  - `scroll-snap-align: start` 추가
- 완료 조건: 수평 스크롤 내에서 카드가 올바르게 표시

#### 4-5. page.tsx (홈) 리디자인 — 규모: L
- 파일: `app/src/app/page.tsx`
- 변경:
  - `groupTrips()` 함수로 여행 그룹핑
  - 레이아웃 구조:
    ```
    Header
    인사말 (기존 유지, 부제 변경)

    [ongoing이 있으면]
      TripHeroCard (ongoing[0])
    [없으면 upcoming이 있으면]
      TripHeroCard (upcoming[0])

    [upcoming 섹션] "다가오는 여행 (N)"
      HorizontalScroll > TripCard[]

    [past 섹션] "지난 여행 (N)"
      HorizontalScroll > TripCard[]
    ```
  - 히어로 카드에 표시된 여행은 아래 리스트에서 제외
  - 여행이 0개일 때 EmptyState 표시
  - NewTripButton 위치 조정 (섹션 헤더 옆)
- 완료 조건: 그룹별 표시, 히어로 카드, 수평 스크롤 동작

#### 4-6. EmptyState 컴포넌트 신규 — 규모: S
- 파일: `app/src/components/shared/EmptyState.tsx` (신규)
- Props: `{ icon: string, title: string, description: string, action?: ReactNode }`
- 용도: 여행 없을 때, 각 탭 데이터 없을 때 재사용
- 완료 조건: 빈 상태 화면 표시

#### 4-7. Header.tsx에서 채팅 버튼 제거 — 규모: S
- 파일: `app/src/components/layout/Header.tsx`
- 변경: `!showBack` 조건의 채팅 버튼(SVG) 제거 (Phase 5에서 FAB로 대체)
- 완료 조건: Header에 채팅 관련 코드 없음

### Phase 4 완료 조건 (DoD)
- [ ] `npm run build` 성공
- [ ] 홈 화면: 히어로 카드 + 수평 스크롤 카드 리스트
- [ ] 여행 그룹핑(다가오는/지난) 정확
- [ ] 빈 상태 표시 동작
- [ ] 모바일(640px 이하)에서 수평 스크롤 터치 동작
- [ ] 기존 여행 상세 진입 정상

### Phase 4 위험
- **보통**: 수평 스크롤 카드의 터치 스크롤 UX가 매끄럽지 않을 수 있음
  - 대응: CSS `scroll-snap-type: x mandatory` + `-webkit-overflow-scrolling: touch` 적용
- **낮음**: 여행이 1개뿐일 때 히어로 카드만 표시되고 리스트 섹션이 비어 보일 수 있음
  - 대응: 여행 1개 = 히어로만 표시, 하단 섹션은 렌더링하지 않음

---

## Phase 5: AI 드로어 통합 (2-3일)

### 목표
별도 `/chat` 페이지를 제거하고, 모든 페이지에서 접근 가능한 플로팅 버튼 + 드로어 패널로 대체한다.

### 작업 목록

#### 5-1. AIFloatingButton 컴포넌트 신규 — 규모: M
- 파일: `app/src/components/ai/AIFloatingButton.tsx` (신규)
- 역할: 우하단 플로팅 액션 버튼 (FAB)
- 디자인:
  - 위치: `fixed bottom-6 right-6`
  - 크기: `w-14 h-14`
  - 배경: Primary gradient
  - 아이콘: 채팅 아이콘 (또는 AI 로봇 아이콘)
  - 그림자: `shadow-float`
  - 반지름: `rounded-full`
  - 애니메이션: hover시 scale-up, 드로어 열림시 X 아이콘으로 전환
- Props: `{ isOpen: boolean, onClick: () => void }`
- 완료 조건: 버튼 렌더링, 클릭 이벤트

#### 5-2. AIDrawer 컴포넌트 신규 — 규모: XL
- 파일: `app/src/components/ai/AIDrawer.tsx` (신규)
- 역할: 오른쪽에서 슬라이드 인/아웃하는 채팅 드로어
- 구현:
  - 모바일 (< 640px): 풀스크린
  - 데스크탑 (>= 640px): 오른쪽 사이드 패널 (width: 400px)
  - 오버레이 (클릭시 닫기)
  - 슬라이드 애니메이션 (`transform: translateX`)
  - 내부에 기존 `ChatContainer` 재사용
  - 헤더: "AI Travel Planner" + 닫기 버튼
- Props: `{ isOpen: boolean, onClose: () => void, mode?: 'create' | 'edit', tripId?: string }`
- 상태 관리: 드로어 열림/닫힘은 부모에서 관리 (useState 또는 zustand)
- 완료 조건: 열림/닫힘 애니메이션, 채팅 기능 동작

#### 5-3. AIDrawerProvider 또는 레이아웃 통합 — 규모: M
- 파일: `app/src/app/layout.tsx` 또는 새로운 Provider
- 변경:
  - FAB + Drawer를 layout 레벨에 배치 (모든 페이지에서 접근)
  - 드로어 상태 관리 방법 결정:
    - **옵션 A**: zustand store에 `isAIDrawerOpen` 추가 -> 어디서든 열기 가능
    - **옵션 B**: layout에서 useState + context -> 하위 컴포넌트에서 접근
  - **권장**: zustand (`useUIStore` 신규 또는 기존 store 확장)
- 파일 (신규 store): `app/src/stores/useUIStore.ts`
  ```typescript
  interface UIState {
    isAIDrawerOpen: boolean;
    aiDrawerMode: 'create' | 'edit';
    aiDrawerTripId?: string;
    openAIDrawer: (mode?: 'create' | 'edit', tripId?: string) => void;
    closeAIDrawer: () => void;
  }
  ```
- 완료 조건: FAB 클릭 -> 드로어 열림, 모든 페이지에서 동작

#### 5-4. 기존 채팅 참조 변경 — 규모: M
- 변경 대상:
  - `app/src/components/home/NewTripButton.tsx`: `router.push('/chat')` -> `openAIDrawer('create')`
  - `app/src/components/viewer/HeroSection.tsx`: `onEdit` -> `openAIDrawer('edit', trip.id)`
  - `app/src/app/page.tsx`: 채팅 관련 로직 제거 (이미 Phase 4에서 Header 버튼 제거)
- 완료 조건: `/chat` 페이지로의 라우터 이동 0건

#### 5-5. /chat 페이지 삭제 — 규모: S
- 삭제: `app/src/app/chat/page.tsx`
- 삭제: `app/src/app/chat/` 폴더
- **주의**: `app/src/components/chat/` 폴더는 유지 (ChatContainer, ChatMessage 등은 AIDrawer에서 사용)
- 완료 조건: `/chat` 라우트 접근 시 404

#### 5-6. ChatContainer 수정 (드로어 모드 대응) — 규모: M
- 파일: `app/src/components/chat/ChatContainer.tsx`
- 변경:
  - 드로어 내에서 동작하도록 높이 조정 (h-full)
  - Header 제거 (드로어 자체 헤더 사용)
  - 여행 생성 완료 시 드로어 닫기 + 여행 상세로 이동 (콜백 추가)
- Props 추가: `{ onTripCreated?: (tripId: string) => void }`
- 완료 조건: 드로어 내에서 채팅 → 여행 생성 → 자동 이동

### Phase 5 완료 조건 (DoD)
- [ ] `npm run build` 성공
- [ ] FAB 버튼이 모든 페이지(홈, 여행 상세)에서 표시
- [ ] FAB 클릭 -> 드로어 열림, 채팅 가능
- [ ] 여행 생성 완료 -> 드로어 닫힘 + 여행 상세 이동
- [ ] "새 여행" 버튼 -> FAB 드로어 열림
- [ ] HeroSection "AI로 수정하기" -> FAB 드로어 열림 (편집 모드)
- [ ] `/chat` 페이지 404
- [ ] 모바일: 드로어 풀스크린, 데스크탑: 사이드 패널 400px

### Phase 5 위험
- **높음**: ChatContainer가 별도 페이지에서만 동작하도록 설계되어 있어, 드로어(오버레이) 안에서 높이/스크롤 이슈 발생 가능
  - 대응: ChatContainer의 `h-full` + `flex flex-col` 구조 확인, 드로어 내부에 `h-full` 전파
- **보통**: 여행 생성 완료 후 useChatStore의 generatedTrip 상태 관리
  - 대응: 드로어 닫을 때 chat store reset 함수 호출
- **보통**: 드로어 열린 상태에서 뒤로가기(브라우저 back) 처리
  - 대응: `popstate` 이벤트 리스너로 드로어 닫기 처리

---

## Phase 6: 전체 컴포넌트 스타일 리디자인 (3-5일)

### 목표
모든 컴포넌트에 Trip.com 스타일의 세련된 UI를 적용한다. Phase 2에서 정의한 디자인 토큰을 활용.

### 작업 목록

#### 6-1. Header 리디자인 — 규모: M
- 파일: `app/src/components/layout/Header.tsx`
- 변경:
  - 배경: 흰색 -> `bg-white/80 backdrop-blur-xl` (더 투명한 글래스)
  - 타이틀: "My Journey" -> Playfair Display (`font-display`)
  - 하단 보더: 더 연하게 (`border-border-light`)
  - 뒤로가기 아이콘: HTML entity -> lucide-react `ArrowLeft`
  - 높이/패딩 미세 조정
- 완료 조건: 시각적으로 개선된 헤더

#### 6-2. HeroSection 리디자인 — 규모: M
- 파일: `app/src/components/viewer/HeroSection.tsx`
- 변경:
  - 제목 폰트: `font-display` (Playfair Display)
  - 그라데이션: `from-primary-50 to-white` -> 더 미묘한 그라데이션
  - 뱃지 스타일: 더 둥근 모서리, 그림자
  - 태그 뱃지: secondary 색상 활용 (틸)
  - "AI로 수정하기" 버튼 제거 (FAB로 대체, Phase 5)
  - 공유하기 버튼 디자인 개선
- 완료 조건: Trip.com 스타일의 히어로 영역

#### 6-3. TabBar 리디자인 — 규모: M
- 파일: `app/src/components/viewer/TabBar.tsx`
- 변경:
  - 아이콘을 lucide-react로 교체 (이모지 -> SVG)
  - 활성 탭 인디케이터: underline -> pill 배경 또는 dot
  - 글래스 배경 강화
  - 4탭이므로 균등 분배 (`justify-around`)
- 완료 조건: 시각적으로 개선된 탭바

#### 6-4. SummaryTab (기존 OverviewTab) 리디자인 — 규모: L
- 파일: `app/src/components/viewer/tabs/SummaryTab.tsx`
- 변경:
  - 항공편 카드: 출발/도착을 시각적 경로(airplane icon + dashed line)로 표현
  - 숙소 카드: 아이콘 + 메타정보 카드
  - 날씨: 기존 수평 스크롤 유지, 카드 디자인 개선
  - 일정 요약: Day 카드 그리드 유지, 카드 디자인 개선
  - 팁: 아이콘 + 배경색 변경
- 완료 조건: 모든 섹션 시각적 개선

#### 6-5. ScheduleTab 리디자인 — 규모: M
- 파일: `app/src/components/viewer/tabs/ScheduleTab.tsx`
- 파일: `app/src/components/viewer/schedule/DayCard.tsx`
- 변경:
  - 타임라인 도트/라인 스타일 개선
  - 카테고리별 색상 토큰 적용 (`--color-cat-*`)
  - 지도 토글 버튼 디자인
  - 시간 표시 형식 개선
- 완료 조건: 타임라인 시각적 개선

#### 6-6. GuideTab 스타일 적용 — 규모: M
- 파일: `app/src/components/viewer/tabs/GuideTab.tsx`
- 변경:
  - Accordion 헤더: 카테고리 아이콘 + 색상 인디케이터
  - 맛집 카드: 평점 별, 가격 뱃지, 카테고리 뱃지
  - 교통 카드: 경로 시각화 (출발 -> 도착)
  - 예산 카드: 프로그레스 바 + 퍼센트
  - 전체적으로 카테고리 색상(cat-food, cat-transport 등) 활용
- 완료 조건: 3개 서브섹션 모두 스타일 적용

#### 6-7. ChecklistTab 스타일 적용 — 규모: M
- 파일: `app/src/components/viewer/tabs/ChecklistTab.tsx`
- 변경:
  - 진행률 바: primary 그라데이션
  - 체크박스: primary 색상으로 체크
  - 카테고리별 아이콘 + 뱃지
  - 사전 할 일: 번호 + 설명 카드
- 완료 조건: 체크리스트 시각적 개선

#### 6-8. TripCard 스타일 적용 — 규모: S
- 파일: `app/src/components/home/TripCard.tsx`
- 변경:
  - 수직 카드 레이아웃 (Phase 4에서 구조 변경, 여기서 스타일 다듬기)
  - 그림자: hover시 `shadow-lg`
  - 이미지/아이콘 영역 비율
  - 뱃지 위치 조정
- 완료 조건: Trip.com 스타일 카드

#### 6-9. Shared 컴포넌트 스타일 통일 — 규모: M
- 파일들:
  - `app/src/components/viewer/shared/SectionTitle.tsx`
  - `app/src/components/viewer/shared/InfoCard.tsx`
  - `app/src/components/viewer/shared/InfoGrid.tsx`
  - `app/src/components/viewer/shared/Tip.tsx`
- 변경:
  - SectionTitle: 아이콘 배경색 토큰 적용, 폰트 크기 조정
  - InfoCard: 테두리/반지름/패딩 토큰 적용
  - Tip: 배경색/아이콘 개선
- 완료 조건: 디자인 토큰 기반 일관된 스타일

#### 6-10. SplashScreen 스타일 업데이트 — 규모: S
- 파일: `app/src/components/layout/SplashScreen.tsx`
- 변경: 브랜드 색상 토큰 적용, Display 폰트 적용
- 완료 조건: 스플래시 화면 브랜드 일관성

#### 6-11. globals.css 애니메이션 정리 — 규모: S
- 파일: `app/src/app/globals.css`
- 변경:
  - 드로어 슬라이드 애니메이션 추가 (Phase 5용)
  - 기존 애니메이션 유지
  - 불필요한 스타일 정리
- 완료 조건: 모든 애니메이션 정상 동작

### Phase 6 완료 조건 (DoD)
- [ ] `npm run build` 성공
- [ ] 모든 컴포넌트에서 디자인 토큰 사용 (하드코딩 색상값 최소화)
- [ ] Playfair Display가 적절한 위치(히어로, 헤더)에 사용됨
- [ ] 모바일(640px 이하) + 데스크탑 반응형 정상
- [ ] 다크 모드 준비: oklch 토큰 정합성 확인 (실제 토글은 미구현)

### Phase 6 위험
- **보통**: 스타일 변경이 많아 예상치 못한 레이아웃 깨짐 가능
  - 대응: 컴포넌트 하나씩 순차적으로 변경, 각 변경 후 빌드 확인
- **낮음**: Playfair Display와 Noto Sans KR 혼용 시 수직 정렬 불일치
  - 대응: line-height 명시적 설정

---

## 전체 파일 변경 요약

### 삭제 파일 (6개)
| 파일 | Phase |
|------|-------|
| `app/src/lib/capacitor.ts` | 1 |
| `app/src/components/CapacitorInit.tsx` | 1 |
| `app/capacitor.config.ts` | 1 |
| `app/ios/` (로컬) | 1 |
| `app/src/app/chat/page.tsx` | 5 |
| `app/src/components/viewer/tabs/OverviewTab.tsx` | 3 (리네이밍) |

### 신규 파일 (9개)
| 파일 | Phase | 역할 |
|------|-------|------|
| `app/src/components/viewer/tabs/SummaryTab.tsx` | 3 | 요약 탭 (OverviewTab 리네이밍) |
| `app/src/components/viewer/tabs/GuideTab.tsx` | 3 | 가이드 탭 (맛집+교통+예산) |
| `app/src/components/viewer/tabs/ChecklistTab.tsx` | 3 | 체크리스트 탭 (준비물+사전준비) |
| `app/src/components/shared/HorizontalScroll.tsx` | 4 | 수평 스크롤 컨테이너 |
| `app/src/components/home/TripHeroCard.tsx` | 4 | 홈 히어로 카드 |
| `app/src/components/shared/EmptyState.tsx` | 4 | 빈 상태 표시 |
| `app/src/components/ai/AIFloatingButton.tsx` | 5 | 플로팅 AI 버튼 |
| `app/src/components/ai/AIDrawer.tsx` | 5 | AI 채팅 드로어 |
| `app/src/stores/useUIStore.ts` | 5 | UI 상태 관리 |

### 수정 파일 (주요, ~20개)
| 파일 | Phase | 변경 내용 |
|------|-------|----------|
| `app/package.json` | 1 | Capacitor 패키지 제거 |
| `app/src/app/layout.tsx` | 1,2,5 | CapacitorInit 제거, Playfair 추가, FAB+Drawer 배치 |
| `app/src/components/layout/Header.tsx` | 1,4,6 | Safe Area 제거, 채팅 버튼 제거, 스타일 개선 |
| `app/src/components/viewer/TabBar.tsx` | 1,3,6 | Safe Area 제거, 4탭, 스타일 개선 |
| `app/src/components/viewer/HeroSection.tsx` | 1,5,6 | Safe Area 제거, AI 버튼 변경, 스타일 개선 |
| `app/src/lib/map-utils.ts` | 1 | Capacitor 제거, 웹 전용 |
| `app/src/app/globals.css` | 2,6 | 토큰 재구성, 애니메이션 추가 |
| `app/src/lib/constants.ts` | 3 | 7탭 -> 4탭 |
| `app/src/components/viewer/TripViewer.tsx` | 3 | 4탭 반영 |
| `app/src/app/page.tsx` | 4 | 홈 리디자인 |
| `app/src/components/home/TripCard.tsx` | 4,6 | 수직 카드형, 스타일 |
| `app/src/components/home/NewTripButton.tsx` | 5 | /chat -> openAIDrawer |
| `app/src/lib/trip-utils.ts` | 4 | groupTrips 추가 |
| `app/src/components/chat/ChatContainer.tsx` | 5 | 드로어 모드 대응 |
| `app/src/stores/useChatStore.ts` | 5 | reset 함수 추가 |
| `app/src/components/viewer/tabs/*.tsx` (5개) | 3 | Section 리네이밍 |
| `app/src/components/viewer/shared/*.tsx` (4개) | 6 | 스타일 토큰 적용 |
| `app/src/components/layout/SplashScreen.tsx` | 6 | 브랜드 컬러 적용 |
| 기타 `app/src/` 전체 | 2 | 토큰 리네이밍 |

### 리네이밍 파일 (5개, Phase 3)
| AS-IS | TO-BE |
|-------|-------|
| `RestaurantTab.tsx` | `RestaurantSection.tsx` |
| `TransportTab.tsx` | `TransportSection.tsx` |
| `BudgetTab.tsx` | `BudgetSection.tsx` |
| `PackingTab.tsx` | `PackingSection.tsx` |
| `PreTodoTab.tsx` | `PreTodoSection.tsx` |

---

## CLAUDE.md 업데이트 필요 사항

Phase 완료 후 `CLAUDE.md`를 업데이트해야 하는 항목:

| Phase | 변경 사항 |
|-------|----------|
| Phase 2 | 색상 체계 섹션: accent -> primary, 신규 secondary(틸) 추가, trip-* -> cat-* |
| Phase 3 | "7탭 구조" -> "4탭 구조" 전체 변경 |
| Phase 3 | 탭 목록 변경 (요약/일정/가이드/체크리스트) |
| Phase 2 | 폰트: `--font-display` -> Playfair Display 반영 |
| Phase 6 | 타임라인 아이템 분류: `--color-accent` -> `--color-primary` 등 |

---

## 타임라인 요약

| Phase | 소요 | 핵심 산출물 | 배포 가능 |
|-------|------|-----------|----------|
| 1. Capacitor 제거 | 1일 | 클린 웹 전용 앱 | O |
| 2. 디자인 토큰 | 1-2일 | 체계적 토큰 시스템 | O (시각 동일) |
| 3. 4탭 재구성 | 2-3일 | GuideTab, ChecklistTab | O |
| 4. 홈 리디자인 | 2-3일 | 히어로 카드, 수평 스크롤 | O |
| 5. AI 드로어 | 2-3일 | FAB + Drawer, /chat 제거 | O |
| 6. 스타일 리디자인 | 3-5일 | Trip.com 스타일 전체 적용 | O |

**총 소요: 약 11-17일 (2-3주)**

---

## 구현 순서 의존성 다이어그램

```
Phase 1 (Capacitor 제거)
    ↓
Phase 2 (디자인 토큰) ←── 반드시 선행
    ↓
Phase 3 (4탭)        Phase 4 (홈)        Phase 5 (AI 드로어)
    ↓                    ↓                    ↓
    └────────────────────┴────────────────────┘
                         ↓
                   Phase 6 (전체 스타일)
```

- Phase 1 -> Phase 2: 필수 순서 (Capacitor 제거 후 토큰 정리)
- Phase 2 -> Phase 3/4/5: 토큰이 정리된 후 병렬 가능하지만, **순차 권장** (충돌 방지)
- Phase 3/4/5 -> Phase 6: 모든 구조 변경 완료 후 스타일 적용

---

## 주요 위험 종합

| 위험 | 등급 | Phase | 대응 |
|------|------|-------|------|
| 토큰 리네이밍 누락 | 높음 | 2 | `grep -r` 전수 검사, 빌드 확인 |
| ChatContainer 드로어 높이 이슈 | 높음 | 5 | flex 레이아웃 테스트, overflow 확인 |
| shadcn `text-primary` 토큰 충돌 | 보통 | 2 | Tailwind v4 `@theme` 우선 규칙 확인 |
| 기존 탭 로직 통합 복잡도 | 보통 | 3 | Section 컴포넌트 재사용 방식 채택 |
| 수평 스크롤 터치 UX | 보통 | 4 | scroll-snap + 터치 테스트 |
| 드로어 브라우저 뒤로가기 | 보통 | 5 | popstate 이벤트 처리 |
| 스타일 변경에 의한 레이아웃 깨짐 | 보통 | 6 | 컴포넌트별 순차 변경 |
