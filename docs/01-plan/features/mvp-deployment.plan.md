# MVP 배포 계획서

**작성일**: 2026-03-09
**상태**: Draft
**프로젝트**: my-journey (AI Travel Planner)

---

## 1. 현황 분석

### AS-IS (현재 상태)

| 항목 | 상태 | 비고 |
|------|------|------|
| Next.js 16 + TypeScript + Tailwind 4 | 완료 | 빌드 성공 확인 |
| Zustand 상태 관리 | 완료 | useTripStore, useChatStore |
| AI 채팅 (Gemini API) | 완료 | 생성/수정/대화 3모드, Rate Limit 폴백 |
| 여행 뷰어 (7탭) | 완료 | 개요/일정/맛집/교통/예산/준비물/사전준비 |
| 홈 페이지 | 완료 | 여행 목록 + 새 여행 버튼 |
| localStorage 저장 | 완료 | Trip CRUD |
| shadcn/ui 컴포넌트 | 완료 | button, badge, tabs, checkbox 등 |
| Wanderlog 스타일 리디자인 | 완료 | 라이트 테마, 오렌지 accent |
| .env.local (GEMINI_API_KEY) | 설정됨 | .gitignore에 포함 확인 |
| 빌드 | 성공 | `next build` 통과, 타입 에러 없음 |

**미구현 항목**:

| 항목 | MVP 필요 여부 | 이유 |
|------|-------------|------|
| PWA (manifest, icons, SW) | 아니오 | MVP 핵심 가치는 "AI로 여행 계획 생성/수정". PWA는 편의 기능 |
| Vercel 배포 | 예 | 배포 없이는 MVP 검증 불가 |
| AI 편집 모드 (/edit) | 아니오 | 채팅 페이지에서 수정 가능. 분할 화면은 UX 개선 |
| Leaflet 지도 (DayMap) | 아니오 | 일정 확인에 지도 없어도 동작. 시각적 부가 기능 |
| domain/trip.ts (applyTripAction) | 아니오 | 현재 replace_trip으로 전체 교체 방식 동작 |
| 테스트 코드 | 아니오 | 개인 프로토타입, 수동 검증으로 충분 |

### TO-BE (MVP 배포 후 상태)

- Vercel에 배포되어 모바일/데스크톱에서 접근 가능
- AI 대화로 여행 생성 --> 뷰어에서 확인 --> 저장 플로우 동작
- API 키 보안 처리 완료
- 기본 에러 핸들링 동작
- SEO 메타데이터 설정

---

## 2. MVP 범위 정의

### MVP에 포함 (v0.1)

> 핵심 가설 검증: "AI 대화만으로 완성도 높은 여행 계획을 만들 수 있다"

1. **AI 채팅으로 여행 생성** -- 이미 완료
2. **여행 뷰어 (7탭)** -- 이미 완료
3. **홈 페이지 (여행 목록)** -- 이미 완료
4. **localStorage 저장** -- 이미 완료
5. **Vercel 배포** -- 신규 작업
6. **배포 전 필수 보안/품질 점검** -- 신규 작업

### MVP에서 제외 (배포 후 추가)

| 항목 | 버전 | 우선순위 |
|------|------|----------|
| PWA (manifest, icons, service worker) | v0.2 | Should |
| AI 편집 모드 (뷰어+채팅 분할) | v0.2 | Should |
| Leaflet 지도 (DayMap) | v0.2 | Should |
| domain/trip.ts (부분 수정 로직) | v0.2 | Could |
| 에러 바운더리 (React Error Boundary) | v0.2 | Should |
| 테스트 코드 | v0.3 | Could |
| 음성 입력 | v0.3 | Could |
| AI 응답 스트리밍 | v0.3 | Could |

---

## 3. 배포 전 필수 작업

### 3.1 보안 점검

