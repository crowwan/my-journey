# 여행 공유 기능 - 작업 체크리스트

## 상태 범례
- [ ] 시작 전
- [🔄] 진행 중
- [✅] 완료
- [❌] 차단됨
- [⏭️] 건너뜀

## 진행 요약
0 / 11 작업 완료 (0%)

---

## Phase 1: HTML 생성 엔진 (3일)

### 1-1. HTML 생성 유틸리티 기초
- [ ] `generateTripHtml(trip: Trip): string` 함수 + HTML 뼈대 + CSS 변수 정의
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - `<!DOCTYPE html>` ~ `</html>` 완전한 문서 구조
    - `<head>`: charset, viewport, title (`{trip.title} | My Journey`), Google Fonts link
    - `<style>` 블록: `:root` CSS 변수 (디자인 시스템 색상 — primary `#f97316`, text-primary `#111827`, text-secondary `#6b7280`, text-tertiary `#9ca3af`, border `#e5e7eb`, bg-secondary `#f9fafb`, bg-tertiary `#f3f4f6`, surface `#ffffff`, success `#10b981`, cat-sightseeing `#10b981`, cat-food `#ec4899`, cat-transport `#3b82f6`), radius, shadow
    - 기본 CSS: 리셋, body 스타일, `.container` (max-width 1100px, mx-auto, px), 타이포그래피 (font-family, line-height 1.7)
    - 반응형 기본: `@media (min-width: 640px)` 규칙 뼈대
    - 헬퍼 함수: `escapeHtml(str: string): string` — `<`, `>`, `&`, `"`, `'` 이스케이프
    - 헬퍼 함수: `formatDate(dateStr: string): string` — "2026-03-02" → "2026.03.02"
    - 공통 컴포넌트 CSS: `.card` (bg-surface, rounded-xl, shadow-sm, border, p-5), `.badge` (text-xs, rounded-full, px-2.5, py-0.5), `.section-title` (text-lg, font-semibold, flex items-center gap-2)
  - 완료 조건: `generateTripHtml(sampleTrip)`이 유효한 HTML 문서를 반환. 브라우저에서 열면 빈 페이지에 CSS 변수 적용 확인
  - 규모: M
  - 의존성: 없음

### 1-2. 히어로 + 요약 섹션 HTML 생성
- [ ] 히어로 섹션 + 항공편/숙소/날씨/일정요약/팁 HTML 생성 함수
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - **히어로**: 제목 (`font-display text-2xl font-bold`), 날짜 범위 (`startDate — endDate`), 인원 ("혼자 여행" / "N명"), 태그 뱃지들
    - **항공편** (빈 경우 섹션 생략):
      - `renderFlightsHtml(flights: Flight[]): string`
      - 가는 편/오는 편 카드: 출발지-[비행기]-도착지, 시간, 소요시간, 날짜, 비고
      - `SummaryTab.tsx` 라인 430-469의 읽기 모드 UI 참고하여 HTML 구조 작성
    - **숙소** (빈 경우 섹션 생략):
      - `renderAccommodationHtml(accommodation: Accommodation): string`
      - 이름 (볼드), 지역, 주소, 근처 역 뱃지 (bg-cat-transport/10 스타일)
      - Google Maps 링크: `href="https://www.google.com/maps/search/?api=1&query={name+address}"`
    - **날씨**: 수평 스크롤 컨테이너, 카드별 요일/아이콘(이모지)/기온
    - **일정 요약**: 그리드 (auto-fill, minmax 200px), Day별 번호+제목+부제목 카드
    - **팁**: `<details><summary>여행 팁</summary>` + `<ul>` 리스트
  - 완료 조건: 항공편 2개 + 숙소 + 날씨 5일 + Day 5개 + 팁 3개가 포함된 Trip으로 HTML 생성 시 SummaryTab과 유사한 레이아웃 확인
  - 규모: L
  - 의존성: 1-1 완료

