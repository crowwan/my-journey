// ============================================================
// Edit Store
// 섹션별 편집 상태 관리 + Trip 복사본으로 안전한 편집
// ============================================================
import { create } from 'zustand';
import type { Trip } from '@/types/trip';
import { useTripStore } from './useTripStore';

interface EditState {
  // 현재 편집 중인 섹션 식별자 (null이면 편집 안 함)
  editingSection: string | null;
  // 편집 중인 Trip 복사본 (원본 보존)
  editingTrip: Trip | null;

  // 섹션 편집 시작: Trip을 깊은 복사하여 복사본으로 작업
  startSectionEdit: (section: string, trip: Trip) => void;
  // 섹션 편집 취소: editingTrip 폐기 + 편집 상태 해제
  cancelSectionEdit: () => void;
  // 섹션 편집 저장: editingTrip -> useTripStore.saveTrip + 편집 상태 해제
  saveSectionEdit: () => void;

  // 특정 섹션이 편집 중인지 확인하는 헬퍼
  isEditingSection: (section: string) => boolean;

  // editingTrip을 업데이트하는 헬퍼
  updateEditingTrip: (updater: (trip: Trip) => Trip) => void;
}

export const useEditStore = create<EditState>((set, get) => ({
  editingSection: null,
  editingTrip: null,

  startSectionEdit: (section, trip) => {
    // 깊은 복사로 원본 보존
    const deepCopy: Trip = JSON.parse(JSON.stringify(trip));
    set({ editingSection: section, editingTrip: deepCopy });
  },

  cancelSectionEdit: () => {
    set({ editingSection: null, editingTrip: null });
  },

  saveSectionEdit: () => {
    const { editingTrip } = get();
    if (editingTrip) {
      // 빈 항목 자동 제거 (저장 전 정리)
      const cleaned: Trip = {
        ...editingTrip,
        // 일정: 빈 제목 아이템 제거
        days: editingTrip.days.map((day) => ({
          ...day,
          items: day.items.filter((item) => item.title.trim() !== ''),
        })),
        // 맛집: 빈 이름 제거
        restaurants: editingTrip.restaurants.filter((r) => r.name.trim() !== ''),
        // 체크리스트: 빈 이름 아이템 제거 (카테고리는 유지)
        packing: editingTrip.packing.map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => item.name.trim() !== ''),
        })),
        // 사전 준비: 빈 제목 제거
        preTodos: editingTrip.preTodos.filter((t) => t.title.trim() !== ''),
        // 예산: 빈 라벨 제거 + 비율 자동 재계산
        budget: (() => {
          const validItems = editingTrip.budget.items.filter((item) => item.label.trim() !== '');
          // 금액에서 숫자 추출 (¥3,000 → 3000)
          const amounts = validItems.map((item) => {
            const num = parseFloat(item.amount.replace(/[^0-9.]/g, ''));
            return isNaN(num) ? 0 : num;
          });
          const total = amounts.reduce((sum, n) => sum + n, 0);
          const itemsWithPercentage = validItems.map((item, i) => ({
            ...item,
            percentage: total > 0 ? Math.round((amounts[i] / total) * 100) : 0,
          }));
          return { ...editingTrip.budget, items: itemsWithPercentage };
        })(),
        // 교통: 빈 제목 단계 제거
        transport: {
          ...editingTrip.transport,
          homeToHotel: editingTrip.transport.homeToHotel.filter((s) => s.title.trim() !== ''),
          intercityRoutes: editingTrip.transport.intercityRoutes.filter((r) => r.from.trim() !== '' || r.to.trim() !== ''),
          passes: editingTrip.transport.passes.filter((p) => p.name.trim() !== ''),
        },
        // 항공편: 빈 출발지 제거 + 숙소 빈 역 제거
        overview: {
          ...editingTrip.overview,
          flights: editingTrip.overview.flights.filter((f) => f.departure.trim() !== '' || f.arrival.trim() !== ''),
          accommodation: editingTrip.overview.accommodation
            ? {
                ...editingTrip.overview.accommodation,
                nearbyStations: (editingTrip.overview.accommodation.nearbyStations ?? []).filter((s) => s.trim() !== ''),
              }
            : editingTrip.overview.accommodation,
        },
        updatedAt: new Date().toISOString(),
      };
      useTripStore.getState().saveTrip(cleaned);
    }
    set({ editingSection: null, editingTrip: null });
  },

  isEditingSection: (section) => {
    return get().editingSection === section;
  },

  updateEditingTrip: (updater) => {
    const { editingTrip } = get();
    if (editingTrip) {
      set({ editingTrip: updater(editingTrip) });
    }
  },
}));
