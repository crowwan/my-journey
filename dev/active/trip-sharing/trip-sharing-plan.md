# 여행 공유 기능 - 전략 계획 (정적 HTML 방식)

## 개요

여행 일정을 **자체 완결형 HTML 파일**로 내보내어 공유하는 기능을 구현한다. Trip 데이터를 CSS/데이터가 모두 인라인된 독립 HTML 파일로 변환하고, 다운로드 또는 Web Share API로 공유할 수 있게 한다. Supabase 등 외부 인프라 없이 순수 클라이언트 사이드에서 동작한다.

## 현재 상태 (AS-IS)

### 데이터 저장
- 모든 Trip 데이터가 localStorage에 저장 (`trip:{id}` 키)
- `app/src/lib/storage.ts`가 localStorage CRUD를 담당
- `useTripStore`(Zustand)가 메모리 캐시 + storage 래퍼 역할

### 기존 공유 기능
- `app/src/lib/share-utils.ts`에 `shareTrip()` 함수 존재
- 현재는 URL만 공유 (`https://my-journey-planner.vercel.app/trips/{tripId}`)
- Web Share API 또는 클립보드 복사 폴백
- **문제**: 공유받은 사람의 localStorage에 해당 Trip이 없으므로 빈 화면

### 뷰어 구조
- `TripViewer` 컴포넌트가 Trip 객체를 받아 4탭(요약/일정/가이드/체크리스트) 렌더링
- `HeroSection`에 공유 버튼 이미 존재 (Share2 아이콘)
- 각 탭의 UI를 HTML 생성 시 참고해야 함

### 디자인 시스템
- Primary: `#f97316` (orange), Secondary: `#0d9488` (teal)
- Font: Noto Sans KR (body), Playfair Display (hero title)
- 반응형 640px 기준
- Day 색상 순환: Day1 `#f97316`, Day2 `#6366f1`, Day3 `#10b981`, Day4 `#a78bfa`, Day5 `#f472b6`

## 제안 솔루션 (TO-BE)

### 전략: 정적 HTML 내보내기

Trip 데이터를 **자체 완결형 HTML 파일**로 변환한다. CSS, 데이터, 폰트 참조 모두 HTML 내에 포함하여 어디서든 열 수 있는 독립 파일을 생성한다.

**선택 이유**:
1. 서버 인프라 불필요 (Supabase, KV 등 없음)
2. 오프라인에서도 볼 수 있음
3. 파일 단위로 카카오톡, 이메일, 에어드롭 등 모든 채널로 공유 가능
4. Supabase는 향후 전체 데이터 저장 방식 변경 시 별도 도입 예정

### 아키텍처

```
[사용자]
   │
   ├─ "공유하기" 버튼 클릭
   │
   ├─ Trip 객체
   │   └─ trip-to-html.ts (변환 유틸)
   │       ├─ 히어로 섹션 HTML
   │       ├─ 요약 섹션 HTML (항공편, 숙소, 날씨, 일정 요약)
   │       ├─ 일정 섹션 HTML (Day별 타임라인)
   │       ├─ 가이드 섹션 HTML (맛집, 교통, 예산)
   │       ├─ 체크리스트 섹션 HTML (준비물, 사전 할 일)
   │       ├─ <style> 블록 (디자인 시스템 CSS)
   │       └─ 워터마크/푸터
   │
   ├─ HTML 문자열 생성 완료
   │
   └─ 공유 옵션 모달
       ├─ [다운로드] → Blob + <a download> → .html 파일 저장
       ├─ [공유하기] → Web Share API (File 객체로 전달)
       └─ [클립보드] → HTML 텍스트 복사 (폴백)
```

### HTML 파일 구조

현재 앱의 **4탭 구조를 그대로 재현**한다. 소량의 `<script>`로 탭 전환을 구현하여 앱과 동일한 UX를 제공한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{trip.title} | My Journey</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;900&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <style>/* 디자인 시스템 CSS + 탭 UI CSS */</style>
</head>
<body>
  <!-- 히어로: 제목, 날짜, 인원, 태그 -->
  <!-- 탭 바: 요약 | 일정 | 가이드 | 체크리스트 -->
  <div class="tab-bar">
    <button class="tab active" data-tab="summary">요약</button>
    <button class="tab" data-tab="schedule">일정</button>
    <button class="tab" data-tab="guide">가이드</button>
    <button class="tab" data-tab="checklist">체크리스트</button>
  </div>
  <!-- 탭 패널들 -->
  <div class="tab-panel active" id="summary"><!-- 항공편, 숙소, 날씨, 팁 --></div>
  <div class="tab-panel" id="schedule"><!-- Day별 타임라인 --></div>
  <div class="tab-panel" id="guide"><!-- 맛집, 교통, 예산 --></div>
  <div class="tab-panel" id="checklist"><!-- 준비물, 사전 할 일 --></div>
  <!-- 푸터: My Journey 워터마크 -->
  <script>
    // 탭 전환 (~15줄)
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab, .tab-panel').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
  </script>
