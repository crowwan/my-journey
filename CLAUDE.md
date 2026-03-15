# My Journey - AI 여행 플래너

## 프로젝트 개요

AI(Gemini)와 대화하며 여행 계획을 생성/수정하고, 상세 일정을 관리하는 Next.js 웹앱.
Vercel로 배포, localStorage로 데이터 영속화.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack)
- **스타일**: Tailwind CSS + 디자인 시스템
- **상태 관리**: Zustand (useTripStore, useChatStore, useUIStore)
- **AI**: Google Gemini API (gemini-2.5-flash / 2.0-flash-lite)
- **지도**: Leaflet (CDN)
- **배포**: Vercel (자동배포, `git push origin main`)

## 폴더 구조

```
my-journey/
├── CLAUDE.md
├── app/                    # Next.js 앱
│   └── src/
│       ├── app/            # 라우트 (/, /trips/[tripId], /api/chat)
│       ├── components/
│       │   ├── ai/         # AIDrawerProvider, AIDrawer, AISplitView, AIFloatingButton
│       │   ├── chat/       # ChatContainer, ChatInput, ChatMessage, TripPreviewCard, QuickSetupForm
│       │   ├── viewer/     # TripViewer, HeroSection, TabBar, tabs/*
│       │   ├── home/       # TripCard, TripHeroCard, NewTripButton
│       │   ├── layout/     # Header, SplashScreen
│       │   ├── shared/     # EmptyState, emoji-to-icon 등
│       │   └── ui/         # shadcn 컴포넌트
│       ├── stores/         # Zustand (useTripStore, useChatStore, useUIStore)
│       ├── api/            # gemini.ts (Gemini SDK 래퍼)
│       ├── lib/            # 유틸 (trip-utils, emoji-to-icon, utils)
│       └── types/          # trip.ts (Trip, ChatMessage 등)
├── dev/active/             # 작업 문서
│   ├── ai-enhancement/     # AI 고도화 계획서/태스크/컨텍스트
│   └── calendar-view/      # 캘린더 뷰 계획서/태스크/컨텍스트
├── docs/                   # 디자인 시스템, 계획서
└── trips/                  # 레거시 HTML 여행 (2025-osaka 등)
```

## AI 기능

### 아키텍처

```
사용자 → ChatInput → useChatStore.sendMessage
  → POST /api/chat (route.ts)
    → geminiApi.chat / createTrip / editTrip (gemini.ts)
      → Google Gemini API
  → 응답 → ChatMessage (tripPreview 포함)
  → generatedTrip → TripViewer (Split View) / TripPreviewCard (모바일)
```

### 3가지 모드
- **chat**: 자유 대화 (여행 상담)
- **create**: Quick Setup 폼 또는 대화 → 전체 Trip JSON 생성
- **edit**: 기존/생성된 Trip을 대화로 수정 (replace_trip 방식)

### Quick Setup 폼
- 목적지, 출발일, 귀국일, 인원 입력 → 프롬프트 조립 → 바로 create
- "건너뛰기" → 자유 채팅 모드

### Split View (데스크탑)
- 초안 생성 후 자동 전환: 좌측 TripViewer + 우측 ChatContainer
- 수정 대화 → 왼쪽 뷰어 실시간 갱신
- 기존 여행 수정: HeroSection "AI로 수정" → Split View edit 모드

### 세션 영속화
- useChatStore → zustand persist + sessionStorage
- 드로어 닫아도 대화 유지, "새 대화"로만 초기화
- skipHydration:true (SSR 안전)

### 이모지 규칙
- Gemini 프롬프트에 허용 이모지 목록 명시 (create + edit 모두)
- `src/lib/emoji-to-icon.tsx`에 매핑 → lucide-react 아이콘 변환
- 매핑에 없는 이모지는 텍스트 폴백

## 여행 데이터

### Trip 타입 (src/types/trip.ts)
- overview: flights, accommodation, weather, tips
- days: dayNumber, date, title, items(timeline), mapSpots
- restaurants, transport, budget, packing, preTodos

### 4탭 뷰어 구조
1. 요약 — 항공편, 숙소, 날씨, 팁
2. 일정 — Day별 타임라인 + Leaflet 지도
3. 가이드 — 맛집, 교통, 예산
4. 체크리스트 — 준비물, 사전 준비

## 디자인 시스템

> **모든 UI 구현 작업 전 반드시 디자인 시스템 문서를 읽고 작업할 것.**

- **디자인 시스템 문서**: `docs/design-system.md`
- 색상: primary(#f97316), blue(#3b82f6), green(#10b981), pink(#f472b6), purple(#a78bfa)
- 반응형: 640px 브레이크포인트
- Day 색상 순환: Day1 #f97316, Day2 #6366f1, Day3 #10b981, Day4 #a78bfa, Day5 #f472b6

## 커스텀 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/trip-new` | 새 여행 생성 |
| `/trip-plan` | AI 여행 계획 도우미 |
| `/trip-add-day` | 일별 일정 추가 |
| `/trip-build-index` | index.html 자동 갱신 |

## 참조 파일

- 디자인 시스템: `docs/design-system.md`
- AI 고도화 계획서: `dev/active/ai-enhancement/ai-enhancement-plan.md`
- 캘린더 뷰 계획서: `dev/active/calendar-view/calendar-view-plan.md`
- 계획서: `docs/01-plan/features/my-journey-project-setup.plan.md`
