# 여행 공유 기능 - 작업 체크리스트

## 상태 범례
- [ ] 시작 전
- [🔄] 진행 중
- [✅] 완료
- [❌] 차단됨
- [⏭️] 건너뜀

## 진행 요약
0 / 14 작업 완료 (0%)

---

## Phase 1: Supabase 인프라 + API (3일)

### 1-1. Supabase 프로젝트 설정
- [ ] Supabase 프로젝트 생성 (my-journey)
  - 상세: supabase.com에서 새 프로젝트 생성, 리전은 Northeast Asia (Tokyo)
  - 완료 조건: 프로젝트 URL과 키 확보
  - 규모: S
  - 의존성: 없음

- [ ] `shared_trips` 테이블 생성
  - 상세: SQL Editor에서 테이블 + 인덱스 생성. 컬럼: id(UUID PK), share_id(TEXT UNIQUE), trip_data(JSONB), title(TEXT), destination(TEXT), created_at, expires_at, view_count, original_trip_id, version
  - 완료 조건: 테이블 생성 확인, 테스트 row INSERT/SELECT 성공
  - 규모: S
  - 의존성: Supabase 프로젝트 생성

- [ ] RLS 정책 설정
  - 상세: SELECT는 anon 허용 (공개 읽기), INSERT/UPDATE/DELETE는 service_role만 허용
  - 완료 조건: anon key로 SELECT 성공, INSERT 차단 확인
  - 규모: S
  - 의존성: 테이블 생성

- [ ] Vercel 환경변수 등록
  - 상세: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 등록. `.env.local`에도 로컬 개발용 추가
  - 완료 조건: `next dev`에서 환경변수 접근 확인
  - 규모: S
  - 의존성: Supabase 프로젝트 생성

### 1-2. Supabase 클라이언트 설정
- [ ] `@supabase/supabase-js`, `nanoid` 패키지 설치 + Supabase 클라이언트 모듈 생성
  - 파일: `app/src/lib/supabase.ts`
  - 상세: `createClient(url, serviceRoleKey)` 서버 전용 클라이언트. 클라이언트 컴포넌트에서 import 방지를 위해 'server-only' 패키지 사용 또는 주석으로 명시
  - 완료 조건: API Route에서 Supabase 연결 테스트 (간단한 SELECT) 성공
  - 규모: S
  - 의존성: Vercel 환경변수 등록

### 1-3. 공유 생성 API
- [ ] POST `/api/shared` 엔드포인트 구현
  - 파일: `app/src/app/api/shared/route.ts`
  - 상세:
    - Request body: `{ trip: Trip }` (Trip JSON 전체)
    - Trip JSON 크기 검증 (1MB 제한)
    - nanoid(12)로 shareId 생성
    - Supabase `shared_trips`에 INSERT
    - unique constraint 충돌 시 nanoid 재생성 (최대 3회)
    - Response: `{ shareId, shareUrl }` (200) 또는 에러 (400/500)
  - 완료 조건: curl/Postman으로 Trip JSON POST → shareId 반환 확인. Supabase 대시보드에서 row 확인
  - 규모: M
  - 의존성: Supabase 클라이언트 설정

### 1-4. 공유 조회 API
- [ ] GET `/api/shared/[shareId]` 엔드포인트 구현
  - 파일: `app/src/app/api/shared/[shareId]/route.ts`
  - 상세:
    - shareId로 `shared_trips` 조회
    - 존재하지 않으면 404 반환
    - expires_at 체크: 만료되었으면 410 Gone 반환
    - view_count 비동기 증가 (응답 차단 안 함)
    - Response: `{ trip: Trip, sharedAt, viewCount }` (200)
  - 완료 조건: 1-3에서 생성한 shareId로 GET → Trip JSON 반환 확인. 존재하지 않는 ID → 404 확인
  - 규모: S
  - 의존성: 공유 생성 API (테스트 데이터 필요)

