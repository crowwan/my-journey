# My Journey Design System

shadcn/ui 기반 디자인 시스템 가이드. 모든 UI 컴포넌트는 이 문서의 규칙을 따릅니다.

---

## 1. Color Palette

### Semantic Colors

| Token | Value | 용도 |
|-------|-------|------|
| `--color-bg` | `#ffffff` | 페이지 배경 |
| `--color-card` | `#f8f8fa` | 카드 배경 |
| `--color-card-secondary` | `#f0f0f4` | 보조 카드 배경 |
| `--color-accent` | `#2563eb` | Primary 액션, 링크, 포커스 |
| `--color-accent-light` | `#3b82f6` | Hover 상태 |
| `--color-accent-warm` | `#1d4ed8` | Active/pressed 상태 |
| `--color-text` | `#111827` | 본문 텍스트 |
| `--color-text-secondary` | `#6b7280` | 보조 텍스트 |
| `--color-text-tertiary` | `#9ca3af` | 비활성/힌트 텍스트 |
| `--color-border` | `rgba(0,0,0,0.06)` | 카드/구분선 테두리 |

### Trip Theme Colors

여행 콘텐츠 유형을 시각적으로 구분하는 전용 색상:

| Token | Value | 용도 |
|-------|-------|------|
| `--color-trip-blue` | `#3b82f6` | 교통/이동 |
| `--color-trip-cyan` | `#06b6d4` | 보조 교통 |
| `--color-trip-green` | `#10b981` | 관광지/완료 |
| `--color-trip-pink` | `#ec4899` | 맛집/식사 |
| `--color-trip-purple` | `#8b5cf6` | 부가 정보 |
| `--color-trip-red` | `#ef4444` | 경고/긴급 |

### Day Colors (순환 팔레트)

```ts
const DAY_COLORS = ['#f97316', '#6366f1', '#10b981', '#a78bfa', '#f472b6'];
```

Day 번호에 따라 순환 적용. 지도 마커, DayCard 번호 뱃지에 사용.

### shadcn/ui Tokens

`--primary`는 oklch 색공간으로 `#2563eb`에 근사한 값 사용:
- Light: `oklch(0.546 0.245 262.881)`
- Dark: `oklch(0.623 0.214 259.815)` (향후 다크모드용)

---

## 2. Typography

### Font Family

- **본문**: `'Noto Sans KR', sans-serif` (`--font-sans`)
- **제목**: 동일 (`--font-display`)

### Size Scale

| 용도 | Size | Weight | 예시 |
|------|------|--------|------|
| 페이지 제목 | `text-2xl` (1.5rem) | `font-black` (900) | HeroSection 제목 |
| 섹션 제목 | `text-base` (1rem) | `font-bold` (700) | DayCard 제목 |
| 카드 제목 | `text-base` (1rem) | `font-semibold` (600) | TripCard 제목 |
| 본문 | `text-sm` (0.875rem) | `font-medium` (500) | 일반 텍스트 |
| 캡션/라벨 | `text-xs` (0.75rem) | `font-medium` (500) | Badge, 날짜 |
| 마이크로 | `text-[0.65rem]` | `font-medium` (500) | 태그 뱃지 |

### Line Height

- `body`: `line-height: 1.7` (글로벌)
- 컴팩트 요소: `leading-none` (카드 제목)
- 설명 텍스트: `leading-relaxed`

---

## 3. Spacing & Radius

### Card Spacing

| 요소 | Padding | Gap |
|------|---------|-----|
| 일반 카드 (Card) | `p-4` ~ `p-5` | `gap-0` (커스텀) |
| InfoCard | `p-[18px]` | - |
| DayCard trigger | `px-5 py-[18px]` | `gap-3.5` |
| 리스트 아이템 | `px-4 py-3` | `gap-3` |

### Border Radius

| Token | Value | 용도 |
|-------|-------|------|
| `--radius-card` | `14px` | 카드, 모달 |
| `--radius` (shadcn) | `0.625rem` (10px) | 버튼, 인풋 |
| 커스텀 | `rounded-xl` (12px) | 체크리스트, 전송 버튼 |
| 커스텀 | `rounded-full` | Badge, 뱃지형 버튼 |
| DayCard 번호 | `rounded-[11px]` | Day 번호 뱃지 |

### Shadows

- 기본 카드: `shadow-sm` (shadcn Card 기본)
- 호버 카드: `shadow-[0_2px_8px_rgba(0,0,0,0.06)]`
- 미세 호버: `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`

---

## 4. Component Usage Guide

### Button (`@/components/ui/button`)

```tsx
import { Button } from '@/components/ui/button';

// Primary (기본)
<Button>전송</Button>

// 둥근 액션 버튼
<Button size="sm" className="rounded-full bg-accent text-white hover:bg-accent/90">
  + 새 여행
</Button>

// 전체 너비
<Button className="w-full rounded-xl bg-accent text-white hover:bg-accent-light">
  여행 저장하기
</Button>
```

**사용처**: NewTripButton, ChatInput, TripPreviewCard

### Card (`@/components/ui/card`)

```tsx
import { Card, CardContent } from '@/components/ui/card';

// 클릭 가능한 카드
<Card className="cursor-pointer rounded-[14px] py-0 gap-0 hover:-translate-y-1">
  <CardContent className="p-4">...</CardContent>
</Card>

// 정보 표시 카드
<Card className="rounded-[14px] py-0 gap-0">
  <CardContent className="p-[18px]">...</CardContent>
</Card>
```

