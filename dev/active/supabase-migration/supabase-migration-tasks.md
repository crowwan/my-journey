# Supabase 마이그레이션 — 작업 체크리스트

**최종 갱신**: 2026-03-16 (React Query 선행 도입 전략 반영)

---

## Phase 0: React Query 도입 (localStorage 유지) [L]

### 0-1. 설치 + Provider
- [ ] `@tanstack/react-query` 설치
- [ ] `@tanstack/react-query-devtools` 설치 (dev)
- [ ] `src/app/providers.tsx` — QueryClientProvider 생성
- [ ] `src/app/layout.tsx` — Providers 래퍼 적용
- [ ] QueryClient 기본 설정 (staleTime 5분, retry false)

### 0-2. Trip Query/Mutation Hooks
- [ ] `src/hooks/useTripQueries.ts` 생성
  - [ ] `useTrips()` — 여행 목록 (storage.getTripSummaries)
  - [ ] `useTrip(tripId)` — 여행 상세 (storage.getTrip)
  - [ ] `useSaveTrip()` — 저장 mutation + 캐시 무효화
  - [ ] `useDeleteTrip()` — 삭제 mutation + 캐시 무효화
  - [ ] `usePackingChecks(tripId)` — 체크 상태 조회
  - [ ] `useTogglePackingItem()` — 체크 토글 mutation

### 0-3. useTripStore 축소
- [ ] 서버 상태 함수 제거 (loadTrips, saveTrip, deleteTrip, getTripSummaries, togglePackingItem)
- [ ] trips Map 제거
- [ ] isLoaded 제거
- [ ] currentTripId 유지 여부 결정 (URL params 대체 가능)

### 0-4. 컴포넌트 마이그레이션
- [ ] `page.tsx` (홈) — useTripStore → useTrips(), useDeleteTrip()
- [ ] `trips/[tripId]/page.tsx` — useTripStore.trips.get → useTrip(tripId)
- [ ] useEditStore.saveSectionEdit — mutation 연동
- [ ] AI 채팅 플로우 (useChatStore) — Trip 저장 시 useSaveTrip 연동
- [ ] Split View — 수정 후 저장 mutation 연동
- [ ] ChecklistTab — usePackingChecks + useTogglePackingItem

### 0-5. 검증
- [ ] 여행 생성 (AI) → 목록 표시 → 상세 보기
- [ ] 인라인 편집 → 저장 → 새로고침 → 유지
- [ ] 여행 삭제 → 목록에서 제거
- [ ] 준비물 체크 → 새로고침 → 유지
- [ ] React Query Devtools 캐시 상태 정상 확인

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
- [ ] trip_days: trips 소유자 기준
- [ ] restaurants: trips 소유자 기준
- [ ] budget_items: trips 소유자 기준
- [ ] packing_categories: trips 소유자 기준
- [ ] packing_checks: 사용자별
- [ ] pre_todos: trips 소유자 기준
- [ ] trip_shares: 소유자만 생성/삭제

### 2-3. Auth 설정
- [ ] Google OAuth 활성화 (GCP Console)
- [ ] Redirect URL 등록 (localhost + production)
- [ ] `src/app/login/page.tsx` — 로그인 UI
- [ ] `src/app/auth/callback/route.ts` — OAuth 콜백
- [ ] `src/hooks/useAuth.ts` — 인증 상태 React Query hook
- [ ] `src/components/layout/AuthGuard.tsx` — 인증 래퍼
- [ ] Header에 프로필 아바타 + 로그아웃
- [ ] 테스트: Google 로그인 → profiles 생성

---

## Phase 3: Supabase 데이터 접근 레이어 [XL]

### 3-1. 타입 + 변환
- [ ] `src/types/supabase.ts` — DB 행 타입
- [ ] `src/types/trip.ts` — userId 추가 (optional)
- [ ] `src/lib/supabase/trip-mapper.ts`
  - [ ] `tripToDb(trip)` — Trip → 테이블별 행 분해
  - [ ] `dbToTrip(...)` — DB 행 → Trip 조립
  - [ ] 단위 테스트 (왕복 변환)

