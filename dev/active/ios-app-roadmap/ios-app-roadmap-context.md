# 프로젝트 컨텍스트 & 의존성

**최종 갱신**: 2026-03-14 (홈 화면 v2 리디자인 세션)

---

## 현재 상태: 홈 화면 v2 수정 진행 중 (미커밋)

### 이번 세션 변경 요약

| 변경 | 파일 | 내용 |
|------|------|------|
| 홈 레이아웃 | `app/src/app/page.tsx` | 좌우 스크롤 → 세로 카드 리스트, 3섹션 구조 (최근 생성/다가오는 여행/지난 여행) |
| 카드 디자인 A안 | `TripCard.tsx`, `TripHeroCard.tsx` | 다가오는 여행에 왼쪽 오렌지 보더(`border-l-4 border-l-primary`) |
| 삭제 기능 | `TripCard.tsx`, `TripHeroCard.tsx` | 휴지통 아이콘 + confirm → `useTripStore.deleteTrip()` 호출 |
| 폰트 변경 | `layout.tsx`, `globals.css` | Playfair Display(serif) → Outfit(sans-serif) |
| 날짜 버그 수정 | `trip-utils.ts` | `toISOString()` UTC → 로컬 시간 기준 YYYY-MM-DD |
| AI 날짜 버그 수정 | `gemini.ts` | `CREATE_TRIP_PROMPT`에 오늘 날짜 주입 → 미래 날짜로 여행 생성 |

### 주요 결정

1. **홈 3섹션 구조 확정**
   - **최근 생성**: `createdAt` 기준 가장 최근 1개 → 히어로 카드
   - **다가오는 여행**: ongoing + upcoming (최근 생성 제외) → 일반 카드
   - **지난 여행**: past (최근 생성 제외) → 일반 카드

2. **디자인 A안 확정**: 왼쪽 오렌지 보더로 다가오는/진행 중 여행 구분
   - B안(상단 그라데이션 바), C안(연한 배경) 코드 제거 완료

3. **Outfit 폰트 확정**: 모던하고 기하학적인 sans-serif
   - Sora, Plus Jakarta, Montserrat, DM Sans 비교 후 선택

4. **히어로 카드 D-day 뱃지**: 타이틀 옆으로 이동 (기존: 타이틀 위 별도 줄)

---

## 해결한 버그 (이번 세션)

### 1. 날짜 그룹핑 UTC 오류 (`trip-utils.ts`)
- **원인**: `today.toISOString().slice(0,10)` → UTC 기준이라 KST에서 하루 전 날짜
- **해결**: `getFullYear()/getMonth()/getDate()` 로컬 시간 기준으로 변경

### 2. AI가 과거 날짜로 여행 생성 (`gemini.ts`)
- **원인**: `CREATE_TRIP_PROMPT`에 오늘 날짜 정보 없음
- **해결**: `getCreateTripPrompt()` 함수로 변경, 호출 시 오늘 날짜 주입 + "startDate는 반드시 오늘 이후" 규칙 추가

### 3. Hydration 불일치 (이전 세션)
- **해결**: useState 초기값 항상 `true`, useEffect에서 sessionStorage 체크

---

## 핵심 파일 맵 (현재)

### 홈 화면 (이번 세션에서 변경)
| 파일 | 역할 | 변경 |
|------|------|------|
| `app/src/app/page.tsx` | 홈 (3섹션 세로 카드 리스트) | 전면 재구성 |
| `app/src/components/home/TripHeroCard.tsx` | 최근 생성 히어로 카드 | A안 확정, 삭제 버튼, D-day 제목 옆 |
| `app/src/components/home/TripCard.tsx` | 일반 카드 (풀 너비 가로 레이아웃) | A안 확정, 삭제 버튼 |
| `app/src/components/home/NewTripButton.tsx` | 새 여행 버튼 | 변경 없음 |
| `app/src/components/shared/HorizontalScroll.tsx` | 수평 스크롤 (미사용, 삭제 가능) | 사용처 없음 |

### 폰트/스타일
| 파일 | 변경 |
|------|------|
| `app/src/app/layout.tsx` | Outfit 단일 폰트 (`--font-display`) |
| `app/src/app/globals.css` | `@theme inline`에 `--font-display: 'Outfit', sans-serif` |

### AI/API
| 파일 | 변경 |
|------|------|
| `app/src/api/gemini.ts` | `getCreateTripPrompt()` 함수 (오늘 날짜 주입) |
| `app/src/lib/trip-utils.ts` | `groupTrips()` 로컬 시간 기준 |

### 라우트 (변경 없음)
| 경로 | 파일 |
|------|------|
| `/` | `app/src/app/page.tsx` |
| `/trips/[tripId]` | `app/src/app/trips/[tripId]/page.tsx` |

---

## 다음 즉시 단계

1. **미커밋 변경사항 커밋** (홈 v2 + 폰트 + 버그 수정)
2. **`git push origin main`** → Vercel 배포
3. **브라우저 시각적 QA** (홈 3섹션, 삭제 기능, AI 드로어)
4. **모바일 반응형 확인** (640px 이하)
5. **CLAUDE.md 업데이트** — 7탭 → 4탭, 홈 구조 설명 변경
6. **HorizontalScroll 컴포넌트 삭제** (사용처 없음)

---

## 배포

- **웹**: `git push origin main` → Vercel 자동배포
- **프로덕션 URL**: `https://my-journey-planner.vercel.app`

---

## 관련 문서

| 문서 | 경로 |
|------|------|
| 프로젝트 규칙 | `CLAUDE.md` |
| 디자인 시스템 | `docs/design-system.md` |
| 리디자인 설계서 | `docs/plans/2026-03-14-design-system-redesign.md` |
| 리디자인 구현 계획서 | `docs/plans/2026-03-14-design-system-redesign-implementation.md` |
