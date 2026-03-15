# 여행 공유 기능 - 컨텍스트 & 결정사항

## 상태
- 단계: 계획 수립 완료, 구현 미착수
- 진행률: 0 / 11 작업 완료
- 최종 수정: 2026-03-15

## 주요 파일

### 수정 대상
- `app/src/lib/share-utils.ts` — 공유 로직 전면 교체 (URL 공유 → HTML 파일 생성 + 다운로드/공유)
- `app/src/components/viewer/HeroSection.tsx` — 공유 버튼 클릭 시 ShareModal 열기로 변경

### 신규 생성
- `app/src/lib/trip-to-html.ts` — Trip → HTML 문자열 변환 핵심 유틸리티
- `app/src/components/viewer/ShareModal.tsx` — 공유 옵션 모달 (다운로드/공유하기/클립보드)

### 변경 없음 (참조만)
- `app/src/types/trip.ts` — Trip 타입 (HTML 생성 시 읽기용)
- `app/src/components/viewer/TripViewer.tsx` — 뷰어 구조 참고 (HTML 섹션 순서)
- `app/src/components/viewer/tabs/SummaryTab.tsx` — 요약 섹션 UI 참고
- `app/src/components/viewer/tabs/ScheduleTab.tsx` — 일정 섹션 UI 참고
- `app/src/components/viewer/tabs/GuideTab.tsx` — 가이드 섹션 UI 참고
- `app/src/components/viewer/tabs/ChecklistTab.tsx` — 체크리스트 섹션 UI 참고
- `app/src/components/viewer/schedule/DayCard.tsx` — Day 카드 + 타임라인 UI 참고
- `app/src/lib/emoji-to-icon.tsx` — 이모지 매핑 참고 (HTML에서는 이모지 텍스트 사용)
- `app/src/lib/trip-utils.ts` — D-Day 계산, Day 색상 로직 참고
- `docs/design-system.md` — 전체 디자인 시스템 (CSS 변수, 컴포넌트 스타일)

## 주요 결정

### 1. 정적 HTML 파일 방식 선택 (Supabase 도입 안 함) (2026-03-15)
- **근거**: Supabase는 공유 전용이 아니라 전체 데이터 저장 방식 변경 시 별도 도입 예정. 공유만을 위한 서버 인프라 도입은 과도
- **대안 검토**:
  - Supabase 즉시 도입: 공유 전용으로만 쓰면 향후 전체 마이그레이션 시 이중 작업
  - Vercel KV / Blob: 추가 비용 발생 가능, 어차피 Supabase로 교체 예정
  - JSON 파일 서버: 보안/관리 부담
- **트레이드오프**: URL 기반 실시간 공유 불가 (파일 전송 방식), 하지만 오프라인 동작 + 인프라 비용 0

### 2. 탭 UI 대신 단일 스크롤 페이지 (2026-03-15)
- **근거**: 정적 HTML에서 탭 전환은 JavaScript 필요. 단일 스크롤 페이지가 JS 없이도 동작하고, 인쇄에도 유리
- **대안 검토**:
  - CSS-only 탭 (`:target` + radio): 가능하지만 URL fragment 변경 등 복잡도 높음
  - JS 포함 탭: HTML 파일에 인라인 JS 추가 가능하나, 보안 우려 (일부 메일 클라이언트에서 JS 차단)
- **트레이드오프**: 페이지가 길어짐, 하지만 앵커 링크로 섹션 이동 가능

### 3. `<style>` 블록 방식 CSS (인라인 스타일 아님) (2026-03-15)
- **근거**: 인라인 스타일(`style=""`)은 반응형 미디어 쿼리 불가 + 코드 중복 심함. `<style>` 블록이면 반응형 + 클래스 재사용 가능
- **대안 검토**:
  - 인라인 스타일: 이메일 클라이언트 호환성 좋지만 반응형 불가
  - 외부 CSS 파일: 자체 완결형이 아님
- **트레이드오프**: 이메일 본문으로 직접 보내기에는 부적합 (파일 첨부로 대체)

### 4. Google Fonts CDN 링크 포함 (2026-03-15)
- **근거**: 폰트를 Base64로 인라인하면 파일 크기가 MB 단위로 증가. CDN 링크는 ~100B로 가벼움
- **대안 검토**:
  - 폰트 인라인 (Base64): 완전 오프라인 지원, 하지만 파일 크기 5MB+
  - 폰트 없이 시스템 폰트만: 디자인 일관성 저하
- **트레이드오프**: 완전한 오프라인 지원 불가 (시스템 폰트 폴백으로 충분히 읽을 수 있음)

### 5. 이모지 텍스트 유지 (SVG 인라인 안 함) (2026-03-15)
- **근거**: lucide-react 아이콘을 SVG로 인라인하면 복잡도 증가 + 파일 크기 증가. 이모지 문자는 모든 현대 브라우저/OS에서 지원
- **대안 검토**:
  - SVG 인라인: 정확한 아이콘 재현, 하지만 각 아이콘 SVG 경로를 하드코딩해야 함
  - 아이콘 폰트 CDN: 외부 의존성 추가
- **트레이드오프**: lucide 아이콘의 깔끔한 느낌 대신 OS별 이모지 차이 발생. 섹션 제목 등 핵심 아이콘은 유니코드 심볼이나 간단한 인라인 SVG로 대체 가능

## 알려진 이슈

### 잠재적 문제
- 카카오톡 인앱 브라우저에서 HTML 파일 직접 열기 동작이 OS/버전별로 다를 수 있음 → 테스트 필요
- Web Share API의 File 공유는 Safari 15+, Chrome 93+에서 지원. 구형 브라우저는 다운로드만 가능
- 일부 이메일 클라이언트는 HTML 첨부파일을 보안 차단할 수 있음 → "다운로드 후 전송" 안내

### 향후 개선 가능
- Supabase 도입 후 URL 기반 공유 추가 (HTML 내보내기와 병행)
- PDF 내보내기 (html2pdf.js 등 활용)
- 공유 HTML에 QR 코드 삽입 (My Journey 앱 링크)
- `inline-edit` 작업과 HeroSection 충돌 가능성 낮음 (공유 버튼 onClick만 변경)

## 외부 의존성

| 의존성 | 용도 | 비고 |
|--------|------|------|
| Google Fonts CDN | HTML 내 폰트 로드 | 기존 사용 중, 오프라인 시 시스템 폰트 폴백 |
| 추가 npm 패키지 | **없음** | 순수 TypeScript 문자열 조립 |
