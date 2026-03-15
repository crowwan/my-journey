# AI 기능 고도화 — 컨텍스트

**최종 갱신**: 2026-03-15

---

## 주요 파일 맵

### AI 드로어 / 채팅 UI

| 파일 | 역할 | Phase |
|------|------|-------|
| `src/components/ai/AIDrawerProvider.tsx` | FAB + 드로어 마운트, 토글 로직 | 1, 2 |
| `src/components/ai/AIDrawer.tsx` | 슬라이드 패널, 닫기/ESC/오버레이/body 스크롤 제어 | 1, 2 |
| `src/components/ai/AIFloatingButton.tsx` | FAB (토글 + 배지 표시 예정) | 2 |
| `src/components/chat/ChatContainer.tsx` | 채팅 메인 영역, 빈 상태, 예시 칩, 생성 버튼 | 1, 3 |
| `src/components/chat/ChatInput.tsx` | 텍스트 입력 + 전송 | - |
| `src/components/chat/ChatMessage.tsx` | 메시지 버블 + tripPreview 렌더링 | 3 |
| `src/components/chat/TripPreviewCard.tsx` | 생성 결과 카드 + 저장 버튼 | 3, 4 |
| `src/components/chat/TypingIndicator.tsx` | 로딩 애니메이션 | - |

### 신규 생성 예정

| 파일 | 역할 | Phase |
|------|------|-------|
| `src/components/chat/QuickSetupForm.tsx` | 목적지/기간/인원 입력 폼 (create 모드 초기 화면) | 1 |

### 상태 관리

| 파일 | 역할 | Phase |
|------|------|-------|
| `src/stores/useChatStore.ts` | 메시지/로딩/에러/생성Trip 관리 | 1, 3 |
| `src/stores/useUIStore.ts` | 드로어 열림/닫힘/모드/tripId | 1, 2 |
| `src/stores/useTripStore.ts` | 여행 CRUD (localStorage 영속) | 4 |

### API / 서버

| 파일 | 역할 | Phase |
|------|------|-------|
| `src/api/gemini.ts` | Gemini SDK 래퍼, 시스템 프롬프트, DTO 변환 | 3, 4 |
| `src/app/api/chat/route.ts` | Next.js API Route (stateless 핸들러) | 3, 4 |

### 타입

| 파일 | 역할 | Phase |
|------|------|-------|
| `src/types/trip.ts` | Trip, ChatMessage, TripAction 타입 정의 | 3, 4 |

### 여행 상세 (edit 진입점)

| 파일 | 역할 | Phase |
|------|------|-------|
| `src/components/viewer/HeroSection.tsx` | 여행 상세 히어로 (수정 버튼 추가 예정) | 4 |
| `src/app/trips/[tripId]/page.tsx` | 여행 상세 페이지 | 4 |

---

## 핵심 결정사항

### D1: 세션 저장소 선택 — sessionStorage

- **이유**: 탭 단위 세션 → 탭 닫으면 자연스럽게 초기화. localStorage는 영구 보존되어 불필요한 데이터 누적.
- **대안 검토**: localStorage (과도), IndexedDB (오버엔지니어링), zustand in-memory (현재, 부족)

### D2: edit 모드 전략 — replace_trip (전체 재생성)

- **이유**: 부분 merge (TripAction 적용)는 action 타입별 로직이 복잡하고, Gemini 응답의 일관성도 보장 어려움. 전체 Trip JSON 재생성이 단순하고 안정적.
- **트레이드오프**: 토큰 사용량 증가 → 프로토타입 단계에서 허용 가능

### D3: 드로어 상태 3단계

- **이유**: 사용자가 AI 대화 중 다른 여행 참조 필요 → 최소화 상태 필수. 닫기와 최소화를 구분하여 의도치 않은 대화 손실 방지.

### D4: TripAction 타입 유지

- **이유**: replace_trip 방식을 주력으로 쓰되, TripAction 타입은 향후 부분 업데이트 최적화 시 재활용 가능. 현재 삭제하지 않음.

---

## 의존성

### 라이브러리

| 패키지 | 용도 | 상태 |
|--------|------|------|
| `zustand` | 상태 관리 | 이미 사용 중 |
| `zustand/middleware` (persist) | sessionStorage 영속화 | zustand 내장, 추가 설치 불필요 |
| `@google/genai` | Gemini API | 이미 사용 중 |

### 환경

| 항목 | 상태 |
|------|------|
| `GEMINI_API_KEY` | 설정 완료 |
| Vercel 배포 | 설정 완료 |
| Next.js App Router | 사용 중 |

---

## 현재 코드 핵심 포인트

### clearMessages() 호출 지점 (Phase 1에서 제거 대상)

1. `AIDrawer.tsx:22` — `handleClose` 콜백 내
2. `AIDrawerProvider.tsx:21` — `handleToggle` 함수 내 (드로어 열려있을 때 닫기)

### body.overflow 제어 (Phase 2에서 조건부 변경)

1. `AIDrawer.tsx:39-47` — `useEffect`에서 isOpen 기반 제어

### edit 모드 미완성 부분

1. `gemini.ts:159-186` — EDIT_TRIP_PROMPT 존재, 프롬프트 수정 필요
2. `gemini.ts:366-387` — editTrip API 존재, replace_trip 방식으로 변경 필요
3. `trip.ts:211-231` — TripAction/TripActionType 타입 존재
4. `ChatMessage.tsx:73` — tripAction 필드 destructure하지만 렌더링 안 함
5. `ChatContainer.tsx:54-59` — edit 모드 핸들러 존재, 동작은 함

### openAIDrawer('edit') 호출 지점 — 현재 없음

- `page.tsx` (홈): openAIDrawer('create') 만 사용
- `NewTripButton`: openAIDrawer('create')
- `AIDrawerProvider`: openAIDrawer() (기본값 create)
