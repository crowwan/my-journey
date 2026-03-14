# My Journey Design System

> 모든 UI 구현 작업 시 반드시 참조하는 디자인 시스템 레퍼런스.
> 최종 수정일: 2026-03-14

---

## 1. Brand Identity

| 항목 | 값 |
|------|-----|
| **앱 이름** | My Journey |
| **목적** | 개인 여행 계획/일정 관리 웹 앱 |
| **톤앤매너** | 따뜻하고 신뢰감 있는, 여행의 설렘을 전달하는 |
| **디자인 철학** | Trip.com 스타일의 깔끔한 정보 구조 + 개인 여행 계획에 최적화된 UX |
| **핵심 키워드** | 직관적, 따뜻한, 깔끔한, 여행 친화적 |

---

## 2. Color System

### 2-1. Brand Colors

#### Primary - Orange

메인 브랜드 컬러. CTA 버튼, 강조 UI, 활성 탭, 기본 타임라인 점에 사용.

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-primary-50` | `#fff7ed` | `bg-primary-50` | 버튼 배경 (soft), 알림 배경 |
| `--color-primary-100` | `#ffedd5` | `bg-primary-100` | hover 배경 (soft) |
| `--color-primary-200` | `#fed7aa` | `bg-primary-200` | 진행률 바 배경 |
| `--color-primary-300` | `#fdba74` | `bg-primary-300` | 비활성 아이콘 |
| `--color-primary-400` | `#fb923c` | `bg-primary-400` | 보조 강조 |
| `--color-primary-500` | `#f97316` | `bg-primary-500` | **기본값 (Primary)** |
| `--color-primary-600` | `#ea580c` | `bg-primary-600` | hover 상태 |
| `--color-primary-700` | `#c2410c` | `bg-primary-700` | active/pressed 상태 |
| `--color-primary-800` | `#9a3412` | `bg-primary-800` | 진한 텍스트 |
| `--color-primary-900` | `#7c2d12` | `bg-primary-900` | 매우 진한 배경 |

#### Secondary - Teal

보조 브랜드 컬러. 보조 CTA, 링크, Secondary 버튼, 정보성 강조에 사용.

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-secondary-50` | `#f0fdfa` | `bg-secondary-50` | 정보 배경 |
| `--color-secondary-100` | `#ccfbf1` | `bg-secondary-100` | hover 배경 (soft) |
| `--color-secondary-200` | `#99f6e4` | `bg-secondary-200` | 태그 배경 |
| `--color-secondary-300` | `#5eead4` | `bg-secondary-300` | 보조 아이콘 |
| `--color-secondary-400` | `#2dd4bf` | `bg-secondary-400` | 보조 강조 |
| `--color-secondary-500` | `#14b8a6` | `bg-secondary-500` | 보조 기본 |
| `--color-secondary-600` | `#0d9488` | `bg-secondary-600` | **기본값 (Secondary)** |
| `--color-secondary-700` | `#0f766e` | `bg-secondary-700` | hover 상태 |
| `--color-secondary-800` | `#115e59` | `bg-secondary-800` | active/pressed 상태 |
| `--color-secondary-900` | `#134e4a` | `bg-secondary-900` | 진한 배경 |

### 2-2. Semantic Colors

#### Backgrounds

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-bg` | `#ffffff` | `bg-bg` | 페이지 배경 |
| `--color-bg-secondary` | `#f9fafb` | `bg-bg-secondary` | 섹션 배경 (gray-50) |
| `--color-bg-tertiary` | `#f3f4f6` | `bg-bg-tertiary` | 입력 필드 배경 (gray-100) |

#### Surfaces (카드, 패널)

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-surface` | `#ffffff` | `bg-surface` | 카드 배경 |
| `--color-surface-hover` | `#f9fafb` | `bg-surface-hover` | 카드 hover |

#### Text

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-text-primary` | `#111827` | `text-text-primary` | 본문, 제목 (gray-900) |
| `--color-text-secondary` | `#6b7280` | `text-text-secondary` | 보조 텍스트, 설명 (gray-500) |
| `--color-text-tertiary` | `#9ca3af` | `text-text-tertiary` | 힌트, 비활성 (gray-400) |
| `--color-text-inverse` | `#ffffff` | `text-text-inverse` | 어두운 배경 위 텍스트 |

#### Border

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-border` | `#e5e7eb` | `border-border` | 기본 테두리 (gray-200) |
| `--color-border-light` | `#f3f4f6` | `border-border-light` | 연한 구분선 (gray-100) |

