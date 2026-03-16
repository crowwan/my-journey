# Supabase 전체 마이그레이션 — 전략 계획서

**작성일**: 2026-03-16
**갱신일**: 2026-03-16 (React Query 선행 도입 전략 반영)
**상태**: 계획 수립 완료, 사용자 승인 대기

---

## 1. 핵심 요약

localStorage 기반 단일 사용자 앱을 **Supabase 기반 멀티 유저 클라우드 앱**으로 전환한다.
단순 저장소 교체가 아니라 인증, 데이터 모델, API 레이어, 공유 기능까지 포괄하는 아키텍처 전환이다.

### 2단계 전환 전략

**변경 지점을 격리**하기 위해, 데이터소스 교체(Supabase)와 상태 관리 전환(React Query)을 분리한다.

```
Step 1: React Query 도입 (데이터소스 = localStorage 그대로)
  → useTripStore에서 서버 상태 관리 제거
  → 컴포넌트가 React Query hooks 사용
  → 이 시점에서 기존 기능 100% 동작 검증

Step 2: Supabase 전환 (queryFn 내부만 교체)
  → storage.xxx() → tripApi.xxx() (Supabase)
  → React Query hooks, 컴포넌트 코드 변경 없음
```

**핵심 변경**:
- localStorage → Supabase PostgreSQL (관계형 DB)
- Zustand 직접 async → React Query (서버 상태 관리)
- 인증 없음 → Supabase Auth (소셜 로그인)
- URL 공유 불가 → URL 기반 공유 (DB 조회)

**변경하지 않는 것**:
- UI 컴포넌트 (TripViewer, 탭 구조, 디자인 시스템)
- AI 기능 (Gemini API, 채팅 플로우)
- Vercel 배포 방식

---

## 2. 현재 상태 분석 (AS-IS)

### 2.1 데이터 저장 구조

```
localStorage
├── trip:list          → ["trip-1710000000", "trip-1710000001"]  (ID 배열)
├── trip:{id}          → { 전체 Trip JSON }  (약 20-50KB/여행)
├── packing:checked:{id} → { "의류": ["반팔"], "전자기기": ["충전기"] }
└── chat-session (sessionStorage) → { messages, generatedTrip }
```

**문제점**:
1. **기기 종속**: 다른 기기에서 접근 불가
2. **공유 불가**: URL로 여행 공유 시 상대방 localStorage에 데이터 없음
3. **데이터 유실 위험**: 브라우저 데이터 삭제 시 복구 불가
4. **검색/분석 불가**: 전체 Trip JSON 통째로 저장, 부분 조회 불가
5. **동시 편집 불가**: 단일 사용자만 가정

### 2.2 Trip 데이터 구조 분석

```
Trip (Root Entity) ── 약 15개 하위 타입, 중첩 최대 3단계
├── 메타 정보: id, title, destination, dates, travelers, tags
├── overview
│   ├── flights[]          (2개 고정: outbound/inbound)
│   ├── accommodation      (1개)
│   ├── weather[]          (실시간 API, 저장 불필요)
│   └── tips[]
├── days[]                 (3~10개)
│   ├── items[]            (10~30개/day — 타임라인)
│   └── mapSpots[]         (5~15개/day)
├── restaurants[]          (10~30개)
├── transport
│   ├── homeToHotel[]      (3~6 스텝)
│   ├── intercityRoutes[]  (0~5개)
│   ├── passes[]           (0~3개)
│   └── tips[]
├── budget
│   ├── items[]            (4~8개)
│   └── tips[]
├── packing[]              (카테고리 3~8개, 아이템 10~40개)
└── preTodos[]             (3~10개)
```

**데이터 특성**:
- 하나의 Trip이 약 **200~500개의 개별 데이터 포인트** 포함
- 읽기가 쓰기보다 압도적으로 많음 (조회 >> 편집)
- 편집은 섹션 단위로 발생 (인라인 편집 → 섹션 저장)
- AI 생성 시에는 전체 Trip JSON을 한번에 생성/교체

### 2.3 현재 코드 흐름

```
[UI] → useTripStore.saveTrip(trip)
        → storage.saveTrip(trip)
          → localStorage.setItem('trip:{id}', JSON.stringify(trip))

[UI] → useTripStore.loadTrips()
        → storage.getAllTrips()
          → trip IDs 순회 → localStorage.getItem → JSON.parse → migrateBudget
```

