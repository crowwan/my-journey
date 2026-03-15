# 여행 상세 인라인 편집 — 컨텍스트

**최종 갱신**: 2026-03-15

---

## 관련 파일

### 수정 대상 (뷰어 탭)
| 파일 | 편집 대상 |
|------|----------|
| `src/components/viewer/tabs/SummaryTab.tsx` | 항공편, 숙소 |
| `src/components/viewer/tabs/ScheduleTab.tsx` | 타임라인 아이템 |
| `src/components/viewer/tabs/GuideTab.tsx` | 맛집, 교통, 예산 |
| `src/components/viewer/tabs/ChecklistTab.tsx` | 체크리스트, 사전 준비 |
| `src/components/viewer/HeroSection.tsx` | 편집 버튼 추가 |

### 신규 생성 예정
| 파일 | 역할 |
|------|------|
| `src/stores/useEditStore.ts` | 편집 모드 상태, Trip 복사본 관리 |
| `src/components/viewer/EditBar.tsx` | 편집 모드 상단 저장/취소 바 |

### 데이터
| 파일 | 역할 |
|------|------|
| `src/stores/useTripStore.ts` | saveTrip (저장 시 호출) |
| `src/types/trip.ts` | Trip 타입 (편집 대상 필드) |
