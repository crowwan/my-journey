# Supabase 마이그레이션 — 작업 체크리스트

**최종 갱신**: 2026-03-17 (Phase 2 DB 스키마 + Auth UI 구현 반영)

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

## Phase 1: Supabase 프로젝트 설정 [S] ✅ 완료

- [x] **1-1** Supabase 대시보드 프로젝트 생성 (도쿄 리전, Project ID: kogoegdsspcndaytqukh)
- [x] **1-2** 환경변수 설정 (.env.local)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - ⚠️ TODO: Vercel 환경변수 설정 필요
- [x] **1-3** `@supabase/supabase-js`, `@supabase/ssr` 설치
- [x] **1-4** `src/lib/supabase/client.ts` — 브라우저 클라이언트 (싱글턴)
- [x] **1-5** `src/lib/supabase/server.ts` — 서버 클라이언트 (cookies 연동)
- [x] **1-6** `middleware.ts` + `src/lib/supabase/middleware.ts` — Auth 세션 갱신
- [ ] **1-7** DB 연결 테스트 — Phase 2 (테이블 생성 후) 검증 예정

---

## Phase 2: DB 스키마 + Auth [L] ✅ 완료

### 2-1. 테이블 생성 (SQL 파일 생성 완료 — 대시보드에서 실행 필요)
- [x] `profiles` 테이블 + auth trigger (handle_new_user)
- [x] `trips` 테이블 (메타 + overview JSONB + transport JSONB)
- [x] `trip_days` 테이블 (items JSONB, map_spots JSONB)
- [x] `restaurants` 테이블
- [x] `budget_items` 테이블
- [x] `packing_categories` 테이블 (items JSONB)
- [x] `packing_checks` 테이블
- [x] `pre_todos` 테이블
- [x] `trip_shares` 테이블
- [x] 인덱스 생성
- 파일: `supabase/migrations/001_initial_schema.sql`

### 2-2. RLS 정책
- [x] trips: 소유자 CRUD (간소화 — 공유 뷰어는 API Route에서 service_role 처리)
- [x] 하위 테이블: trip_id 기반 소유자 확인
- [x] packing_checks: user_id 기반
- [x] trip_shares: 소유자만 관리

### 2-3. Auth 설정
- [x] Kakao OAuth 활성화 (Supabase 대시보드에서 완료)
- [x] `src/app/auth/callback/route.ts` — OAuth 콜백 핸들러
- [x] `src/hooks/useAuth.ts` — 인증 상태 React Query hook (useAuth, useSignInWithKakao, useSignOut)
- [x] Header에 프로필 아바타 + 로그아웃 (비로그인 시 "로그인" 버튼)
- [x] 홈 페이지 비로그인 배너 ("로그인하면 클라우드에 저장됩니다")
- ~~`src/app/login/page.tsx`~~ — 별도 로그인 페이지 불필요 (Header에서 바로 카카오 로그인)

### 2-4. 검증
- [x] `next build` 성공
- [x] `vitest run` 34개 테스트 통과
- [ ] Supabase 대시보드에서 SQL 실행 (사용자 수동)
- [ ] 카카오 로그인 E2E 테스트 (SQL 실행 후)

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
| Phase 1: Supabase 설정 | S | ✅ 완료 | Phase 0 ✅ |
| Phase 2: DB + Auth | L | ✅ 완료 (SQL 실행 대기) | Phase 1 ✅ |
| Phase 3: 데이터 레이어 교체 | XL | ⬜ 미시작 | Phase 2 |
| Phase 4: 마이그레이션 | M | ⬜ 미시작 | Phase 3 |
| Phase 5: 공유 기능 | M | ⬜ 미시작 | Phase 3 |
| Phase 6: 비로그인/오프라인 | M | ⬜ 미시작 | Phase 4 |

**MVP 1**: Phase 0 완료 ✅ → React Query 기반 (localStorage, 기존 기능 유지)
**MVP 2**: Phase 1~3 완료 → 로그인 + 클라우드 저장