### 1-3. 일정 섹션 HTML 생성
- [ ] Day별 타임라인 HTML 생성 함수
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - `renderScheduleHtml(days: Day[]): string`
    - Day 카드: Day 번호 (text-2xl font-black, Day 색상 적용), 날짜, 제목, 부제목
    - Day 색상 순환: Day1 `#f97316`, Day2 `#6366f1`, Day3 `#10b981`, Day4 `#a78bfa`, Day5 `#f472b6`, 5일 초과 순환
    - **타임라인 CSS**: 좌측 수직 라인 (border-left 또는 pseudo-element), 점 (9x9 원형)
      - `.tl-item.spot` → 초록 테두리 점 (`#10b981`)
      - `.tl-item.food` → 핑크 채움 점 (`#ec4899`)
      - `.tl-item.move` → 파랑 채움 점 (`#3b82f6`)
      - `.tl-item.default` → 주황 채움 점 (`#f97316`)
    - 타임라인 아이템: 시간 (font-semibold), 제목, 설명 (text-text-secondary), 비용 뱃지, 카테고리 뱃지
    - **장소 링크**: `mapSpots` 중 이름이 매칭되는 항목이 있으면 Google Maps 링크 제공
      - "📍 지도에서 보기" 텍스트 링크, `target="_blank"`
    - `DayCard.tsx`와 `TimelineItem` 컴포넌트의 UI 참고
  - 완료 조건: 5일 여행 Trip으로 HTML 생성 시 Day별 타임라인이 정상 렌더링. 타임라인 점 색상이 type별로 다르게 표시. 장소 링크 클릭 시 Google Maps 오픈
  - 규모: L
  - 의존성: 1-1 완료

### 1-4. 가이드 + 체크리스트 섹션 HTML 생성
- [ ] 맛집/교통/예산 + 준비물/사전할일 HTML 생성 함수
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - **맛집** (빈 경우 섹션 생략):
      - `renderRestaurantsHtml(restaurants: Restaurant[]): string`
      - Day별 그룹핑 (Map 사용)
      - 카드: 카테고리 뱃지 (bg-cat-food/10), 평점 (별표 ★ 반복), 가게명 (볼드), 설명, 가격대 뱃지
      - Google Maps 링크 (`name` 기반)
      - `GuideTab.tsx` RestaurantSection 참고
    - **교통** (빈 경우 섹션 생략):
      - `renderTransportHtml(transport: TransportSection): string`
      - 집→호텔 경로: 수평 스텝 (아이콘 이모지 + 제목 + 설명 + 화살표)
      - 도시간 노선: HTML `<table>` (출발/도착/교통편/소요/요금)
      - 패스 비교: 카드 (추천=초록 테두리, 보통=기본, 비추천=회색)
      - ICOCA 가이드: 번호 리스트
      - 교통 팁: `<details>` 접기
    - **예산** (빈 경우 섹션 생략):
      - `renderBudgetHtml(budget: BudgetSection): string`
      - 항목별 카드: 아이콘(이모지) + 라벨 + 금액 + 비율 바 (CSS width %)
      - 총 비용 카드: 예상 범위 (min~max, KRW 변환)
      - 예산 팁: `<details>` 접기
    - **체크리스트** (빈 경우 섹션 생략):
      - `renderChecklistHtml(packing: PackingItem[], preTodos: PreTodoItem[]): string`
      - 준비물: 카테고리별 (아이콘 + 카테고리명), 항목 리스트 (체크박스 UI — `☐` 유니코드, 읽기 전용)
      - 사전 할 일: 번호 뱃지 + 제목 + 설명 카드
  - 완료 조건: 맛집 10개 + 교통(노선 3개, 패스 2개) + 예산(항목 5개) + 준비물(3카테고리) + 사전할일(4개)이 포함된 Trip으로 HTML 생성 시 GuideTab/ChecklistTab과 유사한 레이아웃 확인
  - 규모: L
  - 의존성: 1-1 완료

---

## Phase 2: 공유 UI + 플로우 (2일)

### 2-1. 공유 모달 컴포넌트
- [ ] 공유 옵션 모달 UI 구현
  - 파일: `app/src/components/viewer/ShareModal.tsx`
  - 상세:
    - Props: `isOpen: boolean`, `onClose: () => void`, `trip: Trip`
    - 모달 UI: 백드롭 (bg-overlay-dark, z-50) + 패널 (bg-surface, rounded-2xl, shadow-lg, max-w-sm, mx-auto)
    - 제목: "여행 공유하기"
    - 옵션 버튼 (세로 배치, 각각 full-width):
      1. "HTML 파일 다운로드" — 📥 아이콘 + 설명 "파일로 저장하여 공유"
      2. "바로 공유하기" — 📤 아이콘 + 설명 "카카오톡, 에어드롭 등으로 전송" (Web Share API 지원 시만 표시)
    - 로딩 상태: HTML 생성 중 버튼 비활성화 + 스피너
    - 성공 시: 토스트 메시지 표시 ("파일이 다운로드되었습니다" / "공유 완료")
    - 닫기: X 버튼 + 백드롭 클릭
    - 디자인 시스템 준수: bg-surface, rounded-2xl, shadow-lg, text-text-primary 등
  - 완료 조건: 모달 열림/닫힘 동작 확인. "다운로드" 클릭 시 HTML 파일 저장됨. 모바일에서 "바로 공유하기" 시 OS 공유 시트 표시
  - 규모: M
  - 의존성: Phase 1 완료 (HTML 생성 함수 필요)

