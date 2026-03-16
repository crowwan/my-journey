# Supabase 마이그레이션 — 컨텍스트

**최종 갱신**: 2026-03-16 (React Query 선행 도입 전략 반영)
**상태**: 사용자 승인 대기

---

## 핵심 파일 (변경 대상)

### Phase 0: React Query 도입 (localStorage 유지)

#### 신규 생성
| 파일 | 역할 |
|------|------|
| `src/app/providers.tsx` | QueryClientProvider 래퍼 |
| `src/hooks/useTripQueries.ts` | Trip CRUD React Query hooks |

#### 수정
| 파일 | 변경 내용 |
|------|----------|
| `src/app/layout.tsx` | Providers 래퍼 추가 |
| `src/stores/useTripStore.ts` | 서버 상태 제거 → currentTripId만 유지 (또는 완전 제거) |
| `src/stores/useEditStore.ts` | saveSectionEdit에서 mutation 연동 |
| `src/app/page.tsx` | useTripStore → useTrips() hook |
| `src/app/trips/[tripId]/page.tsx` | useTripStore → useTrip(id) hook |

#### 변경 없음
| 파일 | 이유 |
|------|------|
| `src/lib/storage.ts` | **그대로 유지** — queryFn에서 호출 |
| `src/types/trip.ts` | 타입 변경 없음 |
| `src/api/gemini.ts` | AI 로직 독립 |
| `src/stores/useUIStore.ts` | 클라이언트 상태만 |
| `src/stores/useChatStore.ts` | sessionStorage 유지 |
| `src/components/viewer/*` | 데이터만 받음 |
| `src/components/chat/*` | 채팅 UI 변경 없음 |

### Phase 1~3: Supabase 전환

#### 신규 생성
| 파일 | 역할 | Phase |
|------|------|-------|
| `src/lib/supabase/client.ts` | 브라우저 Supabase 클라이언트 | 1 |
| `src/lib/supabase/server.ts` | 서버 Supabase 클라이언트 | 1 |
| `src/lib/supabase/middleware.ts` | Auth 세션 갱신 | 1 |
| `src/types/supabase.ts` | DB 타입 정의 | 3 |
| `src/lib/supabase/trip-api.ts` | Trip 데이터 접근 함수 | 3 |
| `src/lib/supabase/trip-mapper.ts` | Trip ↔ DB 변환 함수 | 3 |
| `src/lib/supabase/migration.ts` | localStorage → Supabase 이전 | 4 |
| `src/hooks/useAuth.ts` | 인증 상태 hook | 2 |
| `src/app/login/page.tsx` | 로그인 페이지 | 2 |
| `src/app/auth/callback/route.ts` | OAuth 콜백 | 2 |
| `src/app/shared/[token]/page.tsx` | 공유 링크 뷰어 | 3 |
| `src/components/layout/AuthGuard.tsx` | 인증 래퍼 | 2 |
| `middleware.ts` (app root) | Supabase 미들웨어 | 1 |

#### 수정 (Phase 3에서)
| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useTripQueries.ts` | queryFn 내부: storage.xxx → tripApi.xxx |
| `src/types/trip.ts` | userId 필드 추가 (optional) |
| `src/app/page.tsx` | 인증 분기 추가 |

#### Phase 3 이후 제거 가능
| 파일 | 이유 |
|------|------|
| `src/lib/storage.ts` | Supabase 완전 전환 후 (Guest Mode 유지 시 보존) |
| `src/stores/useTripStore.ts` | React Query로 완전 이관 시 |

---

## 데이터 흐름 변경

### AS-IS (현재)
```
[컴포넌트] → useTripStore.saveTrip(trip)
              → storage.saveTrip(trip)
                → localStorage.setItem(JSON.stringify(fullTrip))
```

### Phase 0 이후 (React Query + localStorage)
```
[컴포넌트] → useSaveTrip().mutate(trip)
              → storage.saveTrip(trip)        ← queryFn (동일)
                → localStorage.setItem(...)
              → queryClient.invalidateQueries(['trips'])
              → queryClient.setQueryData(['trip', id], trip)
```

### Phase 3 이후 (React Query + Supabase)
```
[컴포넌트] → useSaveTrip().mutate(trip)       ← 컴포넌트 코드 변경 없음!
              → tripApi.saveTrip(userId, trip) ← queryFn만 교체
                → tripMapper.tripToDb(trip)
                  → supabase.from('trips').upsert(...)
                  → supabase.from('trip_days').upsert(...)
                  → ... (6~9 테이블)
              → queryClient.invalidateQueries(['trips'])
