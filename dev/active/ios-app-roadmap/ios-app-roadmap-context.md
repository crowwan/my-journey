# iOS 앱 로드맵 — 컨텍스트 & 의존성

**최종 갱신**: 2026-03-10

---

## 1. 프로젝트 현황 스냅샷

### 완료된 기능 (v0.1 ~ v0.2)

#### v0.1 MVP (2026-03-09 배포)
- [x] AI 채팅 인터페이스 (Gemini 2.5 Flash)
- [x] 여행 계획 자동 생성 (JSON 스키마 기반)
- [x] 7탭 여행 뷰어 (개요, 일정, 맛집, 교통, 예산, 준비물, 사전준비)
- [x] 준비물 체크리스트 (localStorage 저장)
- [x] 스플래시 화면 + 인사말
- [x] 마크다운 채팅 렌더링
- [x] 모바일 반응형 UI (하단 네비게이션)
- [x] Vercel 프로덕션 배포
- [x] Rate Limiting (분당 8회, fallback 모델)

#### v0.2 UX 개선 (2026-03-10)
- [x] 에러 바운더리 (error.tsx, global-error.tsx)
- [x] Leaflet 지도 (DayMap — 번호 마커 + 대시선 경로)
- [x] AI 편집 모드 (뷰어 → 채팅 edit 모드)

---

## 2. 핵심 파일 맵

### 라우트
| 파일 | 역할 |
|------|------|
| `app/src/app/page.tsx` | 홈 (여행 목록) |
| `app/src/app/chat/page.tsx` | AI 채팅 (create/edit 모드) |
| `app/src/app/trips/[tripId]/page.tsx` | 여행 상세 |
| `app/src/app/api/chat/route.ts` | AI API 엔드포인트 |
| `app/src/app/error.tsx` | 에러 바운더리 |
| `app/src/app/global-error.tsx` | 전역 에러 |
| `app/src/app/layout.tsx` | 루트 레이아웃 |
| `app/src/app/globals.css` | 전역 스타일 |

### 상태 관리
| 파일 | 역할 |
|------|------|
| `app/src/stores/useTripStore.ts` | 여행 CRUD + 준비물 체크 |
| `app/src/stores/useChatStore.ts` | 채팅 메시지 + AI 호출 |

### AI 통합
| 파일 | 역할 |
|------|------|
| `app/src/api/gemini.ts` | Gemini API 래퍼 (create/edit/chat) |

### 데이터
| 파일 | 역할 |
|------|------|
| `app/src/types/trip.ts` | 전체 도메인 타입 정의 |
| `app/src/lib/storage.ts` | localStorage 추상화 |
| `app/src/lib/constants.ts` | 탭 설정, Day 컬러 |
| `app/src/lib/trip-utils.ts` | D-day 계산, 상태 유틸 |

### 컴포넌트 (주요)
| 파일 | 역할 |
|------|------|
| `app/src/components/viewer/TripViewer.tsx` | 여행 뷰어 메인 |
| `app/src/components/viewer/HeroSection.tsx` | 히어로 (D-day, 편집 버튼) |
| `app/src/components/viewer/schedule/DayCard.tsx` | Day 카드 (지도 포함) |
| `app/src/components/viewer/schedule/DayMap.tsx` | Leaflet 지도 |
| `app/src/components/chat/ChatContainer.tsx` | 채팅 컨테이너 |
| `app/src/components/layout/BottomNav.tsx` | 하단 네비게이션 |
| `app/src/components/layout/SplashScreen.tsx` | 스플래시 |

---

## 3. 기술 의존성

### 현재 패키지 (app/package.json)

**프로덕션**:
- next 16.1.6
- react 19.2.3, react-dom 19.2.3
- zustand 5.0.11
- @google/genai 1.42.0
- leaflet 1.9.4, react-leaflet 5.0.0
- lucide-react 0.575.0
- class-variance-authority 0.7.1
- clsx 2.1.1, tailwind-merge 3.5.0
- tw-animate-css 1.4.0

**개발**:
- typescript 5, @types/node, @types/react, @types/react-dom
- @types/leaflet
- @eslint/eslintrc, eslint, eslint-config-next
- @tailwindcss/postcss, tailwindcss 4

### iOS 앱 추가 예정 패키지
- @capacitor/core
- @capacitor/ios
- @capacitor/cli
- @capacitor/splash-screen
- @capacitor/status-bar
- @capacitor/local-notifications (Phase 3)
- @capacitor-community/calendar (Phase 2)

---

## 4. 아키텍처 결정 사항

### 결정 1: WebView 방식 (Capacitor server 모드)
- **이유**: 웹 코드 100% 재사용, 앱 업데이트 = 웹 배포
- **트레이드오프**: 오프라인 시 앱 사용 불가 (Phase 5에서 해결)
- **대안**: static 모드 (앱에 번들) — 오프라인 가능하나 업데이트마다 앱 심사

### 결정 2: 캘린더 — .ics 우선, EventKit 후속
- **이유**: .ics는 웹에서도 동작하여 즉시 배포 가능
- **트레이드오프**: 양방향 동기화 불가 (단방향 내보내기만)

### 결정 3: 알림 — 로컬 알림 우선
- **이유**: 서버 인프라 불필요, Capacitor 플러그인으로 간단 구현
- **트레이드오프**: 앱 삭제 시 알림 소실

### 결정 4: 지도 — Leaflet 유지 + "지도 앱에서 열기" 추가
- **이유**: 이미 구현된 Leaflet 활용, 네이티브 지도 앱이 더 나은 UX
- **트레이드오프**: 앱 내 경로 안내 불가

---

## 5. 환경 설정

### 현재 환경
- **배포**: Vercel (vercel.com)
- **환경변수**: `.env.local` — `GEMINI_API_KEY`
- **도메인**: Vercel 기본 도메인

### iOS 빌드 환경 (추가 필요)
- Xcode (최신)
- CocoaPods
- Apple Developer Account ($99/년)
- 프로비저닝 프로파일 & 인증서

---

## 6. 관련 문서

| 문서 | 경로 |
|------|------|
| 프로젝트 규칙 | `CLAUDE.md` |
| 디자인 시스템 | `docs/design-system.md` |
| MVP 배포 계획 | `docs/01-plan/features/mvp-deployment.plan.md` |
| AI 플래너 설계 | `docs/02-design/features/ai-travel-planner-prototype.design.md` |
| 프로젝트 셋업 계획 | `docs/01-plan/features/my-journey-project-setup.plan.md` |
