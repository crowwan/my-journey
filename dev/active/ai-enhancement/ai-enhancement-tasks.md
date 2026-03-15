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

## Phase 3: 생성 결과 대화 내 수정 ✅

- [x] 3.1 생성 완료 후에도 ChatInput 활성 유지 [2026-03-15]
- [x] 3.2 생성 후 메시지 전송 시 자동 edit 모드 전환 [2026-03-15]
- [x] 3.3 Gemini edit 프롬프트 수정 (replace_trip 방식) [2026-03-15]
- [x] 3.4 API route: edit 응답에서 trip 필드 반환 [2026-03-15]
- [x] 3.5 수정 결과 → 새 TripPreviewCard 표시 + isLatest [2026-03-15]
- [x] 3.6 빌드 + 린트 확인 [2026-03-15]
- [ ] 3.7 생성 → 수정 → 재수정 → 저장 E2E 수동 테스트

---

## Phase 2: Split View + 기존 여행 수정 (Phase 2+4 통합)

### Split View 기반
- [x] 2.1 useUIStore에 `aiViewMode: 'drawer' | 'split'` 추가 [2026-03-15]
  - setAIViewMode, openAISplitView 액션 추가
  - closeAIDrawer 시 aiViewMode를 'drawer'로 복원
- [x] 2.2 AISplitView 컴포넌트 생성 [2026-03-15]
  - 좌측: TripViewer (trip prop) + 헤더(닫기/저장), 우측: ChatContainer
  - 전체 화면 fixed flex 레이아웃 (좌 flex-1, 우 w-[400px])
  - ESC 키 닫기, body 스크롤 방지
- [x] 2.3 TripViewer 스크롤 분리 [2026-03-15]
  - scrollContainerRef prop 추가 (optional RefObject)
  - 있으면 내부 스크롤, 없으면 window.scrollTo (하위 호환)
- [x] 2.4 AIDrawerProvider: generatedTrip 생성 시 Split View 자동 전환 [2026-03-15]
  - useSyncExternalStore로 데스크탑 감지 (린트 호환)
  - 데스크탑(>=640px) + generatedTrip 존재 + drawer 모드 → 자동 split 전환

### 초안 생성 → Split View
- [x] 2.5 초안 생성 완료 → Split View에서 TripViewer 실시간 표시 [2026-03-15]
  - AISplitView에서 useChatStore.generatedTrip 구독 → TripViewer에 전달
- [x] 2.6 수정 대화 → generatedTrip 갱신 → 왼쪽 뷰어 자동 반영 [2026-03-15]
  - generatedTrip 변경 시 TripViewer 자동 리렌더링
- [x] 2.7 Split View 내 저장 버튼 [2026-03-15]
  - 헤더 우측에 Save 아이콘 + "여행 저장하기"/"수정 저장하기" 버튼
  - 저장 → localStorage + Split View 해제 + 상세 페이지 이동
- [x] 2.8 Split View에서 TripPreviewCard 숨김 [2026-03-15]
  - ChatMessage에서 aiViewMode === 'split'이면 tripPreview 미렌더링

### 기존 여행 수정
- [x] 2.9 HeroSection에 "AI로 수정" 버튼 추가 [2026-03-15]
  - 데스크탑: Pencil 아이콘 버튼 (공유 옆)
  - 모바일: 텍스트 버튼 "AI로 수정" (공유 옆)
- [x] 2.10 "AI로 수정" → Split View (edit 모드) 진입 [2026-03-15]
  - openAISplitView('edit', trip.id) 호출
  - 기존 Trip을 좌측 TripViewer + 우측 채팅
- [x] 2.11 edit 시작 시 시스템 메시지 자동 추가 [2026-03-15]
  - clearMessages() 후 addSystemMessage("'{trip.title}' 여행을 수정합니다.")
- [x] 2.12 edit 저장 → 기존 Trip ID 유지 + 덮어쓰기 [2026-03-15]
  - AISplitView의 handleSave에서 generatedTrip ?? existingTrip 저장

### 모바일 + 마무리
- [x] 2.13 모바일(< 640px): Split View 미적용, 기존 드로어 유지 [2026-03-15]
  - AIDrawerProvider에서 useIsDesktop() 체크 → 모바일이면 AIDrawer 유지
- [x] 2.14 빌드 + 린트 확인 [2026-03-15]
  - lint: 0 errors (기존 warning 1개 유지)
  - build: 성공
- [ ] 2.15 E2E 수동 테스트
  - 새 여행: Quick Setup → 초안 → Split View → 수정 → 저장
  - 기존 여행: 상세 → AI 수정 → Split View → 수정 → 저장

---

## 완료 후

- [ ] CLAUDE.md 업데이트 (AI 기능 설명 추가)
- [ ] 메모리 업데이트 (프로젝트 상태)
- [ ] Vercel 배포 + QA
