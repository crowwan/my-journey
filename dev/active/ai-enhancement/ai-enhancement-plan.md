# AI 기능 고도화 — 종합 계획서

**날짜**: 2026-03-15
**상태**: Draft
**작성자**: kimjin-wan + Claude

---

## 1. 핵심 요약

현재 AI 채팅은 **1회성 드로어** 구조로, 닫으면 대화가 소멸되고, 생성 중 다른 작업이 불가하며, 만들어진 여행을 대화로 수정할 수 없다. 이 계획은 3가지 축으로 AI 사용성을 고도화한다:

| 축 | 목표 | 핵심 변경 |
|----|------|----------|
| **Quick Setup** | 폼으로 기본 정보 수집 → 토큰 절약 | 드로어 초기 화면에 Quick Setup 폼 추가 |
| **세션 영속화** | 드로어 닫아도 대화 유지 | useChatStore → sessionStorage 영속 |
| **멀티태스킹** | AI 대화 중 다른 화면 조작 | 드로어 최소화 + body scroll 허용 |
| **생성+수정 통합** | 대화 내 결과 수정, 기존 여행 수정 | edit 모드 완성 + replace_trip |

---

## 2. 현재 상태 분석 (AS-IS)

### 2.1 아키텍처

```
[layout.tsx]
  └─ <AIDrawerProvider>
       ├─ <AIFloatingButton>   ← FAB 토글 (open/close)
       └─ <AIDrawer>           ← 오른쪽 슬라이드 (모바일 풀스크린)
            └─ <ChatContainer>
                 ├─ ChatMessage × N
                 │    └─ TripPreviewCard (생성 결과)
                 ├─ TypingIndicator
                 └─ ChatInput
```

### 2.2 상태 관리

| Store | 영속성 | 역할 |
|-------|--------|------|
| `useChatStore` | **비영속** (in-memory) | messages[], isLoading, generatedTrip |
| `useUIStore` | **비영속** (in-memory) | isAIDrawerOpen, aiDrawerMode, aiDrawerTripId |
| `useTripStore` | **영속** (localStorage) | trips Map, saveTrip/deleteTrip |

### 2.3 대화 흐름

```
chat 모드 → 자유 대화 (멀티턴)
  ↓ 메시지 2개 이상 → "여행 계획 생성하기" 버튼
create 모드 → Gemini JSON → TripPreviewCard
  ↓ "여행 저장하기" 클릭
드로어 닫기 + localStorage 저장 + 상세 페이지 이동
```

### 2.4 핵심 문제점

| # | 문제 | 영향 |
|---|------|------|
| P1 | 드로어 닫으면 `clearMessages()` 호출 → 대화 전체 소멸 | 실수로 닫으면 복구 불가 |
| P2 | 드로어 열리면 `body.overflow = 'hidden'` → 뒤 화면 조작 불가 | 다른 여행 참고 불가 |
| P3 | 모바일 풀스크린 → 드로어와 본문 동시 사용 불가 | 모바일 사용성 저하 |
| P4 | edit 모드: 프롬프트/타입만 존재, merge 로직 미구현 | 수정 기능 사실상 없음 |
| P5 | TripAction 타입 정의만 있고 UI 렌더링/처리 없음 | edit 응답 무시됨 |
| P6 | 생성 결과를 "저장 or 버리기"만 가능 | 결과 불만족 시 처음부터 다시 |
| P7 | openAIDrawer('edit', tripId) 호출 지점 없음 | 진입점 자체 부재 |

---

## 3. 목표 상태 (TO-BE)

### 3.1 Phase 1: Quick Setup 폼 + 세션 영속화

#### Quick Setup 폼

```
AS-IS: 드로어 열림 → 빈 상태 + 예시 칩 3개 → 자유 채팅 시작
       → AI가 "기간은?" "인원은?" 2-3턴 추가 질문 → create
       = 약 6메시지, ~3000 토큰

TO-BE: 드로어 열림 → Quick Setup 폼 (목적지/기간/인원)
       → "일정 만들기" 클릭 → 폼 데이터를 프롬프트에 조립 → 바로 create
       → 또는 "건너뛰기" → 기존 자유 채팅
       = 약 1메시지, ~500 토큰 (80% 절약)
```

