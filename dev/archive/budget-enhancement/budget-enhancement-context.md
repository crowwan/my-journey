# 예산 고도화 — 컨텍스트

**최종 갱신**: 2026-03-16
**상태**: ✅ 완료

---

## 구현 완료 파일

| 파일 | 역할 |
|------|------|
| `src/components/viewer/tabs/BudgetTab.tsx` | 예산 독립 탭 (읽기 + 편집) |
| `src/components/viewer/budget/DonutChart.tsx` | SVG arc path 도넛 차트 |
| `src/lib/budget-utils.ts` | 마이그레이션, 합계, 환율, formatCurrency |
| `src/lib/__tests__/budget-utils.test.ts` | 22개 테스트 |

## 주요 결정사항

- **도넛 차트**: arc path 방식 (항목 간 3° gap, hover opacity)
- **예상 총 비용 카드**: 제거 (도넛 중앙 합계로 대체)
- **원화 표기**: ₩ 기호 통일 (formatCurrency 전 통화 동일 패턴)
- **데이터**: amount number, currency 분리, exchangeRate 환산
- **탭 구조**: 5탭 (요약|일정|가이드|예산|체크리스트)
- **마이그레이션**: 구 문자열 → 신 숫자 자동 변환 (storage.ts)

## 커밋 히스토리
- `a9eb683` — 예산 탭 분리 (Phase 0)
- `147830f` — 데이터 마이그레이션 + 도넛 차트 + 편집 UI (Phase 1~3)
- `54a4137` — 도넛 차트 arc path + 총비용 카드 제거 + 원화 표기