#### Status

| Token | Hex | Tailwind | 용도 |
|-------|-----|----------|------|
| `--color-success` | `#10b981` | `text-success` | 완료, 성공 |
| `--color-warning` | `#f59e0b` | `text-warning` | 주의, 경고 |
| `--color-error` | `#ef4444` | `text-error` | 에러, 삭제 |
| `--color-info` | `#3b82f6` | `text-info` | 정보, 안내 |

### 2-3. Category Colors

여행 활동 유형을 구분하는 색상. 타임라인 점, 뱃지, 아이콘에 사용.

| Token | Hex | Tailwind | 카테고리 | 사용 예시 |
|-------|-----|----------|---------|----------|
| `--color-cat-sightseeing` | `#10b981` | `text-cat-sightseeing` | 관광 | 타임라인 `.spot`, 지도 마커 |
| `--color-cat-food` | `#ec4899` | `text-cat-food` | 식사 | 타임라인 `.food`, 맛집 뱃지 |
| `--color-cat-transport` | `#3b82f6` | `text-cat-transport` | 교통 | 타임라인 `.move`, 노선 표시 |
| `--color-cat-accommodation` | `#8b5cf6` | `text-cat-accommodation` | 숙소 | 숙소 카드, 뱃지 |
| `--color-cat-shopping` | `#f59e0b` | `text-cat-shopping` | 쇼핑 | 쇼핑 스팟 표시 |
| `--color-cat-activity` | `#06b6d4` | `text-cat-activity` | 액티비티 | 체험, 날씨 관련 |

**카테고리 뱃지 패턴**: `bg-cat-{name}/10 text-cat-{name}` (10% 배경 + 원색 텍스트)

### 2-4. Overlay Colors

| Token | 값 | 용도 |
|-------|----|------|
| `--color-overlay-light` | `rgba(0,0,0,0.04)` | 카드 위 미세 오버레이 |
| `--color-overlay-dark` | `rgba(0,0,0,0.5)` | 모달/드로어 백드롭 |

### 2-5. Day Colors (지도 마커/경로)

Day별 순환 색상. `getDayColor(dayNumber)` 함수로 접근.

| Day | Hex | 이름 |
|-----|-----|------|
| 1 | `#f97316` | Orange |
| 2 | `#6366f1` | Indigo |
| 3 | `#10b981` | Emerald |
| 4 | `#a78bfa` | Purple |
| 5 | `#f472b6` | Pink |

5일 초과 시 순환 (Day 6 = Day 1 색상).

---

## 3. Typography

### 3-1. Font Family

| Token | 값 | 용도 |
|-------|----|------|
| `--font-sans` | `'Noto Sans KR', system-ui, sans-serif` | 본문, 일반 UI 전체 |
| `--font-display` | `'Playfair Display', serif` | 히어로 섹션 제목만 |

**CDN 로드** (layout.tsx의 Google Fonts):
```
Noto Sans KR: 300, 400, 500, 600, 700, 900
Playfair Display: 400, 700
```

### 3-2. Size Scale

Tailwind 기본 스케일을 그대로 사용. 별도 커스텀 변수 불필요.

| Tailwind | rem | px | 용도 |
|----------|-----|----|------|
| `text-xs` | 0.75 | 12 | 캡션, 메타 정보, 뱃지 |
| `text-sm` | 0.875 | 14 | 보조 텍스트, 설명, 리스트 |
| `text-base` | 1 | 16 | 본문 기본 |
| `text-lg` | 1.125 | 18 | 소제목, 강조 텍스트 |
| `text-xl` | 1.25 | 20 | 섹션 제목 |
| `text-2xl` | 1.5 | 24 | 페이지 제목, 카드 제목 |
| `text-3xl` | 1.875 | 30 | 히어로 부제 |
| `text-4xl` | 2.25 | 36 | 히어로 메인 제목 |

### 3-3. Weight Scale

| Tailwind | Weight | 용도 |
|----------|--------|------|
| `font-light` | 300 | 히어로 부제, 인사말 |
| `font-normal` | 400 | 본문 기본 |
| `font-medium` | 500 | 뱃지, 탭 라벨, 소제목 |
| `font-semibold` | 600 | 카드 제목, 섹션 제목 |
| `font-bold` | 700 | 페이지 제목, 강조 숫자 |
| `font-black` | 900 | 히어로 메인 제목 (드물게) |

### 3-4. Typography Usage Guide

