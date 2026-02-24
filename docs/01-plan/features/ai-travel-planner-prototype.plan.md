# AI Travel Planner - 프로토타입 계획서

> **Summary**: AI와 대화하며 여행 일정을 세우고, 예쁜 UI로 보여주며, AI를 통해 지속 수정 가능한 모바일 앱
>
> **Project**: ai-travel-planner
> **Author**: kimjin-wan
> **Date**: 2026-02-24
> **Status**: Draft
> **Level**: Prototype (MVP)

---

## 1. Overview

### 1.1 Purpose

AI와 자연어 대화로 여행 계획을 세우면, 구조화된 아름다운 여행 페이지가 자동 생성되고, 언제든 AI에게 말해서 수정할 수 있는 앱.

### 1.2 핵심 가치

**"여행 계획의 ChatGPT + 노션 + 구글맵"**

| 기존 방식 | 이 앱 |
|-----------|-------|
| 블로그/유튜브 검색 → 수동 정리 | "오사카 4박5일 계획해줘" 한마디 |
| 구글맵 + 메모 + 스프레드시트 분산 | 하나의 뷰에 일정/지도/맛집/교통/예산 통합 |
| 수정하려면 하나씩 편집 | "저녁을 라멘에서 초밥으로 바꿔줘" |
| 정보 신뢰도 불확실 | AI가 실시간 조사 + 사용자 확인 |

### 1.3 검증하려는 가설

> "AI 대화만으로 완성도 높은 여행 계획을 만들고 수정할 수 있다"

프로토타입에서 검증할 것:
1. AI가 구조화된 여행 데이터를 안정적으로 생성할 수 있는가?
2. 자연어 수정 요청이 정확히 반영되는가?
3. 생성된 결과물이 시각적으로 만족스러운가?

---

## 2. Scope

### 2.1 프로토타입 In Scope

| ID | 기능 | 우선순위 | 설명 |
|----|------|----------|------|
| P-01 | AI 채팅 인터페이스 | Must | 여행 계획을 대화로 생성/수정 |
| P-02 | 여행 뷰어 (읽기 전용) | Must | 생성된 일정을 예쁘게 표시 |
| P-03 | 일정 데이터 구조 | Must | AI 출력 → 구조화된 JSON |
| P-04 | 일정 수정 (AI 대화) | Must | "하루카 대신 쾌속으로 바꿔줘" |
| P-05 | 지도 표시 | Should | 일별 경로를 지도에 표시 |
| P-06 | 로컬 저장 | Should | 여행 데이터 기기에 저장 |

### 2.2 프로토타입 Out of Scope (향후)

- 사용자 인증/로그인 (서버 필요)
- 여행 공유/협업
- 실시간 예약 연동 (항공, 숙소)
- 오프라인 모드
- 다국어 지원
- 수익화 (구독, 광고)

---

## 3. 기술 스택 결정

### 3.1 선택지 비교

| 항목 | Option A: React Native (Expo) | Option B: Next.js PWA | Option C: Flutter |
|------|-------------------------------|----------------------|-------------------|
| 플랫폼 | iOS + Android | 웹 + 모바일(PWA) | iOS + Android |
| 개발 속도 | 빠름 (Expo Go 즉시 테스트) | 매우 빠름 (웹 기반) | 보통 |
| AI 연동 | fetch API | fetch API | http 패키지 |
| 지도 | react-native-maps | Leaflet (기존 경험) | google_maps_flutter |
| 배포 | Expo EAS | Vercel (즉시) | App Store/Play Store |
| 기존 자산 활용 | HTML 뷰어로 WebView 활용 가능 | 기존 HTML/CSS 직접 재활용 | 새로 작성 |
| 프로토타입 적합도 | ★★★★ | ★★★★★ | ★★★ |

### 3.2 결정: Next.js PWA (Option B)

