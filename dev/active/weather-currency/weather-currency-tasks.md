# 환율 계산기 + 실시간 날씨 - 작업 체크리스트

## 상태 범례
- [ ] 시작 전
- [🔄] 진행 중
- [✅] 완료
- [❌] 차단됨
- [⏭️] 건너뜀

## 진행 요약
0 / 17 작업 완료 (0%)

---

## 1단계: 서버 API Routes (2일)

- [ ] 1-1. 캐싱 유틸 생성
  - 파일: `app/src/lib/api-cache.ts`
  - 상세: 인메모리 TTL 캐시. `get(key)`, `set(key, data, ttlMs)`, `has(key)` 메서드. `Map<string, { data: unknown, expiry: number }>` 기반
  - 완료 조건: 캐시 저장/조회/만료 동작 확인
  - 규모: S
  - 의존성: 없음

- [ ] 1-2. Geocoding 유틸 생성
  - 파일: `app/src/lib/geocoding.ts`
  - 상세: `geocodeCity(cityName: string): Promise<{ lat: number, lng: number } | null>`. Open-Meteo Geocoding API 호출. 한글/영어 도시명 모두 지원. 결과 캐시 24시간
  - 완료 조건: "도쿄", "오사카", "파리", "Tokyo" 등 주요 도시명으로 정확한 좌표 반환
  - 규모: S
  - 의존성: 1-1 (api-cache)

- [ ] 1-3. 날씨 API Route 생성
  - 파일: `app/src/app/api/weather/route.ts`
  - 상세:
    - `GET /api/weather?destination=오사카&startDate=2026-04-01&endDate=2026-04-05`
    - 내부적으로 geocoding -> forecast 순서 호출
    - Open-Meteo daily forecast API 호출 (temperature_2m_max, min, mean, precipitation_probability_max, weathercode)
    - WMO weathercode -> 이모지 변환 (weather-utils 사용)
    - 응답: `{ days: WeatherApiDay[], source: 'open-meteo', cachedAt: string }`
    - `WeatherApiDay`: `{ date, dayOfWeek, icon, tempHigh, tempLow, tempAvg, precipProbability }`
    - 캐시: 1시간 TTL (키: destination)
    - 에러: 400(파라미터 누락), 502(외부 API 실패), 500(내부 에러)
  - 완료 조건: `/api/weather?destination=도쿄&startDate=2026-04-01&endDate=2026-04-05` 호출 시 5일간 날씨 데이터 반환
  - 규모: M
  - 의존성: 1-1, 1-2

- [ ] 1-4. WMO 날씨 코드 매핑 유틸
  - 파일: `app/src/lib/weather-utils.ts`
  - 상세:
    - `wmoToEmoji(code: number): string` -- WMO Weather Interpretation Code -> 이모지
    - `wmoToLabel(code: number): string` -- WMO -> 한글 설명 ("맑음", "흐림", "비" 등)
    - `dateToDayOfWeek(dateStr: string): string` -- ISO 날짜 -> 한글 요일 ("월", "화" 등)
    - WMO 코드 테이블:
      - 0: ☀️ 맑음
      - 1: 🌤️ 대체로 맑음, 2: ⛅ 구름 조금, 3: ☁️ 흐림
      - 45, 48: 🌫️ 안개
      - 51, 53, 55: 🌦️ 이슬비
      - 61, 63, 65: 🌧️ 비
      - 66, 67: 🌨️ 진눈깨비
      - 71, 73, 75, 77: ❄️ 눈
      - 80, 81, 82: 🌦️ 소나기
      - 95: ⛈️ 뇌우
      - 96, 99: ⛈️ 우박 동반 뇌우
  - 완료 조건: 모든 WMO 코드에 대해 적절한 이모지와 한글 라벨 반환
  - 규모: S
  - 의존성: 없음

