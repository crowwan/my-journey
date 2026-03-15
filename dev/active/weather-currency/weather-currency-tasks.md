# 환율 계산기 + 실시간 날씨 - 작업 체크리스트

## 상태 범례
- [ ] 시작 전
- [🔄] 진행 중
- [✅] 완료
- [❌] 차단됨
- [⏭️] 건너뜀

## 진행 요약
날씨: 7/7 완료 ✅ | 환율: 0/5 미착수

---

## 1단계: 서버 API Routes

- [✅] 1-1. 캐싱 유틸 생성 — `app/src/lib/api-cache.ts` [2026-03-15]
- [✅] 1-2. Geocoding 유틸 생성 — `app/src/lib/geocoding.ts` [2026-03-15]
  - 한글→영문 매핑 테이블 80+개 도시
  - country_code 필터링 (에티오피아 Jeju 이슈 해결)
  - extractCityName() 도시명 추출 ("오사카 3박4일" → "오사카")
- [✅] 1-3. 날씨 API Route 생성 — `app/src/app/api/weather/route.ts` [2026-03-15]
- [✅] 1-4. WMO 날씨 코드 매핑 — `app/src/lib/weather-utils.ts` [2026-03-15]
- [ ] 1-5. 환율 API Route 생성 — `app/src/app/api/currency/route.ts`
  - ❌ ExchangeRate-API 키 발급 필요
- [ ] 1-6. 목적지→통화 코드 매핑 — `app/src/lib/currency-utils.ts`

---

## 2단계: 실시간 날씨 UI

- [✅] 2-1. useWeather 훅 — `app/src/lib/useWeather.ts` [2026-03-15]
  - geocoding 실패 시 fallbackCoords(mapSpots) 재시도
- [✅] 2-2. SummaryTab 날씨 리디자인 — `app/src/components/viewer/tabs/SummaryTab.tsx` [2026-03-15]
  - 로딩 스켈레톤 (shimmer)
  - 에러: "날씨 데이터를 가져올 수 없습니다" (AI 폴백 없음)
  - 데이터 없음: "예보 범위 밖이거나 날씨 데이터가 없습니다"
  - TODAY 뱃지 + 보더 하이라이트
  - 강수 확률 표시
  - "마지막 업데이트: X분 전"

---

## 3단계: 환율 계산기 UI (미착수)

- [ ] 3-1. useCurrency 훅 — `app/src/lib/useCurrency.ts`
- [ ] 3-2. CurrencyConverter 컴포넌트 — `app/src/components/viewer/CurrencyConverter.tsx`
- [ ] 3-3. GuideTab/BudgetTab에 환율 계산기 통합
  - 주의: 예산 탭이 GuideTab에서 BudgetTab으로 분리됨 (5탭 구조)

---

## 4단계: AI 프롬프트 + 타입 정리

- [✅] 4-1. create 프롬프트 날씨 생성 제거 — `app/src/api/gemini.ts` [2026-03-15]
- [✅] 4-2. edit 프롬프트 날씨 수정 제거 — `app/src/api/gemini.ts` [2026-03-15]
- [✅] 4-3. Trip 타입 weather optional — `app/src/types/trip.ts` [2026-03-15]

---

## 5단계: 통합 테스트 (환율 완료 후)

- [ ] 5-1. API 실패 폴백 검증
- [ ] 5-2. 기존 Trip 하위호환 검증
- [ ] 5-3. 모바일 반응형 확인
- [ ] 5-4. 환경변수 + 문서 정리