</body>
</html>
```

**4탭 구조 선택 이유**: 앱과 동일한 UX를 제공하여 공유받은 사람도 자연스러운 탐색이 가능하다. JS 15줄 정도면 탭 전환이 완성되므로 복잡도 증가 미미.

### CSS 전략

Tailwind 클래스 대신 **`<style>` 블록에 순수 CSS**를 작성한다.

- 디자인 시스템의 CSS 변수(색상, radius, shadow)를 `:root`에 정의
- 컴포넌트별 클래스를 `.card`, `.badge`, `.timeline` 등으로 정의
- 반응형: `@media (min-width: 640px)` 하나만 사용 (디자인 시스템 일관)
- Google Fonts CDN 링크 포함 (유일한 외부 의존성, 오프라인 시 시스템 폰트 폴백)

### 지도 대체 전략

Leaflet 지도는 HTML에 포함 불가하므로:
- 각 장소 이름을 **Google Maps 검색 링크**로 변환 (`https://www.google.com/maps/search/?api=1&query={name}`)
- 숙소, 맛집도 동일하게 Google Maps 링크 제공
- `mapSpots`의 `name` 필드를 활용

### 공유 방식

1. **HTML 파일 다운로드**: `Blob` + `<a download>` → `{trip.title}.html` 저장
2. **Web Share API (File)**: `navigator.share({ files: [htmlFile] })` — 모바일에서 카카오톡, 에어드롭 등으로 직접 공유
3. **클립보드 복사 폴백**: Web Share API 미지원 시 HTML 텍스트 클립보드 복사 (실용성 낮음, 주로 다운로드 권장)

### HTML 크기 예상

| 구성 요소 | 예상 크기 |
|-----------|----------|
| `<style>` CSS | ~8-12KB |
| 히어로 + 요약 | ~3-5KB |
| 일정 (5일 기준) | ~10-20KB |
| 가이드 (맛집+교통+예산) | ~5-10KB |
| 체크리스트 | ~2-4KB |
| **합계** | **~30-50KB** |

가벼운 HTML 파일로 이메일 첨부, 메신저 전송에 문제 없는 크기.

## 구현 단계

### Phase 1: HTML 생성 엔진 (3일)

**목표**: Trip 객체를 자체 완결형 HTML 문자열로 변환하는 유틸리티 완성

#### 1-1. HTML 생성 유틸리티 기초 - 규모: M
- 파일: `app/src/lib/trip-to-html.ts`
- Trip 객체를 받아 완전한 HTML 문자열을 반환하는 `generateTripHtml(trip: Trip): string` 함수
- HTML 문서 뼈대 생성: `<!DOCTYPE>`, `<head>` (charset, viewport, title, Google Fonts 링크), `<body>`
- `<style>` 블록: CSS 변수 (`:root`에 디자인 시스템 색상, radius, shadow), 기본 리셋, 타이포그래피, 반응형 기본 규칙
- 헬퍼 함수: `escapeHtml(str)` (XSS 방지), `formatDate(dateStr)` (날짜 포맷)

#### 1-2. 히어로 + 요약 섹션 HTML 생성 - 규모: L
- 파일: `app/src/lib/trip-to-html.ts` (내부 함수)
- 히어로: 제목 (Playfair Display), 날짜 범위, 인원, 태그
- 항공편: 가는 편/오는 편 카드 (출발지-도착지, 시간, 소요시간, 비고). 빈 경우 섹션 숨김
- 숙소: 이름, 주소, 지역, 근처 역 뱃지. Google Maps 링크. 빈 경우 섹션 숨김
- 날씨: 수평 스크롤 카드 (요일, 아이콘 텍스트 폴백, 기온)
- 일정 요약: Day 번호 + 제목 + 부제목 그리드
- 여행 팁: 접을 수 있는 `<details>` 요소 활용