**주의**: shadcn Card 기본값이 `py-6 gap-6`이므로, 커스텀 시 `py-0 gap-0`으로 리셋 필요.

**사용처**: TripCard, InfoCard, Tip, PreTodoTab, TripPreviewCard

### Badge (`@/components/ui/badge`)

```tsx
import { Badge } from '@/components/ui/badge';

// D-Day 뱃지 (동적 스타일)
<Badge className={cn('text-[11px] font-medium', badgeStyle)}>{dday}</Badge>

// 태그 뱃지
<Badge variant="secondary" className="bg-accent/[0.07] text-accent px-3 py-1 text-xs">
  {tag}
</Badge>

// 번호 뱃지
<Badge variant="secondary" className="w-8 h-8 rounded-lg bg-trip-green/20 text-trip-green p-0">
  {order}
</Badge>
```

**사용처**: HeroSection, TripCard, TripPreviewCard, PreTodoTab

### Tabs (`@/components/ui/tabs`)

```tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs value={activeTab} onValueChange={onChange}>
  <TabsList variant="line" className="w-full justify-start overflow-x-auto scrollbar-hide">
    {TAB_CONFIG.map((tab) => (
      <TabsTrigger
        key={tab.id}
        value={tab.id}
        className="data-[state=active]:text-accent data-[state=active]:after:bg-accent"
      >
        <span className="mr-1">{tab.icon}</span>
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
</Tabs>
```

**주의**: `variant="line"`으로 밑줄 스타일 사용. 모바일에서 `scrollbar-hide` + `overflow-x-auto` 필수.

**사용처**: TabBar (7탭 뷰어)

### Accordion (`@/components/ui/accordion`)

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion type="single" collapsible defaultValue={defaultOpen ? 'day-1' : undefined}>
  <AccordionItem value="day-1" className="bg-card border rounded-[14px] mb-4">
    <AccordionTrigger className="px-5 py-[18px] hover:no-underline">
      {/* Day 헤더 */}
    </AccordionTrigger>
    <AccordionContent className="px-5 pb-5">
      {/* 타임라인 */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**주의**: `hover:no-underline`으로 기본 밑줄 제거. `last:border-b` 추가로 하단 보더 유지.

**사용처**: DayCard

### Checkbox (`@/components/ui/checkbox`)

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
  checked={isChecked}
  className={cn(
    'pointer-events-none',
    isChecked && 'data-[state=checked]:bg-trip-green data-[state=checked]:border-trip-green'
  )}
/>
```

**주의**: 부모 div에 onClick 핸들러가 있으므로 `pointer-events-none`으로 이중 클릭 방지.

**사용처**: PackingTab

### Progress (`@/components/ui/progress`)

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={percentage} className="flex-1 h-1.5 bg-gray-100" />
```

**사용처**: TripCard, HeroSection (준비물 진행률)

---

## 5. Animation Rules

### Keyframe Animations

| 이름 | 용도 | Duration | Easing |
|------|------|----------|--------|
| `fadeUp` | 요소 등장 | 0.5s | ease-out |
| `staggerReveal` | 카드 목록 순차 등장 | 0.5s | ease-out |
| `shimmer` | 로딩 플레이스홀더 | 3s | linear (infinite) |
| `accordion-down` | 아코디언 열기 | shadcn 기본 | - |
| `accordion-up` | 아코디언 닫기 | shadcn 기본 | - |

### Utility Classes

```css
.animate-fade-up        /* fadeUp 0.5s ease-out */
.animate-stagger-reveal /* staggerReveal + opacity:0 (animationDelay 필요) */
.animate-shimmer        /* shimmer 3s linear infinite */
```

### Transition Rules

- 카드 호버: `transition-all duration-300`
- 색상 전환: `transition-colors duration-200` ~ `duration-300`
- 변형(translate): `hover:-translate-y-1` 또는 `hover:-translate-y-0.5`
- 클릭 피드백: `active:scale-[0.98]`

---

## 6. 유지 컴포넌트 (shadcn 미적용)

다음 컴포넌트는 고유 UI 패턴으로 shadcn 교체 대상이 아닙니다:

| 컴포넌트 | 이유 |
|---------|------|
| `TimelineItem` | CSS pseudo-element 기반 타임라인 (`.tl-item`) |
| `ChatMessage` | 채팅 버블 고유 UI |
| `TypingIndicator` | 커스텀 애니메이션 |
| `SectionTitle` | 동적 배경색 로직 |

---

## 7. 파일 구조

```
src/components/
├── ui/                    # shadcn/ui primitives (수정 가능)
│   ├── accordion.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── input.tsx
│   ├── progress.tsx
│   ├── separator.tsx
│   └── tabs.tsx
├── home/                  # 홈 페이지
│   ├── NewTripButton.tsx  # → Button
│   └── TripCard.tsx       # → Card + Badge + Progress
├── chat/                  # 채팅
│   ├── ChatInput.tsx      # → Button (textarea는 네이티브)
│   └── TripPreviewCard.tsx # → Card + Badge + Button
├── viewer/                # 여행 뷰어
│   ├── HeroSection.tsx    # → Badge + Progress
│   ├── TabBar.tsx         # → Tabs
│   ├── schedule/
│   │   └── DayCard.tsx    # → Accordion
│   ├── shared/
│   │   ├── InfoCard.tsx   # → Card
│   │   └── Tip.tsx        # → Card variant
│   └── tabs/
│       ├── PackingTab.tsx  # → Checkbox
│       └── PreTodoTab.tsx  # → Card + Badge
└── layout/                # 레이아웃 (변경 없음)
```