```

### Trip 로딩 흐름 (Phase 3 이후)
```
[페이지] → useTrip(tripId)                    ← 컴포넌트 코드 변경 없음!
            → React Query cache hit → 즉시 반환
            → cache miss → tripApi.getTrip(tripId)
              → 병렬 쿼리:
                supabase.from('trips').select('*').eq('id', tripId)
                supabase.from('trip_days').select('*').eq('trip_id', tripId)
                supabase.from('restaurants').select('*').eq('trip_id', tripId)
                supabase.from('budget_items').select('*').eq('trip_id', tripId)
                supabase.from('packing_categories').select('*').eq('trip_id', tripId)
                supabase.from('pre_todos').select('*').eq('trip_id', tripId)
              → tripMapper.dbToTrip(...)
            → React Query cache 저장
            → [컴포넌트 렌더링]
```

---

## 주요 설계 결정

### 1. React Query 선행 도입 (변경 지점 격리)
- **결정**: Supabase 전환 전에 React Query를 먼저 도입. localStorage 기반으로 동작 검증.
- **이유**: 상태 관리 전환(Store→hooks)과 데이터소스 전환(localStorage→Supabase)을 동시에 하면 디버깅 어려움. 분리하면 각 단계에서 독립적으로 검증 가능.
- **핵심**: Phase 3에서 queryFn 내부만 교체하면 되므로 **컴포넌트 코드 변경 없음**

### 2. useTripStore 제거/최소화
- **결정**: 서버 상태 관리를 React Query로 이관. useTripStore는 currentTripId만 유지하거나 완전 제거.
- **이유**: 현재 useTripStore의 80%가 서버 상태 관리 (loadTrips, saveTrip, deleteTrip, Map 캐시). React Query가 더 잘 한다.
- **currentTripId**: URL params에서 이미 추출 중이므로 제거 가능

### 3. useEditStore는 유지
- **결정**: 편집 임시 상태는 Zustand에서 계속 관리
- **이유**: 편집 중인 Trip 복사본(editingTrip)은 서버 상태가 아닌 클라이언트 로컬 상태. 저장(saveSectionEdit) 시에만 mutation 호출.
- **연동**: `saveSectionEdit()` 내에서 mutation.mutate() 호출

### 4. 하이브리드 정규화 (9 테이블)
- **결정**: 핵심 엔티티만 별도 테이블, 나머지는 JSONB
- **이유**: 완전 정규화는 과도한 JOIN, 전체 JSONB는 관계형 장점 없음
- **트레이드오프**: JSONB 내부 부분 수정 시 전체 replace → 현재 편집 패턴과 일치

### 5. timeline_items를 trip_days JSONB에 포함
- **결정**: Day당 10~30개 아이템을 JSONB로 저장
- **이유**: 별도 테이블 시 5일 여행 = 150+ 행 JOIN. Day 단위 편집과 일치

### 6. 비로그인 모드 (Guest Mode) 유지
- **결정**: 로그인 없이도 localStorage로 기본 기능 사용 가능
- **이유**: 기존 사용자 UX 보존. React Query hooks에서 인증 상태에 따라 queryFn 분기

### 7. Chat은 sessionStorage 유지
- **결정**: 채팅 메시지를 Supabase에 저장하지 않음
- **이유**: 세션 데이터 (창 닫으면 초기화). DB 저장 비용 대비 효과 낮음

### 8. Trip ID 형식 유지
- **결정**: `trip-{timestamp}` 문자열 ID 유지
- **이유**: 기존 데이터 호환, 마이그레이션 간소화

---

## 외부 의존성

### npm 패키지 (Phase별)
| 패키지 | Phase | 크기 |
|--------|-------|------|
| `@tanstack/react-query` | 0 | ~12KB gzip |
| `@tanstack/react-query-devtools` | 0 | dev only |
| `@supabase/supabase-js` | 1 | ~30KB gzip |
| `@supabase/ssr` | 1 | ~5KB gzip |
| `nanoid` | 5 | ~1KB gzip |

### Supabase 프로젝트 (Phase 1~)
- 리전: ap-northeast-2 (서울) 또는 ap-northeast-1 (도쿄)
- 무료 티어: 500MB DB, 50K 월간 Auth, 2GB 대역폭

### OAuth 프로바이더 (Phase 2~)
- Google: GCP Console → OAuth 2.0 Client ID
- Kakao: Kakao Developers → REST API 키 (optional, 추후)

---

## 환경변수

### Phase 0: 추가 없음

### Phase 1~: 신규 추가
```env
# .env.local + Vercel
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUz...  # 서버 전용
```

### 기존 유지
```env
GEMINI_API_KEY=...  # 변경 없음
```

---

## 관련 기존 문서
- `dev/active/trip-sharing/trip-sharing-plan.md` — 정적 HTML 공유 계획 (Supabase 공유로 대체)
- `dev/active/budget-enhancement/` — 예산 고도화 (완료, DB 스키마에 반영됨)
- `dev/active/weather-currency/` — 환율 미착수 (이 작업과 독립적)
