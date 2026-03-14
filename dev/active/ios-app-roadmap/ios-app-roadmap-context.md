# 프로젝트 컨텍스트 & 의존성

**최종 갱신**: 2026-03-14 (방향 전환: iOS 앱 → 웹앱 전용 + 디자인 시스템 리디자인)

---

## 🚨 방향 전환 (2026-03-14)

### 결정 사항
- **iOS 앱 중단**: Capacitor/iOS 관련 코드 전면 제거
- **웹앱 전용**: Vercel 배포만 유지, PWA 불필요
- **전체 리디자인**: Trip.com 스타일 UI + 디자인 시스템 구축
- **브랜드 컬러**: 오렌지(`#f97316`) 유지 + 틸(`#0d9488`) 보조색 추가

### 핵심 문서 (반드시 읽을 것)
| 문서 | 경로 | 용도 |
|------|------|------|
| **디자인 시스템** | `docs/design-system.md` | 모든 UI 작업 시 참조 (색상/타이포/컴포넌트) |
| **리디자인 설계서** | `docs/plans/2026-03-14-design-system-redesign.md` | AS-IS/TO-BE 논리 모델 |
| **구현 계획서** | `docs/plans/2026-03-14-design-system-redesign-implementation.md` | 6 Phase 구현 순서 |

---

## 1. 프로젝트 현황 스냅샷

### 완료된 기능 (v0.1 ~ v0.3)

#### v0.1 MVP (2026-03-09)
- [x] AI 채팅 인터페이스 (Gemini 2.5 Flash)
- [x] 여행 계획 자동 생성 (JSON 스키마 기반)
- [x] 7탭 여행 뷰어 (개요, 일정, 맛집, 교통, 예산, 준비물, 사전준비)
- [x] 준비물 체크리스트 (localStorage 저장)
- [x] 스플래시 화면 + 인사말
- [x] Vercel 프로덕션 배포
- [x] Rate Limiting (분당 8회, fallback 모델)

#### v0.2 UX 개선 (2026-03-10)
- [x] 에러 바운더리
- [x] Leaflet 지도 (DayMap)
- [x] AI 편집 모드

#### v0.3 Capacitor iOS (2026-03-10) — ⚠️ 제거 예정
- [x] Capacitor v6 + iOS 프로젝트 (제거 예정)
- [x] Safe Area 대응 (제거 예정)

#### v0.3.1 UI 리팩토링 (2026-03-11)
- [x] BottomNav 제거, Header에 채팅 버튼
- [x] TabBar 뒤로가기 별도 행
- [x] Quick Wins (.ics 내보내기, 지도 앱 열기, 공유)

---

## 2. 현재 진행 작업: 리디자인 Phase 1 (Capacitor 제거)

### Phase 1 상태: 미시작 → 시작 예정

### Phase 1 작업 내용
1. Capacitor 패키지 제거 (5개): `@capacitor/core`, `@capacitor/ios`, `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/cli`
2. 파일 삭제: `app/src/lib/capacitor.ts`, `app/src/components/CapacitorInit.tsx`, `app/capacitor.config.ts`
3. 코드 수정:
   - `app/src/app/layout.tsx`: CapacitorInit import/사용 제거, `viewportFit: "cover"` 제거
   - `app/src/components/layout/Header.tsx`: `pt-[calc(0.75rem+var(--safe-area-top,0px))]` → `pt-3`
   - `app/src/components/viewer/TabBar.tsx`: `pt-[var(--safe-area-top,0px)]` 제거
   - `app/src/components/viewer/HeroSection.tsx`: `pt-[calc(2rem+var(--safe-area-top,0px))]` → `pt-8`
   - `app/src/lib/map-utils.ts`: Capacitor import 제거, 웹 전용으로 단순화
4. 폴더 삭제: `app/ios/` (로컬에만 존재)

### 완료 조건 (DoD)
- `npm run build` 성공
- Capacitor 관련 import 0개 (`grep -r "capacitor" app/src/`)
- `--safe-area-top` CSS 변수 참조 0개
- 기존 기능 (홈, 채팅, 여행 상세) 정상 동작

---

## 3. 전체 리디자인 6 Phase 요약