#### 1-3. 일정 섹션 HTML 생성 - 규모: L
- 파일: `app/src/lib/trip-to-html.ts` (내부 함수)
- Day별 카드: Day 번호 (bold), 날짜, 제목, 부제목
- 타임라인: CSS pseudo-element 기반 좌측 수직 라인 + 점 (spot=초록, food=핑크, move=파랑, default=주황)
- 각 타임라인 아이템: 시간, 제목, 설명, 비용 뱃지, 카테고리 뱃지
- 장소 링크: `mapSpots`의 name을 Google Maps 검색 링크로 변환하여 "장소 보기" 링크 제공
- Day 색상: `getDayColor(dayNumber)` 로직 인라인 적용

#### 1-4. 가이드 + 체크리스트 섹션 HTML 생성 - 규모: L
- 파일: `app/src/lib/trip-to-html.ts` (내부 함수)
- 맛집: Day별 그룹핑, 카테고리 뱃지, 평점 별표, 설명, 가격대. Google Maps 링크
- 교통: 집→호텔 경로 (수평 스텝), 도시간 노선 테이블, 패스 비교 카드, ICOCA 가이드, 교통 팁
- 예산: 항목별 금액 + 비율 바, 총 비용 카드, 예산 팁
- 체크리스트: 카테고리별 준비물 리스트 (체크박스 UI, 읽기 전용), 사전 할 일 (번호 뱃지 + 제목 + 설명)

### Phase 2: 공유 UI + 플로우 (2일)

**목표**: HeroSection 공유 버튼 → HTML 생성 → 다운로드/공유 모달

#### 2-1. 공유 모달 컴포넌트 - 규모: M
- 파일: `app/src/components/viewer/ShareModal.tsx`
- 모달 UI: 디자인 시스템 준수 (bg-surface, rounded-2xl, shadow-lg)
- 옵션 버튼 2-3개:
  - "HTML 파일 다운로드" (Download 아이콘) — 항상 표시
  - "공유하기" (Share2 아이콘) — Web Share API 지원 시만 표시 (주로 모바일)
  - "클립보드 복사" (Copy 아이콘) — Web Share API 미지원 시 폴백
- 파일명: `{trip.title}.html` (특수문자 제거)
- 로딩 상태: HTML 생성 중 스피너 표시
- 성공/실패 토스트

#### 2-2. share-utils.ts 전면 교체 - 규모: M
- 파일: `app/src/lib/share-utils.ts`
- `generateAndDownloadHtml(trip: Trip): void` — HTML 생성 + Blob + 다운로드
- `generateAndShareHtml(trip: Trip): Promise<ShareResult>` — HTML 생성 + Web Share API (File 객체)
- `copyShareUrl(trip: Trip): Promise<ShareResult>` — 기존 URL 복사 방식 유지 (보조)
- `sanitizeFilename(title: string): string` — 파일명 안전 처리
- 기존 `shareTrip()` 함수 시그니처 변경 (모달에서 직접 호출하는 방식으로)

#### 2-3. HeroSection 공유 버튼 연동 - 규모: S
- 파일: `app/src/components/viewer/HeroSection.tsx`
- 공유 버튼 클릭 시 ShareModal 열기 (기존 `handleShare` 로직 교체)
- 모달 open/close 상태 관리 (`useState`)
- 모바일/데스크탑 모두 동일 플로우

### Phase 3: 품질 + 고도화 (2일)

**목표**: HTML 출력 품질 개선, 브랜딩, 반응형 검증

#### 3-1. HTML 반응형 + 스타일 정교화 - 규모: M
- 파일: `app/src/lib/trip-to-html.ts`
- 모바일(< 640px)에서 카드 1열, 데스크탑에서 2열 그리드
- 수평 스크롤 영역 (날씨, 교통 경로) 터치 스크롤 지원
- print 미디어 쿼리: 인쇄 시 깔끔한 레이아웃 (배경색 유지, 페이지 나눔)
- 다크 모드 미적용 (앱과 동일)

#### 3-2. 워터마크 + 브랜딩 - 규모: S
- 파일: `app/src/lib/trip-to-html.ts`
- 푸터: "My Journey에서 만들었어요" + 앱 URL 링크
- 상단 로고/텍스트: "My Journey" 브랜드 마크 (텍스트만, 이미지 없음)
- 공유일시 표시: "YYYY.MM.DD 공유됨"
- 메타 태그: `<meta name="generator" content="My Journey">`

