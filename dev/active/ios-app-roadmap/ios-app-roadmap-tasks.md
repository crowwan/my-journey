# iOS 앱 로드맵 — 작업 체크리스트

**최종 갱신**: 2026-03-11

---

## 완료된 작업

### v0.1 MVP
- [x] Next.js 프로젝트 셋업 (App Router + TypeScript)
- [x] Zustand 상태 관리 + localStorage 저장
- [x] AI 채팅 인터페이스 (Gemini API 연동)
- [x] 여행 계획 자동 생성 (create 모드)
- [x] 7탭 여행 뷰어 구현
- [x] 준비물 체크리스트 (체크 상태 localStorage 저장)
- [x] 스플래시 화면 + 시간대별 인사말
- [x] 마크다운 채팅 렌더링
- [x] 모바일 반응형 + 하단 네비게이션
- [x] Vercel 프로덕션 배포
- [x] Gemini API Rate Limiting (분당 8회)

### v0.2 UX 개선
- [x] 에러 바운더리 (error.tsx)
- [x] 전역 에러 처리 (global-error.tsx)
- [x] Leaflet 지도 (DayMap 컴포넌트)
- [x] DayCard에 지도 통합 (조건부 렌더링)
- [x] AI 편집 모드 — HeroSection "AI로 수정하기" 버튼
- [x] AI 편집 모드 — chat 페이지 edit 모드 지원
- [x] AI 편집 모드 — ChatContainer edit 모드 UI

### v0.3 Capacitor iOS 설정
- [x] Capacitor 패키지 설치 (`@capacitor/core@6`, `@capacitor/ios@6`, `@capacitor/cli@6`)
- [x] `capacitor.config.ts` 생성 (server 모드, Vercel URL)
- [x] iOS 프로젝트 생성 (`npx cap add ios`)
- [x] `@capacitor/status-bar@6`, `@capacitor/splash-screen@6` 설치
- [x] `src/lib/capacitor.ts` — initCapacitor() 함수 (StatusBar + SplashScreen)
- [x] `CapacitorInit.tsx` 클라이언트 컴포넌트 → layout.tsx에 추가
- [x] viewport-fit: cover 추가 (layout.tsx)
- [x] Safe Area 대응 — `contentInset: 'always'` (capacitor.config.ts)
- [x] Vercel 고정 도메인 설정 (`my-journey-app.vercel.app`)
- [x] Vercel Deployment Protection OFF
- [x] .gitignore에 `app/ios/` 추가
- [x] 시뮬레이터에서 Safe Area 정상 확인

---

## Phase 1 남은 작업: iOS 앱 래핑 (v0.3)

### UI 레이아웃 리팩토링 — ✅ 완료 (2026-03-11, 커밋 `6ace450`~`2eaf453`)
- [x] BottomNav 완전 제거 (page.tsx, chat/page.tsx, globals.css에서 제거, 파일은 보존)
- [x] 홈 네비게이션 단순화 (Header에 채팅 버튼 추가, 새 일정은 기존 NewTripButton 유지)
- [x] 채팅 페이지 뒤로가기 버튼 (기존 showBack 활용, 추가 작업 없음)
- [x] TabBar 뒤로가기를 탭 위 별도 행 "← 홈"으로 분리
- [x] 홈 페이지 min-h-screen 제거 (하단 여백 스크롤 방지)
- [x] 스플래시: sessionStorage로 세션당 1회만 (커밋 c9d55d0)
- [x] 빌드 버전 UI footer (커밋 c9d55d0)

### iOS Safe Area 대응 — ✅ 완료 (2026-03-11, 커밋 `2eaf453`+`4dd56ec`)
- [x] JS 기반 `--safe-area-top` CSS 변수 주입 (`initCapacitor()`)
- [x] Header/TabBar/HeroSection에 var(--safe-area-top) 패딩 적용
- [x] 홈/채팅 페이지 safe area 확인 완료
- [x] 여행 상세 페이지 safe area 최종 검증 완료
- 시행착오: contentInset(sticky 미호환), CSS env()(값 0), viewport-fit 제거(효과 없음) 모두 실패

### iOS 네이티브 마무리
- [ ] 앱 아이콘 생성 (1024x1024 기본 + 각 사이즈)
- [ ] 런치 스크린 (LaunchScreen.storyboard)
- [ ] Info.plist 설정 (앱 이름, 권한 설명 등)

### Quick Wins (Phase 1에 포함) — ✅ 완료 (2026-03-11, 커밋 `d9175aa`)
- [x] `.ics` 캘린더 내보내기 유틸 구현 (`app/src/lib/ics-utils.ts`)
- [x] "캘린더에 추가" 버튼 (OverviewTab)
- [x] "지도 앱에서 열기" 딥링크 버튼 (DayCard, 전체 경유지 경로 지원)
- [x] 공유 기능 (Web Share API + 클립보드 폴백, `@capacitor/share` 불필요)

### App Store 배포
- [ ] Apple Developer 계정 등록 ($99/년)
- [ ] 앱 ID & 프로비저닝 프로파일 생성
- [ ] TestFlight 빌드 업로드
- [ ] 테스트 (iPhone 실기기)
- [ ] App Store 심사 제출
- [ ] 앱 설명, 스크린샷, 키워드 준비

---

## Phase 2: 캘린더 네이티브 연동 (v0.4)

- [ ] `@capacitor-community/calendar` 플러그인 설치
- [ ] 캘린더 접근 권한 요청 UX
- [ ] Day별 이벤트 생성 (제목, 시간, 위치, 메모)
- [ ] 전체 여행 일정 한번에 캘린더 추가
- [ ] 이벤트 중복 생성 방지 로직
- [ ] (선택) Google Calendar API — OAuth 연동

---

## Phase 3: 알림 기능 (v0.5)

- [ ] `@capacitor/local-notifications` 플러그인 설치
- [ ] 알림 권한 요청 UX
- [ ] D-day 기반 알림 스케줄러 (D-7, D-1, 당일)
- [ ] 준비물 미체크 리마인더
- [ ] 알림 설정 UI (ON/OFF, 시간 선택)
- [ ] 알림 탭 시 해당 여행 페이지로 딥링크

---

## Phase 4: 지도 고도화 (v0.6)

- [ ] Google Maps API 키 발급
- [ ] (선택) DayMap Google Maps 버전 구현
- [ ] 장소 검색 통합 (Places API)
- [ ] 경로 안내 — 네이티브 지도 앱 연동
- [ ] 마커 클릭 시 장소 상세정보 팝업
- [ ] (선택) 오프라인 지도 캐싱

---

## Phase 5: 오프라인 & 동기화 (v0.7)

- [ ] Service Worker 등록
- [ ] localStorage → IndexedDB 마이그레이션
- [ ] 오프라인 폴백 페이지
- [ ] 핵심 페이지 캐싱 전략
- [ ] (선택) 클라우드 동기화 (Supabase / Firebase)

---

## 기능 아이디어 백로그

> 우선순위 미정, 아이디어 수집용

- [ ] 여행 공유 (URL 링크 or QR 코드)
- [ ] 여행 PDF 내보내기
- [ ] 다중 여행 비교
- [ ] 여행 후기 / 사진 첨부
- [ ] 환율 계산기
- [ ] 날씨 실시간 업데이트
- [ ] 비행기 실시간 추적
- [ ] 동행자와 공동 편집
- [ ] 다국어 지원 (영어, 일어)
- [ ] Apple Watch 컴패니언 앱
- [ ] 위젯 (D-day 카운트다운)
- [ ] Siri Shortcuts 연동
