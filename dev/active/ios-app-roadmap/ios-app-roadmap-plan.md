# My Journey — iOS 앱 배포 & UX 고도화 로드맵

**작성일**: 2026-03-10
**프로젝트**: My Journey (AI Travel Planner)
**현재 버전**: v0.2 (UX 개선 완료)
**목표**: iOS 앱 배포 + 네이티브 UX 통합

---

## 1. 핵심 요약

My Journey는 AI 기반 여행 계획 웹앱으로, Vercel에 프로덕션 배포 완료 상태(v0.1 MVP).
v0.2에서 에러 바운더리, Leaflet 지도, AI 편집 모드를 추가.
다음 목표는 **iOS 앱 배포(WebView 기반)** 와 **네이티브 기능 통합**(캘린더, 알림, 지도)으로 사용자 경험 극대화.

---

## 2. 현재 상태 (AS-IS)

### 2.1 완료된 버전

| 버전 | 내용 | 상태 |
|------|------|------|
| v0.1 | MVP 배포 — AI 채팅, 7탭 뷰어, 준비물 체크, 스플래시 | ✅ 완료 |
| v0.2 | UX 개선 — 에러 바운더리, Leaflet 지도, AI 편집 모드 | ✅ 완료 |

### 2.2 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + React 19 |
| 상태 관리 | Zustand 5 + localStorage |
| AI | Google Gemini 2.5 Flash |
| 스타일 | Tailwind CSS 4 + shadcn/ui |
| 지도 | Leaflet + react-leaflet |
| 배포 | Vercel (프로덕션) |
| 모바일 | 반응형 웹 (하단 네비 포함) |

### 2.3 프로젝트 규모

| 항목 | 수치 |
|------|------|
| React 컴포넌트 | 36개 TSX |
| TypeScript LOC | ~3,540 |
| 라우트 | 3개 (홈, 채팅, 여행상세) |
| API 엔드포인트 | 1개 (POST /api/chat) |

### 2.4 아키텍처

```
[사용자] → [Next.js 프론트엔드 (Vercel)]
              ↓
         [/api/chat] → [Gemini API]
              ↓
         [localStorage] ← 여행 데이터 저장
```

---

## 3. 목표 상태 (TO-BE)

### 3.1 iOS 앱 배포 (WebView 기반)

```
[iOS 앱 (Swift/Capacitor)]
    ├── WKWebView → Vercel 호스팅 웹앱
    ├── Native Bridge
    │   ├── EventKit → 캘린더 연동
    │   ├── UserNotifications → 푸시 알림
    │   ├── MapKit / Google Maps SDK → 지도
    │   └── Share Extension → 공유
    └── App Store 배포
```

### 3.2 최종 사용자 경험

1. App Store에서 "My Journey" 다운로드
2. AI와 대화하며 여행 계획 생성
3. 일정을 iOS 캘린더에 자동 추가
4. 출발 D-7, D-1 등 알림 수신
5. 지도에서 일정별 경로 확인 (네이티브 지도 or Google Maps)
6. 오프라인에서도 저장된 여행 조회

---

## 4. 구현 단계 (Phase 정의)

### Phase 1: iOS 앱 래핑 (v0.3)
> WebView 기반 iOS 앱 빌드 + App Store 배포

### Phase 2: 캘린더 연동 (v0.4)
> 여행 일정 → iOS/Google 캘린더 내보내기

### Phase 3: 알림 기능 (v0.5)
> D-day 카운트다운, 출발 전 알림, 준비물 리마인더

### Phase 4: 지도 고도화 (v0.6)
> Google Maps 연동 or 네이티브 MapKit 통합

### Phase 5: 오프라인 & 동기화 (v0.7)
> Service Worker + IndexedDB로 오프라인 지원

---

## 5. Phase별 상세 작업

### Phase 1: iOS 앱 래핑 (v0.3) — 공수: L

#### 접근법 비교

| 옵션 | 장점 | 단점 | 추천 |
|------|------|------|------|
| **Capacitor** | 웹 코드 재사용 100%, 플러그인 풍부 | 빌드 도구 학습 필요 | ★★★ |
| **React Native WebView** | React 생태계 | 이중 래핑, 복잡도 증가 | ★★ |
| **Swift WKWebView** | 완전 네이티브 제어 | Swift 학습 필요, 브릿지 직접 구현 | ★★ |
| **PWA** | 가장 간단, 코드 변경 최소 | iOS 제약 많음 (푸시, 설치) | ★ |

**권장: Capacitor** — 기존 Next.js 코드를 그대로 사용하면서 네이티브 API 접근 가능