- [ ] 1-5. 환율 API Route 생성
  - 파일: `app/src/app/api/currency/route.ts`
  - 상세:
    - `GET /api/currency?from=KRW&to=JPY`
    - ExchangeRate-API v6 pair endpoint 호출
    - 환경변수: `EXCHANGE_RATE_API_KEY`
    - 응답: `{ from, to, rate, lastUpdated, source: 'exchangerate-api' }`
    - 캐시: 6시간 TTL (키: `${from}-${to}`)
    - API 키 미설정 시: `{ error: 'API key not configured', status: 503 }`
    - 에러: 400(파라미터 누락), 503(API 키 없음), 502(외부 API 실패)
  - 완료 조건: `/api/currency?from=KRW&to=JPY` 호출 시 환율 반환, API 키 없을 때 503
  - 규모: M
  - 의존성: 1-1 (api-cache)

- [ ] 1-6. 목적지 -> 통화 코드 매핑 유틸
  - 파일: `app/src/lib/currency-utils.ts`
  - 상세:
    - `getDestinationCurrency(destination: string): CurrencyInfo | null`
    - `CurrencyInfo: { code: string, symbol: string, name: string }`
    - 매핑 테이블 (키워드 매칭):
      - 일본/도쿄/오사카/교토/후쿠오카 -> JPY (￥, 일본 엔)
      - 미국/뉴욕/LA/하와이/괌 -> USD ($, 미국 달러)
      - 유럽/파리/런던 제외 유럽/바르셀로나/로마 -> EUR (€, 유로)
      - 영국/런던 -> GBP (￡, 영국 파운드)
      - 태국/방콕/치앙마이/푸켓 -> THB (฿, 태국 바트)
      - 베트남/하노이/호치민/다낭 -> VND (₫, 베트남 동)
      - 대만/타이베이 -> TWD (NT$, 대만 달러)
      - 중국/베이징/상하이 -> CNY (￥, 중국 위안)
      - 호주/시드니/멜버른 -> AUD (A$, 호주 달러)
      - 싱가포르 -> SGD (S$, 싱가포르 달러)
      - 국내(서울/부산/제주 등) -> null (환율 계산 불필요)
    - 대소문자 무시, 부분 매칭
  - 완료 조건: 주요 여행지 15개 이상에서 올바른 통화 반환, 국내 도시는 null
  - 규모: S
  - 의존성: 없음

---

## 2단계: 실시간 날씨 UI (2일)

- [ ] 2-1. 날씨 데이터 fetch 훅 생성
  - 파일: `app/src/lib/useWeather.ts`
  - 상세:
    - `useWeather(destination: string, startDate: string, endDate: string)`
    - 반환: `{ weather: WeatherApiDay[] | null, isLoading: boolean, error: string | null }`
    - 내부: `useEffect` + `fetch('/api/weather?...')` + `useState`
    - 여행 기간에 해당하는 날씨만 필터 (API는 오늘부터 16일간 반환)
    - 여행이 16일 넘게 미래면 빈 배열 반환 + `error: '예보 범위 밖'`
    - 컴포넌트 마운트 시 1회 호출, destination 변경 시 재호출
  - 완료 조건: 훅 호출 시 loading -> data 또는 error 상태 전이, 여행 기간 필터링 동작
  - 규모: M
  - 의존성: 1-3 (weather API route)

- [ ] 2-2. SummaryTab 날씨 섹션 리디자인
  - 파일: `app/src/components/viewer/tabs/SummaryTab.tsx`
  - 상세:
    - `useWeather` 훅으로 실시간 날씨 데이터 가져오기
    - 로딩 중: 기존 날씨 카드 위치에 shimmer 스켈레톤 (animate-shimmer)
    - 성공: 실시간 날씨 카드 (기존 UI 유지 + 강수 확률 추가)
    - 에러 + AI 날씨 있음: AI 생성 데이터 폴백 + "AI 추정 날씨입니다" 안내
    - 에러 + AI 날씨 없음: "날씨 정보를 불러올 수 없습니다" 빈 상태
    - 날씨 카드에 강수 확률 표시 (🌧️ 30% 형태)
    - "오늘" 해당 카드 강조: `border-primary` + "Today" 뱃지
    - 섹션 우측 상단에 "마지막 업데이트: X분 전" 표시 (text-xs text-text-tertiary)
  - 완료 조건: 실시간 날씨 표시, 로딩 스켈레톤, AI 폴백, 에러 처리 모두 동작
  - 규모: L
  - 의존성: 2-1 (useWeather)

