# CAPTURE.md — My Journey 영상 캡처 재현 가이드

> vibe-videos 캡처 자동화 또는 사람이 **10분 안에 앱을 띄워 씨드 화면을 확인**하기 위한 문서.
> 기계 판독용 매니페스트는 `.vibe-video.yml`, 사람 판독용은 본 문서.

---

## 1. 전제

- Node: `.nvmrc`에 고정. 현재 `20` (Next.js 16 + Turbopack은 Node 20+ 필수)
- 패키지 매니저: `npm` (package-lock.json 사용)
- 대상 OS: macOS / Linux. Windows 미검증
- 대상 브라우저: Chromium (Playwright 기본)
- 모노레포 구조: Next.js 앱은 `app/` 서브디렉터리에 있음

## 2. 10분 Quick Start

```bash
# 1. 저장소 클론 (이미 있으면 건너뛰기)
git clone git@github.com:jwkim-imago/my-journey.git && cd my-journey

# 2. Node 버전 맞추기
nvm use                  # .nvmrc → 20

# 3. 의존성 설치 (모노레포: app/ 안쪽)
cd app && npm install

# 4. 환경변수 준비 (아래 §3 참조)
# 현재 .env.example 파일이 없음. app/.env.local 을 직접 만든다.
touch .env.local
# 필수 변수 값 채우기 (§3-1 표 참조)

# 5. (시드) 수동 — 아래 §4 참조. 자동 시드 스크립트는 아직 없음

# 6. 개발 서버 기동
npm run dev              # next dev → http://localhost:3000

# → 브라우저에서 http://localhost:3000 접속 → 아래 §4의 "기대 화면" 확인
```

## 3. 환경변수

### 3-1. 필수 (`app/.env.local`)

