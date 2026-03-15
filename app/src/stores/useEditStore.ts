// ============================================================
// Edit Store
// 편집 모드 상태 관리 + Trip 복사본으로 안전한 편집
// ============================================================
import { create } from 'zustand';
import type { Trip } from '@/types/trip';
import { useTripStore } from './useTripStore';

interface EditState {
  // 편집 모드 상태
  isEditMode: boolean;
  // 편집 중인 Trip 복사본 (원본 보존)
  editingTrip: Trip | null;

  // 편집 모드 진입: Trip을 깊은 복사하여 복사본으로 작업
  enterEditMode: (trip: Trip) => void;
  // 편집 모드 해제 (상태만 리셋)
  exitEditMode: () => void;
  // 편집 내용 저장: editingTrip → useTripStore.saveTrip + 편집 모드 해제
  saveEdit: () => void;
  // 편집 취소: editingTrip 폐기 + 편집 모드 해제
  cancelEdit: () => void;

  // editingTrip을 업데이트하는 헬퍼
  updateEditingTrip: (updater: (trip: Trip) => Trip) => void;
}

export const useEditStore = create<EditState>((set, get) => ({
  isEditMode: false,
  editingTrip: null,

  enterEditMode: (trip) => {
    // 깊은 복사로 원본 보존
    const deepCopy: Trip = JSON.parse(JSON.stringify(trip));
    set({ isEditMode: true, editingTrip: deepCopy });
  },

  exitEditMode: () => {
    set({ isEditMode: false, editingTrip: null });
  },

  saveEdit: () => {
    const { editingTrip } = get();
    if (editingTrip) {
      // updatedAt 갱신
      const updated = { ...editingTrip, updatedAt: new Date().toISOString() };
      useTripStore.getState().saveTrip(updated);
    }
    set({ isEditMode: false, editingTrip: null });
  },

  cancelEdit: () => {
    set({ isEditMode: false, editingTrip: null });
  },

  updateEditingTrip: (updater) => {
    const { editingTrip } = get();
    if (editingTrip) {
      set({ editingTrip: updater(editingTrip) });
    }
  },
}));