```
히어로 메인 제목:  font-display text-4xl font-bold
히어로 부제:       text-lg font-light text-text-secondary
페이지 제목:       text-2xl font-bold
섹션 제목:         text-xl font-semibold
카드 제목:         text-lg font-semibold
본문:              text-base font-normal
보조 설명:         text-sm text-text-secondary
캡션/메타:         text-xs text-text-tertiary
뱃지 텍스트:       text-xs font-medium
탭 라벨:           text-sm font-medium
버튼 텍스트:       text-sm font-medium
```

### 3-5. Line Height

- **글로벌 body**: `line-height: 1.7` (globals.css)
- **컴팩트 요소**: `leading-none` 또는 `leading-tight` (카드 제목, 뱃지)
- **설명 텍스트**: `leading-relaxed`

---

## 4. Spacing & Layout

### 4-1. Spacing System

Tailwind 기본 4px 단위. 별도 커스텀 불필요.

| Tailwind | px | 용도 |
|----------|-----|------|
| `gap-1` / `p-1` | 4 | 아이콘과 텍스트 사이 |
| `gap-2` / `p-2` | 8 | 요소 내부 간격 |
| `gap-3` / `p-3` | 12 | 소형 카드 패딩 |
| `gap-4` / `p-4` | 16 | 기본 간격, 리스트 아이템 |
| `gap-5` / `p-5` | 20 | 페이지 좌우 패딩 (모바일) |
| `gap-6` / `p-6` | 24 | 카드 패딩, 섹션 내부 |
| `gap-8` / `p-8` | 32 | 섹션 간 간격, 데스크탑 패딩 |
| `gap-10` / `p-10` | 40 | 대형 간격 |
| `gap-12` / `p-12` | 48 | 페이지 상하 마진 |

### 4-2. Page Layout

| Token | 값 | 설명 |
|-------|----|------|
| `--max-width` | `1100px` | 콘텐츠 최대 너비 |
| `--page-px` | `20px` | 모바일 좌우 패딩 |
| `--page-px-lg` | `32px` | 데스크탑 좌우 패딩 |

**자주 쓰는 레이아웃 패턴**:

```
페이지 컨테이너:  max-w-[1100px] mx-auto px-5 sm:px-8
섹션 간격:        py-8 또는 space-y-8
카드 패딩:        p-6
카드 내부 간격:   space-y-4 또는 gap-4
리스트 아이템:    py-4 border-b border-border-light
```

---

## 5. Border Radius & Shadow

### 5-1. Border Radius

| Token | 값 | Tailwind | 용도 |
|-------|----|----------|------|
| `--radius-sm` | `6px` | `rounded-sm` | 뱃지, 태그, 작은 칩 |
| `--radius-md` | `8px` | `rounded-md` | 버튼, 입력 필드 |
| `--radius-lg` | `12px` | `rounded-lg` | 작은 카드, 드롭다운 |
| `--radius-xl` | `16px` | `rounded-xl` | 기본 카드, 패널 |
| `--radius-2xl` | `20px` | `rounded-2xl` | 히어로 카드, 모달 |
| `--radius-full` | `9999px` | `rounded-full` | 원형 버튼, 아바타, 필 뱃지 |

**Component-Radius Mapping:**

```
뱃지/태그:       rounded-sm (6px) 또는 rounded-full
버튼:            rounded-md (8px)
입력 필드:       rounded-md (8px)
작은 정보 카드:  rounded-lg (12px)
기본 카드:       rounded-xl (16px)
히어로 카드:     rounded-2xl (20px)
FAB/아바타:      rounded-full
```

### 5-2. Shadow