- [ ] **GEMINI_API_KEY 서버 사이드 확인**: 현재 `src/api/gemini.ts`에서 `process.env.GEMINI_API_KEY` 사용 --> Route Handler(`/api/chat/route.ts`)를 통해서만 호출되므로 클라이언트에 노출되지 않음. 확인 완료.
- [ ] **클라이언트 번들에 API 키 미포함 확인**: `NEXT_PUBLIC_` 접두사 없으므로 안전. 빌드 후 클라이언트 번들 grep으로 재확인.
- [ ] **.env.local이 .gitignore에 포함 확인**: 확인 완료 (`app/.gitignore`에 `.env*` 포함)

### 3.2 에러 핸들링 보강

- [ ] **API Route 에러 응답 개선**: 현재 기본 에러 핸들링 존재 (429, 500 분기). JSON 파싱 실패 시 구체적 에러 메시지 추가.
- [ ] **빈 응답 방어**: Gemini가 빈 trip 데이터를 반환할 경우 사용자에게 "다시 시도해주세요" 안내.
- [ ] **클라이언트 에러 상태 표시**: useChatStore의 error 상태가 UI에 표시되는지 확인.

### 3.3 메타데이터/SEO

- [ ] **layout.tsx 메타데이터 설정**: title, description, og:image 기본값 설정.
- [ ] **favicon 교체**: 현재 기본 Next.js favicon --> 여행 관련 아이콘으로 교체 (또는 이모지 favicon).

### 3.4 빌드 검증

- [ ] **`npm run build` 성공 확인**: 현재 성공 (2026-03-09 확인)
- [ ] **`npm run lint` 통과 확인**
- [ ] **동작 검증**: 로컬에서 `npm run build && npm start`로 프로덕션 모드 테스트
  - 홈 --> 채팅 --> 여행 생성 --> 뷰어 확인 --> 저장 플로우

---

## 4. Vercel 배포 설정

### 4.1 Vercel 프로젝트 설정

```
Framework:        Next.js (자동 감지)
Root Directory:   app/          <-- 모노레포 구조이므로 루트가 아닌 app/ 지정
Build Command:    npm run build (기본값)
Output Directory: .next (기본값)
Node.js Version:  20.x
```

### 4.2 환경 변수

| 변수명 | 값 | 환경 |
|--------|------|------|
| `GEMINI_API_KEY` | (Gemini API 콘솔에서 발급) | Production, Preview, Development |

> Vercel Dashboard --> Settings --> Environment Variables에서 설정.
> `.env.local` 파일은 로컬 개발용이므로 Vercel에는 대시보드에서 직접 입력.

### 4.3 배포 단계

```
1. GitHub 저장소 연결
   - Vercel Dashboard --> New Project --> Import Git Repository
   - Repository: crowwan/my-journey (또는 해당 레포)

2. 프로젝트 설정
   - Root Directory: app/
   - Framework: Next.js (Auto-detected)

3. 환경 변수 설정
   - GEMINI_API_KEY = (실제 키 값)

4. Deploy 클릭
   - 첫 배포 시 도메인: {project-name}.vercel.app

5. 커스텀 도메인 (선택)
   - 필요시 Vercel Dashboard --> Settings --> Domains에서 추가
```

### 4.4 Vercel 설정 파일 (필요시)

현재 `next.config.ts`가 비어있으므로 추가 설정 불필요.
Root Directory를 `app/`으로 지정하면 Vercel이 자동으로 처리.

만약 빌드 이슈 발생 시 `vercel.json` 추가:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## 5. 배포 후 로드맵

### v0.2 -- UX 개선 (배포 후 1-2주)

| 작업 | 설명 | 예상 난이도 |
|------|------|------------|
| PWA 설정 | manifest.json, 아이콘, next-pwa 또는 @serwist/next | 중 |
| Leaflet 지도 | react-leaflet 설치, DayMap 컴포넌트 구현 (dynamic import) | 중 |
| AI 편집 모드 | /trips/[tripId]/edit 분할 화면 | 중 |
| 에러 바운더리 | React Error Boundary + 사용자 친화적 폴백 UI | 하 |
| AI 응답 로딩 UX | 스켈레톤 UI, 생성 진행률 표시 | 하 |
| 준비물 체크 상태 저장 | localStorage에 체크 상태 별도 저장 | 하 |