### 2.4 현재 상태 관리의 문제점

useTripStore가 **서버 상태(데이터 페칭/캐싱)와 클라이언트 상태(현재 선택된 Trip)를 혼합**하고 있다.

```typescript
// 현재: 서버 상태 + 클라이언트 상태가 한 Store에 혼재
interface TripState {
  trips: Map<string, Trip>;     // 서버 상태 (데이터 캐시)
  currentTripId: string | null; // 클라이언트 상태
  isLoaded: boolean;            // 서버 상태 (로딩)
  loadTrips: () => void;        // 서버 상태 (페칭)
  saveTrip: (trip: Trip) => void; // 서버 상태 (뮤테이션)
  // ...
}
```

Supabase로 전환하면 이 Store에 isLoading, error, 재시도, 캐시 무효화, 중복 요청 방지 등을 직접 구현해야 한다. React Query가 이 모든 것을 해결한다.

### 2.5 연관 파일 목록

| 파일 | 역할 | Phase 0 변경 | Phase 1+ 변경 |
|------|------|-------------|-------------|
| `src/lib/storage.ts` | localStorage CRUD | 유지 (queryFn으로 래핑) | **교체** (Supabase) |
| `src/stores/useTripStore.ts` | 메모리 캐시 + storage 래퍼 | **제거/최소화** (React Query로 이관) | - |
| `src/stores/useEditStore.ts` | 섹션 편집 → saveTrip 호출 | 수정 (mutation 연동) | - |
| `src/stores/useChatStore.ts` | 세션 채팅 (sessionStorage) | 변경 없음 | 변경 없음 |
| `src/stores/useUIStore.ts` | UI 상태 | 변경 없음 | 변경 없음 |
| `src/types/trip.ts` | Trip 타입 정의 | 변경 없음 | **확장** (userId 등) |
| `src/api/gemini.ts` | Gemini AI 호출 | 변경 없음 | 변경 없음 |
| `src/app/page.tsx` | 홈 (trip 목록) | 수정 (hooks 교체) | 수정 (인증 분기) |
| `src/app/trips/[tripId]/page.tsx` | 여행 상세 | 수정 (hooks 교체) | - |

---

## 3. 목표 상태 (TO-BE)

### 3.1 아키텍처

```
[브라우저]
├── Supabase Auth → 소셜 로그인 (Google, Kakao)
├── React Query → 서버 상태 관리 (캐시, 로딩, 에러, 재시도)
│   ├── useTrips()      → 여행 목록 (queryKey: ['trips'])
│   ├── useTrip(id)     → 여행 상세 (queryKey: ['trip', id])
│   ├── useSaveTrip()   → 저장 mutation
│   ├── useDeleteTrip() → 삭제 mutation
│   └── usePackingCheck() → 체크 mutation
├── Zustand (클라이언트 상태만)
│   ├── useUIStore      → 드로어, 뷰 모드
│   ├── useEditStore    → 편집 중 임시 상태
│   └── useChatStore    → 세션 채팅 (sessionStorage)
└── AI 생성 → Trip JSON → saveTripMutation

[Supabase]
├── Auth (사용자 관리)
├── PostgreSQL (관계형 데이터)
│   ├── trips (메타 + JSONB 혼합)
│   ├── trip_days (일정별 분리)
│   ├── restaurants (개별 레코드)
│   ├── budget_items (개별 레코드)
│   ├── packing_categories (카테고리 + items JSONB)
│   ├── pre_todos (개별 레코드)
│   ├── packing_checks (체크 상태)
│   └── trip_shares (공유 권한)
└── RLS (Row Level Security)
```

### 3.2 상태 관리 역할 분리

| 관심사 | 담당 | 이유 |
|--------|------|------|
| 서버 데이터 페칭/캐싱 | **React Query** | 로딩, 에러, 캐시 무효화, 재시도 자동 |
| 서버 데이터 변경 | **React Query mutation** | 낙관적 업데이트, 롤백 자동 |
| UI 상태 (드로어, 뷰모드) | **useUIStore** (Zustand) | 서버 무관, 컴포넌트 간 공유 |
| 편집 임시 상태 | **useEditStore** (Zustand) | 저장 전 로컬 수정본, 서버 무관 |
| 세션 채팅 | **useChatStore** (Zustand + sessionStorage) | 탭 닫으면 초기화, DB 불필요 |

