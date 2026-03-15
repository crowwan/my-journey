# 프로젝트 컨텍스트 & 의존성

**최종 갱신**: 2026-03-14 (여행 상세 UI + 히어로 + 홈 첫 화면 세션 완료)

---

## 현재 상태: 모든 변경 커밋 & 푸시 완료

미커밋 변경 없음. 최신 커밋: `8a046ac`

### 커밋 이력 (이번 세션)
| 커밋 | 내용 |
|------|------|
| `7ea19bc` | 여행 상세 UI 개선 — 팁 아코디언, 섹션 정리, 하드코딩 이모지→아이콘 |
| `72fdf7e` | 이모지→lucide 매핑 유틸 + Day 색상 통일 + Today 칩 |
| `6fa0de1` | 히어로 인라인 헤더 리디자인 + 홈 버튼 이동 |
| `165891a` | 탭 변경 시 즉시 스크롤 상단 이동 |
| `8a046ac` | 홈 첫 화면 개선 — 빈 상태 중앙, 아이콘 정렬, CTA 버튼 강화 |

---

## 이번 세션 주요 결정

### 여행 상세 페이지
1. **팁** → TipsAccordion 접이식 바 (SummaryTab/GuideTab)
2. **섹션 타이틀** → 아이콘 제거, `text-sm font-semibold text-text-secondary` + 구분선
3. **숙소** → 3카드→1카드, 구글맵 링크, 주변역 라벨
4. **맛집** → 구글맵 링크, ExternalLink 아이콘, 가격 하단 고정, Day 간 `space-y-6`
5. **교통** → 집→호텔 좌우 스크롤 카드
6. **패스** → 추천만 색상, 칩 `shrink-0 whitespace-nowrap`, price `text-sm`
7. **가이드 아코디언** → 트리거 아이콘 배경 제거, 폰트 `text-lg`, 콘텐츠 `px-4`

### 이모지 → 아이콘
8. **하드코딩** → lucide 직접 교체 (인사말, 채팅, 스플래시, EmptyState)
9. **동적** → `emoji-to-icon.tsx` 매핑 유틸, 날씨 고유 색상, DayMap 이모지 유지

### Day 색상 + 히어로 + 홈
10. **Day** → 전체 primary, 숫자 박스 제거, Today 칩, 자동 펼침
11. **히어로** → 인라인 헤더 (배경 제거, 좌측 정렬, 2xl, 홈 버튼 포함)
12. **탭 전환** → `scrollTo({ top: 0 })` 즉시 (smooth는 리렌더링 문제)
13. **홈 첫 화면** → 빈 상태 `min-h-[50vh]` 중앙, 아이콘 정렬, CTA 버튼 강화

---

## 핵심 파일 맵

### 홈
| 파일 | 역할 |
|------|------|
| `app/src/app/page.tsx` | 홈 (lucide 아이콘 인사말, 큰 CTA 버튼) |
| `app/src/components/shared/EmptyState.tsx` | 빈 상태 (min-h-[50vh], icon: ReactNode) |
| `app/src/components/shared/HorizontalScroll.tsx` | **미사용, 삭제 필요** |

### 여행 상세 뷰어
| 파일 | 역할 |
|------|------|
| `app/src/components/viewer/TripViewer.tsx` | 뷰어 루트 (탭 전환 + 즉시 스크롤) |
| `app/src/components/viewer/HeroSection.tsx` | 인라인 헤더 (홈 버튼 포함) |
| `app/src/components/viewer/TabBar.tsx` | 4탭 바 |
| `app/src/components/viewer/shared/SectionTitle.tsx` | 텍스트+구분선 |
| `app/src/components/viewer/shared/TipsAccordion.tsx` | 팁 접이식 바 |
| `app/src/components/viewer/schedule/DayCard.tsx` | Day 카드 (Today 칩) |
| `app/src/lib/emoji-to-icon.tsx` | 이모지→lucide 매핑 |

---

## 알려진 이슈
- `page.tsx:31` — ESLint 경고: useEffect 내 setState
- `HorizontalScroll.tsx` — 미사용, 삭제 필요
- DayMap 마커 — 이모지 유지

---

## 다음 즉시 단계
1. Vercel 배포 확인 (시각적 QA)
2. 모바일 반응형 확인 (640px 이하)
3. CLAUDE.md 업데이트
4. HorizontalScroll.tsx 삭제
5. page.tsx ESLint 경고 수정

---

## 배포
- **웹**: `git push origin main` → Vercel 자동배포
- **URL**: `https://my-journey-planner.vercel.app`
