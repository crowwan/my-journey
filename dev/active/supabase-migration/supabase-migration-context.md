# Supabase 마이그레이션 — 컨텍스트

**최종 갱신**: 2026-03-17 (Phase 5 공유 기능 구현 완료)
**상태**: Phase 3, 5 완료 → Phase 4 대기 (localStorage 마이그레이션)

---

## Phase 0 구현 완료 (2026-03-17)

### 실제 구현된 파일 (계획과 차이점 포함)

#### 신규 생성
| 파일 | 역할 | 비고 |
|------|------|------|
| `src/app/providers.tsx` | QueryClientProvider + ReactQueryDevtools | 계획대로 |
| `src/queries/useTrips.ts` | Trip CRUD React Query hooks | 계획의 `src/hooks/useTripQueries.ts`에서 경로 변경 |
| `src/queries/useWeather.ts` | 날씨 React Query hook | 추가 구현 (계획에 없었음) |
| `src/queries/useCurrency.ts` | 환율 React Query hook | 추가 구현 (계획에 없었음) |
| `src/api/weather.ts` | 날씨 fetch 함수 | API 레이어 분리 |
| `src/api/currency.ts` | 환율 fetch 함수 | API 레이어 분리 |
| `src/api/chat.ts` | 채팅 fetch 함수 | API 레이어 분리 |
| `src/domain/budget.ts` | 예산 도메인 함수 | lib/budget-utils.ts에서 이동 |
| `src/domain/trip.ts` | 여행 도메인 함수 | lib/trip-utils.ts에서 이동 |
| `src/lib/date-utils.ts` | 날짜 유틸 | 컴포넌트 내 중복 로직 추출 |
| `src/lib/prompt-builder.ts` | 프롬프트 조립 | QuickSetupForm에서 추출 |
| `src/types/weather.ts` | LiveWeatherDay 타입 | 순환 참조 방지용 분리 |

#### 수정
| 파일 | 변경 내용 |
|------|----------|
| `src/app/layout.tsx` | Providers 래퍼 추가 |
| `src/stores/useTripStore.ts` | 84줄→38줄 (서버 상태 전부 제거, currentTripId + togglePackingItem + packingVersion만) |
| `src/stores/useEditStore.ts` | saveSectionEdit → Trip 반환 방식, useTripStore 의존 제거 |
| `src/stores/useChatStore.ts` | fetch 로직 → api/chat.ts 호출로 교체 |
| `src/app/page.tsx` | useTripStore → useTrips() + useAllTrips() + useDeleteTrip() |
| `src/app/trips/[tripId]/page.tsx` | useTripStore → useTrip(id) |
| `src/app/calendar/page.tsx` | useTripStore → useAllTrips() |
| `src/components/ai/AISplitView.tsx` | useTrip + useSaveTrip |
| `src/components/chat/ChatContainer.tsx` | useTrip |
| `src/components/chat/TripPreviewCard.tsx` | useSaveTrip |
| `src/components/viewer/SectionEditHeader.tsx` | useSaveTrip (saveSectionEdit 반환값 연동) |

#### 삭제
| 파일 | 이유 |
|------|------|
| `src/lib/budget-utils.ts` | domain/budget.ts로 이동 |
| `src/lib/trip-utils.ts` | domain/trip.ts로 이동 |
| `src/lib/useWeather.ts` | queries/useWeather.ts로 대체 |
| `src/lib/useCurrency.ts` | queries/useCurrency.ts로 대체 |

#### 변경 없음 (계획대로)
| 파일 | 이유 |
|------|------|
| `src/lib/storage.ts` | queryFn에서 그대로 호출 |
| `src/types/trip.ts` | 타입 변경 없음 |
| `src/api/gemini.ts` | AI 로직 독립 |
| `src/stores/useUIStore.ts` | 클라이언트 상태만 |

---

## 현재 데이터 흐름 (Phase 3 완료 상태)

