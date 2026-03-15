# 환율 계산기 + 실시간 날씨 - 전략 계획

## 개요

여행 목적지의 실시간 날씨/예보와 환율 변환 기능을 추가한다. 현재 Gemini AI가 생성하는 정적 날씨 데이터를 실시간 API 데이터로 대체하고, 가이드탭 예산 섹션에 환율 계산기를 통합한다. 두 기능 모두 무료 API를 사용하며, 서버 사이드(Next.js API Route)에서 호출하여 API 키를 보호한다.

## 현재 상태

### 날씨
- Gemini가 `overview.weather: WeatherDay[]` 필드를 생성 (date, dayOfWeek, icon, tempHigh, tempLow, tempAvg)
- `SummaryTab.tsx`에서 수평 스크롤 카드로 표시
- AI가 만든 데이터라 실제 날씨와 무관하며, 여행 생성 시점의 추측값
- 프롬프트(`gemini.ts`)에 날씨 이모지 규칙과 스키마가 명시되어 있음

### 환율
- `BudgetSection`에서 `total.min/max` (현지 통화) + `total.minKRW/maxKRW` (원화) 표시
- `TimelineItem`에 `cost`와 `currency` 필드 존재 (JPY/KRW)
- 환율 변환은 Gemini가 추정한 고정값 -- 실시간 환율이 아님
- 별도의 환율 계산기 UI는 없음

### 제약사항
- 개인 프로젝트이므로 무료 API만 사용 가능
- Vercel 배포 환경 (서버리스 함수)
- localStorage 기반 데이터 영속화
- 단일 브레이크포인트 (640px)

---

## 무료 API 비교 분석

### 날씨 API

| API | 무료 한도 | API Key | 예보 기간 | 장점 | 단점 |
|-----|-----------|---------|-----------|------|------|
| **Open-Meteo** | 무제한 (비상업) | 불필요 | 16일 | API 키 불필요, 빠름, 풍부한 데이터 | 자체 날씨 아이콘 코드 (WMO) |
| OpenWeatherMap | 1,000회/일 | 필요 | 5일 (무료) | 널리 사용, 풍부한 문서 | 무료 예보 5일 제한, API 키 필요 |
| WeatherAPI | 1,000,000회/월 | 필요 | 3일 (무료) | 넉넉한 호출, 풍부한 데이터 | 무료 예보 3일 제한 |

**선택: Open-Meteo**
- API 키 불필요 -- 환경변수 관리 부담 없음
- 16일 예보 제공 -- 여행 기간 대부분 커버
- 무제한 호출 (비상업) -- 개인 프로젝트에 최적
- 위도/경도 기반 조회 + 무료 geocoding API 제공

### 환율 API

| API | 무료 한도 | API Key | 업데이트 주기 | 장점 | 단점 |
|-----|-----------|---------|-------------|------|------|
| **ExchangeRate-API** | 1,500회/월 | 필요 | 일 1회 | 안정적, 명확한 문서 | 월 1,500회 제한 |
| Open Exchange Rates | 1,000회/월 | 필요 | 시간 1회 | 실시간에 가까움 | USD 기준만 (무료), 월 1,000회 |
| **frankfurter.app** | 무제한 | 불필요 | 일 1회 (ECB 기준) | API 키 불필요, 무제한 | ECB 기준 (아시아 통화 제한적) |
| CurrencyAPI (free) | 300회/월 | 필요 | 일 1회 | 다양한 통화 | 300회 너무 적음 |

**선택: ExchangeRate-API (v6)**
- `https://v6.exchangerate-api.com/v6/{API_KEY}/pair/KRW/JPY`
- 월 1,500회면 개인 프로젝트 충분 (캐싱 적용 시 일 ~3회 수준)
- KRW 기준 조회 가능 (frankfurter는 EUR 기준이라 아시아 통화 약함)
- 안정적이고 깔끔한 응답 구조

**대안 (API 키 없이):** frankfurter.app -- 아시아 통화 지원이 약하지만, API 키 관리 부담 제로. KRW/JPY 직접 지원 여부 확인 필요.

---

## 제안 솔루션

### 아키텍처