### 3.3 DB 설계 원칙

**하이브리드 정규화 전략**: 완전 정규화도 아니고, 전체 JSONB도 아닌 **실용적 균형**을 취한다.

| 원칙 | 적용 |
|------|------|
| **독립 조회 필요** → 별도 테이블 | trips, trip_days, restaurants, budget_items |
| **항상 함께 로드** → JSONB | overview(flights+accommodation), transport |
| **개수 적고 구조 단순** → JSONB | tips[], tags[], mapSpots[] |
| **빈번한 개별 수정** → 별도 테이블 | packing_checks |

**왜 완전 정규화하지 않나?**
- `timeline_items` (Day당 10~30개)를 별도 테이블로 분리하면 5일 여행 로딩에 150+행 조인 필요
- AI가 전체 Trip JSON을 한번에 생성하므로, insert 시 수십 개 테이블에 분산 저장은 복잡도만 증가
- 현재 편집은 **섹션 단위** (Day 전체, 예산 전체)로 발생 → Day 행의 JSONB items 업데이트가 자연스러움

**왜 전체 JSONB가 아닌가?**
- Trip 목록 조회 시 title, destination, dates만 필요 → 전체 JSON 로드 낭비
- 공유 시 권한 관리에 trip_id 기반 RLS 필요
- 향후 "모든 여행의 맛집" 같은 크로스 여행 쿼리 가능성

---

## 4. 데이터베이스 스키마 설계

### 4.1 테이블 설계

```sql
-- =====================================================
-- 1. profiles (Supabase Auth 확장)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. trips (핵심 엔티티)
-- =====================================================
CREATE TABLE trips (
  id TEXT PRIMARY KEY,                    -- 기존 'trip-{timestamp}' 유지
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INT DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  -- 함께 로드되는 중첩 데이터 → JSONB
  overview JSONB DEFAULT '{}',            -- { flights, accommodation, tips }
  transport JSONB DEFAULT '{}',           -- { homeToHotel, intercityRoutes, passes, passVerdict, tips }
  -- 예산 섹션 메타 (items는 별도 테이블)
  budget_currency TEXT DEFAULT 'KRW',
  budget_exchange_rate NUMERIC,
  budget_tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_start_date ON trips(start_date DESC);

-- =====================================================
-- 3. trip_days (일정 — 가장 큰 데이터)
-- =====================================================
CREATE TABLE trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  color TEXT DEFAULT '#f97316',
  items JSONB DEFAULT '[]',               -- TimelineItem[] (JSONB — Day당 10~30개)
  map_spots JSONB DEFAULT '[]',           -- MapSpot[] (JSONB — Day당 5~15개)
  UNIQUE(trip_id, day_number)
);

CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);

-- =====================================================
-- 4. restaurants (맛집 — 개별 레코드)
-- =====================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  category TEXT DEFAULT '',
  name TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  review_count TEXT,
  description TEXT DEFAULT '',
  price_range TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_restaurants_trip_id ON restaurants(trip_id);

-- =====================================================
-- 5. budget_items (예산 항목 — 개별 레코드)
-- =====================================================
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  icon TEXT DEFAULT '',
  label TEXT NOT NULL,
  detail TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'KRW',
  percentage NUMERIC DEFAULT 0,
  color TEXT DEFAULT '#f97316',
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_budget_items_trip_id ON budget_items(trip_id);

-- =====================================================
-- 6. packing_categories (준비물 카테고리 + items JSONB)
-- =====================================================
CREATE TABLE packing_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  category_icon TEXT DEFAULT '',
  items JSONB DEFAULT '[]',               -- PackingEntry[] ({ name, note })
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_packing_categories_trip_id ON packing_categories(trip_id);

-- =====================================================
-- 7. packing_checks (체크 상태 — 사용자별 분리)
-- =====================================================
CREATE TABLE packing_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  checked_items TEXT[] DEFAULT '{}',      -- 체크된 아이템 이름 배열
  UNIQUE(user_id, trip_id, category)
);

CREATE INDEX idx_packing_checks_trip ON packing_checks(trip_id, user_id);

-- =====================================================
-- 8. pre_todos (사전 준비)
-- =====================================================
CREATE TABLE pre_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT DEFAULT ''
);

CREATE INDEX idx_pre_todos_trip_id ON pre_todos(trip_id);

-- =====================================================
-- 9. trip_shares (공유 권한)
-- =====================================================
CREATE TABLE trip_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,                -- 링크 공유용 고유 토큰
  permission TEXT DEFAULT 'view',         -- 'view' | 'edit'
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ                  -- NULL이면 영구 공유
);

CREATE INDEX idx_trip_shares_token ON trip_shares(share_token);
CREATE INDEX idx_trip_shares_trip ON trip_shares(trip_id);
```