| Token | 값 | Tailwind | 용도 |
|-------|----|----------|------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | `shadow-xs` | 뱃지, 작은 요소 |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | `shadow-sm` | 기본 카드 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)` | `shadow-md` | 카드 hover, 드롭다운 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)` | `shadow-lg` | 모달, 서랍 패널 |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04)` | `shadow-xl` | 플로팅 패널 |
| `--shadow-float` | `0 8px 30px rgba(0,0,0,0.12)` | `shadow-float` | FAB, 플로팅 버튼 |

**Component-Shadow Mapping:**

```
기본 카드:       shadow-sm  ->  hover:shadow-md
히어로 카드:     shadow-md  ->  hover:shadow-lg
드롭다운 메뉴:   shadow-md
모달/드로어:     shadow-lg
FAB 버튼:        shadow-float
```

---

## 6. Component Style Guide

### 6-1. Button

shadcn/ui `Button` 기반. `class-variance-authority`로 variant 관리.

#### Variants (shadcn 기본)

| Variant | 스타일 | 용도 |
|---------|--------|------|
| **default** | `bg-primary text-primary-foreground hover:bg-primary/90` | 메인 CTA |
| **secondary** | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | 보조 액션 |
| **outline** | `border bg-background hover:bg-accent` | 취소, 보조 |
| **ghost** | `hover:bg-accent hover:text-accent-foreground` | 아이콘 버튼, 탭 내 액션 |
| **destructive** | `bg-destructive text-white hover:bg-destructive/90` | 삭제 |
| **link** | `text-primary underline-offset-4 hover:underline` | 인라인 링크 |

#### Sizes

| Size | 높이 | 패딩 | 용도 |
|------|------|------|------|
| `xs` | 24px | `px-2` | 뱃지 옆 작은 액션 |
| `sm` | 32px | `px-3` | 카드 내 액션 |
| `default` | 36px | `px-4` | 일반 버튼 |
| `lg` | 40px | `px-6` | 히어로 CTA |
| `icon` | 36x36 | - | 아이콘 전용 |
| `icon-xs` | 24x24 | - | 작은 아이콘 버튼 |
| `icon-sm` | 32x32 | - | 일반 아이콘 버튼 |

#### 프로젝트 커스텀 버튼 패턴

```
Primary CTA (브랜드):
  bg-primary-500 text-white rounded-md px-6 py-2.5
  hover:bg-primary-600 active:bg-primary-700
  transition-colors

Secondary CTA (보조):
  bg-secondary-600 text-white rounded-md px-6 py-2.5
  hover:bg-secondary-700

Soft Primary (연한 배경):
  bg-primary-50 text-primary-600 rounded-md px-4 py-2
  hover:bg-primary-100

Ghost (투명):
  text-text-secondary rounded-md px-3 py-2
  hover:bg-bg-tertiary
```

### 6-2. Card

#### 기본 카드

```
bg-surface rounded-xl shadow-sm border border-border-light p-6
hover:shadow-md transition-shadow
```

#### 히어로 카드 (홈 - 다가오는 여행)

```
relative overflow-hidden rounded-2xl shadow-md
bg-gradient-to-br from-primary-500 to-primary-600
text-white p-6 sm:p-8
```

#### 미니 카드 (수평 스크롤 아이템)

```
flex-shrink-0 w-[200px] rounded-xl shadow-sm
bg-surface border border-border-light p-4
snap-start
```

#### 정보 카드 (InfoCard)

```
bg-bg-secondary rounded-lg p-4
border border-border-light
```

**shadcn Card 주의사항**: 기본 `py-6 gap-6`이므로, 커스텀 시 `py-0 gap-0`으로 리셋 후 사용.

### 6-3. Badge

shadcn/ui `Badge` 기반. 기본 `rounded-full`.

#### 상태별 뱃지

```
D-day (다가오는):
  bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full

진행 중:
  bg-success/10 text-success text-xs font-medium px-2.5 py-0.5 rounded-full

완료:
  bg-bg-tertiary text-text-tertiary text-xs font-medium px-2.5 py-0.5 rounded-full
```

#### 카테고리 뱃지

공통 클래스: `text-xs font-medium px-2.5 py-0.5 rounded-full`

```
관광:    bg-cat-sightseeing/10 text-cat-sightseeing
식사:    bg-cat-food/10 text-cat-food
교통:    bg-cat-transport/10 text-cat-transport
숙소:    bg-cat-accommodation/10 text-cat-accommodation
쇼핑:    bg-cat-shopping/10 text-cat-shopping
액티비티: bg-cat-activity/10 text-cat-activity
```

#### 태그 (해시태그)

```
bg-bg-tertiary text-text-secondary text-xs px-2.5 py-1 rounded-sm
```

### 6-4. Tab Navigation (4탭)

```
탭 바 컨테이너:
  sticky top-0 z-40 bg-surface/95 backdrop-blur-sm
  border-b border-border-light

탭 아이템 (비활성):
  flex-1 flex flex-col items-center gap-1 py-3
  text-text-tertiary text-xs font-medium
  transition-colors

탭 아이템 (활성):
  text-primary-500
  border-b-2 border-primary-500

탭 아이콘:
  size-5 (비활성: text-text-tertiary, 활성: text-primary-500)
