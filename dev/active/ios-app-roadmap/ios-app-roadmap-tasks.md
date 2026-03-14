# 리디자인 작업 체크리스트

**최종 갱신**: 2026-03-14 (방향 전환: iOS → 웹앱 + 디자인 시스템 리디자인)

---

## 완료된 작업 (v0.1 ~ v0.3)

### v0.1 MVP
- [x] Next.js App Router + TypeScript
- [x] Zustand + localStorage
- [x] AI 채팅 (Gemini API)
- [x] 7탭 여행 뷰어
- [x] Vercel 배포

### v0.2 UX 개선
- [x] 에러 바운더리
- [x] Leaflet 지도
- [x] AI 편집 모드

### v0.3 UI 리팩토링
- [x] BottomNav 제거 + Header 채팅 버튼
- [x] TabBar 뒤로가기 별도 행
- [x] Quick Wins (.ics, 지도 앱 열기, 공유)

### 문서 작성 (2026-03-14)
- [x] 디자인 시스템 참조 문서 (`docs/design-system.md`)
- [x] 리디자인 논리 모델/설계서 (`docs/plans/2026-03-14-design-system-redesign.md`)
- [x] 6 Phase 구현 계획서 (`docs/plans/2026-03-14-design-system-redesign-implementation.md`)
- [x] CLAUDE.md에 디자인 시스템 참조 규칙 추가

---

## Phase 1: Capacitor 제거 + 클린업 ⬜ (현재 작업)

### 패키지 제거
- [ ] `npm uninstall @capacitor/core @capacitor/ios @capacitor/status-bar @capacitor/splash-screen` (prod)
- [ ] `npm uninstall @capacitor/cli` (dev)

### 파일 삭제
- [ ] `app/src/lib/capacitor.ts` 삭제
- [ ] `app/src/components/CapacitorInit.tsx` 삭제
- [ ] `app/capacitor.config.ts` 삭제
- [ ] `app/ios/` 로컬 폴더 삭제 (gitignore됨)

### 코드 수정
- [ ] `app/src/app/layout.tsx`: CapacitorInit import/사용 제거
- [ ] `app/src/app/layout.tsx`: `viewportFit: "cover"` 제거
- [ ] `app/src/components/layout/Header.tsx`: safe area 패딩 → `pt-3`
- [ ] `app/src/components/viewer/TabBar.tsx`: safe area 패딩 제거
- [ ] `app/src/components/viewer/HeroSection.tsx`: safe area 패딩 → `pt-8`
- [ ] `app/src/lib/map-utils.ts`: Capacitor import 제거, 웹 전용 단순화

### 검증
- [ ] `npm run build` 성공
- [ ] `grep -r "capacitor" app/src/` → 결과 0건
- [ ] `grep -r "safe-area-top" app/src/` → 결과 0건
- [ ] 홈/채팅/여행상세 페이지 정상 동작 확인

---

## Phase 2: 디자인 토큰 시스템 구축 ⬜

- [ ] `globals.css` @theme 블록 재구성 (설계서 TO-BE 색상 체계 적용)
- [ ] Primary(오렌지) 50~900 스케일 추가
- [ ] Secondary(틸) 50~900 스케일 추가
- [ ] Semantic 색상 토큰 (bg, surface, text, border, success/warning/error/info)
- [ ] Category 색상 토큰 (관광/식사/교통/숙소/쇼핑/액티비티)
- [ ] Shadow 시스템 (xs~float 6단계)
- [ ] Border Radius 시스템 (sm~full 6단계)
- [ ] Playfair Display 폰트 복원 (`--font-display`)
- [ ] 기존 토큰명 → 새 토큰명 일괄 변환 (~30개 파일)
- [ ] `npm run build` 성공
- [ ] 시각적 리그레션 없음 확인

---

## Phase 3: 7탭 → 4탭 재구성 ⬜

- [ ] `constants.ts` TAB_CONFIG 4탭으로 변경
- [ ] `GuideTab.tsx` 신규 (맛집+교통+예산 통합, 아코디언 서브섹션)
- [ ] `ChecklistTab.tsx` 신규 (준비물+사전준비 통합, 진행률 바)
- [ ] `OverviewTab.tsx` → `SummaryTab.tsx` 리네이밍 + 내용 조정
- [ ] `TabBar.tsx` 4탭 대응 (아이콘: Plane, Calendar, Compass, CheckSquare)
- [ ] `TripViewer.tsx` 4탭 렌더링으로 수정
- [ ] 기존 5개 탭(RestaurantTab, TransportTab, BudgetTab, PackingTab, PreTodoTab) → Section 컴포넌트로 전환
- [ ] `npm run build` 성공
- [ ] 4탭 전환 정상, 데이터 표시 정상

---

## Phase 4: 홈 리디자인 ⬜

- [ ] `TripHeroCard.tsx` 신규 (다가오는 여행 강조 카드)
- [ ] `HorizontalScroll.tsx` 신규 (수평 스크롤 + 스냅 컨테이너)
- [ ] `EmptyState.tsx` 신규 (여행 없을 때)
- [ ] `trip-utils.ts`에 그룹핑 함수 (upcoming/ongoing/past)
- [ ] `page.tsx` 홈 리디자인 (히어로 카드 + 수평 스크롤)
- [ ] `TripCard.tsx` 수평 스크롤 대응 수정
- [ ] 여행 0개/1개/다수 케이스 확인

---

## Phase 5: AI 드로어 통합 ⬜

- [ ] `AIFloatingButton.tsx` 신규 (FAB)
- [ ] `AIDrawer.tsx` 신규 (드로어 패널)
- [ ] `useUIStore.ts` 신규 (드로어 열림/닫힘 상태)
- [ ] `ChatContainer.tsx` 드로어 안으로 이동
- [ ] `/chat` 페이지 제거 (라우트 삭제)
- [ ] Header에서 채팅 버튼 제거 (FAB로 대체)
- [ ] 모바일: 풀스크린 슬라이드 / 데스크탑: 사이드 패널(400px)

---

## Phase 6: 전체 스타일 리디자인 ⬜

- [ ] 모든 컴포넌트에 새 디자인 토큰 적용
- [ ] Trip.com 스타일 카드 UI
- [ ] 타임라인 스타일 갱신
- [ ] HeroSection 스타일 갱신
- [ ] Header 스타일 갱신
- [ ] 최종 반응형 테스트 (모바일/데스크탑)
- [ ] 전체 페이지 스타일 일관성 확인

---

## 폐기된 작업 (iOS 중단)

> 아래 작업은 iOS 앱 중단으로 더 이상 진행하지 않음

- ~~앱 아이콘 생성~~
- ~~런치 스크린~~
- ~~Info.plist 설정~~
- ~~Apple Developer 등록~~
- ~~TestFlight/App Store 배포~~
- ~~캘린더 네이티브 연동 (@capacitor-community/calendar)~~
- ~~로컬 알림 (@capacitor/local-notifications)~~
- ~~오프라인 지원~~

---

## 기능 아이디어 백로그

> 리디자인 완료 후 검토

- [ ] 여행 공유 (URL 링크 or QR 코드)
- [ ] 여행 PDF 내보내기
- [ ] 여행 후기 / 사진 첨부
- [ ] 환율 계산기
- [ ] 날씨 실시간 업데이트
- [ ] 동행자와 공동 편집
- [ ] 다국어 지원
