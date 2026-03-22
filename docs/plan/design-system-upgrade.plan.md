# 디자인 시스템 고도화 계획 — 트립닷컴 스타일

> 오렌지 accent 유지 + 트립닷컴의 레이아웃/UI 패턴 적용

## 1단계: 디자인 토큰 리뉴얼 (`globals.css`)

### 컬러 시스템 강화
- **배경 레이어 분리**: 트립닷컴처럼 `bg` → `#f5f6f8` (회색 톤), `card` → `#ffffff`로 구분감 강화
- **Accent 그라디언트 추가**: 버튼/헤더에 오렌지 그라디언트 (`#f97316` → `#fb923c`)
- **세컨더리 CTA**: 블루 `#0770E3`를 보조 CTA로 추가 (링크, 정보성 버튼)
- **상태 컬러 정리**: success `#10b981`, warning `#f59e0b`, error `#ef4444`, info `#3b82f6`
- **Surface 레이어**: `surface-elevated` (카드), `surface-sunken` (배경), `surface-overlay` (모달)

### 타이포그래피 스케일 정리
```
--text-hero: 28px / 900  → 페이지 제목
--text-title: 20px / 700 → 섹션 제목
--text-subtitle: 16px / 600 → 카드 제목
--text-body: 14px / 400  → 본문
--text-caption: 12px / 500 → 레이블/보조
--text-micro: 10px / 500  → 태그/배지
```

### 스페이싱 토큰
```
--space-xs: 4px   --space-sm: 8px   --space-md: 12px
--space-lg: 16px  --space-xl: 20px  --space-2xl: 24px
--space-3xl: 32px
```

### 그림자 3단계
```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.04)
--shadow-md:  0 4px 12px rgba(0,0,0,0.08)
--shadow-lg:  0 8px 24px rgba(0,0,0,0.12)
```

---

## 2단계: 공통 UI 컴포넌트 스타일 개선

### Button 리뉴얼
- **Primary**: 오렌지 그라디언트 + `rounded-xl` + 약간의 그림자
- **Secondary**: 화이트 배경 + 오렌지 테두리
- **Text/Ghost**: 오렌지 텍스트만
- **Info**: 블루 배경 (보조 액션)
- 크기: `lg`(48px), `md`(40px), `sm`(32px) 정리

### Card 리뉴얼
- `rounded-2xl` + `shadow-sm` → hover 시 `shadow-md` + 미세 lift
- **이미지 카드** 패턴 추가: 상단 이미지 + 하단 정보 (트립닷컴 스타일)
- 카드 내부 여백 통일: `p-4` (16px)

### Badge 개선
- **Status Badge**: 상태별 색상 (upcoming=오렌지, ongoing=그린, past=그레이)
- **Count Badge**: 원형 숫자 배지
- **Tag Badge**: 라운드 필 배지 + 아이콘

### SectionTitle 컴포넌트
- 좌측 4px 컬러 바 + 타이틀 (트립닷컴의 섹션 구분 방식)

---

## 3단계: 레이아웃 컴포넌트 개편

### Header 개선
- **홈**: 투명 → 스크롤 시 `bg-white shadow-sm` 트랜지션
- 좌측 로고/타이틀 + 우측 액션 버튼 (알림, 채팅)
- Safe area 대응 유지

### BottomNav 개선
- 4탭으로 확장: 홈 | 내 여행 | 채팅 | 마이페이지
- 아이콘 + 라벨 (활성 탭: 오렌지 fill 아이콘)
- 선택 시 아이콘 미세 bounce 애니메이션
- 상단 얇은 border 대신 `shadow-lg` (위로 그림자)

---

## 4단계: 홈 페이지 리디자인

### 히어로 영역
- **상단 배너**: 오렌지 그라디언트 배경 + 인사 메시지 + 일러스트/이모지
- 검색 바 UI (디자인만, 클릭 시 채팅으로 이동)
- 퀵 액션 아이콘 그리드 (새 여행, AI 추천, 체크리스트 등) — 트립닷컴의 아이콘 그리드 패턴

### 여행 카드 리스트
- **카드 이미지 영역**: 목적지 관련 그라디언트 배경 + 이모지 (현재 소형 아이콘 → 대형 비주얼)
- D-Day 뱃지를 카드 우상단 오버레이
- 카드 하단: 제목 + 날짜 + 진행률 바
- 섹션 제목: "다가오는 여행", "지난 여행" 분류