#### 3-3. 접근성 + 에지 케이스 - 규모: S
- 파일: `app/src/lib/trip-to-html.ts`
- 빈 섹션 처리: 항공편/숙소/맛집 등이 없으면 해당 섹션 생략 (빈 카드 표시 안 함)
- 이모지 처리: `emoji-to-icon.tsx`의 이모지 → 텍스트 매핑 활용 (아이콘 라이브러리 없으므로 이모지 그대로 또는 텍스트 대체)
- HTML 유효성: `<!DOCTYPE html>`, 올바른 charset, lang="ko"
- XSS 방지: 모든 사용자 입력 값 `escapeHtml()` 처리

## 위험 평가

### 높음
- **HTML 스타일 품질**: React 컴포넌트의 Tailwind 스타일을 순수 CSS로 재현하면 미묘한 차이 발생 가능
  - 대응: 디자인 시스템 CSS 변수를 그대로 사용. 핵심 컴포넌트(카드, 뱃지, 타임라인)만 정확히 재현하고 나머지는 단순화
  - 검증: 생성된 HTML을 브라우저에서 직접 열어 TripViewer와 비교 검수

### 보통
- **이모지/아이콘 렌더링**: lucide-react 아이콘을 HTML에서 사용 불가
  - 대응: 이모지 문자 그대로 사용 (날씨 아이콘 등) + CSS로 스타일링. lucide 아이콘은 유니코드/SVG 인라인 또는 텍스트 대체
- **Google Fonts CDN 의존**: 오프라인 환경에서 폰트 로드 불가
  - 대응: CSS `font-family`에 시스템 폰트 폴백 체인 포함 (`system-ui, -apple-system, sans-serif`)
- **대용량 Trip**: 매우 상세한 여행 (10일+, 많은 맛집)의 경우 HTML 파일이 클 수 있음
  - 대응: 실제 Trip은 30-50KB 예상. 100KB 초과해도 공유에 문제 없는 크기

### 낮음
- **Web Share API File 지원**: 일부 브라우저에서 File 공유 미지원
  - 대응: `navigator.canShare({ files })` 체크 후 미지원 시 다운로드 옵션만 표시
- **파일명 특수문자**: 한글, 특수문자가 포함된 파일명 처리
  - 대응: `sanitizeFilename()` 유틸로 안전한 문자만 허용

## 성공 지표

| 지표 | 목표 |
|------|------|
| HTML 생성 시간 | < 500ms (클라이언트 사이드) |
| HTML 파일 크기 | < 100KB (일반적인 5일 여행 기준) |
| 모바일 HTML 렌더링 | 카카오톡 인앱 브라우저에서 정상 표시 |
| 디자인 일관성 | TripViewer와 80%+ 유사도 (시각적 비교) |
| 기존 기능 영향 | 0 (기존 코드 변경 최소화) |

## 의존성

### 코드 의존성
- `inline-edit` 작업과 독립적 (병렬 진행 가능)
- `HeroSection.tsx` 수정 (공유 버튼 동작 변경) — inline-edit와 충돌 가능성 낮음 (다른 영역)
- `share-utils.ts` 전면 교체 (기존 함수 제거 후 재작성)
- `trip.ts` 타입 변경 없음 (읽기만)

### 외부 의존성
- **없음** (추가 npm 패키지 불필요)
- Google Fonts CDN (기존 사용 중, HTML 내 link 태그로 참조)

## 기존 Supabase 계획과의 관계

이 정적 HTML 방식은 Supabase와 **완전히 독립적**이다.

| 항목 | 정적 HTML (이번) | Supabase (향후) |
|------|-----------------|----------------|
| 목적 | 여행 일정 공유 (파일) | 전체 데이터 클라우드 저장 |
| 인프라 | 없음 | Supabase 프로젝트 |
| 공유 방식 | HTML 파일 전송 | URL 기반 (DB 조회) |
| 도입 시기 | 지금 | 데이터 저장 방식 전체 변경 시 |
| 공존 가능 | O | Supabase 도입 후에도 HTML 내보내기 유지 가능 |

Supabase 도입 시에도 HTML 내보내기 기능은 "오프라인 공유", "백업" 용도로 계속 유용하므로 별도 기능으로 유지한다.

## 타임라인

| Phase | 기간 | 산출물 |
|-------|------|--------|
| Phase 1: HTML 생성 엔진 | 3일 | `trip-to-html.ts` 유틸리티 (전체 섹션 HTML 변환) |
| Phase 2: 공유 UI + 플로우 | 2일 | ShareModal, share-utils 교체, HeroSection 연동 |
| Phase 3: 품질 + 고도화 | 2일 | 반응형 검증, 워터마크, 에지 케이스 처리 |
| **총계** | **7일** | **3개 Phase** |