### 4.2 RLS (Row Level Security) 정책

```sql
-- trips: 본인 + 공유받은 사용자만 접근
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_owner" ON trips
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "trips_shared_view" ON trips
  FOR SELECT USING (
    id IN (
      SELECT trip_id FROM trip_shares
      WHERE shared_with_user_id = auth.uid()
         OR (share_token IS NOT NULL AND shared_with_user_id IS NULL)
    )
  );

-- trip_days, restaurants 등: trips 소유자 기준 cascade
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_days_via_trip" ON trip_days
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "trip_days_shared_view" ON trip_days
  FOR SELECT USING (
    trip_id IN (
      SELECT trip_id FROM trip_shares
      WHERE shared_with_user_id = auth.uid()
         OR share_token IS NOT NULL
    )
  );

-- (나머지 테이블도 동일 패턴으로 RLS 적용)
```

### 4.3 타입 매핑 (Trip → DB)

| Trip 필드 | DB 저장 방식 | 이유 |
|-----------|-------------|------|
| id, title, destination, dates | `trips` 컬럼 | 목록 조회, 정렬, 필터링 |
| tags | `trips.tags` (TEXT[]) | PostgreSQL 배열 |
| overview.flights | `trips.overview` JSONB | 항상 Trip과 함께 로드 |
| overview.accommodation | `trips.overview` JSONB | 항상 Trip과 함께 로드 |
| overview.weather | **저장하지 않음** | 실시간 API |
| overview.tips | `trips.overview` JSONB | 항상 Trip과 함께 로드 |
| days[].items | `trip_days.items` JSONB | Day 단위 편집 |
| days[].mapSpots | `trip_days.map_spots` JSONB | Day 단위 편집 |
| restaurants | `restaurants` 테이블 | 크로스 여행 쿼리 가능 |
| transport | `trips.transport` JSONB | 항상 전체 로드 |
| budget.items | `budget_items` 테이블 | 개별 편집 + 차트 데이터 |
| budget.currency/rate/tips | `trips` 컬럼 | Trip 메타 |
| packing | `packing_categories` 테이블 | 카테고리 단위 편집 |
| packing 체크 | `packing_checks` 테이블 | 사용자별 분리 |
| preTodos | `pre_todos` 테이블 | 개별 편집 |

---

## 5. 구현 단계

### Phase 0: React Query 도입 (localStorage 기반) — 규모: L

**목표**: useTripStore의 서버 상태 관리를 React Query로 이관. 데이터소스는 localStorage 그대로 유지하여, 기존 기능이 100% 동작하는 상태에서 상태 관리 패턴만 전환.

**의존성**: 없음 (독립 실행 가능)

