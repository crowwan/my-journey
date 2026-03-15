# 여행 상세 인라인 편집 — 작업 체크리스트

**최종 갱신**: 2026-03-15

---

## Phase 1: 편집 모드 기반 + 체크리스트/사전준비

- [x] 1.1 useEditStore 생성 (isEditMode, editingTrip, enter/exit/save/cancel) [2026-03-15]
- [x] 1.2 HeroSection에 "편집" 토글 버튼 추가 (PenLine 아이콘, 편집 중 비활성) [2026-03-15]
- [x] 1.3 편집 모드 시 상단 저장/취소 바 표시 (EditBar 컴포넌트) [2026-03-15]
- [x] 1.4 체크리스트 항목 추가 (+ 버튼 → 인라인 input, Enter로 확정) [2026-03-15]
- [x] 1.5 체크리스트 항목 삭제 (- 버튼, Minus 아이콘) [2026-03-15]
- [x] 1.6 체크리스트 항목 이름 수정 (인라인 input, border-dashed) [2026-03-15]
- [x] 1.7 사전 준비 항목 추가/삭제/수정 (title, description 인라인 편집) [2026-03-15]
- [x] 1.8 저장/취소 동작 검증 (saveEdit → useTripStore.saveTrip + updatedAt 갱신) [2026-03-15]
- [x] 1.9 빌드 + 린트 확인 (0 errors, 빌드 성공) [2026-03-15]

### Phase 1 리팩토링: 전체 편집 → 섹션별 편집

- [x] 1.R1 useEditStore: `isEditMode` → `editingSection: string | null` 방식으로 변경 [2026-03-15]
- [x] 1.R2 SectionEditHeader 컴포넌트 생성 (제목 + 편집/저장/취소 버튼 통합) [2026-03-15]
- [x] 1.R3 HeroSection "편집" 버튼 제거, AI 버튼은 섹션 편집 중 비활성화 [2026-03-15]
- [x] 1.R4 EditBar 컴포넌트 삭제 [2026-03-15]
- [x] 1.R5 TripViewer: EditBar 제거, editingSection 기반 editingTrip 분기 [2026-03-15]
- [x] 1.R6 ChecklistTab: isEditMode prop 제거, SectionEditHeader 적용 (packing/preTodos 독립 편집) [2026-03-15]
- [x] 1.R7 빌드 + 린트 확인 (0 errors, 빌드 성공) [2026-03-15]

---

## Phase 2: 항공편 + 숙소

- [x] 2.1 항공편 인라인 편집 (시간, 출발지, 도착지, 날짜) [2026-03-15]
- [x] 2.2 항공편 추가/삭제 [2026-03-15]
- [x] 2.3 숙소 정보 인라인 편집 (이름, 주소, 지역, 근처 역) [2026-03-15]
- [x] 2.4 빌드 + 린트 확인 [2026-03-15]

---

## Phase 3: 일정 + 맛집

- [x] 3.1 타임라인 아이템 인라인 편집 (시간, 제목, 설명, type + badge, cost) [2026-03-15]
- [x] 3.2 타임라인 아이템 추가/삭제 [2026-03-15]
- [x] 3.3 맛집 인라인 편집 (이름, 설명, 가격대, 카테고리, 평점, dayNumber) [2026-03-15]
- [x] 3.4 맛집 추가/삭제 [2026-03-15]
- [x] 3.5 빌드 + 린트 확인 (0 errors, 0 warnings, 빌드 성공) [2026-03-15]

---

## Phase 4: 예산 + 교통

- [x] 4.1 예산 항목 편집 + 추가/삭제 [2026-03-15]
  - ✅ BudgetEditCard: icon, label, detail, amount, percentage, color 인라인 편집
  - ✅ 예산 항목 추가/삭제
  - ✅ total (min, max, minKRW, maxKRW) 편집
  - ✅ 예산 팁 수정/삭제/추가
- [x] 4.2 교통 편집 (homeToHotel + intercityRoutes + passes + ICOCA + tips) [2026-03-15]
  - ✅ TransportStepEditCard: homeToHotel 단계 icon/title/subtitle 편집 + 추가/삭제
  - ✅ RouteEditCard: 도시간 노선 편집 + 추가/삭제
  - ✅ PassEditCard: 패스 비교 편집 + 추가/삭제 (추천도 select)
  - ✅ passVerdict 편집
  - ✅ ICOCA 가이드 수정/삭제/추가
  - ✅ 교통 팁 수정/삭제/추가
- [x] 4.3 빌드 + 린트 확인 (0 errors, 빌드 성공) [2026-03-15]
  - 📝 Accordion → SectionEditHeader 방식으로 전환 (교통/예산 모두)

---

## 완료 후

- [ ] CLAUDE.md 업데이트
- [ ] E2E 수동 테스트
