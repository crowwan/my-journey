# My Journey 리팩토링 가이드

> "Practical React Architecture" 원칙을 My Journey 프로젝트에 맞게 적용하는 실용적 가이드


## 1. AS-IS vs TO-BE 비교

### 1.1 폴더 구조

```
AS-IS                                    TO-BE
========================================  ========================================
app/src/                                  app/src/
├── api/gemini.ts          (SDK+DTO+변환)  ├── api/
├── app/api/                               │   ├── gemini.ts          (변경 없음, 이미 양호)
│   ├── chat/route.ts                      │   ├── weather.ts         (fetch 함수 추출)
│   ├── weather/route.ts                   │   └── currency.ts        (fetch 함수 추출)
│   └── currency/route.ts                  ├── app/api/               (변경 없음)
├── types/trip.ts          (모든 타입)      │   ├── chat/route.ts
├── stores/                                │   ├── weather/route.ts
│   ├── useTripStore.ts    (서버+클라이언트)│   └── currency/route.ts
│   ├── useChatStore.ts    (fetch+상태)    ├── types/trip.ts          (변경 없음)
│   ├── useUIStore.ts                      ├── domain/
│   └── useEditStore.ts                    │   ├── budget.ts          (budget-utils에서 이동)
├── lib/                   (유틸+훅 혼재)   │   └── trip.ts            (trip-utils에서 이동)
│   ├── storage.ts                         ├── queries/
│   ├── budget-utils.ts                    │   ├── useTrips.ts        (React Query)
│   ├── trip-utils.ts                      │   ├── useWeather.ts      (React Query)
│   ├── emoji-to-icon.tsx                  │   └── useCurrency.ts     (React Query)
│   ├── weather-utils.ts                   ├── stores/
│   ├── geocoding.ts                       │   ├── useChatStore.ts    (fetch 분리 후)
│   ├── currency-utils.ts                  │   ├── useUIStore.ts      (변경 없음)
│   ├── api-cache.ts                       │   └── useEditStore.ts    (변경 없음)
│   ├── constants.ts                       ├── lib/
│   ├── useWeather.ts      (훅)            │   ├── storage.ts         (변경 없음)
│   ├── useCurrency.ts     (훅)            │   ├── emoji-to-icon.tsx
│   └── utils.ts                           │   ├── weather-utils.ts
└── components/                            │   ├── geocoding.ts
                                           │   ├── currency-utils.ts
                                           │   ├── api-cache.ts
                                           │   ├── constants.ts
                                           │   └── utils.ts
                                           └── components/            (변경 없음)
```

### 1.2 레이어 구조 비교

```
AS-IS: 2레이어 (사실상)                   TO-BE: 4레이어

┌─────────────────────────┐              ┌─────────────────────────┐
│      Components         │              │      Components         │
│  (직접 store 접근,      │              │  (queries 훅 사용,      │
│   직접 fetch 호출)      │              │   store는 클라이언트만) │
├─────────────────────────┤              ├─────────────────────────┤
│     Stores (Zustand)    │              │  Queries (React Query)  │
│  서버상태 + 클라이언트  │              │  서버 상태 전담         │
│  상태 혼재              │              ├─────────────────────────┤
│                         │              │  Stores (Zustand)       │
│                         │              │  클라이언트 상태만      │
├─────────────────────────┤              ├─────────────────────────┤
│     lib/ (혼합)         │              │  Domain (순수 함수)     │
│  유틸 + 훅 + 도메인로직 │              ├─────────────────────────┤
├─────────────────────────┤              │  API (fetch/SDK 래퍼)   │
│   api/gemini.ts         │              │  gemini + weather +     │
│   (서버 전용 SDK)       │              │  currency               │
└─────────────────────────┘              └─────────────────────────┘
```

### 1.3 핵심 변경 요약

