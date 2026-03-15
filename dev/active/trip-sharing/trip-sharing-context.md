# 여행 공유 기능 - 컨텍스트 & 결정사항

## 상태
- 단계: 계획 수립 완료, 구현 미착수
- 진행률: 0 / 14 작업 완료
- 최종 수정: 2026-03-15

## 주요 파일

### 수정 대상
- `app/src/lib/share-utils.ts` - 공유 로직 전면 교체 (Web Share API -> Supabase 업로드 + URL 생성)
- `app/src/components/viewer/HeroSection.tsx` - 공유 버튼 상태 분기 (미공유/공유됨/업데이트 필요)
- `app/src/components/viewer/TripViewer.tsx` - readOnly prop 추가 (편집 기능 조건부 숨김)
- `app/src/lib/storage.ts` - 공유 매핑 저장/조회 함수 추가 (`shared:{tripId}`)

### 신규 생성
- `app/src/lib/supabase.ts` - Supabase 서버 클라이언트 (service role key)
- `app/src/app/api/shared/route.ts` - POST: Trip 공유 생성 API
- `app/src/app/api/shared/[shareId]/route.ts` - GET: 공유 Trip 조회 API
- `app/src/app/shared/[shareId]/page.tsx` - 공유 페이지 (Server Component)
- `app/src/components/viewer/SharedTripViewer.tsx` - 읽기 전용 뷰어 래퍼
- `app/src/components/viewer/SharedHeroSection.tsx` - 공유 페이지용 히어로 (편집 버튼 없음)
- `app/src/app/api/og/route.tsx` - Vercel OG 이미지 생성 API

### 변경 없음 (재사용)
- `app/src/types/trip.ts` - Trip 타입 그대로 사용 (JSONB에 직렬화)
- `app/src/stores/useTripStore.ts` - 기존 localStorage 로직 유지
- `app/src/components/viewer/TabBar.tsx` - 공유 페이지에서도 동일 사용
- `app/src/components/viewer/tabs/*` - 4개 탭 컴포넌트 그대로 사용

## 주요 결정

### 1. Supabase 즉시 도입 (중간 단계 생략) (2026-03-15)
- **근거**: Vercel KV, JSON blob 등 중간 솔루션은 어차피 Supabase 마이그레이션 시 재작업 필요. 처음부터 최종 인프라를 사용하는 것이 총 공수 절감
- **대안 검토**:
  - Vercel KV: 간단하지만 Supabase와 이중 인프라. 비용 발생 가능
  - Vercel Blob: 파일 스토리지 성격. DB 기능 없음
  - JSON 파일 서버: 보안/관리 어려움
  - Firebase: Supabase 대비 장점 없음 (이미 Supabase 결정)
- **트레이드오프**: 초기 설정 비용 약간 높음 (+0.5일), 하지만 마이그레이션 비용 0

### 2. `/shared/[shareId]` 별도 라우트 (2026-03-15)
- **근거**: 공유 페이지는 인증 불필요, OG 메타태그 필요, 편집 기능 제외 등 기존 `/trips/[tripId]`와 요구사항이 다름
- **대안 검토**:
  - `/trips/[tripId]?shared=true`: 하나의 페이지에서 분기 → 복잡도 증가
  - 쿼리 기반은 SEO/OG 메타태그 처리가 어려움
- **트레이드오프**: 새 라우트 + 뷰어 래퍼 필요, 하지만 관심사 분리 깔끔

### 3. Trip JSON을 JSONB로 통째 저장 (2026-03-15)
- **근거**: Trip 스키마가 20+ 인터페이스로 복잡. 공유 스냅샷은 불변 데이터 → 정규화 불필요
- **대안 검토**:
  - 정규화 저장: Trip, Day, TimelineItem 등 별도 테이블 → 공유만을 위해 과도
  - 향후 Trip 테이블은 정규화하되, shared_trips는 스냅샷으로 유지
- **트레이드오프**: 검색 어려움 (JSONB 내부 쿼리 필요), 하지만 공유 목적에는 불필요

### 4. nanoid 12자리 shareId (2026-03-15)
- **근거**: UUID는 URL에 너무 김 (36자). nanoid 12자리는 충분히 짧고 충돌 확률 극히 낮음 (62^12 = 3.2 * 10^21)
- **대안 검토**:
  - UUID v4: 안전하지만 URL이 길어짐
  - 숫자 ID: 순차 예측 가능 → 보안 우려
  - 8자리: 충돌 확률 약간 높아짐
- **트레이드오프**: 외부 패키지 (nanoid) 추가 필요

### 5. 기본 만료 없음 (영구 공유) (2026-03-15)
- **근거**: 개인 프로젝트로 대량 트래픽 예상 안 됨. Supabase 무료 500MB로 5,000+ 공유 가능
- **대안 검토**:
  - 30일 만료: 관리 용이하지만 사용자 불편
  - 90일 만료: 절충안
- **트레이드오프**: 스토리지 누적 가능, 하지만 개인 프로젝트 규모에서 문제 없음. 필요시 만료 정책 추가 용이 (expires_at 컬럼 존재)

## 알려진 이슈

### 차단 요인
- 없음. Supabase 프로젝트 생성은 무료이며 즉시 가능

### 향후 고려사항
- Supabase 2단계 마이그레이션 시 `shared_trips`와 `trips` 테이블 간 관계 정의 필요
- 사용자 인증 도입 시 공유 권한 모델 재설계 (현재는 링크 아는 사람 누구나 접근)
- Trip 데이터 변경 시 공유된 스냅샷 자동 갱신 여부 (현재는 수동 "공유 업데이트")
- `inline-edit` 작업과 병렬 진행 가능하나, HeroSection 수정 시 충돌 가능 → 순서 조율 필요

## 외부 의존성

| 의존성 | 용도 | 비고 |
|--------|------|------|
| Supabase (supabase.com) | DB + 스토리지 | 무료 티어 사용 |
| `@supabase/supabase-js` | Supabase SDK | npm 패키지 |
| `nanoid` | shareId 생성 | npm 패키지. 경량 (130B) |
| `@vercel/og` | OG 이미지 생성 | Next.js 내장 (Phase 3) |
| Vercel 환경변수 | Supabase 키 저장 | 대시보드에서 설정 |
