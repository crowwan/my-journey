# 환율 계산기 + 실시간 날씨 - 컨텍스트 & 결정사항

## 상태
- 단계: 계획 수립 완료, 구현 미착수
- 진행률: 0 / 17 작업 완료
- 최종 수정: 2026-03-15

## 주요 파일

### 수정 대상

| 파일 | 용도 | 변경 내용 |
|------|------|----------|
| `app/src/components/viewer/tabs/SummaryTab.tsx` | 요약탭 날씨 섹션 | 실시간 날씨 위젯으로 교체 |
| `app/src/components/viewer/tabs/GuideTab.tsx` | 가이드탭 예산 섹션 | 환율 계산기 위젯 통합 |
| `app/src/api/gemini.ts` | Gemini 프롬프트 | 날씨 생성 제거, 스키마 수정 |
| `app/src/types/trip.ts` | Trip 타입 정의 | `weather` 필드 optional 변경 + 주석 |

### 신규 생성

| 파일 | 용도 |
|------|------|
| `app/src/app/api/weather/route.ts` | Open-Meteo 날씨 API Route |
| `app/src/app/api/currency/route.ts` | ExchangeRate-API 환율 API Route |
| `app/src/lib/api-cache.ts` | 서버 인메모리 캐시 유틸 |
| `app/src/lib/geocoding.ts` | 도시명 -> 위경도 변환 유틸 |
| `app/src/lib/weather-utils.ts` | WMO 코드 -> 이모지 매핑 |
| `app/src/lib/currency-utils.ts` | 목적지 -> 통화 코드 매핑 |
| `app/src/lib/useWeather.ts` | 날씨 데이터 fetch 커스텀 훅 |
| `app/src/lib/useCurrency.ts` | 환율 데이터 fetch 커스텀 훅 |
| `app/src/components/viewer/CurrencyConverter.tsx` | 환율 변환 위젯 컴포넌트 |

### 참조 (읽기 전용)

| 파일 | 참조 이유 |
|------|----------|
| `app/src/components/viewer/TripViewer.tsx` | 뷰어 구조 파악, 탭 배치 |
| `app/src/components/viewer/HeroSection.tsx` | 여행 메타 정보 참조 |
| `app/src/app/api/chat/route.ts` | 기존 API Route 패턴 참조 |
| `app/src/stores/useTripStore.ts` | Trip 데이터 접근 패턴 |
| `app/src/lib/constants.ts` | 탭 구성, Day 색상 |
| `docs/design-system.md` | UI 컴포넌트 스타일 가이드 |

---

## 주요 결정

### 1. 날씨 API 선택: Open-Meteo (2026-03-15)
- **근거**: API 키 불필요, 무제한 호출(비상업), 16일 예보 제공
- **대안**: OpenWeatherMap (5일 예보 제한), WeatherAPI (3일 예보 제한)
- **트레이드오프**: WMO 날씨 코드를 이모지로 변환하는 매핑 테이블 직접 구현 필요. 대신 API 키 관리 부담 제로

### 2. 환율 API 선택: ExchangeRate-API v6 (2026-03-15)
- **근거**: KRW 직접 지원, 안정적, 월 1,500회로 개인 프로젝트에 충분
- **대안**: frankfurter.app (API 키 불필요, 무제한 -- 하지만 ECB 기준이라 KRW/JPY 등 아시아 통화 지원 불확실)
- **트레이드오프**: API 키 관리 필요 + 월간 호출 제한. 캐싱으로 완화
- **폴백 전략**: API 키 미설정 시 환율 섹션을 gracefully 숨김 (앱 기능에 영향 없음)

### 3. API 호출 위치: 서버 사이드 (Next.js API Route) (2026-03-15)
- **근거**: API 키 보호, CORS 무관, 서버 캐싱 일원화
- **대안**: 클라이언트 직접 호출 (Open-Meteo는 키 불필요라 가능)
- **트레이드오프**: 서버리스 cold start 시 캐시 초기화. 하지만 Vercel의 edge 캐싱/ISR로 보완 가능

### 4. Trip 타입 변경 전략: 최소 변경 + 하위호환 (2026-03-15)
- **근거**: `WeatherDay` 타입 삭제 시 기존 localStorage 데이터 깨짐
- **결정**: `overview.weather`를 optional로만 변경, 타입 자체는 유지
- **대안**: 별도 `LiveWeather` 타입 생성 -- 불필요한 복잡도 증가
- **트레이드오프**: 사용되지 않는 타입이 남지만, 코드베이스 안정성 우선

### 5. UI 배치: 환율 계산기를 가이드탭 예산 섹션 내부에 (2026-03-15)
- **근거**: 환율과 예산은 자연스럽게 연관. 별도 탭이나 모달은 과도
- **대안 A**: 5번째 탭 추가 -- 기존 4탭 구조 깨짐, 디자인 시스템 변경 필요
- **대안 B**: 모달/드로어 -- 접근성 낮음, 빈번한 사용 불편
- **트레이드오프**: 가이드탭이 살짝 길어지지만, Accordion 내부라 접힘/펼침 가능

### 6. 캐싱 전략 (2026-03-15)
- **날씨**: 서버 인메모리 1시간 TTL. 날씨 데이터는 자주 변하므로 짧게
- **환율**: 서버 인메모리 6시간 TTL. 일일 업데이트라 긴 캐시 가능
- **Geocoding**: 서버 인메모리 24시간 TTL. 도시 좌표는 변하지 않음

---

## 알려진 이슈

### 차단 요인
- ExchangeRate-API 무료 회원가입 필요 (https://www.exchangerate-api.com/) -- 구현 시작 전 API 키 발급 필요

### 임시 해결책 (예정)
- 환율 API 키 미설정 시: 환율 계산기 섹션 자체를 숨김
- Open-Meteo geocoding 실패 시: Trip.days[0].mapSpots[0] 좌표 폴백

### 향후 개선사항
- 환율 히스토리 차트 (7일/30일 추이)
- 날씨 알림 (출발 전 악천후 경고)
- 다중 통화 지원 (경유지 통화)
- 시간대별 날씨 (시간별 예보)
- PWA 오프라인 캐시 (ServiceWorker)

---

## 외부 API 상세

### Open-Meteo Forecast API
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=34.6937
  &longitude=135.5023
  &daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,
         precipitation_probability_max,weathercode
  &timezone=auto
  &forecast_days=16
```

응답 예시:
```json
{
  "daily": {
    "time": ["2026-03-15", "2026-03-16"],
    "temperature_2m_max": [18.5, 20.1],
    "temperature_2m_min": [8.2, 9.0],
    "temperature_2m_mean": [13.4, 14.6],
    "precipitation_probability_max": [10, 45],
    "weathercode": [0, 61]
  }
}
```

### Open-Meteo Geocoding API
```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name=osaka
  &count=1
  &language=en
```

### ExchangeRate-API v6
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/pair/KRW/JPY/10000
```

응답 예시:
```json
{
  "result": "success",
  "base_code": "KRW",
  "target_code": "JPY",
  "conversion_rate": 0.1098,
  "conversion_result": 1098.0
}
```
