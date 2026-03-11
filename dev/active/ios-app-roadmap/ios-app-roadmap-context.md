# iOS 앱 로드맵 — 컨텍스트 & 의존성

**최종 갱신**: 2026-03-11 (Quick Wins 구현 완료)

---

## 1. 프로젝트 현황 스냅샷

### 완료된 기능 (v0.1 ~ v0.3)

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

#### v0.3 Capacitor iOS 설정 (2026-03-10)
- [x] Capacitor v6 + iOS 프로젝트 초기화
- [x] StatusBar/SplashScreen 네이티브 플러그인
- [x] Safe Area CSS 대응 (Header, BottomNav)
- [x] CapacitorInit 클라이언트 컴포넌트
- [x] Vercel 고정 도메인 설정
- [x] Vercel Deployment Protection 비활성화

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

### Capacitor (v0.3 신규)
| 파일 | 역할 |
|------|------|
| `app/capacitor.config.ts` | Capacitor 설정 (server 모드) |
| `app/src/lib/capacitor.ts` | 네이티브 초기화 (StatusBar, SplashScreen) |
| `app/src/components/CapacitorInit.tsx` | useEffect 초기화 클라이언트 컴포넌트 |
| `app/ios/` | iOS 네이티브 프로젝트 (.gitignore됨) |

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

### Quick Wins 유틸 (v0.3 신규, 커밋 `d9175aa`)
| 파일 | 역할 |
|------|------|
| `app/src/lib/ics-utils.ts` | .ics 캘린더 내보내기 (RFC 5545, subtitle만 DESCRIPTION) |
| `app/src/lib/map-utils.ts` | 지도 앱 열기 (Apple Maps/Google Maps, 전체 경유지 경로) |
| `app/src/lib/share-utils.ts` | 공유 (Web Share API + 클립보드 폴백) |

### 컴포넌트 (주요)
| 파일 | 역할 |
|------|------|
| `app/src/components/viewer/TripViewer.tsx` | 여행 뷰어 메인 |
| `app/src/components/viewer/HeroSection.tsx` | 히어로 (D-day, 편집/공유 버튼) |
| `app/src/components/viewer/schedule/DayCard.tsx` | Day 카드 (지도 + 지도앱 열기 버튼) |
| `app/src/components/viewer/schedule/DayMap.tsx` | Leaflet 지도 |
| `app/src/components/viewer/tabs/OverviewTab.tsx` | 개요탭 (캘린더 추가 버튼) |
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
- **@capacitor/core@6** (v0.3 추가)
- **@capacitor/ios@6** (v0.3 추가)
- **@capacitor/status-bar@6** (v0.3 추가)
- **@capacitor/splash-screen@6** (v0.3 추가)

**개발**:
- typescript 5, @types/node, @types/react, @types/react-dom
- @types/leaflet
- @eslint/eslintrc, eslint, eslint-config-next
- @tailwindcss/postcss, tailwindcss 4
- **@capacitor/cli@6** (v0.3 추가)

### 향후 추가 예정 패키지
- @capacitor/local-notifications (Phase 3)
- @capacitor-community/calendar (Phase 2)

---

## 4. 아키텍처 결정 사항

### 결정 1: WebView 방식 (Capacitor server 모드)
- **이유**: 웹 코드 100% 재사용, 앱 업데이트 = 웹 배포
- **트레이드오프**: 오프라인 시 앱 사용 불가 (Phase 5에서 해결)
- **대안**: static 모드 (앱에 번들) — 오프라인 가능하나 업데이트마다 앱 심사

### 결정 2: Capacitor v6 사용 (v8 아님)
- **이유**: 현재 Node 20.13.1 환경. Capacitor v8은 Node >= 22 필요
- **영향**: 기능적 차이 없음, v6도 iOS 18 지원

### 결정 3: Vercel Deployment Protection OFF
- **이유**: Capacitor WebView에서 Vercel 인증 벽에 막혀 Safari로 리다이렉트됨
- **영향**: 프로덕션 URL이 공개 접근 가능 (보안 민감 데이터 없으므로 OK)

### 결정 4: 캘린더 — .ics 우선, EventKit 후속
- **이유**: .ics는 웹에서도 동작하여 즉시 배포 가능
- **트레이드오프**: 양방향 동기화 불가 (단방향 내보내기만)

### 결정 5: 알림 — 로컬 알림 우선
- **이유**: 서버 인프라 불필요, Capacitor 플러그인으로 간단 구현
- **트레이드오프**: 앱 삭제 시 알림 소실

### 결정 6: 지도 — Leaflet 유지 + "지도 앱에서 열기" 추가
- **이유**: 이미 구현된 Leaflet 활용, 네이티브 지도 앱이 더 나은 UX
- **트레이드오프**: 앱 내 경로 안내 불가

### 결정 7: 공유 — Web Share API 사용 (@capacitor/share 불필요)
- **이유**: iOS WKWebView에서 `navigator.share()` 정상 동작, 추가 패키지 불필요
- **폴백**: 클립보드 복사 + 토스트 메시지
- **공유 URL**: `https://my-journey-app.vercel.app/trips/{trip.id}`