### 2-2. share-utils.ts 전면 교체
- [ ] HTML 파일 다운로드/공유 유틸리티 함수 구현
  - 파일: `app/src/lib/share-utils.ts`
  - 상세:
    - 기존 `shareTrip()` 함수 제거
    - `downloadTripHtml(trip: Trip): void`
      - `generateTripHtml(trip)` 호출로 HTML 문자열 생성
      - `Blob` 생성 (`text/html; charset=utf-8`)
      - `<a>` 엘리먼트 생성, `href = URL.createObjectURL(blob)`, `download = sanitizeFilename(trip.title) + '.html'`
      - 클릭 트리거 후 URL 해제
    - `shareTripHtml(trip: Trip): Promise<ShareResult>`
      - `generateTripHtml(trip)` 호출로 HTML 문자열 생성
      - `File` 객체 생성 (`{sanitized-title}.html`, `text/html`)
      - `navigator.canShare({ files: [file] })` 체크
      - 지원 시 `navigator.share({ files: [file], title: trip.title })` 호출
      - 미지원 시 `{ success: false, method: 'none' }` 반환
    - `canShareFiles(): boolean` — Web Share API File 지원 여부 체크
    - `sanitizeFilename(title: string): string` — 특수문자 제거, 공백→하이픈, 최대 50자
    - `ShareResult` 타입 유지: `{ success: boolean; method: 'share' | 'download' | 'none' }`
  - 완료 조건: `downloadTripHtml()` 호출 시 `.html` 파일 다운로드 확인. `shareTripHtml()` 호출 시 모바일 공유 시트 표시. `sanitizeFilename("오사카 여행 🇯🇵!!!")` → `"오사카-여행"` 반환
  - 규모: M
  - 의존성: Phase 1 완료 (trip-to-html.ts 필요)

### 2-3. HeroSection 공유 버튼 연동
- [ ] 공유 버튼 → ShareModal 열기로 변경
  - 파일: `app/src/components/viewer/HeroSection.tsx`
  - 상세:
    - `useState<boolean>`로 모달 open 상태 관리
    - 기존 `handleShare` 함수를 `() => setShareModalOpen(true)`로 교체
    - `<ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} trip={displayTrip} />` 렌더링
    - `ShareModal` import 추가
    - 기존 토스트 메시지 로직 제거 (모달 내부에서 처리)
    - 데스크탑 (`hidden sm:flex` 영역) + 모바일 (`sm:hidden` 영역) 모두 동일하게 모달 열기
  - 완료 조건: HeroSection 공유 버튼 클릭 → ShareModal 표시. 모달에서 다운로드/공유 동작 확인. 기존 클립보드 토스트 제거 확인
  - 규모: S
  - 의존성: 2-1 ShareModal 완료

---

## Phase 3: 품질 + 고도화 (2일)

### 3-1. HTML 반응형 + 스타일 정교화
- [ ] 모바일/데스크탑 반응형 CSS + 인쇄 미디어 쿼리
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - 모바일 기본: 카드 1열, 패딩 px-5
    - `@media (min-width: 640px)`: 카드 그리드 2열, 패딩 px-8
    - 날씨 카드: `overflow-x: auto`, `-webkit-overflow-scrolling: touch`
    - 교통 경로 스텝: 모바일에서 세로 배치, 데스크탑에서 가로 배치
    - 도시간 노선 테이블: 모바일에서 `overflow-x: auto` 래퍼
    - `@media print`: 배경색 유지 (`-webkit-print-color-adjust: exact`), 페이지 브레이크 (`page-break-inside: avoid`), 불필요한 링크 스타일 제거
    - TripViewer 실제 화면과 비교하며 차이점 미세 조정
  - 완료 조건: 생성된 HTML을 Chrome DevTools 모바일 시뮬레이터에서 확인. iPhone SE, iPad, 데스크탑 뷰포트에서 레이아웃 정상. Ctrl+P 인쇄 미리보기에서 깔끔한 출력
  - 규모: M
  - 의존성: Phase 1 완료