### NewTripButton
- 바텀 플로팅 FAB 스타일: `w-14 h-14 rounded-full shadow-lg` 오렌지 그라디언트
- 또는 홈 상단 퀵 액션에 통합

---

## 5단계: 여행 상세 페이지 리디자인

### HeroSection 개선
- 큰 배경 그라디언트 (목적지 테마 컬러)
- 뒤로가기 + 공유 버튼 floating
- 타이틀, 날짜, D-Day를 오버레이로
- 태그 칩: 라운드 필 스타일

### TabBar 개선
- 스크롤 가능 탭 (현재 유지)
- 활성 탭: 오렌지 밑줄 → 오렌지 필 배경 (pill 스타일)
- 탭 아이콘 크기 확대 + 라벨 아래 배치

### 일정 탭 (ScheduleTab)
- DayCard: 좌측 컬러 바 + 날짜 헤더
- TimelineItem: 아이콘 원형 + 커넥터 라인 개선
- 지도 토글: 카드 형태로 개선

### 개요 탭 (OverviewTab)
- 항공편: 출발/도착 카드 (공항코드 크게)
- 숙소: 카드 + 지도 미니맵
- 날씨: 수평 스크롤 카드 (아이콘 + 온도)
- 일정 요약: 컬러 타임라인 바

### 맛집 탭 (RestaurantTab)
- 카드 레이아웃: 좌측 이모지/이미지 + 우측 정보
- 별점 + 가격대 인라인
- "지도에서 보기" 액션

### 교통 탭 (TransportTab)
- 스텝 형태: 번호 원 + 커넥터 라인
- 패스 비교: 카드 vs 카드 비교 레이아웃

### 예산 탭 (BudgetTab)
- 도넛 차트 또는 진행 바 시각화
- 카테고리 아이콘 + 금액 + 비율

### 준비물/사전준비 탭
- 체크리스트 UI 유지하되 카테고리 아코디언 스타일 개선

---

## 6단계: 채팅 페이지 개선

- 빈 상태: 트립닷컴 스타일 일러스트 + 추천 프롬프트 카드
- 메시지 버블: 라운드 + 미세 그림자
- 어시스턴트 메시지: 카드 형태로 구조화
- 인풋: 바텀 고정 + `rounded-full` 스타일

---

## 7단계: 마이크로 인터랙션 & 애니메이션

- 페이지 전환: `framer-motion` 없이 CSS transition으로 fade
- 카드 진입: stagger + fade-up (현재 유지 + 개선)
- 탭 전환: 콘텐츠 fade 트랜지션
- 버튼 피드백: `active:scale-[0.96]` + haptic (Capacitor)
- 스켈레톤 로딩: shimmer 패턴 (현재 유지)
- Pull-to-refresh 느낌의 스크롤 피드백

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `globals.css` | 토큰 전면 리뉴얼 |
| `constants.ts` | 탭 설정, 색상 상수 업데이트 |
| `components/ui/button.tsx` | 버튼 variant 추가/스타일 변경 |
| `components/ui/card.tsx` | 카드 스타일 개선 |
| `components/ui/badge.tsx` | 배지 variant 추가 |
| `components/ui/tabs.tsx` | 탭 스타일 개선 |
| `components/layout/Header.tsx` | 스크롤 반응 헤더 |
| `components/layout/BottomNav.tsx` | 4탭 확장 + 그림자 |
| `components/layout/SplashScreen.tsx` | 스플래시 개선 |
| `components/home/TripCard.tsx` | 비주얼 카드 리디자인 |
| `components/home/NewTripButton.tsx` | FAB 스타일 |
| `app/page.tsx` | 홈 히어로 + 섹션 분류 |
| `components/viewer/HeroSection.tsx` | 그라디언트 히어로 |
| `components/viewer/TabBar.tsx` | pill 스타일 탭 |
| `components/viewer/schedule/*` | 일정 카드 개선 |
| `components/viewer/tabs/*` | 각 탭 레이아웃 개선 |
| `components/viewer/shared/*` | 공통 컴포넌트 개선 |
| `components/chat/*` | 채팅 UI 개선 |

## 구현 순서

1단계 → 2단계 → 3단계 → 4단계 → 5단계 → 6단계 → 7단계 순서로 진행.
토큰과 공통 컴포넌트를 먼저 잡고, 페이지별로 적용.
