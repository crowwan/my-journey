# 여행 상세 인라인 편집 — 컨텍스트

**최종 갱신**: 2026-03-15 (전 Phase 완료)
**상태**: ✅ Phase 1~4 완료 + 리팩토링 완료

---

## 구현 완료 파일

### 신규 생성
| 파일 | 역할 |
|------|------|
| `src/stores/useEditStore.ts` | 섹션별 편집 상태 (editingSection, editingTrip, 빈 항목 자동 제거) |
| `src/components/viewer/SectionEditHeader.tsx` | 섹션 제목 + 편집/저장/취소 통합 컴포넌트 |
| `src/components/ui/custom-select.tsx` | 커스텀 Select (OS 기본 대체, 이모지 모드) |

### 주요 수정
| 파일 | 변경 |
|------|------|
| `ChecklistTab.tsx` | 체크리스트/사전준비 섹션별 편집 (추가/삭제/수정) |
| `SummaryTab.tsx` | 항공편/숙소 섹션별 편집, mapUrl 필드 추가 |
| `ScheduleTab.tsx` | Day별 타임라인 편집 (시간/제목/설명/타입/뱃지) |
| `GuideTab.tsx` | 맛집/교통/예산 섹션별 편집, ICOCA/팁편집/passVerdict 제거 |
| `TripViewer.tsx` | editingTrip 분기, 탭 전환 시 편집 자동 취소 |
| `HeroSection.tsx` | 전체 "편집" 버튼 제거 (섹션별로 분산) |

### 삭제
| 파일 | 이유 |
|------|------|
| `EditBar.tsx` | 전체 편집 상단 바 → 섹션별로 대체 |

---

## 주요 결정사항

- **섹션별 편집**: 전체 편집 모드 대신 각 섹션 독립 편집
- **탭 전환 시 자동 취소**: 저장 안 한 편집은 폐기
- **빈 항목 자동 제거**: saveSectionEdit에서 전 섹션 정리
- **예산 비율 자동 계산**: 금액에서 숫자 추출 → 합계 대비 비율
- **팁/ICOCA/passVerdict 편집 제거**: 읽기 전용 유지
- **커스텀 Select**: OS 기본 select 대체 (emojiMode 지원)
