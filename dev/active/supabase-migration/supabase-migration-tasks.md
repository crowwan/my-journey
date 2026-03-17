# Supabase 마이그레이션 — 작업 체크리스트

**최종 갱신**: 2026-03-17 (Phase 3 데이터 접근 레이어 구현 완료)

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

## Phase 3: Supabase 데이터 접근 레이어 [XL] ✅ 완료

### 3-1. Supabase 타입 정의 ✅
- [x] `src/types/supabase.ts` — DB 테이블 행 타입 (DbTrip, DbTripDay, 등 9개)

### 3-2. Trip 변환 함수 ✅
- [x] `src/lib/supabase/trip-mapper.ts` — tripToDb / dbToTrip
- [x] `src/lib/supabase/__tests__/trip-mapper.test.ts` — 13개 테스트 (왕복 변환 포함)
  - overview에서 weather 제외
  - packing items에서 checked 제외
  - budget total 자동 계산
  - sort_order 기반 정렬

### 3-3. Supabase 데이터 접근 모듈 ✅
- [x] `src/lib/supabase/trip-api.ts` — 8개 함수
  - getTripSummaries, getAllTrips, getTrip
  - saveTrip (upsert + replace 전략)
  - deleteTrip (CASCADE)
  - getPackingChecks, setPackingCheck

### 3-4. queryFn 교체 — 핵심 변경 ✅
- [x] `src/queries/useTrips.ts` — 인증 상태에 따라 분기
  - 로그인 → tripApi.xxx (Supabase)
  - 비로그인 → storage.xxx (localStorage)
- [x] staleTime: Infinity → 2분 (로그인 시), 비로그인은 Infinity 유지
- [x] retry: 2 (로그인 시)
- [x] hooks 시그니처 변경 없음 (useTrips, useTrip, useSaveTrip, useDeleteTrip)
- [x] useAuth()로 사용자 정보 자동 주입

### 3-5. useTripStore 패킹 체크 Supabase 전환 ✅
- [x] togglePackingItem에 userId 파라미터 추가
- [x] 로그인 시 Supabase에도 비동기 저장 (localStorage도 유지)
- [x] ChecklistTab에서 user?.id 전달

### 3-6. 검증 ✅
- [x] `next build` 성공
- [x] `vitest run` 47개 테스트 통과 (기존 34 + 신규 13)
- [x] 비로그인 시 기존대로 localStorage 동작 (hooks 시그니처 변경 없으므로)
- [ ] 로그인 상태 E2E 테스트 (Supabase SQL 실행 후)

### 설계 결정
- storage.ts 유지: Guest Mode에서 계속 사용
- DB weather 미저장: 실시간 API
- budget.total DB 미저장: 조립 시 calculateBudgetTotal 계산
- Supabase SDK에 Database 제네릭 미적용: 부분 select 타입 추론 이슈로 unwrap 헬퍼 사용

---

## Phase 5: URL 기반 여행 공유 기능 [M] ✅ 완료

### 5-1. 공유 API 함수 ✅
- [x] `createShareLink(tripId)` — token 생성 + trip_shares insert (기존 있으면 재사용)
- [x] `getShareToken(tripId)` — 현재 공유 토큰 조회
- [x] `deleteShareLink(tripId)` — 공유 해제
- 파일: `src/lib/supabase/trip-api.ts`에 추가

### 5-2. 공유 Trip 조회 API Route ✅
- [x] `src/app/api/shared/[token]/route.ts` 생성
- [x] service_role 키로 RLS 우회 (비로그인 접근)
- [x] share_token → trip_id → 6개 테이블 병렬 쿼리 → dbToTrip 조립 → JSON 응답

### 5-3. 공유 뷰어 페이지 ✅
- [x] `src/app/shared/[token]/page.tsx` 생성
- [x] API Route 호출 → Trip fetch → TripViewer readOnly 렌더링
- [x] 로딩/에러 상태 UI
- [x] 하단 "My Journey에서 만들었어요" 워터마크

### 5-4. ShareModal 업데이트 ✅
- [x] "링크 공유" 옵션 최상단 추가 (createShareLink → 클립보드 복사)
- [x] 이미 공유 중이면 "공유 링크 복사" + "공유 해제" 표시
- [x] 모달 열릴 때 getShareToken 자동 조회
- [x] 기존 HTML 다운로드 + Web Share + 앱 링크 복사 옵션 유지

### 5-5. TripViewer 읽기 전용 모드 ✅
- [x] TripViewer에 `readOnly` prop 추가
- [x] ViewerContext 생성 (하위 컴포넌트에 readOnly 자동 전달)
- [x] HeroSection — readOnly시 AI 수정, 공유 버튼 숨김
- [x] SectionEditHeader — ViewerContext에서 readOnly 감지, 편집 버튼 숨김

### 5-6. 검증 ✅
- [x] `vitest run` 47개 테스트 통과
- [x] `next build` 성공
- [ ] E2E: 공유 링크 생성 → 시크릿 모드 접근 (SQL 실행 후)

---

## 진행 상태 요약

| Phase | 규모 | 상태 | 의존성 |
|-------|------|------|--------|
| Phase 0: React Query 도입 | L | ✅ 완료 | 없음 |
| Phase 1: Supabase 설정 | S | ✅ 완료 | Phase 0 ✅ |
| Phase 2: DB + Auth | L | ✅ 완료 (SQL 실행 대기) | Phase 1 ✅ |
| Phase 3: 데이터 레이어 교체 | XL | ✅ 완료 | Phase 2 ✅ |
| Phase 4: 마이그레이션 | M | ⬜ 미시작 | Phase 3 |
| Phase 5: 공유 기능 | M | ✅ 완료 | Phase 3 ✅ |
| Phase 6: 비로그인/오프라인 | M | ⬜ 미시작 | Phase 4 |

**MVP 1**: Phase 0 완료 ✅ → React Query 기반 (localStorage, 기존 기능 유지)
**MVP 2**: Phase 1~3 완료 → 로그인 + 클라우드 저장
