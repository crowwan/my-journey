# My Journey - 여행 계획 HTML 프로젝트

## 프로젝트 개요

여행 계획/일정을 HTML 문서로 관리하고 GitHub Pages로 웹 공개하는 개인 프로젝트.

## 폴더 구조

```
my-journey/
├── CLAUDE.md            # 이 파일
├── index.html           # 홈페이지 (여행 목록)
├── trips/               # 여행별 폴더
│   └── {year}-{dest}/   # 예: 2025-osaka
│       └── index.html   # 올인원 여행 페이지
├── templates/           # HTML 템플릿 (Claude 참조용)
│   └── trip-page.html   # 여행 페이지 템플릿
├── .claude/commands/    # 커스텀 커맨드
└── docs/                # PDCA 문서
```

## 여행 HTML 규칙

### 파일 구조
- **Single-File 방식**: CSS/JS 모두 HTML에 인라인
- 각 여행은 `trips/{year}-{destination}/index.html` 하나로 완결
- 외부 의존: Google Fonts (Noto Sans KR, Playfair Display) + Leaflet CDN만 허용

### 7탭 구조 (필수)
1. 📋 개요 — 항공편, 숙소, 날씨, 일정 한눈에 보기
2. 📅 일정 — Day별 타임라인 + Leaflet 지도
3. 🍜 맛집 — 날짜별 맛집 (평점, 가격, 설명)
4. 🚃 교통 — 노선, 요금, IC카드, 패스 비교
5. 💰 예산 — 카테고리별 예산 + 총합
6. 🧳 준비물 — 클릭 체크리스트
7. ✅ 사전 준비 — 출발 전 할 일

### 스타일 규칙
- 다크 테마 기본 (`--bg: #0a0f1c`)
- CSS 변수 사용 (`:root` 블록)
- 색상 체계:
  - accent: `#f97316` (메인)
  - blue: `#3b82f6` (교통/이동)
  - green: `#10b981` (관광지)
  - pink: `#f472b6` (맛집/식사)
  - purple: `#a78bfa` (부가)
- 반응형: 640px 브레이크포인트
- 폰트: Noto Sans KR (본문), Playfair Display (제목)

### 타임라인 아이템 분류
- `.tl-item.spot` — 관광지 (초록 점)
- `.tl-item.food` — 식사/간식 (핑크 점)
- `.tl-item.move` — 이동 (파랑 점)
- 기본 — 기타 (오렌지 테두리)

### Leaflet 지도
- 각 Day마다 토글 가능한 지도 포함
- CARTO Voyager 타일 사용
- 번호 마커 + 대시선 경로
- Day별 테마 컬러로 마커/경로 색상 구분

### 폴더 네이밍
- `trips/{year}-{destination}/` 형식
- destination은 영문 소문자, 하이픈 구분
- 예: `2025-osaka`, `2026-tokyo`, `2025-jeju`

## 커스텀 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/trip-new` | 새 여행 생성 (폴더 + HTML) |
| `/trip-plan` | AI 여행 계획 도우미 |
| `/trip-add-day` | 일별 일정 추가 |
| `/trip-build-index` | index.html 자동 갱신 |

## 새 여행 생성 시

1. `templates/trip-page.html` 참조
2. `trips/2025-osaka/index.html`을 실제 예시로 참조
3. 사용자에게 목적지, 기간, 테마, 동행자 수 확인
4. 생성 후 `/trip-build-index` 실행하여 홈페이지 갱신

## 디자인 시스템

> **모든 UI 구현 작업 전 반드시 디자인 시스템 문서를 읽고 작업할 것.**

- **디자인 시스템 문서**: `docs/design-system.md`
  - 색상, 타이포그래피, 스페이싱, 컴포넌트 스타일 가이드
  - Tailwind 클래스 조합 예시 포함
  - DO / DON'T 규칙

## 참조 파일

- 디자인 시스템: `docs/design-system.md`
- 리디자인 설계서: `docs/plans/2026-03-14-design-system-redesign.md`
- 리디자인 구현 계획서: `docs/plans/2026-03-14-design-system-redesign-implementation.md`
- 실제 예시: `trips/2025-osaka/index.html`
- 템플릿: `templates/trip-page.html`
- 계획서: `docs/01-plan/features/my-journey-project-setup.plan.md`
