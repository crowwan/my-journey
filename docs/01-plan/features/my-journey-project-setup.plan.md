# My Journey - 프로젝트 셋업 계획서

> **Summary**: 여행 계획/일정을 HTML 문서로 관리하고 GitHub Pages로 웹 공개하는 프로젝트
>
> **Project**: my-journey
> **Author**: kimjin-wan
> **Date**: 2026-02-22
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

여행 계획, 일정, 메모 등을 체계적으로 관리하고, HTML 형태의 아름다운 문서로 만들어 GitHub Pages를 통해 웹에서 접근 가능하게 하는 개인 프로젝트.

### 1.2 Background

- Claude Code를 활용해 여행 계획을 세우고 문서화하는 워크플로우가 필요
- 여행별로 일정, 장소, 비용, 메모 등을 구조화된 HTML로 관리
- GitHub Pages를 통해 별도 서버 없이 무료 호스팅
- 반복적인 여행 계획 작업을 Claude Code 스킬/커맨드로 자동화

---

## 2. Scope

### 2.1 In Scope

- [x] 프로젝트 폴더 구조 설계
- [x] HTML 템플릿 시스템 (여행 계획, 일정표, 체크리스트 등)
- [x] Claude Code 커스텀 스킬 (여행 계획 생성, 일정 추가 등)
- [x] GitHub Pages 배포 설정
- [x] CSS 스타일 시스템 (반응형, 프린트 지원)
- [x] 인덱스 페이지 (전체 여행 목록)

### 2.2 Out of Scope

- 백엔드 서버 / 데이터베이스
- 사용자 인증 / 로그인
- 예약 시스템 연동

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 여행별 HTML 페이지 생성 (제목, 기간, 목적지, 일정) | High | Pending |
| FR-02 | 일별 일정표 (시간, 장소, 활동, 메모, 예상비용) | High | Pending |
| FR-03 | 여행 목록 인덱스 페이지 | High | Pending |
| FR-04 | Claude Code 스킬: 새 여행 생성 (`/trip-new`) | High | Pending |
| FR-05 | Claude Code 스킬: 여행 계획 도우미 (`/trip-plan`) | High | Pending |
| FR-06 | 준비물 체크리스트 섹션 | Medium | Pending |
| FR-07 | 예산 요약 테이블 | Medium | Pending |
| FR-08 | 프린트 친화적 스타일 | Medium | Pending |
| FR-09 | 모바일 반응형 디자인 | Medium | Pending |
| FR-10 | Leaflet 지도 연동 (일별 경로 표시) | High | Pending |
| FR-11 | 탭 네비게이션 (개요/일정/맛집/교통/예산/준비물/사전준비) | High | Pending |
| FR-12 | 맛집 리스트 (날짜별, 평점/가격 포함) | Medium | Pending |
| FR-13 | 교통 정보 (노선, 요금, 패스 비교) | Medium | Pending |
| FR-14 | 사전 준비 체크리스트 | Medium | Pending |
| FR-15 | 날씨/옷차림 가이드 | Low | Pending |
| FR-16 | GitHub Pages 자동 배포 (GitHub Actions) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 접근성 | 순수 HTML/CSS, JS 프레임워크 불필요 | 정적 파일만 사용 |
| 호환성 | 모든 모던 브라우저 지원 | 수동 테스트 |
| 유지보수 | Claude Code로 쉽게 수정 가능 | 스킬/템플릿 제공 |

---

## 4. 프로젝트 구조

> **핵심 결정**: 오사카 여행 예시를 분석한 결과, **Single-File 방식** (CSS/JS 인라인)이 이 프로젝트에 최적.
> 각 여행 HTML은 독립적으로 동작하며, CDN 의존성은 Google Fonts + Leaflet만 사용.