#### 0-1. React Query 설치 + Provider 설정
- 패키지: `@tanstack/react-query`, `@tanstack/react-query-devtools`
- `src/app/providers.tsx` — QueryClientProvider 래퍼 생성
- `src/app/layout.tsx` — Providers로 children 감싸기
- QueryClient 설정:
  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,   // 5분 (localStorage 데이터는 외부 변경 없음)
        gcTime: 1000 * 60 * 30,     // 30분
        retry: false,                // localStorage는 재시도 불필요
      },
    },
  });
  ```

#### 0-2. Trip Query/Mutation Hooks 생성
- 파일: `src/hooks/useTripQueries.ts`
- 현재 `storage.ts`를 queryFn으로 래핑:
  ```typescript
  // 여행 목록
  export function useTrips() {
    return useQuery({
      queryKey: ['trips'],
      queryFn: () => storage.getTripSummaries(),
    });
  }

  // 여행 상세
  export function useTrip(tripId: string | null) {
    return useQuery({
      queryKey: ['trip', tripId],
      queryFn: () => storage.getTrip(tripId!),
      enabled: !!tripId,
    });
  }

  // 여행 저장 (생성 + 수정)
  export function useSaveTrip() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (trip: Trip) => {
        storage.saveTrip(trip);
        return trip;
      },
      onSuccess: (trip) => {
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.setQueryData(['trip', trip.id], trip);
      },
    });
  }

  // 여행 삭제
  export function useDeleteTrip() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (tripId: string) => {
        storage.deleteTrip(tripId);
        return tripId;
      },
      onSuccess: (tripId) => {
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.removeQueries({ queryKey: ['trip', tripId] });
      },
    });
  }

  // 준비물 체크
  export function usePackingChecks(tripId: string) {
    return useQuery({
      queryKey: ['packing-checks', tripId],
      queryFn: () => storage.getPackingChecked(tripId),
    });
  }

  export function useTogglePackingItem() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ tripId, category, itemName }: {...}) => {
        // 기존 toggle 로직
      },
      onSuccess: (_, { tripId }) => {
        queryClient.invalidateQueries({ queryKey: ['packing-checks', tripId] });
      },
    });
  }
  ```

#### 0-3. useTripStore 축소
- **제거**: trips Map, isLoaded, loadTrips, saveTrip, deleteTrip, getTripSummaries, togglePackingItem
- **유지**: currentTripId, setCurrentTrip (순수 클라이언트 상태)
- 또는 currentTripId도 URL params로 대체하여 **useTripStore 완전 제거** 검토
  - 현재 `[tripId]/page.tsx`에서 이미 params에서 tripId를 추출하고 있으므로 가능

#### 0-4. 컴포넌트 마이그레이션
- `src/app/page.tsx` (홈):
  - `useTripStore.getTripSummaries()` → `useTrips()`
  - `useTripStore.deleteTrip()` → `useDeleteTrip().mutate()`
  - `isLoaded` → `isLoading` (React Query 자동 제공)
- `src/app/trips/[tripId]/page.tsx` (상세):
  - `useTripStore.trips.get(tripId)` → `useTrip(tripId)`
  - 로딩/에러 상태 자동 처리
- `useEditStore.saveSectionEdit()`:
  - 내부 `useTripStore.getState().saveTrip()` → mutation 연동
  - 방법: useEditStore에서 saveFn을 인자로 받거나, 컴포넌트에서 mutation 호출
- AI 채팅 플로우:
  - `useChatStore` → Trip 생성 후 `useSaveTrip().mutate(trip)` 호출
  - Split View에서 수정 후 저장도 동일

#### 0-5. 검증
- 기존 기능 전체 동작 확인 (생성, 편집, 삭제, 체크, AI 생성/수정)
- React Query Devtools로 캐시 상태 확인
- 새로고침 후 데이터 유지 확인

**수용 기준**: localStorage 기반으로 모든 기능이 React Query hooks를 통해 동작. useTripStore에서 서버 상태 관리 코드 완전 제거.

---

### Phase 1: Supabase 프로젝트 설정 — 규모: S

**목표**: Supabase 프로젝트 생성, 환경변수 설정, SDK 설치

**의존성**: Phase 0 완료 (React Query 패턴 확립 후)

#### 1-1. Supabase 프로젝트 생성
- Supabase 대시보드에서 프로젝트 생성 (ap-northeast-2 리전)
- Project URL, anon key, service_role key 확보
- 환경변수 설정:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...  (서버 전용)
  ```
- Vercel 환경변수에도 동일 설정

#### 1-2. SDK 설치 + 클라이언트 초기화
- 패키지: `@supabase/supabase-js`, `@supabase/ssr`
- 파일 생성:
  - `src/lib/supabase/client.ts` — 브라우저 클라이언트 (싱글턴)
  - `src/lib/supabase/server.ts` — 서버 클라이언트 (Route Handler, RSC용)
  - `src/lib/supabase/middleware.ts` — Auth 세션 갱신 미들웨어
- `middleware.ts` (app root) — Supabase Auth 세션 자동 갱신

**수용 기준**: Supabase 클라이언트로 DB 연결 테스트 (select 1) 성공

---

### Phase 2: 데이터베이스 스키마 + Auth — 규모: L

**목표**: 전체 테이블 생성, RLS 설정, 소셜 로그인 구현

**의존성**: Phase 1 완료