### 로그인 시 (Supabase)
```
[컴포넌트] → useTrips() / useTrip(id)
              → React Query 캐시 확인 (staleTime: 2분)
              → cache miss → tripApi.getTripSummaries() / tripApi.getTrip(id)
                → Supabase PostgreSQL (RLS 자동 필터)

[컴포넌트] → useSaveTrip().mutate(trip)
              → tripApi.saveTrip(trip, userId)
                → trips upsert + 하위 테이블 replace
              → queryClient.invalidateQueries / setQueryData
```

### 비로그인 시 (Guest Mode — localStorage)
```
[컴포넌트] → useTrips() / useTrip(id)
              → React Query 캐시 확인 (staleTime: Infinity)
              → cache miss → storage.getAllTrips() / storage.getTrip(id)
                → localStorage

[컴포넌트] → useSaveTrip().mutate(trip)
              → storage.saveTrip(trip)
                → localStorage.setItem(...)
              → queryClient.invalidateQueries / setQueryData
```

---

## Phase 1 구현 완료 (2026-03-17)

### 생성된 파일
| 파일 | 역할 |
|------|------|
| `src/lib/supabase/client.ts` | 브라우저 Supabase 클라이언트 (싱글턴, createBrowserClient) |
| `src/lib/supabase/server.ts` | 서버 Supabase 클라이언트 (createServerClient + cookies) |
| `src/lib/supabase/middleware.ts` | Auth 세션 갱신 헬퍼 (updateSession) |
| `middleware.ts` | Next.js 미들웨어 (정적 파일 제외 matcher) |

## Phase 2 구현 완료 (2026-03-17)

### 생성된 파일
| 파일 | 역할 |
|------|------|
| `supabase/migrations/001_initial_schema.sql` | 전체 DB 스키마 (9 테이블 + RLS + 인덱스 + 트리거) |
| `src/app/auth/callback/route.ts` | OAuth 콜백 핸들러 (code exchange → 세션 → 홈 리다이렉트) |
| `src/hooks/useAuth.ts` | 인증 React Query hooks (useAuth, useSignInWithKakao, useSignOut) |

### 수정된 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/components/layout/Header.tsx` | 로그인/로그아웃 UI 추가 (아바타 + 로그아웃 / 로그인 버튼) |
| `src/app/page.tsx` | useAuth 연동 + 비로그인 시 클라우드 저장 안내 배너 |

### 설계 결정
- 별도 로그인 페이지 불필요 — Header에서 바로 카카오 로그인 실행 (간소화)
- RLS 간소화 — 공유 뷰어는 비로그인 읽기 전용이므로 API Route에서 service_role로 처리
- profiles RLS — 본인 SELECT/UPDATE만 (INSERT는 트리거가 SECURITY DEFINER로 처리)

## Phase 3 구현 완료 (2026-03-17)

### 생성된 파일
| 파일 | 역할 |
|------|------|
| `src/types/supabase.ts` | DB 테이블 행 타입 정의 (9개 인터페이스) |
| `src/lib/supabase/trip-mapper.ts` | Trip ↔ DB 변환 함수 (tripToDb, dbToTrip) |
| `src/lib/supabase/trip-api.ts` | Supabase 데이터 접근 모듈 (8개 함수) |
| `src/lib/supabase/__tests__/trip-mapper.test.ts` | trip-mapper 단위 테스트 (13개) |

### 수정된 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/queries/useTrips.ts` | queryFn 분기 (로그인→Supabase, 비로그인→localStorage) |
| `src/stores/useTripStore.ts` | togglePackingItem에 userId 파라미터 추가 |
| `src/components/viewer/tabs/ChecklistTab.tsx` | useAuth 추가, togglePackingItem에 user?.id 전달 |

### 변경 없음 (계획대로)
| 파일 | 이유 |
|------|------|
| `src/app/page.tsx` | hooks 시그니처 변경 없으므로 |
| `src/app/trips/[tripId]/page.tsx` | hooks 시그니처 변경 없으므로 |
| `src/types/trip.ts` | userId 필드 불필요 (useAuth에서 별도 관리) |

