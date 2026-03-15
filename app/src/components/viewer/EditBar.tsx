'use client';

import { Save, X } from 'lucide-react';
import { useEditStore } from '@/stores/useEditStore';

// 편집 모드 시 상단에 고정 표시되는 저장/취소 바
export function EditBar() {
  const saveEdit = useEditStore((s) => s.saveEdit);
  const cancelEdit = useEditStore((s) => s.cancelEdit);

  return (
    <div className="sticky top-0 z-40 bg-primary-50 border-b border-primary/20">
      <div className="max-w-[1100px] mx-auto px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary-700">
          편집 모드
        </span>
        <div className="flex items-center gap-2">
          {/* 취소 버튼 */}
          <button
            onClick={cancelEdit}
            className="flex items-center gap-1.5 text-sm text-text-secondary border border-border rounded-md px-4 py-2 hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          >
            <X className="size-4" />
            취소
          </button>
          {/* 저장 버튼 */}
          <button
            onClick={saveEdit}
            className="flex items-center gap-1.5 text-sm text-white bg-primary-500 rounded-md px-4 py-2 hover:bg-primary-600 transition-colors"
          >
            <Save className="size-4" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
