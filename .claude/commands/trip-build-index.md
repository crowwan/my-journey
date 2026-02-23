## 홈페이지(index.html) 자동 갱신

trips/ 폴더를 스캔하여 index.html의 여행 카드 목록을 최신 상태로 갱신합니다.

### 실행 절차

1. `trips/` 하위 폴더 목록 스캔
   - 각 폴더의 `index.html`에서 메타 정보 추출:
     - 여행 제목 (`<title>` 또는 hero `<h1>`)
     - 기간 (hero 서브타이틀)
     - 목적지 태그 (`.hero-tag`)

2. `/Users/kimjin-wan/Works/personal/my-journey/index.html` 읽기

3. 여행 카드 섹션을 최신 목록으로 교체:
   - 최신 여행이 먼저 오도록 정렬 (년도-목적지 역순)
   - 각 카드에 링크: `trips/{folder}/index.html`

4. 통계 업데이트: "총 N개 여행"

### 카드 정보 추출 규칙
- 제목: `<h1>` 태그 텍스트
- 기간: `.hero-sub` 텍스트
- 태그: `.hero-tag` 목록

### 주의사항
- index.html의 전체 구조(hero, footer 등)는 유지하고 카드 영역만 교체
- 빈 trips/ 폴더(index.html 없음)는 무시

$ARGUMENTS