### v0.3 -- 기능 확장 (배포 후 1개월)

| 작업 | 설명 |
|------|------|
| domain/trip.ts | applyTripAction 부분 수정 로직 (replace_trip 대신 세밀한 수정) |
| AI 응답 스트리밍 | Gemini 스트리밍 API로 실시간 타이핑 효과 |
| 여행 공유 (읽기 전용 링크) | 서버리스 DB 필요 (Vercel KV 또는 Supabase) |
| 테스트 코드 | 핵심 로직 (gemini.ts 변환 함수, tripStore) 단위 테스트 |
| Analytics | Vercel Analytics 또는 Google Analytics 연동 |

### v1.0 -- 정식 출시 (장기)

- 사용자 인증 + 클라우드 저장
- 여행 공유/협업
- React Native 앱 전환
- 수익화 (프리미엄 AI 기능)

---

## 6. 완료 조건 (Definition of Done)

### MVP 배포 완료 조건

- [ ] `npm run build` 성공 (타입 에러 없음)
- [ ] `npm run lint` 통과
- [ ] Vercel에 배포 완료 (HTTPS URL 접근 가능)
- [ ] 환경 변수 (GEMINI_API_KEY) 설정 확인
- [ ] 핵심 플로우 수동 검증:
  - [ ] 홈 페이지 로드
  - [ ] "새 여행 만들기" --> AI 채팅 시작
  - [ ] 여행 생성 요청 --> AI 응답 --> 여행 데이터 생성
  - [ ] 뷰어에서 7탭 모두 표시 확인
  - [ ] 저장 후 홈에서 여행 카드 표시
  - [ ] 모바일 브라우저에서 레이아웃 정상 표시
- [ ] API 키가 클라이언트 번들에 미포함 확인
- [ ] 에러 상황에서 사용자에게 적절한 메시지 표시

### 소요 시간 예상

| 작업 | 예상 시간 |
|------|----------|
| 보안/에러 핸들링 점검 및 보강 | 1시간 |
| 메타데이터/favicon 설정 | 30분 |
| Vercel 프로젝트 생성 및 배포 | 30분 |
| 배포 후 수동 검증 | 30분 |
| **합계** | **약 2.5시간** |

---

## 부록: 현재 프로젝트 구조

```
app/
├── next.config.ts          # 빈 설정
├── package.json            # Next.js 16 + Gemini + Zustand + shadcn
├── .env.local              # GEMINI_API_KEY (gitignore됨)
├── public/
│   └── seed/               # 시드 데이터
├── src/
│   ├── api/gemini.ts       # Gemini API Layer (프롬프트, DTO, 변환, Rate Limit)
│   ├── app/
│   │   ├── api/chat/route.ts   # POST /api/chat (Route Handler)
│   │   ├── chat/page.tsx       # AI 채팅 페이지
│   │   ├── trips/[tripId]/page.tsx  # 여행 뷰어
│   │   ├── page.tsx            # 홈 (여행 목록)
│   │   ├── layout.tsx          # Root Layout
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/           # ChatContainer, ChatMessage, ChatInput, TripPreviewCard, TypingIndicator
│   │   ├── home/           # TripCard, NewTripButton
│   │   ├── layout/         # Header, BottomNav
│   │   ├── ui/             # shadcn 컴포넌트 (button, badge, tabs 등)
│   │   └── viewer/         # TripViewer, HeroSection, TabBar, 7탭, DayCard, TimelineItem, shared/*
│   ├── stores/             # useTripStore, useChatStore
│   ├── types/trip.ts       # Domain 타입
│   └── lib/                # constants, storage, trip-utils, utils
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-09 | MVP 배포 계획서 초안 | kimjin-wan |