### 결정 8: 캘린더 DESCRIPTION — subtitle만 포함
- **이유**: 타임라인 아이템 전체 포함 시 캘린더 앱에서 내용이 너무 길어짐
- **변경**: 초기 구현에서 시간별 요약 포함 → subtitle 한 줄로 축소

### 결정 9: 지도 앱 경로 — 전체 경유지 포함
- **이유**: 첫/끝 2곳만 표시하면 중간 경유지가 빠져 실용성 떨어짐
- **Apple Maps**: `daddr=장소1+to:장소2+to:장소3`
- **Google Maps**: `/dir/장소1/장소2/장소3`

---

## 5. 배포 방식

### 웹 (Vercel)
- **프로젝트**: `crowwans-projects/app`
- **프로덕션 도메인**: `https://my-journey-app.vercel.app` (alias 설정됨)
- **배포 트리거**: `git push origin main` → Vercel 자동 배포
- **Vercel 프로젝트 설정**: root directory = `app/`
- **환경변수**: `GEMINI_API_KEY` (Vercel 대시보드에서 설정)
- **Deployment Protection**: OFF (Capacitor WebView 호환 위해)

### iOS (Capacitor)
- **모드**: server 모드 (Vercel URL을 WKWebView로 로드)
- **설정 파일**: `app/capacitor.config.ts`
- **iOS 프로젝트**: `app/ios/` (.gitignore됨, 로컬에서 생성)
- **빌드 커맨드**:
  ```bash
  cd app
  npx cap sync ios    # 설정/플러그인 동기화
  npx cap open ios    # Xcode 열기
  # Xcode에서 Cmd + R로 시뮬레이터 실행
  ```
- **로컬 테스트 시**: `capacitor.config.ts`의 URL을 `http://localhost:3000`으로 임시 변경 + `cleartext: true`

### CLI 배포 주의사항
- `npx vercel --prod`는 프로젝트 루트에서 실행하면 `my-journey` 프로젝트로 감
- `app/` 디렉토리의 Vercel 프로젝트(`app`)는 git push로만 배포 권장
- 두 개의 `.vercel/project.json` 존재: 루트(`my-journey`) / `app/`(`app`)

---

## 6. 환경 설정

### 현재 환경
- **배포**: Vercel (vercel.com)
- **환경변수**: `.env.local` — `GEMINI_API_KEY`
- **도메인**: `my-journey-app.vercel.app` (고정 alias)
- **Node**: v20.13.1

### iOS 빌드 환경
- Xcode (최신)
- CocoaPods (Capacitor sync 시 자동 설치)
- Apple Developer Account ($99/년) — 아직 미등록
- 프로비저닝 프로파일 & 인증서 — 아직 미생성

---

## 7. 시행착오 기록 (Safe Area)

> 다시 시도하지 말 것

- ❌ CSS `env(safe-area-inset-top)` Tailwind arbitrary value → Capacitor WebView에서 작동 안 함
- ❌ globals.css에 `.safe-top`/`.safe-bottom` 커스텀 클래스 → 효과 없음
- ❌ `StatusBar.setOverlaysWebView({ overlay: true })` → contentInset과 충돌
- ❌ MyViewController.swift 커스텀 클래스 (CAPBridgeViewController 상속) → 앱 실행 불가
- ❌ `app/ios/`를 git에 포함 → 빌드 아티팩트(이미지, xcodeproj) 포함됨, 되돌림
- ✅ **`contentInset: 'always'`가 정답** — capacitor.config.ts의 ios 옵션으로 해결

## 8. 현재 상태 & 다음 단계

### 해결된 이슈
- Safe Area: `contentInset: 'always'`로 해결 완료 (커밋 `f35eb07`)
- Vercel Deployment Protection: OFF로 WebView 로딩 정상화
- Vercel 고정 도메인: `my-journey-app.vercel.app` alias 설정

### 다음 즉시 단계
1. ~~Quick Wins 구현~~ ✅ 완료 (커밋 `d9175aa`)
2. 앱 아이콘 & 런치 스크린 제작 (디자인 에셋 필요)
3. Info.plist 설정 (세로 모드 고정, 수출 규정 플래그)
4. Apple Developer 등록 → TestFlight 배포

---

## 8. 관련 문서

| 문서 | 경로 |
|------|------|
| 프로젝트 규칙 | `CLAUDE.md` |
| 디자인 시스템 | `docs/design-system.md` |
| MVP 배포 계획 | `docs/01-plan/features/mvp-deployment.plan.md` |
| AI 플래너 설계 | `docs/02-design/features/ai-travel-planner-prototype.design.md` |
| 프로젝트 셋업 계획 | `docs/01-plan/features/my-journey-project-setup.plan.md` |
| Quick Wins 구현 계획 | `docs/plans/2026-03-11-ios-quick-wins.md` |