```

**4탭 구성**:

| 탭 | 아이콘 (lucide) | 내용 |
|----|----------------|------|
| 요약 | `Plane` | 항공편, 숙소, 날씨, 일정 미리보기, 팁 |
| 일정 | `Calendar` | Day별 타임라인 + 지도 |
| 가이드 | `Compass` | 맛집 / 교통 / 예산 (서브 섹션) |
| 체크리스트 | `CheckSquare` | 준비물 / 사전 할 일 (진행률 바) |

### 6-5. Input

```
w-full rounded-md border border-border bg-bg px-3 py-2
text-sm placeholder:text-text-tertiary
focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
transition-colors
```

### 6-6. Checkbox

```
shadcn/ui Checkbox 사용.
체크 시: bg-primary border-primary
미체크 시: border-border
라벨: text-sm, 체크 시 line-through text-text-tertiary
```

### 6-7. Progress Bar

```
배경: bg-bg-tertiary rounded-full h-2
채움: bg-primary-500 rounded-full h-2 transition-all
퍼센트 텍스트: text-xs font-medium text-text-secondary
```

### 6-8. Accordion

```
shadcn/ui Accordion 사용.
트리거: text-sm font-medium py-4 hover:no-underline
콘텐츠: pb-4 text-sm
구분선: border-b border-border-light
```

### 6-9. Timeline (CSS 전용)

타임라인은 CSS pseudo-element 기반. shadcn 미적용.

```css
.timeline          /* padding-left: 26px, 좌측 수직 라인 */
.tl-item           /* 각 아이템, mb-16px */
.tl-item::before   /* 좌측 점 (9x9, border-radius: 50%) */
.tl-item.spot      /* 초록 테두리 점 (관광) */
.tl-item.food      /* 핑크 채움 점 (식사) */
.tl-item.move      /* 파랑 채움 점 (교통) */
```

---

## 7. Icon System

### 7-1. Library

`lucide-react` 사용. 일관된 선 두께(stroke-width: 2).

### 7-2. Size

| Tailwind | px | 용도 |
|----------|-----|------|
| `size-4` | 16 | 인라인 아이콘, 버튼 내부 |
| `size-5` | 20 | 탭 아이콘, 리스트 아이콘 |
| `size-6` | 24 | 카드 아이콘, 헤더 액션 |
| `size-8` | 32 | 빈 상태, 히어로 아이콘 |

### 7-3. Tab Icon Mapping (4탭)

| 탭 | 아이콘 | import |
|----|--------|--------|
| 요약 | Plane | `import { Plane } from 'lucide-react'` |
| 일정 | Calendar | `import { Calendar } from 'lucide-react'` |
| 가이드 | Compass | `import { Compass } from 'lucide-react'` |
| 체크리스트 | CheckSquare | `import { CheckSquare } from 'lucide-react'` |

### 7-4. Category Icon Mapping

| 카테고리 | 아이콘 |
|---------|--------|
| 관광 | `Camera`, `MapPin` |
| 식사 | `UtensilsCrossed` |
| 교통 | `Train`, `Bus` |
| 숙소 | `Hotel`, `Bed` |
| 쇼핑 | `ShoppingBag` |
| 액티비티 | `Sparkles` |

### 7-5. Action Icon Mapping

| 액션 | 아이콘 |
|------|--------|
| 뒤로가기 | `ChevronLeft` |
| 닫기 | `X` |
| 공유 | `Share2` |
| 편집 | `Pencil` |
| 삭제 | `Trash2` |
| 추가 | `Plus` |
| 검색 | `Search` |
| AI 채팅 | `MessageCircle` |
| 체크 | `Check` |
| 지도 | `Map` |
| 외부 링크 | `ExternalLink` |

---

## 8. Animation & Transition

### 8-1. Transition Rules

| 유형 | 클래스 | 용도 |
|------|--------|------|
| 색상 변경 | `transition-colors duration-200` | 버튼 hover, 텍스트 |
| 그림자 변경 | `transition-shadow duration-200` | 카드 hover |
| 전체 | `transition-all duration-300` | 크기+색상+위치 동시 |
| 투명도 | `transition-opacity duration-200` | 페이드 인/아웃 |

**기본 원칙**: `duration-200` (빠른 피드백), 복잡한 전환은 `duration-300`.

### 8-2. Keyframe Animations

| 이름 | 클래스 | Duration | 용도 |
|------|--------|----------|------|
| `fadeUp` | `animate-fade-up` | 0.5s ease-out | 페이지 진입 요소 등장 |
| `staggerReveal` | `animate-stagger-reveal` | 0.5s ease-out forwards | 리스트 순차 등장 (animationDelay 필요) |
| `shimmer` | `animate-shimmer` | 3s linear infinite | 스켈레톤 로딩 |

**staggerReveal 사용 예시**:
```tsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-stagger-reveal"
    style={{ animationDelay: `${i * 0.1}s` }}
  >
    ...
  </div>
))}
```

### 8-3. 인터랙션 패턴

```
카드 hover:     hover:-translate-y-0.5 transition-all duration-300
버튼 active:    active:scale-[0.98]
카드 press:     active:scale-[0.98]
```

---

## 9. Responsive Rules

### 9-1. Breakpoint

단일 브레이크포인트만 사용.

| Breakpoint | 값 | Tailwind | 설명 |
|------------|-----|---------|------|
| 모바일 (기본) | `< 640px` | 프리픽스 없음 | 모바일 퍼스트 |
| Small+ | `>= 640px` | `sm:` | 데스크탑/태블릿 |

**`md:`, `lg:`, `xl:` 사용 금지** - 단일 브레이크포인트로 통일.

### 9-2. 모바일 vs 데스크탑

| 요소 | 모바일 (기본) | 데스크탑 (`sm:`) |
|------|-------------|----------------|
| 페이지 패딩 | `px-5` (20px) | `sm:px-8` (32px) |
| 히어로 카드 패딩 | `p-6` | `sm:p-8` |
| 카드 그리드 | 1열 | `sm:grid-cols-2` |
| 수평 스크롤 | 터치 스크롤 | 마우스 드래그 + 화살표 |
| AI 드로어 | 풀스크린 슬라이드 | 사이드 패널 (400px) |
| 히어로 제목 | `text-4xl` | `sm:text-5xl` |

### 9-3. Touch Target

모바일 터치 타겟 최소: **44px x 44px** (`min-h-11 min-w-11`)

버튼, 탭, 체크박스 등 모든 인터랙티브 요소에 적용. padding으로 터치 영역 확보 가능.

---

## 10. Z-Index Layers

| 레이어 | z-index | 용도 |
|--------|---------|------|
| FAB | `z-30` | 플로팅 액션 버튼 |
| Sticky 헤더/탭 | `z-40` | Header, TabBar |
| Overlay/Backdrop | `z-50` | 드로어 백드롭 |
| Drawer/Modal | `z-50` | AI 드로어, 모달 |
| Toast | `z-[100]` | 토스트 알림 (필요시) |

---

## 11. DO / DON'T

### DO

- 디자인 토큰(CSS 변수)을 통해 색상 참조 (`bg-primary-500`, `text-text-secondary`)
- Tailwind 유틸리티 클래스 우선 (커스텀 CSS는 pseudo-element 등 불가피한 경우만)
- 컴포넌트 간격은 부모에서 `gap` / `space-y`로 제어
- 반응형은 모바일 퍼스트 + `sm:` 프리픽스
- `transition` 클래스를 인터랙티브 요소에 항상 포함
- shadcn/ui 컴포넌트를 기반으로 확장 (Button, Badge, Card 등)
- 카테고리 색상은 `--color-cat-*` 토큰만 사용
- 아이콘은 `lucide-react`에서만 가져오기
- `font-display`는 히어로 제목에만 사용

### DON'T

- 하드코딩 색상값 (`bg-[#f97316]` 대신 `bg-primary-500`)
- 임의 스페이싱 (`p-[13px]` 대신 `p-3` 또는 `p-4`)
- `dark:` 프리픽스 사용 (다크 모드 미지원, 추후 별도 작업)
- 정의된 6단계 외 커스텀 shadow 사용
- `640px` 외 브레이크포인트 추가 (`md:`, `lg:`, `xl:` 금지)
- inline style로 색상/간격 지정
- 컴포넌트 내부에서 margin으로 외부 간격 제어 (부모의 gap 사용)
- z-index 임의 사용 (10장의 레이어 규칙 준수)
- 외부 CDN 추가 (Google Fonts, Leaflet 외)

---

## Quick Reference

```
Brand:      Primary #f97316 (orange)  /  Secondary #0d9488 (teal)
Font:       Noto Sans KR (body)  /  Playfair Display (hero title only)
Radius:     sm(6) md(8) lg(12) xl(16) 2xl(20) full(9999)
Shadow:     xs < sm < md < lg < xl < float
Spacing:    4px grid (Tailwind default)
MaxWidth:   1100px
Breakpoint: 640px only (sm:)
Icons:      lucide-react
UI Base:    shadcn/ui
Tabs:       4 (Summary / Schedule / Guide / Checklist)
```