| Phase | 내용 | 상태 |
|-------|------|------|
| **1** | Capacitor 제거 + 클린업 | ⬜ 미시작 |
| **2** | 디자인 토큰 시스템 구축 | ⬜ 미시작 |
| **3** | 7탭 → 4탭 재구성 | ⬜ 미시작 |
| **4** | 홈 리디자인 (히어로+수평 스크롤) | ⬜ 미시작 |
| **5** | AI 드로어 통합 (FAB + Drawer) | ⬜ 미시작 |
| **6** | 전체 스타일 리디자인 | ⬜ 미시작 |

---

## 4. 핵심 파일 맵

### 라우트
| 파일 | 역할 |
|------|------|
| `app/src/app/page.tsx` | 홈 (여행 목록) |
| `app/src/app/chat/page.tsx` | AI 채팅 (Phase 5에서 드로어로 통합 후 제거) |
| `app/src/app/trips/[tripId]/page.tsx` | 여행 상세 |
| `app/src/app/api/chat/route.ts` | AI API 엔드포인트 |
| `app/src/app/layout.tsx` | 루트 레이아웃 |
| `app/src/app/globals.css` | 전역 스타일 |

### 상태 관리
| 파일 | 역할 |
|------|------|
| `app/src/stores/useTripStore.ts` | 여행 CRUD + 준비물 체크 |
| `app/src/stores/useChatStore.ts` | 채팅 메시지 + AI 호출 |

### 데이터
| 파일 | 역할 |
|------|------|
| `app/src/types/trip.ts` | 전체 도메인 타입 정의 |
| `app/src/lib/storage.ts` | localStorage 추상화 |
| `app/src/lib/constants.ts` | 탭 설정, Day 컬러 |
| `app/src/lib/trip-utils.ts` | D-day 계산, 상태 유틸 |

### 유틸
| 파일 | 역할 |
|------|------|
| `app/src/lib/ics-utils.ts` | .ics 캘린더 내보내기 |
| `app/src/lib/map-utils.ts` | 지도 앱 열기 (Phase 1에서 웹 전용으로 수정) |
| `app/src/lib/share-utils.ts` | 공유 (Web Share API) |

### 제거 대상 (Phase 1)
| 파일 | 역할 |
|------|------|
| `app/src/lib/capacitor.ts` | ❌ 삭제 |
| `app/src/components/CapacitorInit.tsx` | ❌ 삭제 |
| `app/capacitor.config.ts` | ❌ 삭제 |

---

## 5. 아키텍처 결정 사항

### 유지되는 결정
- Vercel 프로덕션 배포 (`my-journey-planner.vercel.app`)
- Gemini API 연동 (create/edit/chat)
- Leaflet 지도 유지
- Web Share API 사용

### 새로운 결정 (2026-03-14)
- **iOS 중단**: 웹앱만으로 충분, Capacitor 복잡도 제거
- **디자인 시스템**: Trip.com 스타일, 오렌지+틸 브랜드 컬러
- **4탭 구조**: 요약/일정/가이드/체크리스트 (기존 7탭 통합)
- **AI 드로어**: 별도 /chat 페이지 → 플로팅 버튼 + 사이드 드로어
- **라이트 테마 기본**: 화이트 배경, 깔끔한 카드 UI
- **Playfair Display 폰트 복원**: 히어로 제목용

### 폐기된 결정
- ~~Capacitor server 모드~~ → 웹앱 전용
- ~~Safe Area JS 변수 방식~~ → 불필요
- ~~App Store 배포~~ → 중단

---

## 6. 배포 방식

### 웹 (Vercel) — 유일한 배포 대상
- **프로덕션 도메인**: `https://my-journey-planner.vercel.app`
- **배포 트리거**: `git push origin main` → Vercel 자동 배포
- **Vercel 프로젝트 설정**: root directory = `app/`
- **환경변수**: `GEMINI_API_KEY` (Vercel 대시보드)

---

## 7. 관련 문서

| 문서 | 경로 |
|------|------|
| 프로젝트 규칙 | `CLAUDE.md` |
| 디자인 시스템 | `docs/design-system.md` |
| 리디자인 설계서 | `docs/plans/2026-03-14-design-system-redesign.md` |
| 리디자인 구현 계획서 | `docs/plans/2026-03-14-design-system-redesign-implementation.md` |
| AI 플래너 설계 | `docs/02-design/features/ai-travel-planner-prototype.design.md` |
| 프로젝트 셋업 계획 | `docs/01-plan/features/my-journey-project-setup.plan.md` |