---

## Phase 2: 공유 페이지 + UI (2일)

### 2-1. 공유 페이지 라우트
- [ ] `/shared/[shareId]` 페이지 구현
  - 파일: `app/src/app/shared/[shareId]/page.tsx`
  - 상세:
    - Server Component로 구현
    - fetch로 `/api/shared/[shareId]` 호출 (또는 직접 Supabase 조회)
    - `generateMetadata`로 OG 태그 생성: title, description, og:image
    - 에러 처리: 404 → "존재하지 않는 공유 링크" 페이지, 410 → "만료된 링크" 페이지
    - 성공 시 `SharedTripViewer` 렌더링
  - 완료 조건: `/shared/{실제shareId}` 접속 시 여행 일정 표시. 잘못된 shareId → 404 페이지 표시
  - 규모: M
  - 의존성: 공유 조회 API

### 2-2. SharedTripViewer 컴포넌트
- [ ] 읽기 전용 뷰어 래퍼 구현
  - 파일: `app/src/components/viewer/SharedTripViewer.tsx`, `app/src/components/viewer/SharedHeroSection.tsx`
  - 상세:
    - `TripViewer`에 `readOnly` prop 추가하는 방식 또는 별도 래퍼
    - SharedHeroSection: "AI로 수정" 버튼 제거, "공유하기" 대신 "원본 공유" 또는 숨김
    - "My Journey에서 보기" 하단 배너 (브랜딩 + 앱 유도)
    - 체크리스트 탭: 체크 기능 비활성화 (보기만)
    - 디자인 시스템 준수: bg-surface, rounded-xl, shadow-sm 등
  - 완료 조건: 공유 페이지에서 4탭 모두 정상 표시. 편집 관련 UI 요소 숨겨짐 확인
  - 규모: M
  - 의존성: 공유 페이지 라우트

### 2-3. 공유하기 플로우 업데이트
- [ ] `share-utils.ts` 수정 + HeroSection 공유 버튼 연동
  - 파일: `app/src/lib/share-utils.ts`, `app/src/components/viewer/HeroSection.tsx`
  - 상세:
    - `shareTrip()` 함수 수정: Trip JSON → POST `/api/shared` → shareUrl 반환
    - 기존 공유 매핑 확인: `shared:{tripId}`가 있으면 같은 shareId 재사용 (링크 유지)
    - HeroSection: 공유 버튼 클릭 시 로딩 스피너 표시
    - 성공: shareUrl 클립보드 복사 + 토스트 "공유 링크가 복사되었습니다"
    - 실패: 에러 토스트 "공유에 실패했습니다"
    - localStorage에 공유 매핑 저장: `shared:{tripId}` → `{ shareId, sharedAt, shareUrl }`
  - 완료 조건: HeroSection 공유 버튼 클릭 → Supabase에 저장 → `/shared/xxx` URL 클립보드 복사 확인. 해당 URL 접속 시 여행 표시
  - 규모: M
  - 의존성: 공유 생성 API, SharedTripViewer

---

## Phase 3: 공유 관리 + 고도화 (2일)

### 3-1. 공유 상태 관리
- [ ] 공유 상태에 따른 HeroSection UI 분기
  - 파일: `app/src/lib/storage.ts`, `app/src/components/viewer/HeroSection.tsx`
  - 상세:
    - `storage.ts`에 공유 매핑 CRUD 추가: `getShareInfo(tripId)`, `setShareInfo(tripId, info)`, `removeShareInfo(tripId)`
    - HeroSection 공유 버튼 3가지 상태:
      1. 미공유: Share2 아이콘 + "공유하기" → 새 공유 생성
      2. 공유됨: Link 아이콘 + "링크 복사" → 기존 URL 복사
      3. 공유 해제: 드롭다운 메뉴에 "공유 해제" 옵션
    - 공유 해제: DELETE `/api/shared/[shareId]` → Supabase 삭제 → localStorage 매핑 제거
  - 완료 조건: 공유 후 버튼이 "링크 복사"로 변경. "공유 해제" 시 공유 URL 접속 불가. 재공유 시 새 링크 생성
  - 규모: M
  - 의존성: Phase 2 완료

