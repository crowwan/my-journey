# 여행 공유 기능 - 전략 계획

## 개요

여행 일정을 URL로 공유하여 누구나 읽기 전용으로 볼 수 있는 기능을 구현한다. 현재 localStorage 기반 구조에서 Supabase를 도입하여 공유 데이터를 서버에 저장하고, 향후 전체 데이터 마이그레이션의 기반을 마련한다.

## 현재 상태 (AS-IS)

### 데이터 저장
- **모든 Trip 데이터가 localStorage에 저장** (`trip:{id}` 키)
- `app/src/lib/storage.ts`가 localStorage CRUD를 담당
- `useTripStore`(Zustand)가 메모리 캐시 + storage 래퍼 역할

### 기존 공유 기능
- `app/src/lib/share-utils.ts`에 `shareTrip()` 함수 존재
- **현재는 URL만 공유** (`https://my-journey-planner.vercel.app/trips/{tripId}`)
- Web Share API 또는 클립보드 복사 폴백
- **문제**: 공유받은 사람의 localStorage에 해당 Trip이 없으므로 "데이터를 불러오는 중..." 무한 대기

### 라우트 구조
- `/trips/[tripId]/page.tsx` - localStorage에서 Trip 로드 후 `TripViewer` 렌더링
- `/api/chat/route.ts` - Gemini AI 채팅 API (유일한 서버 API)

### 뷰어 구조
- `TripViewer` 컴포넌트가 Trip 객체를 받아 4탭 렌더링
- `HeroSection`에 공유 버튼 이미 존재 (Share2 아이콘)
- 뷰어 자체는 Trip 객체만 받으면 동작 (데이터 소스에 무관)

## 제안 솔루션 (TO-BE)

### 전략: Supabase 단계적 도입

**즉시 Supabase를 도입하되, 공유 전용 테이블로 시작한다.**

이유:
1. "중간 단계" (JSON blob 서버, Vercel KV 등)는 어차피 Supabase로 재마이그레이션 필요 = 이중 작업
2. Supabase 무료 티어(500MB, 50K row)로 공유 기능에 충분
3. 향후 전체 Trip 데이터 마이그레이션 시 인프라가 이미 준비됨
4. Supabase SDK가 Next.js와 잘 통합됨

### 아키텍처

```
[공유하는 사용자]                          [공유받는 사용자]
     │                                         │
     ├─ "공유하기" 클릭                         ├─ 공유 URL 접속
     │                                         │   /shared/[shareId]
     ├─ localStorage Trip 데이터               │
     │   + shareId 생성                        ├─ Next.js Route Handler
     │                                         │   GET /api/shared/[shareId]
     ├─ POST /api/shared                       │
     │   Trip JSON → Supabase                  ├─ Supabase에서 Trip 조회
     │                                         │
     ├─ shareId 반환                           ├─ SharedTripViewer 렌더링
     │   → URL 복사/공유                       │   (읽기 전용 TripViewer)
     └─                                       └─
```

### URL 구조

**`/shared/[shareId]`** 별도 라우트 선택.

| 옵션 | URL 예시 | 장점 | 단점 |
|------|---------|------|------|
| A. 별도 라우트 | `/shared/abc123` | 권한 분리 명확, SEO 가능 | 새 라우트 필요 |
| B. 쿼리 파라미터 | `/trips/id?shared=true` | 기존 라우트 재사용 | 권한 분기 복잡 |
| C. 서브도메인 | `share.my-journey.vercel.app` | 완전 분리 | 인프라 복잡 |

**옵션 A 선택 이유**: 공유 페이지는 로그인 불필요 + SEO 메타태그 필요 + 편집 기능 제외 등 기존 Trip 페이지와 요구사항이 다름.

### shareId 설계

- **형식**: nanoid 12자리 (`V1StGXR8_Z5j`)
- **고유성**: Supabase unique constraint
- **URL**: `https://my-journey-planner.vercel.app/shared/V1StGXR8_Z5j`

### Supabase 스키마 (공유 전용)

```sql
-- 공유된 여행 스냅샷 저장
CREATE TABLE shared_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL,        -- URL용 짧은 ID
  trip_data JSONB NOT NULL,             -- Trip 전체 JSON 스냅샷
  title TEXT NOT NULL,                  -- 검색/목록용
  destination TEXT NOT NULL,            -- 검색/목록용
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,              -- NULL이면 영구
  view_count INTEGER DEFAULT 0,
  original_trip_id TEXT,               -- localStorage의 원본 Trip ID (참고용)
  version INTEGER DEFAULT 1            -- 재공유 시 버전 관리
);

-- shareId 검색 인덱스
CREATE INDEX idx_shared_trips_share_id ON shared_trips(share_id);
-- 만료 정리용 인덱스
CREATE INDEX idx_shared_trips_expires_at ON shared_trips(expires_at);
```