#### 2-1. 테이블 생성 (SQL Migration)
- Supabase 대시보드 SQL Editor 또는 `supabase/migrations/` 로컬 마이그레이션
- 4.1절 전체 SQL 실행
- RLS 정책 적용 (4.2절)
- 테스트 데이터 수동 삽입으로 쿼리 검증

#### 2-2. Supabase Auth 설정
- Google OAuth 프로바이더 활성화 (GCP Console에서 OAuth Client ID 발급)
- Kakao OAuth 프로바이더 활성화 (Kakao Developers에서 앱 등록)
- Redirect URL 설정: `https://my-journey-planner.vercel.app/auth/callback`
- Auth trigger: 회원가입 시 `profiles` 테이블 자동 생성 (Database Function)

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '여행자'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 2-3. Auth UI 구현
- `src/app/login/page.tsx` — 로그인 페이지 (소셜 로그인 버튼)
- `src/app/auth/callback/route.ts` — OAuth 콜백 핸들러
- `src/components/layout/AuthGuard.tsx` — 인증 확인 래퍼
- `src/hooks/useAuth.ts` — 인증 상태 React Query hook
  ```typescript
  export function useAuth() {
    return useQuery({
      queryKey: ['auth'],
      queryFn: () => supabase.auth.getUser(),
      staleTime: 1000 * 60 * 10,  // 10분
    });
  }
  ```
- Header에 프로필 아바타 + 로그아웃 버튼 추가

**수용 기준**: Google 로그인 → profiles 생성 → 홈 진입 성공

---

### Phase 3: Supabase 데이터 접근 레이어 — 규모: XL

**목표**: queryFn 내부를 localStorage → Supabase로 교체. React Query hooks와 컴포넌트는 변경 최소화.

**의존성**: Phase 2 완료

#### 3-1. Supabase 타입 생성
- `supabase gen types typescript` 실행 → `src/types/supabase.ts` 생성
- 또는 수동 타입 정의

#### 3-2. Trip 변환 함수 (App ↔ DB)
- 파일: `src/lib/supabase/trip-mapper.ts`
- `tripToDb(trip: Trip)` → DB 삽입용 객체들 분해
- `dbToTrip(dbTrip, dbDays, dbRestaurants, ...)` → App의 Trip 객체로 조립
- 단위 테스트 (왕복 변환: Trip → DB → Trip 동일성)

#### 3-3. Supabase 데이터 접근 모듈
- 파일: `src/lib/supabase/trip-api.ts`
- 함수 시그니처: Phase 0에서 사용한 `storage.ts`와 동일한 인터페이스
  ```typescript
  getTripSummaries(userId: string): Promise<TripSummary[]>
  getTrip(tripId: string): Promise<Trip | null>
  saveTrip(userId: string, trip: Trip): Promise<void>
  deleteTrip(tripId: string): Promise<void>
  getPackingChecks(userId: string, tripId: string): Promise<Record<string, string[]>>
  setPackingCheck(...): Promise<void>
  createShareLink(tripId: string): Promise<string>
  getTripByShareToken(token: string): Promise<Trip | null>
  ```

#### 3-4. React Query hooks의 queryFn 교체 — 핵심 변경 지점
- `src/hooks/useTripQueries.ts` 수정:
  ```typescript
  // Before (Phase 0):
  queryFn: () => storage.getTripSummaries()

  // After (Phase 3):
  queryFn: () => tripApi.getTripSummaries(userId)
  ```
- **컴포넌트 코드는 변경 없음** — `useTrips()`, `useTrip(id)` 그대로 사용
- QueryClient 설정 업데이트:
  ```typescript
  staleTime: 1000 * 60 * 2,  // 2분 (서버 데이터는 외부 변경 가능)
  retry: 2,                   // 네트워크 재시도
  ```

#### 3-5. 인증 연동
- hooks에서 userId 자동 주입 (useAuth hook 활용)
- 비로그인 시 localStorage 폴백 (Guest Mode)

#### 3-6. 페이지 업데이트
- `page.tsx` (홈): 비로그인 → 랜딩/로그인 유도, 로그인 → 기존대로
- `shared/[token]/page.tsx` 신규: 공유 링크 뷰어 (읽기 전용)
- AI 채팅 플로우: mutation 내부가 Supabase로 바뀌므로 자동 적용

**수용 기준**: 로그인 → 여행 생성 → Supabase DB 저장 확인 → 새로고침 → 데이터 유지. 컴포넌트 코드 변경 최소.