| 이름 | 용도 | 발급 방법 | 비용 |
|------|------|----------|------|
| `GEMINI_API_KEY` | Gemini 2.5 Flash / 2.0 Flash Lite 호출 (AI 여행 생성/수정) | [Google AI Studio](https://aistudio.google.com/apikey) | 무료 할당량 있음 |
| `EXCHANGE_RATE_API_KEY` | 환율 계산 (가이드 탭 예산 환산) | [ExchangeRate-API](https://www.exchangerate-api.com/) | 무료 플랜 가능 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (DB + Auth) | [Supabase Dashboard](https://supabase.com/dashboard) > 프로젝트 > Settings > API | 무료 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 브라우저용 publishable key | 상동 | 무료 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 라우트에서 RLS 우회 시 사용 | 상동 (Service Role key) | 무료 — 외부 노출 금지 |

카카오 로그인을 사용하려면 Supabase 대시보드에서 **Authentication → Providers → Kakao** 를 활성화하고
[Kakao Developers](https://developers.kakao.com/)에서 발급한 REST API 키 + Client Secret을 Supabase 측에 등록한다.
앱 코드에서 직접 Kakao 시크릿을 참조하지 않으므로 `.env.local`에 넣을 필요는 없다.

### 3-2. 캡처용(모킹) — `app/.env.capture` (추후 추가 예정)

외부 API 호출을 우회하려면 아래 토글을 `true`로 할 계획. **현재 코드에 모킹 스위치가 없으므로** 캡처 시에는
실제 Gemini / Supabase / Kakao 호출이 발생한다. 모킹 도입 후 본 섹션을 채운다.

| 이름 | 기본값 | 설명 (계획) |
|------|--------|------|
| `MOCK_LLM` | false | Gemini 호출을 고정 응답으로 대체 |
| `MOCK_OAUTH` | false | 카카오 로그인을 시드 사용자로 자동 통과 |

## 4. 씨드 상태의 기대 화면

자동 시드 스크립트가 없다. 현재 시점(Supabase 기반) 캡처를 위한 수동 절차:

1. 브라우저에서 `http://localhost:3000` 접속 → 랜딩 화면
2. 카카오 로그인 (또는 Supabase Auth가 허용한 다른 Provider)
3. AI 플로팅 버튼 → Quick Setup 폼에 "오사카 / 2026-03-01 / 2026-03-05 / 2명" 입력
4. 생성된 초안 저장 → 홈 카드 1건 표시 + `/trips/{tripId}` 이동 가능

성공 체크리스트:
- [ ] `/` 접속 시 홈에 방금 생성한 오사카 여행 카드 1건 노출
- [ ] `/trips/{tripId}` 에서 4탭(요약/일정/가이드/체크리스트) 정상 렌더
- [ ] `/calendar` 월별 셀에 출발일·귀국일 마커 노출
- [ ] 콘솔 에러 없음 (Leaflet CDN 로드, React Query devtools 경고는 허용)

> 참고 스크린샷: `docs/captures/quickstart-home.png` (미작성)

## 5. 주요 라우트 카탈로그

| route_id | 경로 | 설명 | 인증 필요 | 비고 |
|----------|------|------|----------|------|
| home | `/` | 홈 — 여행 카드 목록 + NewTripButton | O | 비로그인 시 랜딩, AI 숨김 |
| trip_detail | `/trips/:tripId` | 여행 상세 — 4탭 뷰어 (요약/일정/가이드/체크리스트) | O (본인 소유 or 공유 링크) | `tripId` 형식: `trip-{timestamp}` |
| calendar | `/calendar` | 월별 캘린더 — 여행 기간 시각화 | O | |
| auth_callback | `/auth/callback` | Supabase OAuth 콜백 | - | 직접 캡처 대상 아님 |

API 라우트(`/api/chat`, `/api/weather`, `/api/currency`, `/api/shared`)는 UI 캡처 대상이 아니므로 목록에서 제외.

## 6. 캡처 시 주의사항

### 민감정보
- 카카오 로그인 시 헤더에 **실제 사용자 이름/아바타**가 노출됨 → `.vibe-video.yml`의 `privacy.mask` selector(`[data-user-email]`, `[data-user-name]`, 프로필 이미지)로 블러 처리
- 시드 데이터로만 운영: 실제 일정/예산/연락처를 화면에 띄우지 말 것

### 외부 요청
- **현재 모킹 스위치 미구현**. Gemini 호출은 실제 API를 때림 → 유료/쿼터 주의
- 카카오 로그인도 실제 OAuth 플로우를 탄다
- 모킹 도입 전까지는 **네트워크 끊긴 상태 캡처 금지** (앱이 깨짐: Supabase 세션 갱신 미들웨어가 매 요청마다 동작)

### 과거 커밋 재현
- `git checkout {sha}`가 아니라 `git worktree add ../my-journey-{sha} {sha}`로 복제 (현재 작업 트리를 보존)
- Node 버전이 현재 OS에서 호환 안 되면 `.vibe-video.yml`에 `fallback: manual` 표기

## 7. 알려진 제약

- **Supabase 마이그레이션 이전(b23efb5 이전)은 localStorage 기반**이라 별도 seed 없음. 해당 커밋 체크아웃 시 브라우저에서 AI 플로우를 통해 여행을 직접 생성해야 카드가 보임
- **Next.js 16 + Turbopack은 Node 20+에서만 빌드**. Node 18 환경에서는 `npm run dev`가 즉시 실패
- `.env.example` 파일이 레포에 없음 → 본 문서 §3 표를 단일 소스로 사용
- 자동 시드 스크립트 없음 → 캡처 재현은 본 문서 §4 수동 절차
- 캡처용 모킹(`MOCK_LLM`, `MOCK_OAUTH`) 미구현 → 실 API 호출됨
- dev 포트는 현재 `3000`. 다중 프로젝트 동시 캡처 시 충돌 가능 → 7777 대로 옮기는 별도 작업 예정

## 8. 문의 / 유지보수

- 매니페스트/문서 오너: `jwkim`
- 질문/제안: 레포 이슈 또는 직접 연락
- 마지막 검증일: `2026-04-18` — 이 날짜 이후 workflow가 달라졌다면 본 문서 업데이트 필요