**Quick Setup UI**:
```
┌─────────────────────────────────┐
│  어디로 떠나볼까요?             │
│                                  │
│  📍 목적지  [              ]    │
│  📅 기간   [3박 4일    ▾]      │
│  👥 인원   [1명        ▾]      │
│                                  │
│  [✨ 일정 만들기]  [건너뛰기 →] │
└─────────────────────────────────┘
```

**폼 → 프롬프트 조립 방식**:
```
사용자 요청 정보:
- 목적지: {destination}
- 기간: {nights}박 {days}일
- 인원: {travelers}명

위 정보를 기반으로 여행 계획을 생성해주세요.
```

**변경 범위**:
- `ChatContainer`: 빈 상태 UI를 Quick Setup 폼으로 교체
- Quick Setup 제출 → sendMessage(조립된 프롬프트, 'create')로 바로 생성
- "건너뛰기" → 기존 자유 채팅 모드 진입 (예시 칩 유지)

#### 세션 영속화

```
AS-IS: 드로어 닫기 → clearMessages() → 대화 소멸
TO-BE: 드로어 닫기 → 대화 유지 (sessionStorage)
       "새 대화" 버튼으로만 명시적 초기화
       드로어 다시 열면 이전 대화 복원
```

**변경 범위**:
- `useChatStore`: sessionStorage persist 미들웨어 추가
- `AIDrawer`: `handleClose`에서 `clearMessages()` 제거
- `AIDrawerProvider`: `handleToggle`에서 `clearMessages()` 제거
- `ChatContainer`: "새 대화" 버튼 추가 (빈 상태가 아닐 때 표시)

### 3.2 Phase 2: 드로어 최소화 + 멀티태스킹

```
AS-IS: 드로어 열림 = 풀 오버레이 + body 스크롤 차단
TO-BE: 드로어 상태 3가지
       - open: 현재와 동일 (사이드 패널)
       - minimized: FAB에 배지 표시, 뒤 화면 자유 조작
       - closed: 완전 닫힘
```

**변경 범위**:
- `useUIStore`: `aiDrawerState: 'open' | 'minimized' | 'closed'` 추가
- `AIDrawer`: 최소화 버튼 추가, 최소화 시 body.overflow 복원
- `AIFloatingButton`: minimized 상태일 때 진행중 배지 표시
- `AIDrawer`: 데스크탑에서 오버레이 제거 옵션 (사이드바 모드)

### 3.3 Phase 3: 생성 결과 대화 내 수정

```
AS-IS: 생성 → 프리뷰 → 저장/버리기
TO-BE: 생성 → 프리뷰 → "이 부분 수정해줘" 대화 → 재생성 → 저장
```

**변경 범위**:
- `ChatContainer`: 생성 후에도 대화 입력 유지 (수정 요청 가능)
- `useChatStore.sendMessage`: 생성된 Trip이 있으면 자동으로 edit 모드 전환
- `ChatMessage`: TripAction 렌더링 (수정 내용 시각화)
- Gemini 프롬프트: 수정 요청 시 전체 Trip 재생성 (replace_trip) 방식으로 단순화

### 3.4 Phase 4: 기존 여행 수정 (edit 모드 완성)

```
AS-IS: 진입점 없음 + merge 로직 없음
TO-BE: 여행 상세 페이지에서 "AI로 수정" → 드로어 열림 (edit 모드)
       대화로 수정 요청 → 수정된 Trip 프리뷰 → 저장 (기존 Trip 덮어쓰기)
```

**변경 범위**:
- 여행 상세 페이지: "AI로 수정" 버튼 추가 → `openAIDrawer('edit', tripId)`
- `ChatContainer`: edit 모드 시 기존 Trip 컨텍스트 자동 로드
- `TripPreviewCard`: edit 모드 시 "수정 저장하기" (기존 Trip ID 유지)
- Gemini edit: replace_trip 방식으로 단순화 (부분 merge 복잡도 회피)

---

## 4. 구현 단계