| 영역 | 현재 상태 | 목표 상태 | 이유 |
|------|-----------|-----------|------|
| Trip CRUD | useTripStore (Zustand + localStorage) | React Query + storage.ts | 캐시/로딩/에러 자동 관리, Supabase 전환 준비 |
| 날씨/환율 | useWeather/useCurrency (useState+useEffect) | React Query 훅 | 캐시 중복 제거, 로딩 상태 일관성 |
| 채팅 | useChatStore (fetch + 상태 + 영속화) | fetch 분리 + store 경량화 | 관심사 분리 |
| 도메인 로직 | lib/*-utils.ts | domain/*.ts | 비즈니스 로직 응집도 향상 |
| useUIStore | 순수 클라이언트 상태 | **변경 없음** | 이미 적절함 |
| useEditStore | 순수 클라이언트 상태 | **변경 없음** | 이미 적절함 |
| gemini.ts | SDK+DTO+변환 단일 파일 | **변경 없음** | 이미 Practical RA 원칙 준수 |

---

## 2. 레이어별 리팩토링 계획

### 2.1 API Layer

#### gemini.ts -- 변경 불필요

현재 `api/gemini.ts`는 이미 Practical React Architecture의 API 레이어 원칙을 잘 따르고 있다.

- DTO 타입(`GeminiCreateResponseDTO`)이 파일 내부에 지역적으로 존재
- 변환 함수(`toTrip`, `normalizeDays` 등)가 API 레이어 안에서 DTO를 Domain 타입으로 변환
- 외부에는 Domain 타입(`Trip`, `CreateTripResult`)만 노출
- SDK 초기화, 프롬프트, rate limit 관리가 응집성 있게 하나의 모듈에

이 파일은 서버 전용(Route Handler에서만 호출)이므로 클라이언트 API fetch 함수와 성격이 다르다. 건드리지 않는다.

#### 날씨/환율 API fetch 함수 추출

현재 `useWeather.ts`, `useCurrency.ts`에서 fetch 로직과 상태 관리가 합쳐져 있다. fetch 함수를 API 레이어로 분리한다.

**생성할 파일:**

```
api/weather.ts   -- /api/weather Route Handler를 호출하는 클라이언트 fetch 함수
api/currency.ts  -- /api/currency Route Handler를 호출하는 클라이언트 fetch 함수
```

**api/weather.ts 역할:**
- `fetchWeather(params)` 함수: URL 조립 + fetch + 에러 처리 + 타입 반환
- `WeatherApiResponse` DTO는 이 파일 안에서만 사용
- 외부에는 `LiveWeatherDay[]`만 반환 (현재 `useWeather.ts`에 정의된 타입)
- 폴백 좌표 재시도 로직도 이 함수 안에 포함

**api/currency.ts 역할:**
- `fetchCurrencyRate(from, to)` 함수: URL 조립 + fetch + 에러 처리
- `CurrencyApiResponse` DTO는 이 파일 안에서만 사용
- 외부에는 `{ rate: number, lastUpdated: string }`만 반환

**이 프로젝트의 특수성:**
- 일반적인 Practical RA에서는 외부 REST API 클라이언트를 API 레이어에 두지만, 이 프로젝트는 **자체 Route Handler**(`/api/weather`, `/api/currency`)를 호출하는 구조
- Route Handler 자체는 `app/api/` 디렉토리에 그대로 유지 (Next.js 컨벤션)
- API 레이어의 fetch 함수는 "Route Handler를 호출하는 클라이언트 코드"만 담당

#### Chat API fetch 함수 추출

현재 `useChatStore.ts`의 `sendMessage` 안에 `fetch('/api/chat', ...)` 호출이 직접 들어있다.

**생성할 파일:**
```
api/chat.ts  -- /api/chat Route Handler를 호출하는 클라이언트 fetch 함수
```

**역할:**
- `sendChatMessage(messages, mode, tripContext?)`: fetch + JSON 파싱 + 에러 처리
- `ChatApiResponse` DTO는 이 파일 안에서만 사용
- useChatStore는 이 함수를 호출하고 상태만 업데이트

### 2.2 Domain Types -- 변경 불필요

`types/trip.ts`는 이미 프론트엔드 관점의 Domain 타입만 담고 있다.

- `Trip`, `Day`, `TimelineItem` 등 = 비즈니스 Entity
- `ChatMessage`, `TripAction` = 채팅 도메인 타입
- `TripSummary` = 파생 타입 (읽기 전용 DTO 아닌, 도메인 수준 요약)

Gemini API의 DTO(`GeminiCreateResponseDTO`)는 이미 `api/gemini.ts` 안에만 존재하므로, 타입 레이어가 오염되지 않았다. 변경 불필요.

### 2.3 Query Hooks Layer (신규 도입)

이 프로젝트에서 가장 큰 실질적 이득을 제공하는 변경이다.

#### 2.3.1 React Query 도입 배경

현재 서버 상태 관리의 문제점:
1. **useTripStore**: localStorage 데이터를 Zustand Map에 수동 동기화 (loadTrips 호출 타이밍 관리 필요)
2. **useWeather/useCurrency**: useState+useEffect 패턴으로 로딩/에러 상태를 매번 수동 관리
3. **api-cache.ts**: 서버 사이드 인메모리 캐시를 직접 구현 (React Query의 클라이언트 캐시로 대체 가능 영역 아님 -- Route Handler용이므로 유지)

#### 2.3.2 도입할 Query 훅

**queries/useTrips.ts**
```
- useTrips(): 전체 여행 목록 조회 (TripSummary[])
- useTrip(tripId): 단일 여행 조회
- useSaveTrip(): mutation (저장)
- useDeleteTrip(): mutation (삭제)

queryFn 내부에서 storage.ts 함수를 직접 호출한다.
(localStorage 기반이므로 네트워크 요청이 아니라 동기적 호출이지만,
React Query의 캐시/무효화/로딩 상태 관리 이점을 활용)
```

**왜 localStorage인데 React Query를 쓰는가?**

1. useTripStore의 `trips` Map과 localStorage 간 수동 동기화가 불필요해진다
2. mutation 후 자동 무효화 (`queryClient.invalidateQueries`)로 일관된 상태 보장
3. Supabase 전환 시 `queryFn`만 교체하면 된다 (storage.getTrip -> supabase.from('trips'))
4. 로딩/에러 상태를 컴포넌트가 개별 관리할 필요 없이 `useTrip(id).isLoading`으로 통일

**queries/useWeather.ts**
```
- useWeather(destination, startDate, endDate, fallbackCoords?)
  현재 lib/useWeather.ts의 useState+useEffect를 React Query로 전환
  queryFn에서 api/weather.ts의 fetchWeather() 호출
  staleTime: 1시간 (현재 서버 캐시 TTL과 동일)
```

**queries/useCurrency.ts**
```
- useCurrency(from, to)
  현재 lib/useCurrency.ts의 useState+useEffect를 React Query로 전환
  queryFn에서 api/currency.ts의 fetchCurrencyRate() 호출
  staleTime: 30분
```

#### 2.3.3 적용 불가/불필요한 부분

**useChatStore는 React Query로 전환하지 않는다.**

이유:
- 채팅은 **스트리밍/세션 기반** 상호작용이다. "서버 상태를 캐시한다"는 React Query의 멘탈 모델과 맞지 않는다.
- sessionStorage 영속화는 React Query persist 플러그인보다 현재 Zustand persist가 더 단순하다.
- sendMessage는 "쿼리"가 아니라 "대화 진행"이다. mutation으로 모델링할 수 있지만, 메시지 목록 + 로딩 + 에러 + generatedTrip을 하나의 mutation으로 관리하면 오히려 복잡해진다.

대신 fetch 로직만 `api/chat.ts`로 추출하여 관심사를 분리한다.

### 2.4 Domain Functions Layer

#### budget-utils.ts -> domain/budget.ts

`budget-utils.ts`의 함수들은 순수 비즈니스 로직이다:
- `parseAmountString`: 통화 파싱
- `migrateBudgetItem`, `migrateBudget`: 데이터 마이그레이션
- `calculateBudgetTotal`: 합계 계산
- `formatCurrency`, `convertToKRW`: 통화 포맷

이들을 `domain/budget.ts`로 이동한다. "utils"가 아니라 "도메인 함수"로 명확히 분류.

#### trip-utils.ts -> domain/trip.ts

`trip-utils.ts`의 함수들도 순수 비즈니스 로직:
- `groupTrips`: 여행 상태별 그룹핑
- `getDDay`, `getTripStatus`: 여행 상태 판별
- `getPackingProgress`: 체크리스트 진행률
- `getDDayBadgeStyle`: 상태별 스타일

이들을 `domain/trip.ts`로 이동한다.

#### 이동하지 않는 것들

다음 파일들은 "도메인 함수"가 아니라 **인프라 유틸**이므로 `lib/`에 유지:

| 파일 | 이유 |
|------|------|
| `lib/storage.ts` | 인프라 (localStorage 접근) |
| `lib/api-cache.ts` | 인프라 (서버 캐시) |
| `lib/geocoding.ts` | 인프라 (외부 API 호출) |
| `lib/weather-utils.ts` | 인프라 (WMO 코드 매핑 테이블) |
| `lib/currency-utils.ts` | 인프라 (목적지-통화 매핑 테이블) |
| `lib/emoji-to-icon.tsx` | UI 유틸 (React 컴포넌트 반환) |
| `lib/constants.ts` | 상수 정의 |
| `lib/utils.ts` | 범용 유틸 (cn 등) |

### 2.5 Store Layer 경량화

#### useTripStore 축소

React Query 도입 후 useTripStore에서 제거되는 것:

| 현재 | 이후 | 이유 |
|------|------|------|
| `trips: Map<string, Trip>` | 제거 | React Query 캐시로 대체 |
| `isLoaded: boolean` | 제거 | useTrips().isSuccess로 대체 |
| `loadTrips()` | 제거 | React Query가 자동 fetch |
| `saveTrip(trip)` | 제거 | useSaveTrip() mutation으로 대체 |
| `deleteTrip(tripId)` | 제거 | useDeleteTrip() mutation으로 대체 |
| `getTripSummaries()` | 제거 | useTrips() 쿼리로 대체 |

**useTripStore에 남는 것:**

```
- currentTripId: string | null       (UI 상태: 현재 보고 있는 여행)
- setCurrentTrip(tripId): void
- togglePackingItem(tripId, ...): void  (localStorage 직접 접근 + 리렌더 트리거)
```

`togglePackingItem`은 React Query mutation으로 전환할 수도 있지만, 체크 상태가 Trip 데이터와 별도 키로 저장되어 있고(`packing:checked:{tripId}`), 빈번한 토글이 발생하므로 현재 구조를 유지하는 것이 단순하다. Supabase 전환 시 함께 이관하면 된다.

#### useChatStore 경량화

fetch 로직을 `api/chat.ts`로 추출한 후:

```
// 변경 전 sendMessage:
- 유저 메시지 생성 + set
- fetch('/api/chat', ...) 직접 호출
- 응답 파싱 + assistantMessage 생성 + set
- 에러 처리 + set

// 변경 후 sendMessage:
- 유저 메시지 생성 + set
- const result = await chatApi.send(messages, mode, tripContext)  // api/chat.ts
- assistantMessage 생성 + set
- 에러 처리 + set
```

Store의 책임: **메시지 목록 관리 + 로딩/에러 상태 + sessionStorage 영속화**
API의 책임: **HTTP 통신 + DTO 변환 + 에러 매핑**

#### useUIStore, useEditStore -- 변경 없음

둘 다 순수 클라이언트 상태만 관리하고 있어 변경 불필요.

---

## 3. 파일 이동/생성/삭제 매핑

### 3.1 생성

| 파일 | 내용 | 의존성 |
|------|------|--------|
| `api/weather.ts` | fetchWeather() 클라이언트 fetch 함수 | types/trip.ts (LiveWeatherDay 타입은 여기로 이동) |
| `api/currency.ts` | fetchCurrencyRate() 클라이언트 fetch 함수 | - |
| `api/chat.ts` | sendChatMessage() 클라이언트 fetch 함수 | types/trip.ts |
| `queries/useTrips.ts` | useTrips, useTrip, useSaveTrip, useDeleteTrip | api 불필요 (storage.ts 직접), domain/trip.ts |
| `queries/useWeather.ts` | useWeather (React Query) | api/weather.ts |
| `queries/useCurrency.ts` | useCurrency (React Query) | api/currency.ts |
| `domain/budget.ts` | 예산 도메인 함수들 | types/trip.ts |
| `domain/trip.ts` | 여행 도메인 함수들 | types/trip.ts |

### 3.2 삭제 (이동 완료 후)

| 파일 | 이유 |
|------|------|
| `lib/budget-utils.ts` | domain/budget.ts로 이동 |
| `lib/trip-utils.ts` | domain/trip.ts로 이동 |
| `lib/useWeather.ts` | queries/useWeather.ts로 대체 |
| `lib/useCurrency.ts` | queries/useCurrency.ts로 대체 |

### 3.3 수정

| 파일 | 변경 내용 |
|------|-----------|
| `stores/useTripStore.ts` | trips Map, loadTrips, saveTrip, deleteTrip, getTripSummaries 제거 |
| `stores/useChatStore.ts` | fetch 로직을 api/chat.ts 호출로 교체 |
| `api/gemini.ts` | `migrateBudget` import 경로 변경 (`lib/budget-utils` -> `domain/budget`) |
| `lib/storage.ts` | `migrateBudget` import 경로 변경 |
| 컴포넌트 다수 | useTripStore -> useTrips/useTrip/useSaveTrip 교체, import 경로 변경 |

### 3.4 변경 없음

| 파일 | 이유 |
|------|------|
| `types/trip.ts` | 이미 깨끗한 도메인 타입 |
| `api/gemini.ts` | 이미 API 레이어 원칙 준수 |
| `stores/useUIStore.ts` | 순수 클라이언트 상태 |
| `stores/useEditStore.ts` | 순수 클라이언트 상태 |
| `app/api/chat/route.ts` | 이미 얇은 핸들러 |
| `app/api/weather/route.ts` | 서버 사이드 로직, 변경 불필요 |
| `lib/storage.ts` | 인프라 레이어로 적절 (import 경로만 변경) |
| `lib/api-cache.ts` | 서버 사이드 인메모리 캐시, React Query와 무관 |
| `lib/geocoding.ts` | 서버 사이드 유틸, 변경 불필요 |
| `lib/weather-utils.ts` | 인프라 매핑 테이블 |
| `lib/currency-utils.ts` | 인프라 매핑 테이블 |
| `lib/emoji-to-icon.tsx` | UI 유틸 |
| `lib/constants.ts` | 상수 |
| `lib/utils.ts` | 범용 유틸 |
| `components/` 전체 구조 | 컴포넌트 자체 구조는 양호 |

---

## 4. 단계별 실행 순서

### Phase 0: React Query 인프라 설치 (사전 준비)

**소요**: 30분
**위험도**: 낮음 (기존 코드 변경 없음)

1. `@tanstack/react-query` 패키지 설치
2. `QueryClientProvider` 설정 (app/layout.tsx 또는 providers.tsx)
3. DevTools 설정 (개발 환경만)
4. 기존 코드에 영향 없음을 확인

### Phase 1: Domain 함수 추출 (가장 안전한 변경)

**소요**: 1시간
**위험도**: 매우 낮음 (파일 이동 + import 변경만)

1. `domain/budget.ts` 생성 -- `lib/budget-utils.ts` 내용 복사
2. `domain/trip.ts` 생성 -- `lib/trip-utils.ts` 내용 복사
3. 기존 파일에서 새 파일로 re-export 추가 (호환성 유지)
   ```ts
   // lib/budget-utils.ts (임시 호환 레이어)
   export { parseAmountString, migrateBudget, ... } from '@/domain/budget';
   ```
4. 모든 import를 새 경로로 변경
5. 구 파일의 re-export 제거 후 파일 삭제
6. 빌드 확인

### Phase 2: API fetch 함수 추출

**소요**: 1시간
**위험도**: 낮음

1. `api/weather.ts` 생성 -- `useWeather.ts`에서 fetch 로직 추출
2. `api/currency.ts` 생성 -- `useCurrency.ts`에서 fetch 로직 추출
3. `api/chat.ts` 생성 -- `useChatStore.ts`에서 fetch 로직 추출
4. 기존 훅에서 새 API 함수를 호출하도록 변경 (동작 변경 없음)
5. useChatStore에서 fetch 로직을 api/chat.ts 호출로 교체
6. 빌드 + 동작 확인

### Phase 3: React Query 점진 도입 (핵심 변경)

**3-A: 날씨/환율 훅 전환** (가장 단순, 먼저 연습)

**소요**: 2시간
**위험도**: 중간

1. `queries/useWeather.ts` 생성 (React Query 기반)
2. `queries/useCurrency.ts` 생성 (React Query 기반)
3. 사용처 컴포넌트(`SummaryTab`, `BudgetTab` 등)에서 import 변경
4. 기존 `lib/useWeather.ts`, `lib/useCurrency.ts` 삭제
5. 동작 확인: 날씨/환율 데이터 로딩, 에러 처리, 캐시 동작

**3-B: Trip CRUD 전환** (가장 영향 범위 넓음, 신중하게)

**소요**: 4시간
**위험도**: 높음

1. `queries/useTrips.ts` 생성
   - `useTrips()`: storage.getAllTrips() 기반
   - `useTrip(tripId)`: storage.getTrip(tripId) 기반
   - `useSaveTrip()`: useMutation + invalidateQueries
   - `useDeleteTrip()`: useMutation + invalidateQueries
2. 홈 페이지 컴포넌트부터 전환 (TripCard, TripHeroCard)
   - `useTripStore.getTripSummaries()` -> `useTrips()`
3. 여행 상세 페이지 전환
   - `useTripStore.trips.get(id)` -> `useTrip(id).data`
4. 저장/삭제 전환
   - `useTripStore.saveTrip(trip)` -> `useSaveTrip().mutate(trip)`
   - `useTripStore.deleteTrip(id)` -> `useDeleteTrip().mutate(id)`
5. useEditStore.saveSectionEdit의 `useTripStore.getState().saveTrip(cleaned)` 호출 변경
   - 방법 A: useEditStore 내부에서 queryClient 직접 사용 (비권장)
   - 방법 B: saveSectionEdit가 cleaned Trip을 반환, 컴포넌트에서 useSaveTrip 호출 (권장)
6. useTripStore에서 제거된 필드/함수 삭제
7. 전체 flow 테스트: 생성 -> 조회 -> 수정 -> 삭제

### Phase 4: 정리

**소요**: 30분

1. 미사용 import 제거
2. 빈 파일 삭제
3. 빌드 + Vercel preview 배포 확인

---

## 5. Supabase 마이그레이션과의 관계

### 5.1 이 리팩토링이 Phase 0인 이유

```
현재: Component -> useTripStore -> storage.ts -> localStorage
이후: Component -> useTrip()    -> storage.ts -> localStorage     (리팩토링 완료)
미래: Component -> useTrip()    -> supabase.ts -> Supabase         (Phase 1)
```

React Query를 도입하면:
- 컴포넌트는 `useTrip(id)`만 호출한다 (데이터 소스를 모른다)
- `queryFn` 안의 `storage.getTrip(id)`를 `supabase.from('trips').select().eq('id', id)`로 교체하면 끝
- 캐시/로딩/에러/무효화 로직은 그대로 유지

### 5.2 충돌 방지 체크리스트

| 리팩토링 결정 | Supabase 전환에 미치는 영향 |
|---------------|---------------------------|
| storage.ts를 queryFn 안에서 호출 | queryFn만 교체하면 되므로 문제 없음 |
| api-cache.ts 유지 | Route Handler용 서버 캐시이므로 독립적 |
| useChatStore를 React Query로 전환하지 않음 | 채팅 데이터는 Supabase 이관 대상이 아님 (sessionStorage 유지) |
| togglePackingItem을 useTripStore에 유지 | 별도 키 저장이므로 Supabase 시 독립 테이블로 이관 가능 |
| domain/ 폴더 도입 | 데이터 소스와 무관한 순수 함수이므로 영향 없음 |

### 5.3 Supabase 전환 시 변경 범위 예측

| 파일 | 변경 내용 |
|------|-----------|
| `queries/useTrips.ts` | queryFn 내부만 변경 (storage -> supabase client) |
| `lib/storage.ts` | 오프라인 폴백 또는 삭제 |
| `app/api/chat/route.ts` | 채팅 로그 저장 추가 (선택) |
| `domain/*.ts` | 변경 없음 (순수 함수) |
| `components/*` | 변경 없음 (쿼리 훅 인터페이스 동일) |

---

## 6. 적용하지 않는 Practical RA 원칙과 그 이유

| 원칙 | 적용하지 않는 이유 |
|------|-------------------|
| API Client 패턴 (axios instance 등) | 자체 Route Handler를 fetch()로 호출하므로 별도 클라이언트 불필요 |
| Infrastructure Service + DI | 프로토타입 규모에서 과도한 추상화. MSW 없이 storage.ts 직접 테스트 가능 |
| DTO를 별도 파일로 분리 | gemini.ts의 DTO는 이미 지역적, weather/currency Route Handler의 응답 타입도 파일 내부에 |
| Use Case Hook (복수 API + 분기) | 현재 이 정도 복잡한 유스케이스가 없음. 필요 시 추가 |
| 모든 Store를 React Query로 전환 | useChatStore(세션 대화), useUIStore(UI 상태), useEditStore(편집 상태)는 서버 상태가 아님 |

---

## 7. 리스크 및 대응

### 7.1 Phase 3-B (Trip CRUD 전환)의 주의점

**useEditStore.saveSectionEdit 연동 문제:**

현재 useEditStore가 `useTripStore.getState().saveTrip(cleaned)`를 직접 호출한다. React Query 전환 후에는 Store 바깥에서 mutation을 호출해야 한다.

권장 패턴:
```
// useEditStore: cleaned Trip을 반환하도록 변경
saveSectionEdit: () => {
  const { editingTrip } = get();
  if (!editingTrip) return null;
  const cleaned = cleanTrip(editingTrip); // 정리 로직
  set({ editingSection: null, editingTrip: null });
  return cleaned; // 컴포넌트에서 useSaveTrip().mutate(cleaned) 호출
}

// SectionEditHeader 컴포넌트:
const saveTrip = useSaveTrip();
const handleSave = () => {
  const cleaned = useEditStore.getState().saveSectionEdit();
  if (cleaned) saveTrip.mutate(cleaned);
};
```

**localStorage 동기 호출의 React Query 적합성:**

localStorage는 동기적이지만, React Query의 queryFn은 비동기를 기대한다. `Promise.resolve(storage.getTrip(id))`로 감싸면 동작하지만, 불필요한 비동기 오버헤드가 있다. 그러나 이 오버헤드는 무시 가능한 수준이며, Supabase 전환 시 자연스럽게 비동기가 된다.

### 7.2 롤백 전략

각 Phase는 독립적으로 롤백 가능하다:
- Phase 1 (domain 추출): re-export 제거하고 원래 import 복원
- Phase 2 (API fetch 추출): 기존 훅으로 import 복원
- Phase 3-A (날씨/환율): 기존 훅으로 되돌리기
- Phase 3-B (Trip CRUD): useTripStore의 제거된 코드 복원 + 컴포넌트 import 복원

Phase별로 커밋을 분리하면 `git revert`로 개별 롤백이 가능하다.

---

## 8. 컴포넌트 내 도메인 로직 추출

컴포넌트 파일 안에 산재한 도메인 로직, 포맷팅, 매핑 상수를 정리한다.

### 8.1 중복 로직 — 최우선 추출

#### `todayStr` 계산 (3곳 중복)

SummaryTab, DayCard, ChecklistTab에서 동일한 "오늘 날짜 문자열" 계산이 반복된다.

```
// SummaryTab.tsx:317-320, DayCard.tsx:23-26 — 동일 패턴
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
```

추출: `lib/date-utils.ts` → `getTodayISO()`, `isToday(dateStr)`

#### 날짜 포맷팅 (4곳 각각 다른 패턴)

| 파일 | 포맷 | 용도 |
|------|------|------|
| QuickSetupForm:27-30 | "3월 15일" | 한글 짧은 포맷 |
| TripPreviewCard:19-24 | "3월 15일 ~ 3월 20일" | 날짜 범위 |
| TripCard:56 | "2026.03.15" | 점 구분 포맷 |
| ChatMessage:14-16 | "14:30" | 시간만 |

추출: `lib/date-utils.ts` → `formatDateKR()`, `formatDateRange()`, `formatDateDot()`, `formatTime()`

### 8.2 도메인 로직 — 비즈니스 규칙

#### 환율 계산 (CurrencyConverter.tsx:76-108)

양방향 환율 계산, 역수 처리, 포맷팅이 컴포넌트 안에 있다.

```
calculateConversion() — 방향별 계산 (KRW ↔ 현지 통화), 역수 처리
formatNumber() — 천 단위 쉼표, 소수점 2자리
getTimeAgo() — 경과 시간 텍스트 변환
CURRENCY_SYMBOLS — 통화 코드→기호 매핑 (17-39줄)
```

추출: `domain/budget.ts` 확장 또는 `lib/currency-utils.ts` 확장

#### 맛집 그룹핑 (GuideTab.tsx:634-642)

맛집을 dayNumber 기준으로 그룹핑 + 정렬하는 로직이 컴포넌트 안에 있다.

추출: `domain/trip.ts` → `groupRestaurantsByDay(restaurants)`

#### 진행률 계산 (ChecklistTab.tsx:98-106)

체크리스트 전체 진행률을 reduce로 집계하는 로직.

추출: `domain/trip.ts` → `calculatePackingProgress(categories, checkedItems)`

#### 프롬프트 조립 (QuickSetupForm.tsx:58-68)

Quick Setup 폼 데이터 → AI 프롬프트 텍스트 변환 로직.

추출: `lib/prompt-builder.ts` → `buildQuickSetupPrompt(formData)`

#### 예산 헤더 suffix (BudgetTab.tsx:419-432)

예산 총액을 표시할 때 total/items 기반 조건 분기 + 포맷팅.

추출: `domain/budget.ts` → `getBudgetSuffix(budget)`

### 8.3 매핑 상수 — 응집도 향상

| 현재 위치 | 상수 | 추출 위치 |
|-----------|------|-----------|
| BudgetTab:22-42 | `BUDGET_EMOJI_OPTIONS`, `CURRENCY_OPTIONS` | `lib/constants.ts` |
| GuideTab:24-38 | `TRANSPORT_EMOJI_OPTIONS` | `lib/constants.ts` |
| CurrencyConverter:17-39 | `CURRENCY_SYMBOLS` | `lib/constants.ts` |
| TimelineItem:11-16 | `timeColor` 타입→색상 | `lib/constants.ts` |
| CalendarGrid:12-13 | `WEEKDAY_LABELS` | `lib/constants.ts` |
| GuideTab:416-426 | `getPassColor()` | `lib/constants.ts` |

> **판단 기준**: 1곳에서만 쓰이는 매핑 상수는 해당 컴포넌트에 두어도 괜찮다. 하지만 편집 UI와 뷰어 UI에서 동일 매핑이 필요한 경우(예: `BUDGET_EMOJI_OPTIONS`은 인라인 편집에서도 사용) 공유 위치로 추출한다.

### 8.4 UI 헬퍼 — 추출 선택적

다음은 순수 UI 렌더링 보조 로직으로, 추출 이득이 적다:

| 파일 | 로직 | 판단 |
|------|------|------|
| DonutChart:31-67 | SVG arc path 계산 | 이 컴포넌트 전용, 유지 |
| ChatMessage:19-73 | 마크다운 파싱 | 재사용 가능성 있으면 추출 |
| TripCard:22-24 | 이모지 판별 (Intl.Segmenter) | TripHeroCard에서도 쓰면 추출 |
| TripBar:16-21 | borderRadius 조건 | cn() 패턴으로 충분, 유지 |

### 8.5 실행 순서 (기존 Phase와 통합)

이 작업은 기존 **Phase 1 (Domain 함수 추출)** 과 함께 수행한다:

```
Phase 1-A: lib/budget-utils.ts → domain/budget.ts (기존 계획)
Phase 1-B: lib/trip-utils.ts → domain/trip.ts (기존 계획)
Phase 1-C: 컴포넌트 내 도메인 로직 추출 (신규)
  1. lib/date-utils.ts 생성 — todayStr, 날짜 포맷팅 통합
  2. domain/budget.ts에 환율 계산/포맷팅 추가
  3. domain/trip.ts에 맛집 그룹핑, 진행률 계산 추가
  4. lib/constants.ts에 매핑 상수 통합
  5. lib/prompt-builder.ts 생성
  6. 컴포넌트에서 추출한 함수 import로 교체
```

---

## 9. 성공 지표

| 지표 | 측정 방법 |
|------|-----------|
| useTripStore 코드 50% 이상 감소 | 줄 수 비교 (현재 84줄 -> 목표 30줄 이하) |
| 서버 상태 관리 일원화 | useTripStore에 trips Map 없음 |
| Supabase 전환 준비 | queryFn 교체만으로 데이터 소스 전환 가능 |
| 컴포넌트 내 도메인 로직 제거 | todayStr 중복 0건, 포맷팅 함수 공유화 |
| 빌드 성공 + 배포 성공 | `next build` + Vercel preview 정상 |
| 기능 회귀 없음 | Trip CRUD, 채팅, 날씨, 편집 모두 정상 동작 |
| lib/ 폴더 정리 | 커스텀 훅 0개, 도메인 로직은 domain/ 으로 이동 |