```
my-journey/
├── CLAUDE.md                    # 프로젝트 규칙 + 여행 관련 지침
├── index.html                   # 전체 여행 목록 (홈페이지)
├── trips/                       # 여행별 폴더
│   ├── 2025-osaka/              # 실제 예시: 오사카 여행
│   │   ├── index.html           # 여행 메인 (올인원 single-file)
│   │   └── images/              # 여행별 이미지
│   └── {year}-{destination}/    # 새 여행 패턴
│       └── index.html
├── templates/                   # HTML 템플릿 (Claude 참조용, 실제 서빙 안 됨)
│   └── trip-page.html           # 올인원 여행 페이지 템플릿
├── .claude/
│   ├── commands/                # 커스텀 Claude Code 커맨드
│   │   ├── trip-new.md          # 새 여행 생성
│   │   ├── trip-plan.md         # AI 여행 계획 도우미
│   │   ├── trip-add-day.md      # 일정 추가
│   │   └── trip-build-index.md  # 인덱스 페이지 갱신
│   └── settings.json            # 프로젝트 설정
└── docs/                        # PDCA 문서 (기존)
```

### 4.1 Single-File 방식 선택 이유

| 비교 | 분리형 (CSS/JS 별도) | Single-File (인라인) |
|------|---------------------|---------------------|
| 독립성 | 공유 CSS 변경 시 전체 영향 | 각 여행이 독립적으로 동작 |
| 유지보수 | CSS 공유로 일관성 좋음 | 여행마다 커스텀 스타일 가능 |
| 배포 | 파일 경로 관리 필요 | HTML 하나만 있으면 됨 |
| Claude 생성 | 여러 파일 동시 관리 복잡 | 하나의 파일만 생성하면 끝 |
| **결론** | | **이 프로젝트에 적합** |

### 4.2 CDN 의존성

| 라이브러리 | 용도 | CDN |
|-----------|------|-----|
| Noto Sans KR | 한글 폰트 | Google Fonts |
| Playfair Display | 영문 제목 폰트 | Google Fonts |
| Leaflet 1.9.4 | 지도 (경로 표시) | cdnjs |

---

## 5. Claude Code 커스텀 스킬 상세

### 5.1 `/trip-new` - 새 여행 생성

**기능**: 대화형으로 여행 기본 정보를 입력받아 폴더와 HTML 파일 생성

```
입력: 목적지, 기간, 테마/목적, 동행자 수
출력: trips/{year}-{destination}/index.html 생성
```

**동작 흐름**:
1. AskUserQuestion으로 목적지, 날짜, 테마 질문
2. 템플릿 기반으로 HTML 생성
3. index.html에 새 여행 링크 추가

### 5.2 `/trip-plan` - AI 여행 계획 도우미

**기능**: Claude가 목적지 정보를 조사하고 일정을 제안

```
입력: 여행 폴더명 (예: 2026-tokyo)
출력: 추천 일정, 맛집, 관광지, 교통편 등을 HTML에 반영
```

**동작 흐름**:
1. 기존 여행 페이지 읽기
2. 웹 검색으로 목적지 정보 조사
3. 일정 제안 (사용자 확인 후 반영)
4. HTML 업데이트

### 5.3 `/trip-add-day` - 일정 추가

**기능**: 특정 여행에 일별 상세 일정 추가

```
입력: 여행 폴더명, 날짜(Day N)
출력: 해당 일자의 상세 일정 HTML 생성/수정
```

### 5.4 `/trip-build-index` - 인덱스 갱신

**기능**: trips/ 폴더를 스캔해서 index.html 자동 갱신

---

## 6. HTML 템플릿 상세 (오사카 예시 기반)

> 참조: `trips/2025-osaka/index.html` — 실제 완성된 예시

### 6.1 올인원 여행 페이지 템플릿 (`trip-page.html`)

**7개 탭 구조** (오사카 예시에서 검증됨):

| 탭 | 내용 | 주요 컴포넌트 |
|----|------|-------------|
| 📋 개요 | 항공편, 숙소, 날씨, 일정 한눈에 보기 | `info-grid`, `weather-bar` |
| 📅 일정 | 날짜별 상세 타임라인 + Leaflet 지도 | `day-card`, `timeline`, `map` |
| 🍜 맛집 | 날짜별 맛집 리스트 (평점, 가격) | `rest-grid`, `rest-card` |
| 🚃 교통 | 노선, 요금, IC카드, 패스 비교 | `step-flow`, `ttable`, `station-grid` |
| 💰 예산 | 카테고리별 예산 바 차트 | `budget-item`, `budget-bar` |
| 🧳 준비물 | 클릭 체크 가능한 체크리스트 | `check-list`, `check-item` |
| ✅ 사전 준비 | 출발 전 할 일 순서 | `pretodo-item` |