### 설계 결정
- Supabase SDK에 Database 제네릭 미적용: 부분 select 시 타입 추론 이슈로 unwrap 헬퍼 패턴 사용
- storage.ts 삭제하지 않음: Guest Mode에서 계속 사용
- togglePackingItem: 동기(localStorage) + 비동기(Supabase) 이중 저장으로 UX 유지

---

## Phase 5 구현 완료 (2026-03-17)

### 생성된 파일
| 파일 | 역할 |
|------|------|
| `src/app/api/shared/[token]/route.ts` | 공유 토큰으로 Trip 조회 API (service_role RLS 우회) |
| `src/app/shared/[token]/page.tsx` | 공유 뷰어 페이지 (비로그인 읽기 전용) |
| `src/components/viewer/ViewerContext.tsx` | readOnly 상태 Context (하위 전체 전달) |

### 수정된 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/lib/supabase/trip-api.ts` | createShareLink, getShareToken, deleteShareLink 함수 추가 |
| `src/components/viewer/ShareModal.tsx` | 링크 공유 옵션 추가 (생성/복사/해제) |
| `src/components/viewer/TripViewer.tsx` | readOnly prop + ViewerProvider 래퍼 |
| `src/components/viewer/HeroSection.tsx` | readOnly prop — AI 수정/공유 버튼 조건부 숨김 |
| `src/components/viewer/SectionEditHeader.tsx` | ViewerContext 연동 — readOnly시 편집 버튼 숨김 |

### 설계 결정
- ViewerContext 패턴: 5개 탭 컴포넌트에 개별 readOnly prop 전달 대신, Context로 일괄 전달
- share_token 생성: crypto.randomUUID().replace(/-/g,'').slice(0,12) — nanoid 패키지 미설치
- 공유 뷰어: 클라이언트 컴포넌트 (fetch → TripViewer) — SSR 불필요 (비로그인 동적 데이터)

---

## 주요 설계 결정

### Phase 0에서 추가된 결정 (2026-03-17)

#### 9. staleTime: Infinity
- **결정**: localStorage 기반 쿼리는 staleTime을 Infinity로 설정
- **이유**: 외부에서 변경되지 않으므로 mutation의 invalidateQueries로만 갱신
- **Supabase 전환 시**: staleTime을 적절한 값(예: 5분)으로 변경

#### 10. useChatStore는 React Query 전환하지 않음
- **결정**: 채팅은 Zustand + sessionStorage 유지
- **이유**: 세션 기반 대화는 "서버 상태 캐시" 모델과 맞지 않음. fetch만 api/chat.ts로 분리

#### 11. useEditStore.saveSectionEdit → Trip 반환 방식
- **결정**: saveSectionEdit가 cleaned Trip을 반환, 컴포넌트에서 useSaveTrip().mutate() 호출
- **이유**: Store에서 queryClient에 직접 접근하는 것보다 컴포넌트 레벨 연동이 깔끔

#### 12. packingVersion 카운터
- **결정**: togglePackingItem 후 리렌더 트리거를 위해 packingVersion 카운터 도입
- **이유**: 기존에는 trips Map 재생성으로 리렌더가 발생했으나, Map 제거 후 별도 메커니즘 필요

### 기존 결정 (1~8번) 유지
- React Query 선행 도입, useTripStore 최소화, useEditStore 유지
- 하이브리드 정규화 9테이블, timeline_items JSONB
- 비로그인 Guest Mode, Chat sessionStorage, Trip ID 형식

---

## 외부 의존성 (업데이트)

### npm 패키지 (Phase별)
| 패키지 | Phase | 상태 |
|--------|-------|------|
| `@tanstack/react-query` | 0 | ✅ 설치됨 |
| `@tanstack/react-query-devtools` | 0 | ✅ 설치됨 (dev) |
| `@supabase/supabase-js` | 1 | ✅ 설치됨 |
| `@supabase/ssr` | 1 | ✅ 설치됨 |

---

## 관련 문서
- `docs/refactoring-guide.md` — Practical React Architecture 기반 리팩토링 가이드
- `dev/active/trip-sharing/trip-sharing-plan.md` — 정적 HTML 공유 계획 (Supabase 공유로 대체)
