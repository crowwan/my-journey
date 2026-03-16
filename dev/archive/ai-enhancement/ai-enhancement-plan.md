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

### 3.2 Phase 2: Split View (여행 뷰어 + AI 채팅) ← Phase 2, 3, 4 통합

```
AS-IS: 드로어에 작은 TripPreviewCard만 표시
       → 전체 여행을 보면서 수정 불가
       → 기존 여행 수정 진입점 없음

TO-BE: 생성/수정 시 Split View 전환
       → 왼쪽: TripViewer (전체 여행 상세)
       → 오른쪽: AI 채팅 (수정 대화)
       → 수정 반영 시 왼쪽 실시간 갱신
```

**Split View 레이아웃**:
```
데스크탑 (≥ 768px):
┌──────────────────────────┬────────────────┐
│                          │                │
│   TripViewer             │   AI 채팅      │
│   (기존 컴포넌트 재활용)  │   ChatContainer│
│                          │                │
│   탭: 개요/일정/맛집...   │   대화 내역    │
│   (좌측 패널 내 스크롤)   │   입력창       │
│                          │                │
│         flex-1           │   w-[400px]    │
└──────────────────────────┴────────────────┘

모바일 (< 768px):
기존 풀스크린 드로어 유지 (화면 작아서 split 불가)
```

**UX 흐름 — 새 여행 생성**:
```
1. FAB 클릭 → 드로어 열림 (기존과 동일)
2. Quick Setup / 자유 채팅 → create 호출
3. 초안 생성 완료 → 자동으로 Split View 전환
   - 왼쪽: TripViewer (generatedTrip 표시)
   - 오른쪽: 채팅 유지 (수정 입력 가능)
4. "Day2 맛집 바꿔줘" → edit → 왼쪽 실시간 갱신
5. 만족 → "저장하기" → localStorage 저장 + 상세 페이지 이동
```

**UX 흐름 — 기존 여행 수정**:
```
1. 여행 상세 페이지 → "AI로 수정" 버튼 클릭
2. Split View 전환
   - 왼쪽: 기존 TripViewer 유지
   - 오른쪽: 채팅 (edit 모드)
3. 수정 대화 → 왼쪽 실시간 갱신
4. "수정 저장하기" → 기존 Trip 덮어쓰기
```

**변경 범위**:
- 신규: `AISplitView` 컴포넌트 (좌 TripViewer + 우 ChatContainer)
- `AIDrawerProvider`: generatedTrip 존재 시 → Split View 모드 전환
- `useUIStore`: `aiViewMode: 'drawer' | 'split'` 상태 추가
- `TripViewer`: window.scrollTo → 내부 스크롤 컨테이너 ref 대응
- HeroSection: "AI로 수정" 버튼 추가
- `TripPreviewCard`: Split View에서는 숨김 (왼쪽에 뷰어가 있으므로)
- 모바일: 기존 드로어 유지, Split View 미적용

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

### Phase 2: Split View + 기존 여행 수정 (통합)

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 2.1 | useUIStore에 `aiViewMode: 'drawer' \| 'split'` 추가 | S | - |
| 2.2 | AISplitView 컴포넌트 생성 (좌 TripViewer + 우 ChatContainer) | L | 2.1 |
| 2.3 | TripViewer 스크롤 분리 (window.scrollTo → 내부 ref 스크롤) | M | 2.2 |
| 2.4 | AIDrawerProvider: generatedTrip 존재 시 Split View 자동 전환 | M | 2.2 |
| 2.5 | Split View에서 수정 → generatedTrip 갱신 → 왼쪽 뷰어 실시간 반영 | M | 2.4 |
| 2.6 | Split View 저장 버튼 (하단 바 또는 채팅 내) | M | 2.5 |
| 2.7 | 저장 → localStorage + 상세 페이지 이동 + Split View 해제 | S | 2.6 |
| 2.8 | HeroSection에 "AI로 수정" 버튼 추가 | S | - |
| 2.9 | "AI로 수정" → Split View (edit 모드) 진입 | M | 2.2, 2.8 |
| 2.10 | edit 모드 시작 시 시스템 메시지 자동 추가 | S | 2.9 |
| 2.11 | edit 저장 → 기존 Trip ID 유지 + 덮어쓰기 | M | 2.6 |
| 2.12 | 모바일: Split View 미적용, 기존 드로어 유지 | M | 2.2 |
| 2.13 | 빌드 + 린트 확인 | S | 전체 |

**수용 기준**:
- 데스크탑: 초안 생성 후 좌측에 TripViewer, 우측에 채팅이 나란히 보인다
- 수정 요청 시 왼쪽 뷰어가 실시간으로 갱신된다
- "저장하기" 클릭 → 저장 + 상세 페이지 이동
- 여행 상세 → "AI로 수정" → Split View (edit) → 수정 → 저장 → 반영
- 모바일: 기존 드로어 동작 유지 (변경 없음)

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

### 5.2 Split View 아키텍처

```typescript
// useUIStore 확장
interface UIState {
  isAIDrawerOpen: boolean;
  aiDrawerMode: 'create' | 'edit';
  aiDrawerTripId?: string;
  aiViewMode: 'drawer' | 'split'; // 추가

  openAIDrawer: (mode?: 'create' | 'edit', tripId?: string) => void;
  closeAIDrawer: () => void;
  setAIViewMode: (mode: 'drawer' | 'split') => void; // 추가
}
```

```
AISplitView 컴포넌트 구조:

<div className="fixed inset-0 z-50 flex">
  {/* 왼쪽: 여행 뷰어 */}
  <div className="flex-1 overflow-y-auto">
    <TripViewer trip={generatedTrip} scrollContainerRef={scrollRef} />
  </div>

  {/* 오른쪽: 채팅 */}
  <div className="w-[400px] border-l flex flex-col">
    <ChatContainer mode={mode} tripId={tripId} />
  </div>
</div>
```

**전환 로직**:
- generatedTrip이 생성됨 + 데스크탑 → 자동 split 전환
- 모바일 → 항상 drawer 유지
- "AI로 수정" 클릭 → split + edit 모드
- 저장/닫기 → drawer로 복귀
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
Phase 1: Quick Setup + 세션 영속화 ── ✅ 완료
    ↓
Phase 3: 생성 후 수정 (replace_trip) ── ✅ 완료
    ↓
Phase 2: Split View + 기존 여행 수정 ── 다음 (Phase 2+4 통합)
    - AISplitView 컴포넌트 (좌 뷰어 + 우 채팅)
    - 초안 생성 → Split View 자동 전환
    - HeroSection "AI로 수정" → Split View edit 모드
    - 모바일: 기존 드로어 유지
```

Phase 1 → 2 → 3 → 4 순서로 진행하되, Phase 2는 독립적으로 병렬 가능.
