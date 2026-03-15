# 예산 고도화 — 컨텍스트

**최종 갱신**: 2026-03-15

---

## 관련 파일

### 수정 대상

| 파일 | 역할 |
|------|------|
| `src/types/trip.ts` | BudgetItem, BudgetSection, BudgetRange 타입 |
| `src/components/viewer/tabs/GuideTab.tsx` | 예산 읽기/편집 UI |
| `src/api/gemini.ts` | 예산 프롬프트 스키마 + normalizeBudget |
| `src/stores/useEditStore.ts` | 저장 시 비율 자동 계산 |
| `src/stores/useTripStore.ts` | 로드 시 마이그레이션 |

### 신규 생성 예정

| 파일 | 역할 |
|------|------|
| `src/components/viewer/tabs/BudgetTab.tsx` | 예산 독립 탭 (GuideTab에서 분리) |
| `src/components/viewer/budget/DonutChart.tsx` | SVG 도넛 차트 |
| `src/lib/budget-utils.ts` | 마이그레이션, 합계 계산, 환율 변환 유틸 |

### 탭 구조 변경

```
AS-IS (4탭): 요약 | 일정 | 가이드(맛집+교통+예산) | 체크리스트
TO-BE (5탭): 요약 | 일정 | 가이드(맛집+교통) | 예산 | 체크리스트
```

---

## 현재 데이터 예시

```json
{
  "items": [
    { "icon": "🚆", "label": "교통", "detail": "전철, 버스", "amount": "¥3,000", "percentage": 30, "color": "#3b82f6" },
    { "icon": "🍽️", "label": "식비", "detail": "현지 식당", "amount": "¥5,000", "percentage": 50, "color": "#f472b6" }
  ],
  "total": { "min": "¥8,000", "max": "¥12,000", "minKRW": "약 8만원", "maxKRW": "약 12만원" },
  "tips": ["현금 준비 권장"]
}
```

## 마이그레이션 로직

```
기존: { amount: "¥3,000" }
  ↓ 파싱: 통화 기호 → currency, 숫자 → amount
변환: { amount: 3000, currency: "JPY" }
```

통화 기호 매핑: ¥→JPY, $→USD, €→EUR, ₩→KRW, ฿→THB, ₫→VND
