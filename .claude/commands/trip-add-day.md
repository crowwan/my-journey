## 일별 일정 추가

특정 여행의 Day에 상세 일정을 추가하거나 수정합니다.

### 사용법
```
/trip-add-day {여행폴더명} {day번호}
```
예: `/trip-add-day 2026-tokyo 1` → Day 1 일정 추가

### 실행 절차

1. `trips/{여행폴더명}/index.html` 읽기
2. 해당 Day 카드가 이미 있는지 확인

3. 사용자에게 질문 (AskUserQuestion):
   - 이 날의 주요 목적지/활동
   - 식사 계획 (예약 유무)
   - 특별 이벤트/예약
   - 이동 수단 선호

4. 필요시 웹 검색으로 보충 조사:
   - 관광지 운영시간/입장료
   - 식당 영업시간/휴무일
   - 교통 노선/요금

5. 타임라인 아이템 생성:
   - `.tl-item.spot` — 관광지
   - `.tl-item.food` — 식사
   - `.tl-item.move` — 이동
   - 시간, 제목, 설명, 뱃지 포함

6. Leaflet mapData에 좌표 추가

7. HTML 업데이트

### 주의사항
- 기존 Day 내용이 있으면 사용자에게 덮어쓸지/추가할지 확인
- 좌표는 정확한 위도/경도 사용 (웹 검색으로 확인)
- Day 컬러는 순서대로: orange → blue → green → purple → pink

$ARGUMENTS