**선택 이유:**
1. **기존 자산 최대 활용** — 현재 오사카 여행 HTML/CSS 디자인을 그대로 컴포넌트화
2. **가장 빠른 프로토타입** — Vercel 배포 즉시 가능, 모바일에서 PWA로 설치
3. **웹 + 모바일 동시 지원** — 별도 앱스토어 심사 불필요
4. **Leaflet 재활용** — 이미 검증된 지도 구현
5. **향후 React Native 전환 용이** — React 컴포넌트 로직 재사용 가능

### 3.3 기술 스택 상세

```
Frontend:  Next.js 15 (App Router) + TypeScript
Styling:   Tailwind CSS (기존 CSS 변수 시스템 이전)
AI:        Google Gemini API (무료 티어)
           - Gemini 2.5 Flash (10 RPM, 250 RPD, 1M context)
           - SDK: @google/genai
Map:       Leaflet / react-leaflet
State:     Zustand (경량 상태 관리)
Storage:   localStorage (프로토타입) → 향후 DB
Deploy:    Vercel
PWA:       next-pwa
```

---

## 4. 데이터 모델

### 4.1 핵심 엔티티

```typescript
// 여행 (Trip)
interface Trip {
  id: string;
  title: string;           // "오사카 여행 완전판"
  destination: string;     // "osaka"
  startDate: string;       // "2026-03-02"
  endDate: string;         // "2026-03-06"
  travelers: number;       // 1
  tags: string[];          // ["오사카", "교토", "나라", "고베"]
  days: Day[];
  overview: TripOverview;
  budget: BudgetSection;
  packing: PackingItem[];
  preTodos: PreTodoItem[];
}

// 일별 일정 (Day)
interface Day {
  dayNumber: number;       // 1
  date: string;            // "2026-03-02"
  title: string;           // "오사카 도착 & 우메다 산책"
  subtitle: string;        // "나카노시마 → 텐진바시스지 → 스카이빌딩"
  color: string;           // "#f97316"
  items: TimelineItem[];
  mapSpots: MapSpot[];
}

// 타임라인 항목 (TimelineItem)
interface TimelineItem {
  time: string;            // "08:30"
  title: string;           // "김포공항 출발"
  description?: string;    // "비행 2h"
  type: 'spot' | 'food' | 'move' | 'default';
  cost?: number;           // 1800 (엔)
  currency?: 'JPY' | 'KRW';
}

// 지도 스팟 (MapSpot)
interface MapSpot {
  lat: number;
  lng: number;
  name: string;
  time: string;
  icon: string;            // emoji
}
```

### 4.2 AI 입출력 형식

```
[사용자 입력]
"오사카 3/2~3/6 혼자 여행, 맛집 많이, 예산 50만원"

[AI 출력 → 구조화된 JSON]
{
  "action": "create_trip",
  "data": { ... Trip 객체 }
}

[수정 요청]
"DAY 1 저녁을 라멘에서 초밥으로 바꿔줘"

[AI 출력 → 부분 업데이트]
{
  "action": "update_item",
  "dayNumber": 1,
  "itemIndex": 14,
  "data": { ... 수정된 TimelineItem }
}
```

---

## 5. 화면 구성

### 5.1 주요 화면 (4개)