### Phase 1: Quick Setup 폼 + 세션 영속화 (우선순위 최고)

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 1.1 | QuickSetupForm 컴포넌트 생성 (목적지/기간/인원 폼) | M | - |
| 1.2 | ChatContainer 빈 상태를 QuickSetupForm으로 교체 | S | 1.1 |
| 1.3 | 폼 제출 → 프롬프트 조립 → sendMessage(text, 'create') | M | 1.2 |
| 1.4 | "건너뛰기" → 기존 자유 채팅 모드 (예시 칩) 진입 | S | 1.2 |
| 1.5 | useChatStore에 sessionStorage persist 추가 | S | - |
| 1.6 | AIDrawer.handleClose에서 clearMessages() 제거 | S | 1.5 |
| 1.7 | AIDrawerProvider.handleToggle에서 clearMessages() 제거 | S | 1.5 |
| 1.8 | ChatContainer에 "새 대화" 버튼 UI 추가 | S | 1.6 |
| 1.9 | "새 대화" 클릭 시 clearMessages() + Quick Setup으로 복귀 | S | 1.8 |
| 1.10 | generatedTrip도 세션에 포함하여 영속화 | S | 1.5 |

**수용 기준**:
- Quick Setup 폼에서 목적지/기간/인원 입력 후 바로 여행 생성이 가능하다
- "건너뛰기"로 자유 채팅 모드 진입이 가능하다
- 드로어 닫았다 열면 이전 대화가 그대로 보인다
- "새 대화" 버튼 클릭 시에만 대화가 초기화된다
- 브라우저 탭 새로고침 시 대화가 초기화된다 (sessionStorage)
- 탭을 완전히 닫으면 대화가 초기화된다

### Phase 2: 드로어 최소화 + 멀티태스킹

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 2.1 | useUIStore에 aiDrawerState 3-상태 추가 | S | - |
| 2.2 | AIDrawer 헤더에 최소화 버튼 (─) 추가 | S | 2.1 |
| 2.3 | 최소화 시 드로어 숨김 + body.overflow 복원 | M | 2.2 |
| 2.4 | AIFloatingButton에 minimized 배지 (진행중 표시) | S | 2.1 |
| 2.5 | FAB 클릭 시 minimized → open 복원 | S | 2.1 |
| 2.6 | 데스크탑: 사이드바 모드 (오버레이 없이 본문 옆에 배치) | M | 2.3 |
| 2.7 | 모바일: 최소화 → FAB 배지, 다시 탭하면 풀스크린 복원 | M | 2.4 |

**수용 기준**:
- 최소화 후 뒤 화면 스크롤/네비게이션이 가능하다
- FAB에 대화 진행중 상태가 시각적으로 표시된다
- FAB 클릭으로 최소화 ↔ 열림 전환이 가능하다
- 데스크탑에서 드로어 열린 상태로 본문 조작이 가능하다

### Phase 3: 생성 결과 대화 내 수정

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 3.1 | 생성 후 ChatInput 유지 (비활성화 제거) | S | - |
| 3.2 | "수정해줘" 메시지 → edit 모드 자동 전환 로직 | M | - |
| 3.3 | edit 모드: 기존 generatedTrip을 tripContext로 전달 | M | 3.2 |
| 3.4 | Gemini edit 응답을 replace_trip 방식으로 통일 | M | - |
| 3.5 | 수정 결과 → 새 TripPreviewCard로 업데이트 표시 | M | 3.4 |
| 3.6 | TripPreviewCard: 이전 버전 대비 변경점 하이라이트 (선택) | L | 3.5 |

**수용 기준**:
- 여행 생성 후 "Day2를 수정해줘" 입력 → 수정된 Trip 프리뷰가 표시된다
- 수정된 프리뷰에서 "여행 저장하기" 클릭 → 최종 버전이 저장된다
- 여러 번 수정 요청이 가능하다

### Phase 4: 기존 여행 수정 (edit 모드 완성)

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 4.1 | 여행 상세 HeroSection에 "AI로 수정" 버튼 추가 | S | - |
| 4.2 | 버튼 클릭 → openAIDrawer('edit', tripId) | S | 4.1 |
| 4.3 | edit 모드 ChatContainer 시작 메시지 ("X 여행을 수정합니다") | S | 4.2 |
| 4.4 | edit 대화에 tripContext 자동 포함 | M | 4.3 |
| 4.5 | edit 응답 → replace_trip → 수정된 전체 Trip 프리뷰 | M | 3.4 |
| 4.6 | TripPreviewCard: edit 모드 시 기존 Trip ID 유지 + 덮어쓰기 저장 | M | 4.5 |
| 4.7 | 저장 후 페이지 새로고침 (수정 반영) | S | 4.6 |