### 6.2 핵심 UI 컴포넌트

- **Hero 섹션**: 그라데이션 배경 + 여행 제목 + 태그
- **Sticky 탭바**: 상단 고정, 블러 배경
- **Day Card**: 접기/펼치기, 날짜별 그라데이션 컬러
- **Timeline**: 세로선 + 색상 구분 (관광/식사/이동)
- **Leaflet Map**: 날짜별 경로 + 번호 마커 + 대시선
- **Check Item**: 클릭 시 취소선 + 체크마크

### 6.3 스타일 설계 (확정)

- **테마**: 다크 모드 기본 (오사카 예시 기준)
- **컬러 시스템**: CSS 변수 기반
  - accent: `#f97316` (오렌지) — 메인 포인트
  - blue: `#3b82f6` — 교통/이동
  - green: `#10b981` — 관광지
  - pink: `#f472b6` — 맛집/식사
  - purple: `#a78bfa` — 부가 정보
- **폰트**: Noto Sans KR + Playfair Display (제목)
- **반응형**: 640px 브레이크포인트, 그리드→1컬럼
- **프린트**: 추후 추가 (현재 Out of Scope → Medium Priority로 변경)

---

## 7. GitHub Pages 설정

### 7.1 배포 방식

- **Option A**: main 브랜치 루트에서 직접 서빙 (선택)
  - 장점: 단순, 별도 빌드 불필요
  - 단점: 소스와 배포가 동일
- **Option B**: GitHub Actions로 빌드 후 배포
  - 장점: 빌드 단계 추가 가능
  - 단점: 순수 HTML이면 불필요한 복잡성

### 7.2 URL 구조

```
https://{username}.github.io/my-journey/           # 홈 (여행 목록)
https://{username}.github.io/my-journey/trips/2026-tokyo/  # 여행 상세
```

---

## 8. Success Criteria

### 8.1 Definition of Done

- [ ] 프로젝트 폴더 구조 생성 완료
- [ ] CLAUDE.md 작성 (프로젝트 규칙)
- [x] 예시 여행 1건 (오사카 2025) — 완료!
- [ ] 올인원 HTML 템플릿 1종 완성 (오사카 기반 일반화)
- [ ] Claude Code 커맨드 4종 작성
- [ ] index.html (홈페이지) 완성
- [ ] GitHub repo 초기화 및 Pages 설정
- [ ] 웹에서 접근 확인

---

## 9. 구현 순서 (오사카 예시 반영, 수정)

```
Phase 1: 기본 구조 ✅ (완료)
  ├── 폴더 구조 생성 ✅
  └── 오사카 예시 여행 저장 ✅

Phase 2: 프로젝트 기반 (다음)
  ├── CLAUDE.md 작성 (템플릿 참조 규칙 포함)
  ├── Git 초기화
  ├── 오사카 HTML → 일반화된 템플릿 추출
  └── index.html (홈페이지) 작성

Phase 3: Claude Code 스킬 (핵심)
  ├── /trip-new — 새 여행 폴더+HTML 생성
  ├── /trip-plan — AI 일정 조사 & 제안
  ├── /trip-add-day — 일별 일정 추가/수정
  └── /trip-build-index — 홈페이지 자동 갱신

Phase 4: 배포
  ├── GitHub repo 생성 & push
  ├── GitHub Pages 활성화
  └── 웹 접근 확인
```

---

## 10. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| GitHub Pages 무료 제한 (1GB) | Low | Low | 이미지 최적화, 외부 호스팅 고려 |
| 여행 정보 검색 정확도 | Medium | Medium | 사용자 확인 단계 필수 |
| HTML 수동 관리 번거로움 | Medium | Medium | Claude Code 스킬로 자동화 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-22 | Initial draft | kimjin-wan |
| 0.2 | 2026-02-22 | 오사카 예시 반영: Single-File 방식, 7탭 구조, Leaflet 지도, 다크 테마 확정 | kimjin-wan |
