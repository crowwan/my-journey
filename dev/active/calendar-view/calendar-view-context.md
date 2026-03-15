# 캘린더 뷰 — 컨텍스트

**최종 갱신**: 2026-03-15

---

## 관련 파일

### 데이터 소스
| 파일 | 역할 |
|------|------|
| `src/stores/useTripStore.ts` | trips Map, getTripSummaries() |
| `src/types/trip.ts` | Trip.startDate, Trip.endDate, Day.color |
| `src/lib/trip-utils.ts` | groupTrips (upcoming/ongoing/past 분류) |

### 신규 생성 예정
| 파일 | 역할 |
|------|------|
| `src/app/calendar/page.tsx` | 캘린더 페이지 |
| `src/components/calendar/CalendarHeader.tsx` | 월 표시 + 네비게이션 |
| `src/components/calendar/CalendarGrid.tsx` | 7열 월간 그리드 |
| `src/components/calendar/TripBar.tsx` | 여행 가로 바 |
| `src/lib/calendar-utils.ts` | 날짜 계산, Trip→바 위치 변환 |

### 수정 예정
| 파일 | 변경 |
|------|------|
| `src/components/layout/Header.tsx` | 캘린더 아이콘 버튼 추가 |

---

## 핵심 로직: Trip → 캘린더 바 변환

```
입력: Trip[] + 현재 표시 월 (year, month)
  ↓
1. 현재 월과 겹치는 Trip 필터링
2. 각 Trip을 주(week) 단위로 분할
   - Trip이 2주에 걸치면 2개 바로 분할
3. 같은 주에 여러 Trip → row 인덱스 할당 (세로 쌓기)
4. 각 바의 grid-column 위치 계산 (요일 기준 1~7)

출력: CalendarBar[]
  {tripId, weekIndex, startCol, endCol, color, title, row}
```

---

## 스타일 참조

- Mac 캘린더: 여행 바가 셀 경계를 무시하고 가로로 길게 표시
- 바 색상: Trip의 `days[0].color` (Day별 색상 팔레트: #f97316, #6366f1, #10b981 등)
- 디자인 시스템: `docs/design-system.md`