```
┌─────────────────────────────────────┐
│  1. 홈 (여행 목록)                    │
│  ┌───────────────────────────────┐  │
│  │ 🌸 오사카 여행          3/2~6 │  │
│  │ 🗼 도쿄 여행           (예정) │  │
│  │                              │  │
│  │     [+ 새 여행 만들기]        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  2. AI 채팅                          │
│  ┌───────────────────────────────┐  │
│  │ 🤖 어떤 여행을 계획할까요?     │  │
│  │                              │  │
│  │ 👤 오사카 4박5일 혼자 여행     │  │
│  │    맛집 위주로!               │  │
│  │                              │  │
│  │ 🤖 좋아요! DAY 1부터         │  │
│  │    계획을 세워볼게요...       │  │
│  │    [일정 미리보기 카드]        │  │
│  │                              │  │
│  └───────────────────────────────┘  │
│  [메시지 입력...]          [전송]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  3. 여행 뷰어 (현재 HTML과 동일)      │
│  ┌───────────────────────────────┐  │
│  │ 📋개요 📅일정 🍜맛집 🚃교통   │  │
│  │───────────────────────────────│  │
│  │  [현재 오사카 HTML의 뷰를      │  │
│  │   React 컴포넌트로 재현]       │  │
│  └───────────────────────────────┘  │
│              [✏️ AI로 수정하기]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  4. 여행 뷰어 + AI 수정 모드         │
│  ┌───────────────────────────────┐  │
│  │  [여행 뷰어 상단 절반]         │  │
│  │───────────────────────────────│  │
│  │ 👤 DAY 1 저녁 초밥으로 바꿔줘  │  │
│  │ 🤖 변경했어요!                │  │
│  │    라멘 카모토네기 → 하루코마   │  │
│  │    [변경 전/후 비교 카드]      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 5.2 디자인 원칙

- 기존 오사카 HTML의 다크 테마 + 컬러 시스템 유지
- 모바일 퍼스트 (세로 스크롤 중심)
- AI 채팅은 하단 시트 또는 전체 화면

---

## 6. 구현 순서

### Phase 1: 프로젝트 셋업 (Day 1)
```
├── Next.js 15 + TypeScript 초기화
├── Tailwind CSS 설정 (기존 CSS 변수 이전)
├── 프로젝트 구조 생성
├── PWA 기본 설정
└── Vercel 배포 연결
```

### Phase 2: 데이터 모델 + 뷰어 (Day 2~3)
```
├── Trip/Day/TimelineItem 타입 정의
├── 오사카 여행 데이터를 JSON으로 변환 (시드 데이터)
├── 여행 뷰어 컴포넌트 구현
│   ├── 탭 네비게이션
│   ├── 개요 탭
│   ├── 일정 탭 (타임라인 + 지도)
│   ├── 맛집 탭
│   └── 나머지 탭 (교통/예산/준비물/사전준비)
└── 홈 화면 (여행 목록)
```

### Phase 3: AI 채팅 연동 (Day 4~5)
```
├── Gemini API 연동 (Route Handler)
│   ├── @google/genai SDK 설정
│   ├── 구조화된 JSON 출력 (response_mime_type)
│   └── 무료 티어 Rate Limit 처리 (10 RPM)
├── 채팅 UI 구현
├── AI 시스템 프롬프트 설계
│   ├── 여행 데이터 JSON 생성 프롬프트
│   ├── 부분 수정 프롬프트
│   └── 웹 검색 통합 (맛집/교통 조사)
├── AI 응답 → Trip 데이터 파싱
└── 실시간 뷰어 업데이트
```

### Phase 4: 저장 + 마무리 (Day 6~7)
```
├── localStorage 기반 여행 저장/불러오기
├── 새 여행 생성 플로우
├── AI 수정 모드 (뷰어 + 채팅 분할)
├── PWA 설치 테스트
├── 모바일 반응형 최종 확인
└── 프로토타입 완성 배포
```

---

## 7. AI 시스템 프롬프트 설계 (핵심)

### 7.1 Gemini API 설정

```typescript
// Gemini 모델 전략
const MODEL_CONFIG = {
  primary: 'gemini-2.5-flash',    // 메인 (10 RPM, 250 RPD)
  fallback: 'gemini-2.0-flash-lite', // 폴백 (15 RPM, 1,000 RPD)
};

