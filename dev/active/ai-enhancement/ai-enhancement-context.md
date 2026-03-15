# AI 기능 고도화 — 컨텍스트

**최종 갱신**: 2026-03-15 (세션 종료 시점)

---

## 현재 구현 상태

### ✅ 완료된 Phase

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | Quick Setup 폼 + 세션 영속화 | ✅ 완료 |
| Phase 3 | 생성 결과 대화 내 수정 (replace_trip) | ✅ 완료 |
| Phase 2 | Split View + 기존 여행 수정 | ✅ 구현 완료 (E2E 테스트 미완) |

### 미완료 항목
- 1.9: 드로어 닫았다 열었을 때 대화 복원 수동 테스트
- 3.7: 생성 → 수정 → 재수정 → 저장 E2E 수동 테스트
- 2.15: Split View E2E 수동 테스트
- CLAUDE.md 업데이트
- 메모리 업데이트
- Vercel 배포 QA

---

## 이번 세션에서 수정된 파일 (2026-03-15)

### 신규 생성
| 파일 | 역할 |
|------|------|
| `src/components/chat/QuickSetupForm.tsx` | 목적지/출발일/귀국일/인원 입력 폼 → 프롬프트 조립 → 바로 create |
| `src/components/ai/AISplitView.tsx` | Split View (좌 TripViewer + 우 ChatContainer), 저장/닫기 헤더 |

### 주요 수정
| 파일 | 변경 내용 |
|------|----------|
| `src/stores/useChatStore.ts` | zustand persist + sessionStorage, skipHydration:true, quickSetupSkipped 상태, action 필드 제거 |
| `src/stores/useUIStore.ts` | aiViewMode('drawer'\|'split'), setAIViewMode, openAISplitView 추가 |
| `src/components/ai/AIDrawerProvider.tsx` | useSyncExternalStore 데스크탑 감지, generatedTrip 시 자동 Split View 전환, clearMessages 제거 |
| `src/components/ai/AIDrawer.tsx` | handleClose에서 clearMessages() 제거 |
| `src/components/chat/ChatContainer.tsx` | Quick Setup/자유채팅/edit 3분기 빈 상태, 새 대화 버튼(Split View시 숨김), rehydrate() 호출 |
| `src/components/chat/ChatMessage.tsx` | isLatestPreview prop, Split View시 TripPreviewCard 숨김 |
| `src/components/chat/TripPreviewCard.tsx` | isLatest prop, "초안 보기" 풀스크린 모달 (모바일용) |
| `src/components/chat/ChatInput.tsx` | CSS 기반 높이 자동 조절 (invisible div 방식), scrollbar-hide |
| `src/components/viewer/TripViewer.tsx` | scrollContainerRef optional prop (Split View 내부 스크롤 대응) |
| `src/components/viewer/HeroSection.tsx` | "AI로 수정" 버튼 추가 → openAISplitView('edit', tripId) |
| `src/api/gemini.ts` | EDIT_TRIP_PROMPT → getEditTripPrompt() 함수, replace_trip 방식, editTrip 반환타입 변경 |
| `src/app/page.tsx` | useState lazy initializer → useEffect 복원 (하이드레이션 수정), eslint block disable |
| `src/app/trips/[tripId]/page.tsx` | useState+useEffect → useMemo 변환 |

### 삭제
| 파일 | 이유 |
|------|------|
| `src/components/shared/HorizontalScroll.tsx` | 미사용 컴포넌트 |

---

## 주요 결정사항

### D1: 세션 저장소 — sessionStorage
- 탭 닫으면 자연 초기화, localStorage는 과도

### D2: edit 모드 — replace_trip (전체 재생성)
- 부분 merge 복잡도 회피, create와 동일한 스키마 재활용
- gemini.ts의 editTrip이 trip 필드 반환 (기존 action 대신)
- 기존 Trip ID + createdAt 유지

### D3: Split View (드로어 최소화 대체)
- 데스크탑: 좌 TripViewer + 우 ChatContainer (fixed flex)
- 모바일: 기존 드로어 유지 + TripPreviewCard에 "초안 보기" 풀스크린 모달
- AIDrawerProvider에서 useSyncExternalStore로 데스크탑 감지 (640px 기준)

### D4: Quick Setup → 바로 create
- 폼에서 기본 정보 수집 → 프롬프트 조립 → sendMessage(text, 'create')
- 날짜: date input 2개 (출발일 + 귀국일), 기간 자동 계산
- "건너뛰기" → 자유 채팅 모드

### D5: ChatInput 높이 조절 — CSS invisible div 방식
- JS adjustHeight 대신 invisible div가 콘텐츠 높이 결정
- textarea는 absolute로 div 위에 배치
- min-h-[40px], max-h-[120px], scrollbar-hide

### D6: SSR 하이드레이션 안전
- useChatStore: skipHydration:true + ChatContainer에서 수동 rehydrate()
- page.tsx showSplash: useEffect에서 sessionStorage 확인 (eslint block disable)

---

## 해결한 버그

1. **하이드레이션 에러**: useState lazy initializer의 `typeof window` 분기 → 서버/클라이언트 불일치 → useEffect 복원
2. **ChatInput 스크롤 노출**: textarea py 패딩 + border-radius → overflow-hidden + invisible div 방식으로 해결
3. **Split View 헤더 높이 불일치**: ChatContainer "새 대화" 바가 추가 높이 → Split View시 숨김 + 양쪽 h-[49px] 고정

---

## 커밋 히스토리 (이번 세션)

| 커밋 | 내용 |
|------|------|
| `12003fd` | 미사용 컴포넌트 삭제 + ESLint 수정 |
| `774c203` | Quick Setup 폼 + 세션 영속화 (Phase 1) |
| `2bb750b` | SSR 하이드레이션 에러 수정 |
| `a7d11e6` | 생성 결과 대화 내 수정 (Phase 3) |
| `077ee23` | Split View 구현 (Phase 2) |
| `531616d` | ChatInput 높이 자동 조절 개선 |
| `df9b19c` | 모바일 초안 보기 + ChatInput 스크롤바 숨김 |
| `4c8174b` | Split View 헤더 높이 통일 + 새 대화 버튼 통합 |

---

## 다음 작업 (우선순위순)

1. **E2E 수동 테스트** — Vercel 배포 후 전체 흐름 확인
   - Quick Setup → 생성 → Split View → 수정 → 저장
   - 기존 여행 → AI 수정 → Split View → 수정 → 저장
   - 모바일: 드로어 → 생성 → 초안 보기 → 저장
   - 세션 영속화: 드로어 닫기 → 열기 → 대화 복원
2. **국내 여행 대응** — Gemini 프롬프트에 국내 여행 가이드 추가, 항공편 없을 때 "정보 없음" 대신 섹션 숨김
3. **Phase 2 (드로어 최소화)** — 필요 시 추후 구현 (현재 Split View로 대체)
4. **CLAUDE.md 업데이트** — AI 기능 설명 추가