**Trip 전체를 JSONB로 저장하는 이유**:
- 현재 Trip 스키마가 복잡 (20+ 중첩 인터페이스) → 정규화 비용 大
- 공유 스냅샷은 불변 (수정 불필요) → JSONB가 적합
- 향후 Trip 테이블 정규화 시 shared_trips는 그대로 유지 가능

### 공유 데이터 생명주기

| 정책 | 값 | 근거 |
|------|-----|------|
| 기본 만료 | 없음 (영구) | 개인 프로젝트, 스토리지 부담 작음 |
| 수동 삭제 | 공유한 사용자가 삭제 가능 | localStorage에 shareId 매핑 저장 |
| 재공유 | 기존 공유 갱신 (같은 shareId) | 링크 유지 + 최신 데이터 반영 |
| 크기 제한 | Trip JSON 최대 1MB | Supabase row 크기 고려 |

## 구현 단계

### Phase 1: Supabase 인프라 + API (3일)

**목표**: Supabase 연동 + 공유 API 엔드포인트 완성

#### 1-1. Supabase 프로젝트 설정 - 규모: M
- Supabase 프로젝트 생성 (my-journey)
- `shared_trips` 테이블 생성 (위 스키마)
- RLS(Row Level Security) 정책: 읽기는 public, 쓰기는 anon key + service role
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Vercel에 환경변수 등록

#### 1-2. Supabase 클라이언트 설정 - 규모: S
- `@supabase/supabase-js` 패키지 설치
- `app/src/lib/supabase.ts` - 서버용 Supabase 클라이언트 생성
- 서버 컴포넌트/API Route에서만 사용 (클라이언트 번들에 service key 노출 방지)

#### 1-3. 공유 생성 API - 규모: M
- `app/src/app/api/shared/route.ts` - POST: Trip JSON 수신 -> shareId 생성 -> Supabase 저장
- nanoid 12자리 생성 (충돌 시 재시도)
- 응답: `{ shareId, shareUrl }`
- Trip JSON 크기 검증 (1MB 제한)

#### 1-4. 공유 조회 API - 규모: S
- `app/src/app/api/shared/[shareId]/route.ts` - GET: shareId로 Trip 조회
- view_count 증가 (비동기, 응답 차단 안 함)
- 만료 체크 (expires_at이 있고 지났으면 404)
- 응답: Trip JSON

### Phase 2: 공유 페이지 + UI (2일)

**목표**: 공유 URL 접속 시 읽기 전용 뷰어 표시

#### 2-1. 공유 페이지 라우트 - 규모: M
- `app/src/app/shared/[shareId]/page.tsx` - Server Component
- API 호출로 Trip 데이터 fetch
- Next.js `generateMetadata`로 OG 태그 생성 (제목, 목적지, 날짜)
- 에러 처리: 존재하지 않는 shareId -> 404 페이지
- 만료된 공유 -> "이 공유 링크가 만료되었습니다" 안내

#### 2-2. SharedTripViewer 컴포넌트 - 규모: M
- 기존 `TripViewer`를 래핑하는 읽기 전용 뷰어
- **제거할 요소**: "AI로 수정" 버튼, 인라인 편집 버튼, 체크리스트 체크 기능
- **추가할 요소**: "My Journey로 보기" 워터마크/배너, "내 여행에 복사" 버튼
- HeroSection을 `SharedHeroSection`으로 대체 (편집 기능 제거, 공유 출처 표시)

#### 2-3. 공유하기 플로우 업데이트 - 규모: M
- `app/src/lib/share-utils.ts` 수정: `shareTrip()` -> Supabase에 업로드 후 shareUrl 반환
- HeroSection 공유 버튼: 로딩 상태 표시 (업로드 중)
- 성공 시: shareUrl 클립보드 복사 + 토스트 "공유 링크가 복사되었습니다"
- 실패 시: "공유에 실패했습니다. 다시 시도해주세요" 토스트
- localStorage에 `shared:{tripId}` -> shareId 매핑 저장 (재공유 시 같은 링크 유지)

### Phase 3: 공유 관리 + 고도화 (2일)

**목표**: 공유 상태 관리, 재공유, OG 이미지

#### 3-1. 공유 상태 관리 - 규모: M
- localStorage에 공유 매핑 저장: `shared:{tripId}` -> `{ shareId, sharedAt, shareUrl }`
- HeroSection 공유 버튼 상태 분기: 미공유 시 "공유하기" / 공유 후 "링크 복사" + "공유 해제"
- 공유 해제: Supabase에서 삭제 + localStorage 매핑 제거