---

## 3단계: 환율 계산기 UI (2일)

- [ ] 3-1. 환율 데이터 fetch 훅 생성
  - 파일: `app/src/lib/useCurrency.ts`
  - 상세:
    - `useCurrency(from: string, to: string)`
    - 반환: `{ rate: number | null, isLoading: boolean, error: string | null, lastUpdated: string | null }`
    - from 또는 to가 빈 문자열이면 호출하지 않음
    - 컴포넌트 마운트 시 1회 호출
  - 완료 조건: 훅 호출 시 환율 데이터 반환, API 키 없을 때 error 상태
  - 규모: M
  - 의존성: 1-5 (currency API route)

- [ ] 3-2. CurrencyConverter 컴포넌트 생성
  - 파일: `app/src/components/viewer/CurrencyConverter.tsx`
  - 상세:
    - Props: `currencyInfo: CurrencyInfo` (from currency-utils)
    - 두 입력 필드: KRW (상단) / 현지 통화 (하단)
    - 입력 시 실시간 변환 (debounce 불필요 -- 단순 산술)
    - 현재 환율 표시: "1 {code} = {rate} KRW" (text-sm text-text-secondary)
    - 마지막 업데이트: "X시간 전 기준" (text-xs text-text-tertiary)
    - 로딩: 입력 필드 비활성 + shimmer
    - 에러: "환율 정보를 불러올 수 없습니다" (text-sm text-text-tertiary)
    - 스타일: `bg-surface border border-border-light rounded-xl p-5 shadow-sm`
    - 입력 필드: `text-2xl font-bold text-text-primary text-right` + 통화 심볼 왼쪽 고정
    - 스왑 버튼 (ArrowUpDown 아이콘) 중앙 배치
    - 반응형: 모바일에서 전체 너비
  - 완료 조건: KRW <-> 현지 통화 양방향 변환, 실시간 입력 반응, 로딩/에러 상태
  - 규모: L
  - 의존성: 3-1 (useCurrency), 1-6 (currency-utils)

- [ ] 3-3. GuideTab에 환율 계산기 통합
  - 파일: `app/src/components/viewer/tabs/GuideTab.tsx`
  - 상세:
    - `getDestinationCurrency(trip.destination)` 호출
    - null이 아니면 예산 AccordionContent 최상단에 CurrencyConverter 배치
    - null이면 (국내 여행) 환율 계산기 숨김
    - 예산 섹션 AccordionTrigger 텍스트에 통화 정보 추가는 하지 않음 (기존 UI 유지)
  - 완료 조건: 해외 여행 시 환율 계산기 표시, 국내 여행 시 숨김
  - 규모: S
  - 의존성: 3-2, 1-6

---

## 4단계: AI 프롬프트 + 타입 정리 (1일)

- [ ] 4-1. Gemini create 프롬프트 수정
  - 파일: `app/src/api/gemini.ts`
  - 상세:
    - `getCreateTripPrompt()` 함수 내:
      - "날씨 (weather.icon)" 이모지 규칙 섹션 제거
      - JSON 스키마에서 `"weather": [...]` 부분을 `"weather": []` (빈 배열 고정)로 변경
      - "## 출력 규칙" 에 추가: "### 날씨\n날씨 데이터는 실시간 API에서 제공됩니다. overview.weather는 빈 배열 []로 설정하세요."
  - 완료 조건: Gemini가 weather 빈 배열로 반환, 기존 Trip 생성 정상 동작
  - 규모: M
  - 의존성: 2-2 완료 후 (날씨 폴백 안전 확인)

- [ ] 4-2. Gemini edit 프롬프트 수정
  - 파일: `app/src/api/gemini.ts`
  - 상세:
    - `getEditTripPrompt()` 함수 내:
      - 날씨 이모지 규칙에서 날씨 항목 제거
      - 수정 규칙에 추가: "6. overview.weather 배열은 수정하지 말고 기존 값을 그대로 유지하세요."
  - 완료 조건: edit 모드에서 날씨 데이터 변경 없이 유지
  - 규모: S
  - 의존성: 4-1

