# 환율 계산기 + 실시간 날씨 - 작업 체크리스트

## 상태 범례
- [ ] 시작 전
- [🔄] 진행 중
- [✅] 완료
- [❌] 차단됨

## 진행 요약
날씨: 7/7 완료 ✅ | 환율: 4/4 완료 ✅ | 통합 테스트: 미착수

---

## 1단계: 서버 API Routes ✅

- [✅] 1-1. 캐싱 유틸 — `app/src/lib/api-cache.ts` [2026-03-15]
- [✅] 1-2. Geocoding 유틸 — `app/src/lib/geocoding.ts` [2026-03-15]
- [✅] 1-3. 날씨 API Route — `app/src/app/api/weather/route.ts` [2026-03-15]
- [✅] 1-4. WMO 날씨 코드 매핑 — `app/src/lib/weather-utils.ts` [2026-03-15]
- [✅] 1-5. 환율 API Route — `app/src/app/api/currency/route.ts` [2026-03-16]
- [✅] 1-6. 목적지→통화 매핑 — `app/src/lib/currency-utils.ts` [2026-03-16]

## 2단계: 실시간 날씨 UI ✅

- [✅] 2-1. useWeather 훅 — `app/src/lib/useWeather.ts` [2026-03-15]
- [✅] 2-2. SummaryTab 날씨 리디자인 [2026-03-15]

## 3단계: 환율 계산기 UI ✅

- [✅] 3-1. useCurrency 훅 — `app/src/lib/useCurrency.ts` [2026-03-16]
- [✅] 3-2. CurrencyConverter 컴포넌트 — `app/src/components/viewer/CurrencyConverter.tsx` [2026-03-16]
  - 양방향 입력 (KRW/현지통화), 스왑 버튼, 환율 표시, 업데이트 시각
- [✅] 3-3. BudgetTab에 통합 — 도넛 차트 아래, KRW 아닐 때만 [2026-03-16]

## 4단계: AI 프롬프트 + 타입 정리 ✅

- [✅] 4-1~4-3. Gemini 프롬프트 날씨 제거 + Trip 타입 수정 [2026-03-15]

## 5단계: 통합 테스트 (미착수)

- [ ] 5-1. API 실패 폴백 검증
- [ ] 5-2. 기존 Trip 하위호환 검증
- [ ] 5-3. 모바일 반응형 확인
- [ ] 5-4. 환경변수 + CLAUDE.md 문서 정리

---

## 미커밋 변경사항 (2026-03-17 기준)
- `app/src/app/api/currency/route.ts` — 신규
- `app/src/lib/currency-utils.ts` — 신규
- `app/src/lib/useCurrency.ts` — 신규
- `app/src/components/viewer/CurrencyConverter.tsx` — 신규
- `app/src/components/viewer/tabs/BudgetTab.tsx` — 수정 (CurrencyConverter 통합)
- `dev/active/weather-currency/weather-currency-context.md` — 수정
- `.env.local` — EXCHANGE_RATE_API_KEY 추가 (커밋 불가)
- Vercel 환경변수 — EXCHANGE_RATE_API_KEY 프로덕션 등록 완료

## 다음 단계
1. 미커밋 변경사항 커밋 + 푸시
2. 5단계 통합 테스트 수행
3. CLAUDE.md 기술 스택에 외부 API 추가