### 3-2. 워터마크 + 브랜딩
- [ ] 상단/하단 브랜딩 + 공유 날짜 표시
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - 상단: "My Journey" 텍스트 (font-display, text-primary, 작은 크기)
    - 하단 푸터: 구분선 + "My Journey에서 만들었어요" + 앱 URL (https://my-journey-planner.vercel.app) 링크
    - 공유 날짜: "YYYY.MM.DD 공유됨" (푸터에 작은 글씨)
    - `<meta name="generator" content="My Journey">` 메타 태그
    - 푸터 스타일: `text-center`, `text-text-tertiary`, `text-xs`, `py-8`, `border-top`
  - 완료 조건: HTML 상단에 브랜드 마크 표시. 하단에 워터마크 + 앱 링크 + 공유 날짜 표시. 앱 링크 클릭 시 My Journey 사이트 열림
  - 규모: S
  - 의존성: Phase 1 완료

### 3-3. 접근성 + 에지 케이스
- [ ] 빈 섹션 처리 + 이모지 대체 + XSS 방지 + HTML 유효성
  - 파일: `app/src/lib/trip-to-html.ts`
  - 상세:
    - 빈 섹션 처리: `flights.length === 0`이면 항공편 섹션 전체 생략. 숙소, 맛집, 교통, 예산, 체크리스트 동일
    - 이모지 처리: 날씨 아이콘 (`w.icon`), 예산 아이콘 (`item.icon`), 교통 아이콘 (`step.icon`), 체크리스트 카테고리 아이콘 (`categoryIcon`) — 모두 이모지 문자 그대로 출력
    - XSS 방지: `escapeHtml()` 을 모든 Trip 데이터 필드 (title, description, name 등)에 적용
    - HTML 유효성: W3C Validator 통과 수준 (self-closing 태그, 속성 따옴표 등)
    - 극단적 데이터: 20일 여행, 빈 Trip (모든 필드 empty/undefined), 한글+영문+일본어 혼합 제목
  - 완료 조건: 빈 Trip 객체로 생성 시 에러 없이 최소 HTML (히어로 + 푸터만) 생성. 모든 필드에 `<script>alert('xss')</script>` 넣어도 실행 안 됨
  - 규모: S
  - 의존성: Phase 1 완료

---

## 참고사항

### 작업 순서 권장
1. Phase 1은 1-1 먼저, 이후 1-2/1-3/1-4 병렬 가능 (모두 1-1의 기초 위에 독립적 섹션)
2. Phase 2는 Phase 1 완료 후 진행 (HTML 생성 함수 필요)
3. Phase 3은 Phase 1 완료 후 언제든 진행 가능 (Phase 2와 병렬 가능)

### inline-edit 작업과의 충돌 가능성
- `HeroSection.tsx`에서 공유 버튼 onClick 변경만 필요 — inline-edit는 편집 버튼/SectionEditHeader 영역이므로 충돌 가능성 낮음
- 충돌 발생 시 git merge로 해결 가능한 수준

### 테스트 체크리스트 (Phase별 완료 시 확인)
- [ ] Phase 1: 샘플 Trip으로 HTML 생성 → 브라우저에서 열어 모든 섹션 렌더링 확인
- [ ] Phase 2: HeroSection 공유 버튼 → 모달 → 다운로드/공유 동작 확인 (모바일 + 데스크탑)
- [ ] Phase 3: 빈 Trip, 대형 Trip, 특수문자 Trip으로 HTML 생성 → 에러 없이 정상 렌더링

### HTML 출력 검수 포인트
- [ ] 항공편 카드: 출발-도착 경로 시각적 표현 (SummaryTab 라인 445-463 참고)
- [ ] 타임라인 점 색상: spot=초록, food=핑크, move=파랑, default=주황
- [ ] Day 색상: Day1=주황, Day2=인디고, Day3=에메랄드, Day4=퍼플, Day5=핑크
- [ ] 맛집 평점: 별표 반복 + 숫자 (★★★★ 4.0)
- [ ] 예산 비율 바: CSS width로 비율 표현
- [ ] 체크리스트: 읽기 전용 체크박스 (체크 불가)
- [ ] 모바일에서 수평 스크롤 영역 터치 동작
- [ ] 인쇄 시 배경색 유지 + 페이지 나눔 적절