**수용 기준**:
- 여행 상세 → "AI로 수정" → "맛집 추가해줘" → 수정된 프리뷰 표시
- "수정 저장하기" → 기존 여행이 업데이트된다 (새 여행 생성 아님)
- 수정 후 상세 페이지에 변경 사항이 반영된다

---

## 5. 기술 설계 상세

### 5.1 useChatStore 세션 영속화

```typescript
// zustand/middleware의 persist 사용
import { persist } from 'zustand/middleware';

// sessionStorage 어댑터
const sessionStorageAdapter = {
  getItem: (name: string) => sessionStorage.getItem(name),
  setItem: (name: string, value: string) => sessionStorage.setItem(name, value),
  removeItem: (name: string) => sessionStorage.removeItem(name),
};

// persist 미들웨어 적용
create<ChatState>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'chat-session',
      storage: createJSONStorage(() => sessionStorageAdapter),
      partialize: (state) => ({
        messages: state.messages,
        generatedTrip: state.generatedTrip,
      }),
    }
  )
);
```

### 5.2 드로어 3-상태 모델

```typescript
// useUIStore 확장
interface UIState {
  aiDrawerState: 'open' | 'minimized' | 'closed';
  aiDrawerMode: 'create' | 'edit';
  aiDrawerTripId?: string;

  openAIDrawer: (mode?: 'create' | 'edit', tripId?: string) => void;
  minimizeAIDrawer: () => void;
  closeAIDrawer: () => void;
}
```

### 5.3 edit 모드 단순화 전략

기존의 부분 수정(TripAction merge)은 복잡도가 높고 에러 가능성이 크다.
**replace_trip 방식으로 통일**:

```
사용자: "Day2 일정 줄여줘"
→ Gemini에 전체 Trip JSON + 수정 요청 전달
→ Gemini가 수정된 전체 Trip JSON 반환 (create와 동일한 스키마)
→ 새 TripPreviewCard 렌더링
→ 저장 시 기존 Trip 덮어쓰기
```

장점:
- create와 동일한 응답 스키마 → 기존 toTrip() 재사용
- 부분 merge 로직 불필요
- TripAction 파싱/적용 복잡도 제거

단점:
- 토큰 사용량 증가 (전체 Trip 재생성)
- 의도하지 않은 변경 가능성 (프롬프트로 방어)

---

## 6. 위험 평가 및 대응

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|------|
| sessionStorage 용량 초과 (5MB) | 낮음 | 중간 | 메시지 수 제한 (최근 50개), tripPreview 분리 저장 |
| replace_trip 시 의도하지 않은 변경 | 중간 | 높음 | 프롬프트에 "변경 최소화" 강조 + 사용자 확인 |
| 모바일 최소화 UX 혼란 | 중간 | 낮음 | FAB 배지 + 스낵바 알림 ("대화가 유지되고 있어요") |
| Gemini 응답 지연 (전체 Trip 재생성) | 중간 | 중간 | 로딩 상태 명시 + 경량 모델 폴백 유지 |

---

## 7. 성공 지표

| 지표 | 기준 |
|------|------|
| 세션 영속화 | 드로어 닫았다 열었을 때 100% 대화 복원 |
| 멀티태스킹 | 최소화 상태에서 다른 여행 상세 페이지 접근 가능 |
| 생성 후 수정 | 생성 결과를 대화로 3회 이상 연속 수정 가능 |
| edit 모드 | 기존 여행의 특정 Day 수정 → 저장 → 반영 확인 |
| 빌드/린트 | 0 errors, 0 warnings |

---

## 8. 구현 순서 요약

```
Phase 1: Quick Setup + 세션 영속화 ── 기반 (토큰 절약 + 세션 유지)
    ↓
Phase 2: 드로어 최소화 ────────────── UX (독립적, 병렬 가능)
    ↓
Phase 3: 생성 후 수정 ────────────── 핵심 가치 (Phase 1 필요)
    ↓
Phase 4: edit 모드 완성 ───────────── Phase 3 기반 확장
```

Phase 1 → 2 → 3 → 4 순서로 진행하되, Phase 2는 독립적으로 병렬 가능.