#### 3-2. 재공유 (업데이트) - 규모: S
- 이미 공유된 Trip 수정 후 "공유 업데이트" 버튼
- 같은 shareId로 trip_data 업데이트 (version 증가)
- 토스트: "공유된 여행이 업데이트되었습니다"

#### 3-3. OG 메타태그 + 소셜 미리보기 - 규모: M
- `app/src/app/shared/[shareId]/page.tsx`에서 `generateMetadata` 구현
- title: `{trip.title} | My Journey`
- description: `{destination} {startDate}~{endDate} {dayCount}일 여행`
- og:image: Vercel OG로 동적 이미지 생성 (여행 제목 + 목적지 + 날짜)
- `app/src/app/api/og/route.tsx` - Vercel OG 이미지 생성 API

#### 3-4. "내 여행에 복사" 기능 - 규모: S
- 공유 페이지에서 "내 여행에 복사" 버튼
- Trip 데이터를 새 ID로 localStorage에 저장
- 홈(`/`)으로 리다이렉트 + 토스트 "여행이 복사되었습니다"

## 위험 평가

### 높음
- **Supabase 무료 티어 제한**: 500MB 스토리지, 2GB 전송/월
  - 대응: Trip JSON 평균 50-100KB → 5,000~10,000개 공유 가능. 개인 프로젝트로 충분
  - 모니터링: Supabase 대시보드에서 사용량 확인

- **API Key 노출**: `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트에 노출되면 DB 직접 접근 가능
  - 대응: 서버 컴포넌트/API Route에서만 service key 사용. 클라이언트는 API Route 통해서만 접근

### 보통
- **대용량 Trip JSON**: 매우 상세한 여행의 경우 JSON이 클 수 있음
  - 대응: 1MB 크기 제한 + 에러 메시지. 실제 Trip은 50-200KB 수준

- **shareId 충돌**: nanoid 12자리 충돌 확률 극히 낮음
  - 대응: Supabase unique constraint + 충돌 시 재생성 (최대 3회)

- **기존 공유 링크 호환**: 현재 `/trips/{tripId}` URL로 공유한 사용자 존재 가능
  - 대응: 기존 링크는 그대로 동작 (localStorage 기반). 새 공유만 `/shared/` 사용

### 낮음
- **Supabase 서비스 장애**: 공유 페이지 접근 불가
  - 대응: 에러 페이지에 "잠시 후 다시 시도" 안내. 로컬 데이터는 영향 없음

## 성공 지표

| 지표 | 목표 |
|------|------|
| 공유 링크 생성 시간 | < 2초 |
| 공유 페이지 로드 시간 | < 1.5초 (FCP) |
| OG 미리보기 | 카카오톡, 슬랙, iMessage에서 정상 표시 |
| 에러율 | 공유 생성 실패 < 1% |
| 기존 기능 영향 | 0 (localStorage 기반 기능 변경 없음) |

## 의존성

### 코드 의존성
- `inline-edit` 작업과 독립적 (병렬 진행 가능)
- `TripViewer` 컴포넌트 재사용 (props 추가만 필요)
- `share-utils.ts` 수정 (기존 함수 시그니처 유지, 내부 로직 변경)

### 외부 의존성
- **Supabase 프로젝트 생성** (무료 티어)
- **패키지**: `@supabase/supabase-js`, `nanoid`
- **Vercel 환경변수 등록**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Supabase 전체 마이그레이션 로드맵

이 공유 기능은 Supabase 도입의 **1단계**이다. 향후 로드맵:

| 단계 | 범위 | 시기 |
|------|------|------|
| **1단계** (이번) | 공유 전용 테이블 (`shared_trips`) | 지금 |
| **2단계** | Trip 테이블 정규화 + localStorage -> Supabase 동기화 | 공유 안정화 후 |
| **3단계** | 사용자 인증 (Supabase Auth) + 개인 Trip 클라우드 저장 | 2단계 이후 |
| **4단계** | 공동 편집 (Realtime) | 3단계 이후 |

이번 작업에서 **2단계를 염두에 둔 설계**:
- `supabase.ts` 클라이언트를 별도 모듈로 분리 → 2단계에서 재사용
- Trip 타입(`trip.ts`)을 변경하지 않음 → 2단계에서 DB 스키마를 Trip 타입에 맞춤
- `storage.ts`의 인터페이스 유지 → 2단계에서 Supabase 백엔드로 교체만 하면 됨

## 타임라인

| Phase | 기간 | 산출물 |
|-------|------|--------|
| Phase 1: 인프라 + API | 3일 | Supabase 연동, 공유 생성/조회 API |
| Phase 2: 페이지 + UI | 2일 | 공유 페이지, 읽기 전용 뷰어, 공유 플로우 |
| Phase 3: 관리 + 고도화 | 2일 | 공유 상태 관리, OG 이미지, 복사 기능 |
| **총계** | **7일** | **3개 Phase** |