#### 작업 목록

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 1.1 | Capacitor 초기 설정 (`@capacitor/core`, `@capacitor/ios`) | S | - |
| 1.2 | Next.js 정적 빌드 설정 (`output: 'export'` or Capacitor server 모드) | M | 1.1 |
| 1.3 | iOS 프로젝트 생성 (`npx cap add ios`) | S | 1.2 |
| 1.4 | Safe Area, 상태바, 스플래시 스크린 네이티브 처리 | M | 1.3 |
| 1.5 | 앱 아이콘 & 런치 스크린 생성 | S | 1.3 |
| 1.6 | Apple Developer 계정 설정 & 프로비저닝 | S | - |
| 1.7 | TestFlight 배포 & 테스트 | M | 1.4, 1.5, 1.6 |
| 1.8 | App Store 심사 제출 | M | 1.7 |

**고려사항**:
- Capacitor `server` 모드: WebView가 Vercel URL을 직접 로드 (앱 업데이트 = 웹 배포)
- 또는 `static` 모드: 빌드된 HTML을 앱에 번들 (오프라인 가능, 업데이트 = 앱 업데이트)
- **권장: server 모드** (빠른 반복, 앱 심사 없이 업데이트 가능)

---

### Phase 2: 캘린더 연동 (v0.4) — 공수: M

#### 구현 방식

```
여행 상세 페이지
    ↓
[캘린더에 추가] 버튼 클릭
    ↓
┌─ iOS 앱 ─────────────────────┐
│  Capacitor Plugin             │
│  → @capacitor-community/      │
│    calendar                    │
│  → EventKit API               │
│  → iOS 캘린더에 이벤트 생성    │
└──────────────────────────────┘
    또는
┌─ 웹 (폴백) ──────────────────┐
│  .ics 파일 생성 & 다운로드     │
│  → 모든 캘린더 앱에서 열기 가능 │
└──────────────────────────────┘
```

#### 작업 목록

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 2.1 | `.ics` 파일 생성 유틸리티 (웹 폴백) | S | - |
| 2.2 | "캘린더에 추가" 버튼 UI (OverviewTab에 배치) | S | - |
| 2.3 | Capacitor Calendar 플러그인 설정 | M | Phase 1 |
| 2.4 | Day별 이벤트 생성 로직 (제목, 시간, 위치, 메모) | M | 2.3 |
| 2.5 | 권한 요청 UX (캘린더 접근 허용) | S | 2.3 |
| 2.6 | Google Calendar API 연동 (선택적, OAuth 필요) | L | - |

**단계별 접근**:
1. 먼저 `.ics` 파일 내보내기 (웹에서도 동작)
2. iOS 앱에서는 EventKit으로 직접 캘린더 추가
3. (선택) Google Calendar API로 양방향 동기화

---

### Phase 3: 알림 기능 (v0.5) — 공수: M

#### 알림 시나리오

| 시점 | 알림 내용 | 유형 |
|------|----------|------|
| D-7 | "오사카 여행이 일주일 남았어요! 준비물을 확인하세요" | 로컬 |
| D-1 | "내일 출발! 여권과 항공편을 확인하세요" | 로컬 |
| 당일 | "오늘의 일정: 오사카성 → 도톤보리 → 신세카이" | 로컬 |
| 미체크 | "아직 체크하지 않은 준비물이 5개 있어요" | 로컬 |

#### 작업 목록

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 3.1 | Capacitor Local Notifications 플러그인 설정 | S | Phase 1 |
| 3.2 | 알림 스케줄러 로직 (D-day 기반 계산) | M | 3.1 |
| 3.3 | 알림 설정 UI (ON/OFF, 시간 선택) | M | 3.1 |
| 3.4 | 알림 권한 요청 UX | S | 3.1 |
| 3.5 | 준비물 미체크 리마인더 | S | 3.2 |
| 3.6 | (선택) 서버 푸시 알림 — FCM or APNs | XL | - |

**권장: 로컬 알림으로 시작** — 서버 불필요, Capacitor 플러그인으로 간단 구현

---

### Phase 4: 지도 고도화 (v0.6) — 공수: L

#### 옵션 비교

| 옵션 | 장점 | 단점 | 비용 |
|------|------|------|------|
| **Leaflet 유지** | 무료, 이미 구현됨 | 네이티브 경험 부족 | 무료 |
| **Google Maps JS API** | 장소 검색, 경로 안내, Street View | API 키 + 과금 | $200/월 무료 |
| **MapKit JS** | Apple 생태계 통합 | iOS/Safari 최적화 | 무료 (제한적) |
| **네이티브 MapKit** | 최고의 iOS 경험 | Swift 코드 필요, 웹 공유 불가 | 무료 |

