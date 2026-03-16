# 캘린더 뷰 — 컨텍스트

**최종 갱신**: 2026-03-15 (구현 완료)
**상태**: ✅ 완료 (E2E 테스트 미완)

---

## 구현 완료 파일

| 파일 | 역할 |
|------|------|
| `src/app/calendar/page.tsx` | `/calendar` 라우트, 월 네비게이션 상태 관리 |
| `src/components/calendar/CalendarHeader.tsx` | 월 표시 + < > 네비게이션 + 오늘 버튼 |
| `src/components/calendar/CalendarGrid.tsx` | 7열 그리드, 동적 셀 높이, hoveredTripId 상태 |
| `src/components/calendar/TripBar.tsx` | 가로 바, 색상, 제목, 같은 Trip 동시 hover |
| `src/components/calendar/MonthTripList.tsx` | 캘린더 하단 월간 여행 카드 리스트 |
| `src/lib/calendar-utils.ts` | getCalendarDays, getCalendarBars 유틸 |
| `src/lib/__tests__/calendar-utils.test.ts` | vitest 12개 테스트 |
| `src/components/layout/Header.tsx` | showCalendar prop, CalendarDays 아이콘 버튼 |

## 주요 결정사항

- 셀 높이: 바 개수에 따라 동적 확장 (3개 제한 제거)
- hover: CalendarGrid에서 hoveredTripId 상태 관리 → 같은 Trip 전체 바 동시 하이라이트
- 모바일: 바 텍스트 truncate로 표시 (숨기지 않음)
- 월간 리스트: 해당 월과 겹치는 Trip 필터링 + 시작일 순 정렬
- 캘린더 추가(ics) 버튼: SummaryTab에서 제거 (import/버튼 코드 삭제)

## 커밋
- 기본 구현: executor가 한 번에 완료
- 개선: `ac44a72` (모바일 텍스트 + 월간 리스트 + 동적 높이 + hover + ics 제거)
