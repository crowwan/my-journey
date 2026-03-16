# 예산 고도화 — 작업 체크리스트

**최종 갱신**: 2026-03-15

---

## Phase 0: 예산 탭 분리

- [x] 0.1 BudgetTab 컴포넌트 생성 (GuideTab에서 예산 코드 이동) [2026-03-15]
- [x] 0.2 GuideTab에서 예산 섹션 제거 [2026-03-15]
- [x] 0.3 TripViewer TabBar에 예산 탭 추가 (5탭) [2026-03-15]
- [x] 0.4 빌드 + 린트 확인 [2026-03-15]

---

## Phase 1: 데이터 구조 마이그레이션

- [x] 1.1 BudgetItem 타입 변경 (amount: string → number, currency 추가) [2026-03-15]
- [x] 1.2 BudgetSection에 currency, exchangeRate 필드 추가 [2026-03-15]
- [x] 1.3 BudgetTotal 자동 계산 방식으로 변경 [2026-03-15]
- [x] 1.4 기존 데이터 마이그레이션 유틸 (문자열 파싱 → 숫자 변환) [2026-03-15]
  - ✅ budget-utils.ts 생성: parseAmountString, migrateBudgetItem, migrateBudget, calculateBudgetTotal, formatCurrency, convertToKRW
  - ✅ 22개 유닛 테스트 작성 및 통과
- [x] 1.5 Gemini 프롬프트 업데이트 (새 예산 스키마) [2026-03-15]
  - ✅ amount를 number로, currency/exchangeRate 필드 추가, total 제거 (자동 계산)
- [x] 1.6 gemini.ts normalizeBudget 업데이트 [2026-03-15]
  - ✅ migrateBudget 함수로 위임 (구/신 데이터 모두 처리)
- [x] 1.7 빌드 + 린트 확인 [2026-03-15]
  - ✅ localStorage 로드 시 자동 마이그레이션 (storage.ts)
  - ✅ trip-to-html.ts 신 구조 대응
  - ✅ useEditStore.ts 비율/합계 자동 계산 로직 업데이트
  - ✅ calendar-utils.test.ts 테스트 데이터 구조 업데이트

---

## Phase 2: 읽기 UI 개선

- [x] 2.1 도넛 차트 SVG 컴포넌트 생성 [2026-03-15]
  - ✅ DonutChart.tsx: SVG circle + stroke-dasharray, 중앙 합계, 범례
  - ✅ useMemo로 세그먼트 사전 계산 (린트 준수)
- [x] 2.2 예산 카드에 원화 환산 표시 [2026-03-15]
  - ✅ 각 항목에 convertToKRW 적용, KRW가 아닌 경우만 표시
- [x] 2.3 합계 카드 자동 계산 반영 [2026-03-15]
  - ✅ calculateBudgetTotal로 자동 계산, 구 데이터(range) 폴백
- [x] 2.4 빌드 + 린트 확인 [2026-03-15]

---

## Phase 3: 편집 UI 개선

- [x] 3.1 기본 통화 선택 드롭다운 [2026-03-15]
  - ✅ CustomSelect 기반 통화 선택 (KRW, JPY, USD, EUR, THB, CNY, TWD, VND)
- [x] 3.2 환율 입력 필드 [2026-03-15]
  - ✅ KRW일 때 환율 입력 숨김, "1 {currency} = ? KRW" 형식
- [x] 3.3 amount를 숫자 input으로 변경 [2026-03-15]
  - ✅ type="number" input, 통화 기호는 레이블에 표시
- [x] 3.4 실시간 합계/비율 계산 표시 [2026-03-15]
  - ✅ 편집 모드 하단 합계 카드 (실시간 items.reduce 계산)
  - ✅ useEditStore 저장 시 비율/합계 자동 재계산
- [x] 3.5 빌드 + 린트 확인 [2026-03-15]

---

## 완료 후

- [ ] CLAUDE.md 업데이트
- [ ] E2E 수동 테스트