### 3-2. 재공유 (업데이트)
- [ ] Trip 수정 후 공유 데이터 업데이트
  - 파일: `app/src/lib/share-utils.ts`, `app/src/app/api/shared/[shareId]/route.ts`
  - 상세:
    - `[shareId]/route.ts`에 PUT 메서드 추가: trip_data 업데이트 + version 증가
    - Trip 수정 감지: 공유된 Trip의 updatedAt > sharedAt이면 "공유 업데이트" 버튼 표시
    - 업데이트 시 토스트: "공유된 여행이 업데이트되었습니다"
  - 완료 조건: 공유된 여행 수정 → "공유 업데이트" 클릭 → 공유 URL에서 최신 데이터 확인
  - 규모: S
  - 의존성: 공유 상태 관리

### 3-3. OG 메타태그 + 소셜 미리보기
- [ ] 동적 OG 이미지 생성 API
  - 파일: `app/src/app/api/og/route.tsx`
  - 상세:
    - Vercel OG (`@vercel/og` / `next/og`) 사용
    - 입력: title, destination, startDate, endDate, dayCount (쿼리 파라미터)
    - 출력: 1200x630 이미지 (여행 제목 + 목적지 + 날짜 + My Journey 로고)
    - 디자인: primary 컬러 (#f97316) 그라데이션 배경 + 흰색 텍스트
    - `shared/[shareId]/page.tsx`의 `generateMetadata`에서 og:image URL 설정
  - 완료 조건: 카카오톡/슬랙에서 공유 URL 붙여넣기 시 미리보기 카드 정상 표시
  - 규모: M
  - 의존성: 공유 페이지 라우트

### 3-4. "내 여행에 복사" 기능
- [ ] 공유 페이지에서 여행 데이터를 내 localStorage에 복사
  - 파일: `app/src/components/viewer/SharedTripViewer.tsx`
  - 상세:
    - SharedTripViewer 하단 또는 SharedHeroSection에 "내 여행에 복사" 버튼
    - 클릭 시: Trip 데이터 복사 + 새 ID 생성 (nanoid) + createdAt/updatedAt 갱신
    - localStorage에 저장 (useTripStore.saveTrip)
    - 홈(`/`)으로 리다이렉트 + 토스트 "여행이 내 목록에 추가되었습니다"
  - 완료 조건: 공유 페이지에서 "내 여행에 복사" → 홈에서 복사된 여행 확인 → 원본과 동일한 내용
  - 규모: S
  - 의존성: SharedTripViewer 구현

---

## 참고사항

### 작업 순서 권장
1. Phase 1은 순차 진행 (1-1 → 1-2 → 1-3 → 1-4)
2. Phase 2는 2-1 → 2-2 → 2-3 순차 (각 단계가 이전 결과 의존)
3. Phase 3의 3-3(OG 이미지)과 3-4(복사 기능)는 3-1/3-2와 병렬 가능

### inline-edit 작업과의 충돌 가능성
- `HeroSection.tsx`를 양쪽에서 수정 → 작업 순서 조율 필요
- inline-edit가 먼저 머지되면 그 위에서 공유 버튼 변경. 병렬이면 HeroSection 충돌 해결 필요

### 테스트 체크리스트 (Phase별 완료 시 확인)
- [ ] Phase 1: curl로 공유 생성/조회 API 동작 확인
- [ ] Phase 2: 브라우저에서 공유 → 공유 URL 접속 → 읽기 전용 뷰어 확인
- [ ] Phase 3: 카카오톡/슬랙 미리보기, 공유 해제, 재공유, 복사 기능 확인