- [ ] 4-3. Trip 타입 수정
  - 파일: `app/src/types/trip.ts`
  - 상세:
    - `TripOverview.weather`를 optional로 변경: `weather?: WeatherDay[]`
    - `WeatherDay` 인터페이스 위에 주석 추가: `/** @deprecated 레거시 AI 생성 날씨. 실시간 날씨는 /api/weather 사용 */`
    - `WeatherDay` 타입 자체는 삭제하지 않음 (기존 데이터 하위호환)
  - 완료 조건: 기존 코드 컴파일 에러 없음 (이미 `weather ?? []` 패턴 사용 중)
  - 규모: S
  - 의존성: 없음 (언제든 적용 가능하지만, 논리적으로 4단계)

---

## 5단계: 통합 테스트 + 폴리싱 (1일)

- [ ] 5-1. 오프라인 / API 실패 폴백 검증
  - 상세:
    - 날씨 API 실패 시: AI 생성 `trip.overview.weather` 폴백 표시 확인
    - 환율 API 실패 시: 에러 메시지 표시, 앱 동작에 영향 없음 확인
    - API 키 미설정 (EXCHANGE_RATE_API_KEY 없음): 환율 섹션 숨김 확인
    - 네트워크 끊김: fetch timeout 후 에러 상태 전이 확인
  - 완료 조건: 모든 실패 시나리오에서 앱이 깨지지 않음
  - 규모: M
  - 의존성: 2-2, 3-3

- [ ] 5-2. 기존 Trip 하위호환 검증
  - 상세:
    - localStorage에 기존 Trip 로드 (overview.weather 있는 경우) -- 정상 표시
    - 새로 생성된 Trip (overview.weather 빈 배열) -- 실시간 날씨만 표시
    - overview.weather 없는 Trip -- 실시간 날씨만 표시
  - 완료 조건: 3가지 케이스 모두 정상 동작
  - 규모: S
  - 의존성: 4-1, 4-3

- [ ] 5-3. 모바일 반응형 + UI 폴리싱
  - 상세:
    - 날씨 위젯: 수평 스크롤 유지 (640px 미만), 스켈레톤 크기 일치
    - 환율 계산기: 640px 미만 전체 너비, 입력 필드 터치 타겟 44px 이상
    - 디자인 시스템 준수: 색상 토큰, 그림자, 반경, 간격
    - 애니메이션: animate-fade-up 적용
  - 완료 조건: 모바일/데스크탑 모두 자연스러운 UI
  - 규모: S
  - 의존성: 2-2, 3-2

- [ ] 5-4. 환경변수 + 문서 정리
  - 상세:
    - `.env.local.example` 생성 또는 업데이트: `EXCHANGE_RATE_API_KEY=your_key_here`
    - `CLAUDE.md` 기술 스택 섹션에 외부 API 추가:
      - "날씨: Open-Meteo (무료, 키 불필요)"
      - "환율: ExchangeRate-API v6 (무료, EXCHANGE_RATE_API_KEY 필요)"
    - Vercel 환경변수 설정 안내
  - 완료 조건: 다른 개발자가 문서만 보고 환경 설정 가능
  - 규모: S
  - 의존성: 없음

---

## 참고사항

### 사전 준비 (구현 시작 전)
- ExchangeRate-API 무료 회원가입: https://www.exchangerate-api.com/
- API 키 발급 후 `.env.local`에 `EXCHANGE_RATE_API_KEY` 설정
- Vercel 프로젝트 환경변수에도 동일하게 설정

### 구현 순서 권장
1-1 -> 1-4 -> 1-2 -> 1-3 (캐시 -> 매핑 -> geocoding -> 날씨 route)
1-6 -> 1-5 (통화 매핑 -> 환율 route)
위 두 트랙은 병렬 가능

### Open-Meteo 참고
- 문서: https://open-meteo.com/en/docs
- Geocoding: https://open-meteo.com/en/docs/geocoding-api
- 한글 도시명 지원 여부 확인 필요 (안 되면 영문 매핑 테이블 추가)
