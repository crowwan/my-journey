# 환율 계산기 + 실시간 날씨 - 컨텍스트 & 결정사항

## 상태
- 단계: **날씨 구현 완료, 환율 구현 완료**
- 진행률: 날씨 7/7 완료, 환율 4/4 완료
- 최종 수정: 2026-03-16

## 이번 세션 구현 완료 (날씨)

### 생성된 파일
| 파일 | 용도 | 상태 |
|------|------|------|
| `app/src/lib/api-cache.ts` | 인메모리 TTL 캐시 유틸 | ✅ 완료 |
| `app/src/lib/geocoding.ts` | 도시명 → 위경도 (한글→영문 매핑 80+개) | ✅ 완료 |
| `app/src/lib/weather-utils.ts` | WMO 코드 → 이모지/설명 매핑 | ✅ 완료 |
| `app/src/app/api/weather/route.ts` | Open-Meteo 날씨 API Route (1시간 캐시) | ✅ 완료 |
| `app/src/lib/useWeather.ts` | `useWeather()` 커스텀 훅 | ✅ 완료 |

### 수정된 파일
| 파일 | 변경 내용 | 상태 |
|------|----------|------|
| `app/src/components/viewer/tabs/SummaryTab.tsx` | 실시간 날씨 위젯 (스켈레톤, 에러, TODAY 뱃지, 강수확률) | ✅ 완료 |
| `app/src/types/trip.ts` | `weather` optional 변경 + 레거시 주석 | ✅ 완료 |
| `app/src/api/gemini.ts` | create/edit 프롬프트에서 날씨 생성 제거 | ✅ 완료 |

### 구현 완료 (환율, 2026-03-16)

#### 생성된 파일
| 파일 | 용도 | 상태 |
|------|------|------|
| `app/src/app/api/currency/route.ts` | ExchangeRate-API v6 환율 API Route (6시간 캐시) | ✅ 완료 |
| `app/src/lib/currency-utils.ts` | 목적지 → 통화 코드 매핑 (100+개 도시) | ✅ 완료 |
| `app/src/lib/useCurrency.ts` | `useCurrency()` 커스텀 훅 | ✅ 완료 |
| `app/src/components/viewer/CurrencyConverter.tsx` | 환율 변환 위젯 (양방향, 스왑, 로딩/에러) | ✅ 완료 |

#### 수정된 파일
| 파일 | 변경 내용 | 상태 |
|------|----------|------|
| `app/src/components/viewer/tabs/BudgetTab.tsx` | CurrencyConverter 통합 (도넛 차트 아래, KRW 아닐 때만) | ✅ 완료 |

---

## 주요 결정

### 1. 날씨 API: Open-Meteo (2026-03-15)
- API 키 불필요, 무제한 호출(비상업), 16일 예보

### 2. Geocoding: 한글→영문 매핑 테이블 방식 (2026-03-15)
- **이슈**: Open-Meteo Geocoding이 한글 검색을 지원하지 않음 ("제주도", "오사카" → 결과 없음)
- **해결**: `CITY_NAME_MAP` 테이블로 한글→영문 변환 (80+개 도시)
- **추가 이슈**: "Jeju" 검색 시 에티오피아가 1순위로 반환됨
- **해결**: `count: 5`로 복수 결과 조회 + 주요 국가 코드(KR, JP 등) 우선 선택
- **폴백**: 매핑 테이블에 없는 도시 → 영문 그대로 검색 → 실패 시 mapSpots 좌표 폴백

### 3. 날씨 실패 시 AI 폴백 없음 (2026-03-15)
- **사용자 결정**: AI 생성 날씨는 부정확해서 차라리 안 보여주는 게 나음
- **구현**: 에러 시 "날씨 데이터를 가져올 수 없습니다" 메시지만 표시
- **16일 초과**: "예보 범위 밖이거나 날씨 데이터가 없습니다" 표시

### 4. 환율 API: ExchangeRate-API v6 (2026-03-15)
- KRW 직접 지원, 월 1,500회 (캐싱 6시간이면 충분)
- **차단 요인**: API 키 발급 필요 (https://www.exchangerate-api.com/)

### 5. 공유 기능: Supabase 도입 시 함께 (2026-03-15)
- **사용자 결정**: 공유 기능은 보류, Supabase 전체 데이터 레이어 전환 시 도입
- trip-sharing 계획서는 `dev/active/trip-sharing/`에 유지

### 6. iOS 앱 폐기 (2026-03-15)
- Capacitor 기반 iOS 앱 계획 폐기, 웹 서빙 방식으로 전환
- 계획서 아카이빙: `dev/archive/ios-app-roadmap/`

---

## 알려진 이슈

### 해결됨
- ✅ Open-Meteo 한글 검색 미지원 → 영문 매핑 테이블로 해결
- ✅ "Jeju" 에티오피아 우선 반환 → country_code 필터링으로 해결

### 미해결
- ExchangeRate-API 키 미발급 → Vercel 환경변수 `EXCHANGE_RATE_API_KEY` 설정 필요 (미설정 시 503 → UI에서 에러 메시지 표시)
- ShareModal.tsx ESLint 경고 (useEffect 내 setState) — 기존 이슈

---

## 외부 API 상세

### Open-Meteo Forecast API
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=34.6937&longitude=135.5023
  &daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,
         precipitation_probability_max,weathercode
  &timezone=auto&forecast_days=16
```

### Open-Meteo Geocoding API
```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name=Osaka&count=5&language=en
```
주의: 한글 검색 미지원. CITY_NAME_MAP으로 영문 변환 필요.

### ExchangeRate-API v6 (구현 완료)
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/pair/KRW/JPY
응답: { result: "success", base_code: "KRW", target_code: "JPY", conversion_rate: 0.1098 }
```
- 환경변수: `EXCHANGE_RATE_API_KEY`
- 캐시: 6시간 TTL (api-cache.ts 재사용)
- API 키 미설정 시: 503 반환 → UI에서 에러 메시지 표시