---

### Phase 4: localStorage → Supabase 마이그레이션 — 규모: M

**목표**: 기존 사용자의 localStorage 데이터를 Supabase로 이전

**의존성**: Phase 3 완료

#### 4-1. 마이그레이션 유틸리티
- 파일: `src/lib/supabase/migration.ts`
- `hasLocalData(): boolean`
- `migrateLocalToSupabase(userId: string): Promise<MigrationResult>`
- `cleanupLocalData(): void`

#### 4-2. 마이그레이션 UI 플로우
- 로그인 직후, `hasLocalData()` 확인
- 데이터 있으면 마이그레이션 안내 모달:
  ```
  "기존 여행 데이터가 발견되었습니다!
   클라우드로 이전하면 어디서든 접근할 수 있어요.
   [이전하기] [나중에]"
  ```
- 프로그레스 바 + 완료 메시지
- 성공 후 localStorage 원본 보존 (백업 키), 일주일 후 정리

**수용 기준**: localStorage 여행 3개 → 마이그레이션 → Supabase 확인 → 새 기기에서 로그인 → 3개 표시

---

### Phase 5: 공유 기능 — 규모: M

**목표**: URL 기반 여행 공유 구현

**의존성**: Phase 3 완료

#### 5-1. 공유 링크 생성
- HeroSection "공유하기" → 공유 모달
- `trip_shares` insert (share_token 생성) → URL 복사
- URL: `https://my-journey-planner.vercel.app/shared/{token}`

#### 5-2. 공유 뷰어
- `/shared/[token]` 페이지 (Phase 3-6에서 생성)
- 비로그인도 접근 가능
- 읽기 전용 TripViewer + "나도 만들어보기" CTA

#### 5-3. 공유 관리
- 공유 상태 표시, 공유 해제, 만료일 (optional)

**수용 기준**: 공유 링크 생성 → 시크릿 모드 접근 → 여행 데이터 정상 표시

---

### Phase 6: 비로그인 모드 + 오프라인 대응 — 규모: M

**목표**: 비로그인 사용자도 기본 기능 사용 가능, 오프라인 폴백

**의존성**: Phase 4 완료

#### 6-1. 비로그인 모드 (Guest Mode)
- 로그인 없이 AI 채팅 + Trip 생성 가능 (localStorage)
- React Query hooks이 인증 상태에 따라 queryFn 자동 분기:
  ```typescript
  queryFn: () => userId
    ? tripApi.getTripSummaries(userId)  // Supabase
    : storage.getTripSummaries()         // localStorage
  ```
- 로그인 시 마이그레이션 제안 (Phase 4 재사용)

#### 6-2. 오프라인 폴백
- Supabase 연결 실패 시 React Query의 `networkMode: 'offlineFirst'` 활용
- 캐시된 데이터로 읽기 가능, 쓰기는 큐잉 (또는 에러 표시)
- "오프라인 모드" 배너

**수용 기준**: 비로그인 → Trip 생성 → 로그인 → 마이그레이션 → Supabase 저장

---

## 6. 위험 평가

### 높음

| 위험 | 영향 | 대응 |
|------|------|------|
| **React Query 전환 시 기존 기능 깨짐** | useTripStore 제거 과정에서 연쇄 오류 | Phase 0에서 localStorage 유지하며 점진적 전환. 기능별 검증 |
| **Trip 전체 저장/로딩 성능** | Trip 1개 로드에 6~9개 테이블 쿼리 | 병렬 쿼리 + React Query 캐시. 목록은 trips만 조회 |
| **AI 생성 Trip → 다중 테이블 insert** | 분해 저장 복잡도 | `saveTrip()` 트랜잭션 (RPC 또는 순차 upsert). 실패 시 롤백 |
| **기존 사용자 데이터 유실** | 마이그레이션 중 실패 | localStorage 원본 보존 + 상세 로그 |

### 보통

| 위험 | 영향 | 대응 |
|------|------|------|
| **useEditStore + mutation 연동 복잡** | 편집 임시 상태와 서버 저장의 경계 | useEditStore는 클라이언트 상태만 담당, 저장 시 mutation 호출 |
| **인증 UX 마찰** | 기존 사용자 이탈 | Guest Mode (비로그인도 localStorage로 사용) |
| **Supabase 무료 티어** | 500MB DB, 50k 월 인증 | 개인 프로젝트로 충분 |

