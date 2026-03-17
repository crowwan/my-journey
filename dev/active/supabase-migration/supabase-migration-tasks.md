# Supabase 마이그레이션 — 작업 체크리스트

**최종 갱신**: 2026-03-17 (Phase 0 구현 완료 반영)

---

## Phase 0: React Query 도입 (localStorage 유지) [L] ✅ 완료

### 0-1. 설치 + Provider ✅
- [x] `@tanstack/react-query` 설치
- [x] `@tanstack/react-query-devtools` 설치 (dev)
- [x] `src/app/providers.tsx` — QueryClientProvider 생성
- [x] `src/app/layout.tsx` — Providers 래퍼 적용
- [x] QueryClient 기본 설정 (staleTime 5분, retry 1)

### 0-2. Trip Query/Mutation Hooks ✅
- [x] `src/queries/useTrips.ts` 생성 (계획의 `src/hooks/useTripQueries.ts`에서 경로 변경)
  - [x] `useTrips()` — 여행 목록 (TripSummary[])
  - [x] `useAllTrips()` — 전체 Trip Map
  - [x] `useTrip(tripId)` — 여행 상세
  - [x] `useSaveTrip()` — 저장 mutation + 캐시 무효화
  - [x] `useDeleteTrip()` — 삭제 mutation + 캐시 무효화
  - [ ] ~~`usePackingChecks(tripId)`~~ — useTripStore에 유지 (packingVersion 카운터)
  - [ ] ~~`useTogglePackingItem()`~~ — useTripStore에 유지

### 0-3. useTripStore 축소 ✅
- [x] 서버 상태 함수 제거 (loadTrips, saveTrip, deleteTrip, getTripSummaries)
- [x] trips Map 제거
- [x] isLoaded 제거
- [x] currentTripId 유지 (URL params 대체 가능하나 현재 유지)
- [x] togglePackingItem 유지 (별도 localStorage 키 + packingVersion)

### 0-4. 컴포넌트 마이그레이션 ✅
- [x] `page.tsx` (홈) — useTrips() + useAllTrips() + useDeleteTrip()
- [x] `trips/[tripId]/page.tsx` — useTrip(tripId)
- [x] `calendar/page.tsx` — useAllTrips()
- [x] useEditStore.saveSectionEdit — Trip 반환 방식 + SectionEditHeader에서 useSaveTrip
- [x] AISplitView — useTrip + useSaveTrip
- [x] ChatContainer — useTrip
- [x] TripPreviewCard — useSaveTrip
- [x] ChecklistTab — togglePackingItem은 useTripStore 유지 (packingVersion 구독)

### 0-5. 추가 리팩토링 (계획 외, 함께 완료) ✅
- [x] API 레이어 분리: `api/weather.ts`, `api/currency.ts`, `api/chat.ts`
- [x] 날씨/환율 React Query 전환: `queries/useWeather.ts`, `queries/useCurrency.ts`
- [x] Domain 레이어: `domain/budget.ts`, `domain/trip.ts`
- [x] 컴포넌트 도메인 로직 추출: `lib/date-utils.ts`, `lib/prompt-builder.ts`
- [x] useChatStore fetch 로직 → api/chat.ts 분리

### 0-6. 검증 ✅
- [x] `next build` 성공
- [x] `vitest run` 34개 테스트 통과
- [x] 동작 확인 (사용자 확인 완료)

---

## Phase 1: Supabase 프로젝트 설정 [S]

- [ ] **1-1** Supabase 대시보드 프로젝트 생성 (서울/도쿄 리전)
- [ ] **1-2** 환경변수 설정 (.env.local + Vercel)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **1-3** `@supabase/supabase-js`, `@supabase/ssr` 설치
- [ ] **1-4** `src/lib/supabase/client.ts` — 브라우저 클라이언트
- [ ] **1-5** `src/lib/supabase/server.ts` — 서버 클라이언트
- [ ] **1-6** `middleware.ts` — Auth 세션 갱신 미들웨어
- [ ] **1-7** DB 연결 테스트 (select 1 성공)

---

## Phase 2: DB 스키마 + Auth [L]

### 2-1. 테이블 생성
- [ ] `profiles` 테이블 + auth trigger (handle_new_user)
- [ ] `trips` 테이블 (메타 + overview JSONB + transport JSONB)
- [ ] `trip_days` 테이블 (items JSONB, map_spots JSONB)
- [ ] `restaurants` 테이블
- [ ] `budget_items` 테이블
- [ ] `packing_categories` 테이블 (items JSONB)
- [ ] `packing_checks` 테이블
- [ ] `pre_todos` 테이블
- [ ] `trip_shares` 테이블
- [ ] 인덱스 생성

### 2-2. RLS 정책
- [ ] trips: 소유자 CRUD + 공유 SELECT
- [ ] 기타 테이블: trips 소유자 기준

### 2-3. Auth 설정
- [ ] Google OAuth 활성화 (GCP Console)
- [ ] `src/app/login/page.tsx` — 로그인 UI
- [ ] `src/app/auth/callback/route.ts` — OAuth 콜백
- [ ] `src/hooks/useAuth.ts` — 인증 상태 hook
- [ ] Header에 프로필 아바타 + 로그아웃

---

## Phase 3: Supabase 데이터 접근 레이어 [XL]

### 3-1. queryFn 교체 — 핵심 변경
- [ ] `src/queries/useTrips.ts` — queryFn: storage.xxx → tripApi.xxx
- [ ] QueryClient staleTime 변경 (Infinity → 2분)
- [ ] 인증 연동 (hooks에서 userId 자동 주입)

(나머지 Phase 3~6은 기존 계획 유지)

---

## 진행 상태 요약

| Phase | 규모 | 상태 | 의존성 |
|-------|------|------|--------|
| Phase 0: React Query 도입 | L | ✅ 완료 | 없음 |
| Phase 1: Supabase 설정 | S | ⬜ 미시작 | Phase 0 ✅ |
| Phase 2: DB + Auth | L | ⬜ 미시작 | Phase 1 |
| Phase 3: 데이터 레이어 교체 | XL | ⬜ 미시작 | Phase 2 |
| Phase 4: 마이그레이션 | M | ⬜ 미시작 | Phase 3 |
| Phase 5: 공유 기능 | M | ⬜ 미시작 | Phase 3 |
| Phase 6: 비로그인/오프라인 | M | ⬜ 미시작 | Phase 4 |

**MVP 1**: Phase 0 완료 ✅ → React Query 기반 (localStorage, 기존 기능 유지)
**MVP 2**: Phase 1~3 완료 → 로그인 + 클라우드 저장
