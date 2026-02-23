## 새 여행 생성

새로운 여행 페이지를 생성합니다.

### 실행 절차

1. 사용자에게 아래 정보를 AskUserQuestion으로 질문:
   - 목적지 (한글 + 영문)
   - 여행 기간 (출발일 ~ 귀국일)
   - 여행 타입 (혼자/커플/가족/친구)
   - 주요 방문 도시/지역 (태그용)

2. 폴더 생성: `trips/{year}-{destination-english}/`
   - 예: `trips/2026-tokyo/`, `trips/2025-jeju/`

3. `templates/trip-page.html`을 읽어서 플레이스홀더를 채운 HTML 생성
   - 실제 예시 참조: `trips/2025-osaka/index.html`

4. `trips/{year}-{destination}/index.html`로 저장

5. 생성 완료 후 `/trip-build-index` 실행하여 홈페이지 갱신

### 주의사항
- CLAUDE.md의 여행 HTML 규칙 준수
- 7탭 구조 필수 (개요/일정/맛집/교통/예산/준비물/사전준비)
- 일정 탭은 빈 Day 카드로 기본 구조만 생성 (상세는 /trip-plan으로)
- Leaflet 지도 코드는 빈 mapData로 포함

$ARGUMENTS