// 구조화된 JSON 출력 설정
const generationConfig = {
  response_mime_type: 'application/json',  // JSON 모드 강제
  response_schema: TripSchema,             // Trip 스키마 검증
  temperature: 0.7,
};
```

**무료 티어 제약 대응:**
- 하루 250회 요청 → 개인 프로토타입에 충분
- Rate Limit 초과 시 Flash-Lite 자동 폴백
- 1M 토큰 컨텍스트 → 전체 여행 데이터 + 대화 이력 한 번에 전달 가능

### 7.2 여행 생성 프롬프트 구조

```
[시스템 프롬프트]
당신은 여행 계획 전문가입니다.
사용자의 요청에 맞는 여행 계획을 JSON 형식으로 생성합니다.

출력 규칙:
1. 반드시 Trip 스키마에 맞는 JSON을 생성
2. 각 Day의 timeline은 시간순 정렬
3. 맛집은 Google 평점 4.0 이상 기준
4. 교통비는 실제 요금 기반
5. type 분류: spot(관광), food(식사), move(이동), default(기타)

[사용자 메시지]
오사카 3/2~3/6 혼자 여행, 맛집 많이, 예산 50만원
```

### 7.3 수정 프롬프트 구조

```
[시스템 프롬프트]
현재 여행 데이터: {현재 Trip JSON}

사용자의 수정 요청을 분석하여 변경 사항을 JSON Patch 형식으로 반환합니다.
변경된 부분만 반환하세요.
```

---

## 8. 리스크 및 대응

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI 출력이 JSON 스키마에 안 맞음 | High | Medium | Gemini JSON 모드 활용 + 스키마 검증 + 재시도 |
| Gemini 무료 티어 Rate Limit | Medium | Medium | 2.5 Flash(10 RPM/250 RPD), 초과 시 Flash-Lite 폴백 |
| 맛집/교통 정보 부정확 | Medium | High | "AI 생성 정보, 실제와 다를 수 있음" 면책 표시 |
| PWA 제한 (푸시알림 등) | Low | Low | 프로토타입에선 필요 없음 |
| 지도 성능 (많은 마커) | Low | Low | Day별 lazy loading |

---

## 9. Success Criteria

### 9.1 프로토타입 완료 조건

- [ ] AI 대화로 여행 계획 생성 가능
- [ ] 생성된 계획이 7탭 뷰어로 표시
- [ ] AI 대화로 일정 수정 가능 (추가/변경/삭제)
- [ ] 지도에 일별 경로 표시
- [ ] 여행 데이터 로컬 저장/불러오기
- [ ] 모바일에서 PWA로 설치 가능
- [ ] Vercel에 배포 완료

### 9.2 검증 시나리오

```
시나리오 1: 새 여행 생성
1. "도쿄 3박4일 커플 여행 계획해줘" 입력
2. AI가 일정 제안
3. 뷰어에서 예쁘게 확인

시나리오 2: 일정 수정
1. 생성된 도쿄 여행 열기
2. "DAY 2 아침에 츠키지 시장 추가해줘"
3. 뷰어에서 수정 반영 확인

시나리오 3: 기존 여행 재활용
1. 오사카 여행 데이터(현재 HTML 기반) 불러오기
2. AI로 수정 가능한지 확인
```

---

## 10. 향후 로드맵 (프로토타입 이후)

```
v0.1 프로토타입 (현재 계획)
  └── AI 생성/수정 + 뷰어 + 로컬 저장

v0.2 사용성 개선
  ├── 음성 입력 지원
  ├── AI 응답 스트리밍 (실시간 타이핑)
  └── 일정 드래그&드롭 수동 편집

v0.3 데이터 강화
  ├── 실시간 맛집/관광지 정보 연동
  ├── 환율 자동 계산
  └── 날씨 API 연동

v1.0 정식 출시
  ├── 사용자 인증 + 클라우드 저장
  ├── 여행 공유 (링크/SNS)
  ├── React Native 앱 전환
  └── 수익화 (프리미엄 AI 기능)
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-24 | Initial prototype plan | kimjin-wan |
| 0.2 | 2026-02-24 | Claude API → Gemini API 무료 티어로 변경 | kimjin-wan |