#### 작업 목록

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 4.1 | Google Maps API 키 발급 & 설정 | S | - |
| 4.2 | DayMap을 Google Maps로 교체 (선택적) | M | 4.1 |
| 4.3 | 장소 검색 통합 (Places API) | L | 4.1 |
| 4.4 | 경로 안내 연동 (Directions API → 네이티브 지도 앱) | M | Phase 1 |
| 4.5 | "지도 앱에서 열기" 딥링크 (Google Maps / Apple Maps) | S | - |
| 4.6 | 오프라인 지도 캐싱 (선택적) | XL | - |

**권장 단계별 접근**:
1. 현재 Leaflet 유지 (이미 동작)
2. "지도 앱에서 열기" 버튼 추가 (가장 실용적)
3. (선택) Google Maps API로 장소 검색 강화

---

### Phase 5: 오프라인 & 동기화 (v0.7) — 공수: L

#### 작업 목록

| # | 작업 | 공수 | 의존성 |
|---|------|------|--------|
| 5.1 | Service Worker 등록 (next-pwa or 직접) | M | - |
| 5.2 | 여행 데이터 IndexedDB 저장 (localStorage 대체) | M | - |
| 5.3 | 오프라인 폴백 페이지 | S | 5.1 |
| 5.4 | 지도 타일 캐싱 (제한적) | L | 5.1 |
| 5.5 | (선택) 클라우드 동기화 — Supabase or Firebase | XL | - |

---

## 6. 우선순위 매트릭스

```
          높은 임팩트
              ▲
    [캘린더 .ics] [iOS 앱]
    [알림 기능]   [지도앱 열기]
              │
  낮은 노력 ──┼── 높은 노력
              │
    [PWA 설정]   [Google Maps API]
    [오프라인]    [클라우드 동기화]
              ▼
          낮은 임팩트
```

**Quick Wins** (낮은 노력 + 높은 임팩트):
1. `.ics` 캘린더 내보내기
2. "지도 앱에서 열기" 딥링크
3. Capacitor iOS 래핑

---

## 7. 위험 평가

| 위험 | 영향 | 확률 | 대응 |
|------|------|------|------|
| App Store 심사 거절 (WebView 앱) | 높음 | 중간 | 네이티브 기능 추가로 차별화, 가이드라인 준수 |
| Capacitor + Next.js 16 호환 이슈 | 중간 | 중간 | static export 모드로 폴백, 커뮤니티 확인 |
| Gemini API 비용 증가 | 중간 | 낮음 | Rate limiting 이미 구현, 캐싱 추가 |
| localStorage 데이터 유실 | 높음 | 중간 | IndexedDB 마이그레이션, 클라우드 백업 검토 |
| Apple Developer 연회비 ($99/년) | 낮음 | 확정 | 필수 비용으로 수용 |

**App Store 심사 주의사항**:
- WebView만으로는 심사 거절 가능성 있음
- 네이티브 기능(캘린더, 알림, 공유) 반드시 포함해야 함
- 최소 1-2개 네이티브 기능이 Phase 1에 포함되어야 안전

---

## 8. 권장 실행 순서

```
v0.3 ── Phase 1: iOS 앱 래핑 (Capacitor)
  │       + .ics 캘린더 내보내기 (2.1, 2.2)
  │       + "지도 앱에서 열기" 딥링크 (4.5)
  │
v0.4 ── Phase 2: 캘린더 연동 (EventKit)
  │       + Phase 3: 로컬 알림 (D-day 알림)
  │
v0.5 ── Phase 4: 지도 고도화 (선택적)
  │       + Phase 5: 오프라인 지원
  │
v1.0 ── 안정화 & 정식 출시
```

---

## 9. 성공 지표

| 지표 | 목표 |
|------|------|
| App Store 등록 | v0.3 완료 시 |
| 캘린더 연동률 | 여행 생성 후 50% 이상 캘린더 추가 |
| 알림 활성화율 | 사용자 70% 이상 알림 ON |
| 앱 크래시율 | < 0.1% |
| 오프라인 사용 | 저장된 여행 100% 오프라인 조회 가능 |

---

## 10. 필요 리소스

| 항목 | 비용 | 비고 |
|------|------|------|
| Apple Developer Program | $99/년 | 필수 |
| Google Maps API | $0~200/월 | 월 $200 무료 크레딧 |
| Vercel | $0 | Hobby 플랜 (현재) |
| Gemini API | $0 | 무료 티어 내 사용 |
| Mac + Xcode | 보유 중 | 필수 |
