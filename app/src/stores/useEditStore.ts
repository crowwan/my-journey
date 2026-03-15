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
      // updatedAt 갱신
      const updated = { ...editingTrip, updatedAt: new Date().toISOString() };
      useTripStore.getState().saveTrip(updated);
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