### 낮음

| 위험 | 영향 | 대응 |
|------|------|------|
| **React Query 번들 크기** | ~12KB gzip | 이미 Zustand 사용 중. 전체 대비 미미 |
| **Supabase 장애** | 데이터 접근 불가 | React Query 캐시로 현재 세션 유지 |

---

## 7. 성공 지표

| 지표 | 목표 |
|------|------|
| Phase 0 후 기능 회귀 | 0건 (기존 기능 100% 유지) |
| Trip 목록 로딩 | < 500ms (서울 리전) |
| Trip 상세 로딩 | < 1s (전체 데이터 조립) |
| Trip 저장 | < 2s (AI 생성 전체 저장 포함) |
| localStorage 마이그레이션 성공률 | > 95% |
| 공유 링크 접근 | 3초 내 첫 화면 렌더링 |
| useTripStore 코드량 | 80%+ 감소 (Phase 0 후) |

---

## 8. 의존성

### npm 패키지

| 패키지 | Phase | 용도 |
|--------|-------|------|
| `@tanstack/react-query` | 0 | 서버 상태 관리 |
| `@tanstack/react-query-devtools` | 0 | 개발 도구 (dev only) |
| `@supabase/supabase-js` | 1 | Supabase 클라이언트 |
| `@supabase/ssr` | 1 | Next.js SSR 통합 |
| `nanoid` | 5 | 공유 토큰 생성 |

### 외부 의존성
- Supabase 프로젝트 (무료 티어) — Phase 1부터
- Google OAuth Client ID (GCP Console) — Phase 2부터
- Kakao OAuth App Key — optional, 향후

---

## 9. Phase별 의존성 그래프

```
Phase 0 (L) ─── React Query 도입 (localStorage 유지) ◄── 선행 필수
    │
Phase 1 (S) ─── Supabase 설정
    │
Phase 2 (L) ─── DB 스키마 + Auth
    │
Phase 3 (XL) ── queryFn 교체 (localStorage → Supabase) ◄── 핵심
    │
    ├── Phase 4 (M) ── localStorage 마이그레이션
    │
    ├── Phase 5 (M) ── 공유 기능
    │
    └── Phase 6 (M) ── 비로그인 + 오프라인 ◄── Phase 4 이후
```

### 최소 출시 가능 버전 (MVP)
- **Phase 0 완료**: React Query 기반 아키텍처 (localStorage, 기존 기능 유지)
- **Phase 0~3 완료**: 로그인 + 클라우드 저장 + 기존 기능
- Phase 4~6은 이후 순차 적용

---

## 10. 대안 비교

### 상태 관리 전략

| 옵션 | 장점 | 단점 | 판정 |
|------|------|------|------|
| **A. Zustand에서 async 직접 관리** | 추가 라이브러리 없음 | 캐시/재시도/중복요청 직접 구현, 코드 비대화 | ❌ |
| **B. React Query + Zustand 최소화 — 채택** | 서버 상태 자동 관리, 변경 지점 격리 | 학습 곡선, 번들 약간 증가 | ✅ |
| **C. SWR** | 가벼움 | mutation 지원 미흡, 낙관적 업데이트 복잡 | ❌ |

### DB 설계 전략

| 옵션 | 장점 | 단점 | 판정 |
|------|------|------|------|
| **A. 완전 정규화 (15+ 테이블)** | 깔끔한 관계형 설계 | Trip 로드에 15+ JOIN, AI insert 복잡 | ❌ |
| **B. 하이브리드 (9 테이블) — 채택** | 실용적 균형 | JSONB 부분 수정 복잡 | ✅ |
| **C. 전체 JSONB (1 테이블)** | 마이그레이션 최소 | 관계형 장점 없음 | ❌ |

### 전환 순서

| 옵션 | 장점 | 단점 | 판정 |
|------|------|------|------|
| **A. 병행 (React Query + Supabase 동시)** | 한번에 완성 | 변경 범위 거대, 디버깅 어려움 | ❌ |
| **B. React Query 먼저 → Supabase — 채택** | 변경 지점 격리, 단계별 검증 | 2단계 작업 | ✅ |
| **C. Supabase 먼저 → React Query** | 데이터소스 먼저 전환 | Store에 async 직접 구현 후 다시 교체 (이중 작업) | ❌ |
