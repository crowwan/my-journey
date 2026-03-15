# 캘린더 뷰 — 작업 체크리스트

**최종 갱신**: 2026-03-15

---

## 사전 작업

- [ ] 0.1 기존 캘린더 추가 관련 코드 조사 및 제거
- [ ] 0.2 TripStore에서 날짜 기반 Trip 조회 유틸 필요 여부 확인

---

## Phase 1: 기본 캘린더 그리드

- [ ] 1.1 `src/app/calendar/page.tsx` 라우트 생성
- [ ] 1.2 CalendarHeader 컴포넌트 (월 표시 + < > 네비게이션 + 오늘 버튼)
- [ ] 1.3 CalendarGrid 컴포넌트 (7열 그리드, 날짜 셀)
  - 해당 월의 시작 요일 ~ 마지막 날짜 계산
  - 이전/다음 월 날짜도 흐리게 표시
- [ ] 1.4 오늘 날짜 하이라이트 (primary 동그라미)
- [ ] 1.5 이전/다음 월 네비게이션 (useState로 현재 월 관리)

---

## Phase 2: 여행 바 표시

- [ ] 2.1 Trip → 캘린더 바 위치 계산 유틸 함수
  - 입력: Trip[], 현재 월(year, month)
  - 출력: 주별 바 정보 [{tripId, startCol, endCol, color, title, row}]
  - 주를 넘어가는 Trip은 분할
- [ ] 2.2 TripBar 컴포넌트 (가로 바, 색상, 제목 텍스트)
  - grid-column: startCol / endCol+1
  - 배경색: Trip의 days[0].color
  - 모서리: 시작일 좌측 둥글게, 종료일 우측 둥글게
- [ ] 2.3 같은 주 여러 Trip 세로 쌓기
  - row 인덱스로 top 위치 조정
  - 최대 3개까지 표시, 초과 시 "+N개 더보기"
- [ ] 2.4 바 클릭 → router.push(`/trips/${tripId}`)

---

## Phase 3: 진입점 + 마무리

- [ ] 3.1 홈 Header에 캘린더 아이콘 버튼 추가 (CalendarDays 아이콘)
- [ ] 3.2 반응형 (모바일 셀 축소, 바 텍스트 말줄임)
- [ ] 3.3 빌드 + 린트 확인
- [ ] 3.4 E2E 수동 테스트

---

## 완료 후

- [ ] CLAUDE.md 업데이트
- [ ] 메모리 업데이트
