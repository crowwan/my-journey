# AI 기능 고도화 — 작업 체크리스트

**최종 갱신**: 2026-03-15

---

## Phase 1: Quick Setup 폼 + 세션 영속화

### Quick Setup 폼
- [x] 1.1 QuickSetupForm 컴포넌트 생성 [2026-03-15]
  - 목적지 (텍스트 입력), 기간 (드롭다운: 1박2일~7박8일), 인원 (드롭다운: 1~10명)
  - "일정 만들기" 버튼, "건너뛰기" 링크
- [x] 1.2 ChatContainer 빈 상태(create 모드)를 QuickSetupForm으로 교체 [2026-03-15]
  - edit 모드일 때는 기존 빈 상태 유지
- [x] 1.3 폼 제출 → 프롬프트 조립 → sendMessage(text, 'create') 바로 호출 [2026-03-15]
  - 조립 예: "목적지: 도쿄, 기간: 3박 4일, 인원: 1명. 여행 계획을 생성해주세요."
- [x] 1.4 "건너뛰기" → 기존 자유 채팅 모드 진입 (예시 칩 표시) [2026-03-15]
  - useChatStore에 quickSetupSkipped 상태 추가

### 세션 영속화
- [x] 1.5 useChatStore에 zustand persist 미들웨어 + sessionStorage 적용 [2026-03-15]
  - messages, generatedTrip, quickSetupSkipped를 partialize 대상
  - isLoading, error는 영속화 제외
- [x] 1.6 AIDrawer.handleClose에서 clearMessages() 호출 제거 [2026-03-15]
- [x] 1.7 AIDrawerProvider.handleToggle에서 clearMessages() 호출 제거 [2026-03-15]
- [x] 1.8 ChatContainer 헤더에 "새 대화" 버튼 추가 [2026-03-15]
  - 메시지가 있을 때만 표시
  - 클릭 시 clearMessages() → Quick Setup 폼으로 복귀
- [ ] 1.9 드로어 닫았다 열었을 때 대화 복원 수동 테스트
- [x] 1.10 빌드 + 린트 확인 [2026-03-15]
  - lint: 0 errors (기존 warning 1개 유지)
  - build: 성공

---

## Phase 2: 드로어 최소화 + 멀티태스킹

- [ ] 2.1 useUIStore: isAIDrawerOpen boolean → aiDrawerState 3-상태로 변경
  - 'open' | 'minimized' | 'closed'
  - 기존 openAIDrawer/closeAIDrawer 시그니처 유지 (하위 호환)
- [ ] 2.2 AIDrawer 헤더에 최소화 버튼 (─ 아이콘) 추가
  - X 버튼 옆에 배치
- [ ] 2.3 최소화 시: 드로어 translate-x-full + body.overflow 복원
- [ ] 2.4 AIFloatingButton: minimized 상태 시 배지 표시
  - 작은 초록 도트 또는 메시지 카운트
- [ ] 2.5 FAB 클릭 동작 변경
  - closed → open (기존)
  - open → minimized (최소화)
  - minimized → open (복원)
- [ ] 2.6 데스크탑: 드로어 열림 시 오버레이 제거 + 본문 너비 축소 (사이드바 모드)
- [ ] 2.7 모바일: 최소화 → 풀스크린 해제, FAB 배지
- [ ] 2.8 빌드 + 린트 확인

---

## Phase 3: 생성 결과 대화 내 수정

- [ ] 3.1 생성 완료 후에도 ChatInput 활성 유지
  - showCreateButton 로직 수정 (generatedTrip이 있어도 입력 가능)
- [ ] 3.2 생성 후 메시지 전송 시 자동 edit 모드 전환
  - generatedTrip이 있으면 mode를 'edit'으로, tripContext를 generatedTrip으로 설정
- [ ] 3.3 Gemini edit 프롬프트 수정
  - replace_trip 방식: 수정된 전체 Trip JSON 반환
  - "변경 요청된 부분만 수정, 나머지 유지" 강조
- [ ] 3.4 API route: edit 응답에서 trip 필드로 전체 Trip 반환
  - 기존 action 필드 대신 trip 필드 사용
- [ ] 3.5 수정 결과 → 새 TripPreviewCard 표시
  - 이전 TripPreviewCard의 저장 버튼 비활성화 (최신만 저장 가능)
- [ ] 3.6 빌드 + 린트 확인
- [ ] 3.7 생성 → 수정 → 재수정 → 저장 E2E 수동 테스트

---

## Phase 4: 기존 여행 수정 (edit 모드 완성)

- [ ] 4.1 HeroSection에 "AI로 수정" 버튼 추가
  - Pencil 아이콘 + 텍스트
- [ ] 4.2 버튼 클릭 → openAIDrawer('edit', tripId)
- [ ] 4.3 edit 모드 시작 시 시스템 메시지 자동 추가
  - "'{trip.title}' 여행을 수정합니다. 수정하고 싶은 부분을 말씀해주세요."
- [ ] 4.4 edit 모드에서 대화 전송 시 tripContext 자동 주입
  - trips.get(tripId)로 최신 데이터 로드
- [ ] 4.5 TripPreviewCard: edit 모드 시 기존 Trip ID 유지
  - 새 ID 생성 대신 tripId 전달
  - "수정 저장하기" 텍스트로 변경
- [ ] 4.6 저장 시 기존 여행 업데이트 (saveTrip → 같은 ID로 덮어쓰기)
- [ ] 4.7 저장 후 상세 페이지 새로고침 (router.refresh 또는 store 갱신)
- [ ] 4.8 빌드 + 린트 확인
- [ ] 4.9 기존 여행 → AI 수정 → 저장 → 반영 E2E 수동 테스트

---

## 완료 후

- [ ] CLAUDE.md 업데이트 (AI 기능 설명 추가)
- [ ] 메모리 업데이트 (프로젝트 상태)
- [ ] Vercel 배포 + QA