```
[클라이언트]                           [서버 API Routes]              [외부 API]

SummaryTab (날씨 위젯)  ──fetch──>  /api/weather?lat=X&lng=Y  ──>  Open-Meteo
                                    └─ 캐싱: 1시간                   (무료, 키 불필요)

GuideTab (환율 계산기)  ──fetch──>  /api/currency?from=KRW&to=JPY ──> ExchangeRate-API
                                    └─ 캐싱: 6시간                   (무료, 키 필요)
```

### 핵심 설계 결정

1. **서버 사이드 API 호출**: API 키 보호 + CORS 회피 + 캐싱 일원화
2. **인메모리 캐싱**: Vercel 서버리스에서 cold start 시 캐시 초기화되지만, warm 상태에서는 캐시 히트. 추가로 클라이언트 측 SWR/React Query 없이 단순 fetch + useState로 구현
3. **Trip 타입 변경 최소화**: `WeatherDay` 타입은 유지하되, AI 생성 대신 실시간 API로 채움. 기존 저장된 Trip의 하위호환성 보장
4. **API 실패 시 안내 메시지**: "날씨 데이터를 가져올 수 없습니다" 표시 (AI 폴백 없음)

---

## 구현 단계

### 1단계: 서버 API Routes (2일)

**목표**: 날씨와 환율 데이터를 조회하는 Next.js API Route 2개 생성

**작업**:

- [ ] 1-1. 날씨 API Route 생성 - 파일: `app/src/app/api/weather/route.ts` - 규모: M
  - Open-Meteo API 호출 (`https://api.open-meteo.com/v1/forecast`)
  - 쿼리 파라미터: `lat`, `lng`, `days` (기본 7)
  - 응답을 `WeatherDay[]` 형태로 변환
  - WMO Weather Code -> 이모지 아이콘 매핑
  - 인메모리 캐시 (1시간 TTL, 키: `${lat},${lng}`)
  - 에러 핸들링 (timeout, API 장애)

- [ ] 1-2. 환율 API Route 생성 - 파일: `app/src/app/api/currency/route.ts` - 규모: M
  - ExchangeRate-API v6 호출
  - 쿼리 파라미터: `from`, `to`, `amount` (선택)
  - 환경변수: `EXCHANGE_RATE_API_KEY`
  - 인메모리 캐시 (6시간 TTL, 키: `${from}-${to}`)
  - 에러 핸들링 + API 키 미설정 시 graceful 처리

- [ ] 1-3. 캐싱 유틸 생성 - 파일: `app/src/lib/api-cache.ts` - 규모: S
  - 공통 인메모리 캐시 (`Map<string, { data, expiry }>`)
  - TTL 기반 만료 처리
  - 두 API Route에서 공유