### 3-2. 데이터 접근 모듈
- [ ] `src/lib/supabase/trip-api.ts`
  - [ ] `getTripSummaries(userId)` — 목록
  - [ ] `getTrip(tripId)` — 상세 (병렬 쿼리 + 조립)
  - [ ] `saveTrip(userId, trip)` — upsert (분해 + 다중 테이블)
  - [ ] `deleteTrip(tripId)` — CASCADE 삭제
  - [ ] `getPackingChecks(userId, tripId)` — 체크 상태
  - [ ] `setPackingCheck(...)` — 체크 업데이트
  - [ ] `createShareLink(tripId)` — 공유 토큰
  - [ ] `getTripByShareToken(token)` — 공유 Trip

### 3-3. queryFn 교체 — 핵심 변경
- [ ] `useTripQueries.ts` — queryFn: storage.xxx → tripApi.xxx
- [ ] QueryClient 설정 업데이트 (staleTime 2분, retry 2)
- [ ] 인증 연동 (hooks에서 userId 자동 주입)

### 3-4. 페이지 업데이트
- [ ] `page.tsx` (홈) — 인증 분기 (비로그인 → 랜딩/로그인)
- [ ] `shared/[token]/page.tsx` 신규 — 공유 뷰어
- [ ] 로딩 스켈레톤 (TripCard, TripViewer)
- [ ] 에러 바운더리 + 토스트

### 3-5. 검증
- [ ] 로그인 → AI 생성 → Supabase DB 저장 확인
- [ ] 인라인 편집 → 저장 → 새로고침 → 유지
- [ ] 삭제 → DB에서 제거 확인
- [ ] 새 기기에서 로그인 → 동일 데이터

---

## Phase 4: localStorage 마이그레이션 [M]

- [ ] **4-1** `src/lib/supabase/migration.ts`
  - [ ] `hasLocalData()` — Trip 존재 여부
  - [ ] `migrateLocalToSupabase(userId)` — 일괄 이전
  - [ ] `cleanupLocalData()` — 이전 후 정리
- [ ] **4-2** 마이그레이션 안내 모달 UI
- [ ] **4-3** 프로그레스 바 + 결과 표시
- [ ] **4-4** 테스트: localStorage 3개 → 마이그레이션 → Supabase 확인

---

## Phase 5: 공유 기능 [M]

- [ ] **5-1** HeroSection 공유 → ShareModal 업데이트
  - [ ] "링크 복사" → share_token 생성 + URL 복사
  - [ ] 공유 상태 표시
- [ ] **5-2** 공유 해제 기능
- [ ] **5-3** 테스트: 공유 링크 → 시크릿 모드 접근 → 정상 표시

---

## Phase 6: 비로그인 모드 + 오프라인 [M]

- [ ] **6-1** Guest Mode — 비로그인 시 queryFn → localStorage 분기
- [ ] **6-2** 로그인 배너 ("클라우드 저장하려면 로그인하세요")
- [ ] **6-3** 로그인 시 자동 마이그레이션 제안 (Phase 4 재사용)
- [ ] **6-4** 오프라인 감지 + 배너
- [ ] **6-5** 테스트: 비로그인 → 생성 → 로그인 → 마이그레이션

---

## 진행 상태 요약

| Phase | 규모 | 상태 | 의존성 |
|-------|------|------|--------|
| Phase 0: React Query 도입 | L | ⬜ 미시작 | 없음 |
| Phase 1: Supabase 설정 | S | ⬜ 미시작 | Phase 0 |
| Phase 2: DB + Auth | L | ⬜ 미시작 | Phase 1 |
| Phase 3: 데이터 레이어 교체 | XL | ⬜ 미시작 | Phase 2 |
| Phase 4: 마이그레이션 | M | ⬜ 미시작 | Phase 3 |
| Phase 5: 공유 기능 | M | ⬜ 미시작 | Phase 3 |
| Phase 6: 비로그인/오프라인 | M | ⬜ 미시작 | Phase 4 |

**MVP 1**: Phase 0 완료 → React Query 기반 (localStorage, 기존 기능 유지)
**MVP 2**: Phase 0~3 완료 → 로그인 + 클라우드 저장