- [ ] 1-4. Geocoding 유틸 - 파일: `app/src/lib/geocoding.ts` - 규모: S
  - Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`)
  - 도시명 -> 위도/경도 변환 (Trip.destination 기반)
  - 캐시 적용 (24시간 TTL)

### 2단계: 실시간 날씨 UI (2일)

**목표**: SummaryTab의 날씨 섹션을 실시간 데이터로 교체

**작업**:

- [ ] 2-1. 날씨 데이터 fetch 훅 생성 - 파일: `app/src/lib/useWeather.ts` - 규모: M
  - `useWeather(destination: string, startDate: string, endDate: string)`
  - `/api/weather` 호출 (geocoding 포함)
  - 상태: loading / data / error
  - 여행 기간에 해당하는 날씨만 필터링
  - 16일 초과 예보 불가 시 범위 외 표시

- [ ] 2-2. SummaryTab 날씨 섹션 리디자인 - 파일: `app/src/components/viewer/tabs/SummaryTab.tsx` - 규모: L
  - 실시간 날씨 위젯으로 교체 (기존 `trip.overview.weather` 대신 API 데이터)
  - 로딩 스켈레톤 (shimmer 애니메이션)
  - 에러 시 "날씨 데이터를 가져올 수 없습니다" 안내 메시지 표시 (AI 폴백 없음)
  - "마지막 업데이트: X분 전" 표시
  - 오늘 날씨 강조 표시 (여행 중일 때)
  - 기온 단위: 섭씨 (°C)
  - 강수 확률, 습도 추가 표시 (Open-Meteo 제공)

- [ ] 2-3. WMO 날씨 코드 -> 이모지/아이콘 매핑 - 파일: `app/src/lib/weather-utils.ts` - 규모: S
  - Open-Meteo WMO Weather Interpretation Codes 매핑
  - 기존 `WeatherDay.icon` 이모지와 호환되는 매핑
  - 코드 테이블: 0(맑음), 1-3(구름), 45-48(안개), 51-57(이슬비), 61-67(비), 71-77(눈), 80-82(소나기), 95-99(뇌우)

### 3단계: 환율 계산기 UI (2일)

**목표**: 가이드탭 예산 섹션에 환율 계산기 위젯 통합

**작업**:

- [ ] 3-1. 환율 데이터 fetch 훅 생성 - 파일: `app/src/lib/useCurrency.ts` - 규모: M
  - `useCurrency(from: string, to: string)`
  - `/api/currency` 호출
  - 상태: loading / rate / error / lastUpdated
  - 양방향 변환 (KRW -> JPY, JPY -> KRW)

- [ ] 3-2. CurrencyConverter 컴포넌트 생성 - 파일: `app/src/components/viewer/CurrencyConverter.tsx` - 규모: L
  - 인라인 환율 변환 위젯 (가이드탭 예산 섹션 상단)
  - 두 개의 입력 필드: KRW / 현지 통화
  - 한쪽 입력 시 다른 쪽 자동 계산
  - 현재 환율 표시 ("1 JPY = X.XX KRW")
  - 마지막 업데이트 시각 표시
  - 통화 코드 자동 추론: `Trip.destination` 기반 (도쿄->JPY, 파리->EUR 등)
  - 로딩/에러 상태 처리
  - 디자인: 기존 카드 스타일 (`bg-surface border border-border-light rounded-xl p-5 shadow-sm`)

- [ ] 3-3. GuideTab에 환율 계산기 통합 - 파일: `app/src/components/viewer/tabs/GuideTab.tsx` - 규모: S
  - 예산 섹션 AccordionContent 내부, 예산 항목 리스트 위에 배치
  - Trip destination 기반으로 통화 코드 자동 결정
  - 국내 여행이면 환율 계산기 숨김

- [ ] 3-4. 목적지 -> 통화 코드 매핑 유틸 - 파일: `app/src/lib/currency-utils.ts` - 규모: S
  - `getDestinationCurrency(destination: string): { code: string, symbol: string, name: string } | null`
  - 주요 여행지 매핑: 일본(JPY), 미국(USD), 유럽(EUR), 태국(THB), 베트남(VND) 등
  - 국내 여행은 null 반환

### 4단계: AI 프롬프트 + 타입 정리 (1일)

**목표**: AI가 날씨 데이터를 생성하지 않도록 프롬프트 수정, 타입 정리

**작업**:

- [ ] 4-1. create 프롬프트에서 날씨 생성 제거 - 파일: `app/src/api/gemini.ts` - 규모: M
  - `getCreateTripPrompt()`에서 `overview.weather` 스키마 제거
  - 날씨 이모지 규칙 섹션 제거
  - "날씨는 실시간 API에서 제공되므로 생성하지 마세요" 명시
  - `overview.weather`는 빈 배열 `[]`로 반환하도록 안내

- [ ] 4-2. edit 프롬프트에서 날씨 수정 제거 - 파일: `app/src/api/gemini.ts` - 규모: S
  - `getEditTripPrompt()`에서 날씨 관련 안내 제거
  - "weather 배열은 수정하지 말고 그대로 유지하세요" 명시

- [ ] 4-3. WeatherDay 타입 유지 + 주석 추가 - 파일: `app/src/types/trip.ts` - 규모: S
  - `WeatherDay` 인터페이스는 삭제하지 않음 (하위호환)
  - 주석 추가: "레거시: AI 생성 데이터. 실시간 날씨는 /api/weather에서 조회"
  - `TripOverview.weather`를 optional로 변경 (`weather?: WeatherDay[]`)

- [ ] 4-4. normalizeOverview 수정 - 파일: `app/src/api/gemini.ts` - 규모: S
  - `normalizeOverview()`에서 weather가 없어도 안전하게 처리 (이미 빈 배열 폴백 있음 -- 확인만)

### 5단계: 통합 테스트 + 폴리싱 (1일)

**목표**: 전체 흐름 검증, 엣지 케이스 처리, UI 폴리싱

**작업**:

- [ ] 5-1. 오프라인 / API 실패 폴백 검증 - 규모: M
  - 날씨 API 실패 시: "날씨 데이터를 가져올 수 없습니다" 안내 메시지 표시
  - 환율 API 실패 시: "환율 정보를 불러올 수 없습니다" + 마지막 캐시 값
  - API 키 미설정 시: 환율 섹션 숨김 (graceful degradation)

- [ ] 5-2. 기존 Trip 하위호환 검증 - 규모: S
  - localStorage에 저장된 기존 Trip 데이터 (`overview.weather` 있음)가 깨지지 않는지 확인
  - 새로 생성된 Trip (`overview.weather: []`)도 정상 표시

- [ ] 5-3. 모바일 반응형 확인 - 규모: S
  - 날씨 위젯: 수평 스크롤 유지 (기존 패턴)
  - 환율 계산기: 640px 미만에서 전체 너비

- [ ] 5-4. Vercel 환경변수 설정 문서화 - 규모: S
  - `.env.local.example`에 `EXCHANGE_RATE_API_KEY` 추가
  - CLAUDE.md 또는 README에 환경변수 안내 추가

---

## 위험 평가

- **높음**: Open-Meteo Geocoding 정확도 -- "오사카"를 검색하면 정확한 좌표를 반환하는지. 대응: destination 기반 geocoding 실패 시 Trip.days[0].mapSpots[0]의 좌표를 폴백으로 사용
- **높음**: 환율 API 월 1,500회 제한 초과 가능성 -- 대응: 서버 캐시 6시간 + 클라이언트 캐시(sessionStorage). 초과 시 frankfurter.app 폴백
- **보통**: 기존 Trip 데이터 하위호환 -- overview.weather 필드가 optional이 되면서 타입 에러 가능. 대응: 이미 `weather ?? []` 패턴 사용 중이라 안전
- **보통**: Vercel 서버리스 인메모리 캐시 효율 -- cold start마다 캐시 초기화. 대응: 충분한 트래픽이 없는 개인 프로젝트이므로 허용 범위
- **낮음**: Open-Meteo 16일 예보 제한 -- 장기 여행(2주+)은 후반부 날씨 미표시. 대응: "예보 범위 밖" 안내 표시

---

## 성공 지표

- 날씨: 여행 목적지의 실시간 날씨가 1시간 이내 데이터로 표시됨
- 환율: KRW <-> 현지 통화 양방향 변환이 6시간 이내 환율로 작동
- 폴백: API 실패 시 에러 메시지 표시 (앱이 깨지지 않음)
- AI 프롬프트: Gemini가 날씨 데이터를 생성하지 않음 (토큰 절약)
- 하위호환: 기존 저장된 Trip 데이터가 정상 로드됨

---

## 의존성

### 코드 의존성
- 1단계(API Routes)는 독립적, 먼저 구축
- 2단계(날씨 UI)는 1-1, 1-3, 1-4에 의존
- 3단계(환율 UI)는 1-2, 1-3에 의존
- 4단계(프롬프트)는 2단계 완료 후 (날씨 폴백 확인 후)

### 외부 의존성
- Open-Meteo API: 키 불필요, 즉시 사용 가능
- ExchangeRate-API: 무료 회원가입 필요 (https://www.exchangerate-api.com/)
- Vercel 환경변수: `EXCHANGE_RATE_API_KEY` 설정 필요

### NPM 패키지
- 추가 패키지 없음 (fetch API + Next.js 내장 기능만 사용)

---

## 타임라인

| 단계 | 기간 | 산출물 |
|------|------|--------|
| 1단계: 서버 API Routes | 2일 | `/api/weather`, `/api/currency`, 캐싱 유틸 |
| 2단계: 실시간 날씨 UI | 2일 | SummaryTab 날씨 위젯 리디자인 |
| 3단계: 환율 계산기 UI | 2일 | CurrencyConverter, GuideTab 통합 |
| 4단계: AI 프롬프트 정리 | 1일 | Gemini 프롬프트/타입 수정 |
| 5단계: 통합 테스트 | 1일 | 폴백/하위호환/모바일 검증 |
| **총 소요** | **~8일** | **5개 단계** |
