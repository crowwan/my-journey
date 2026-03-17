'use client';

import { useCallback } from 'react';
import { PenLine, Save, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Trip } from '@/types/trip';
import { useEditStore } from '@/stores/useEditStore';
import { useSaveTrip } from '@/queries/useTrips';
import { cn } from '@/lib/utils';
import { useViewerContext } from './ViewerContext';

interface SectionEditHeaderProps {
  title: string;
  icon?: ReactNode;
  section: string;
  trip: Trip;
  // 제목 옆에 추가로 표시할 내용 (예: 카운터)
  suffix?: ReactNode;
}

// 섹션 제목 + 편집/저장/취소 버튼 통합 컴포넌트
// readOnly는 ViewerContext에서 자동으로 감지
export function SectionEditHeader({ title, icon, section, trip, suffix }: SectionEditHeaderProps) {
  const { readOnly } = useViewerContext();
  const editingSection = useEditStore((s) => s.editingSection);
  const startSectionEdit = useEditStore((s) => s.startSectionEdit);
  const saveSectionEdit = useEditStore((s) => s.saveSectionEdit);
  const cancelSectionEdit = useEditStore((s) => s.cancelSectionEdit);
  const saveTripMutation = useSaveTrip();

  const isEditing = editingSection === section;
  // 다른 섹션이 편집 중이면 이 섹션의 편집 버튼 비활성화
  const isOtherEditing = editingSection !== null && editingSection !== section;

  // 저장 버튼 클릭: cleaned Trip을 받아 mutation으로 저장
  const handleSave = useCallback(() => {
    const cleaned = saveSectionEdit();
    if (cleaned) {
      saveTripMutation.mutate(cleaned);
    }
  }, [saveSectionEdit, saveTripMutation]);

  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      {/* 아이콘 (있으면) */}
      {icon && <span className="text-text-secondary shrink-0">{icon}</span>}
      {/* 제목 */}
      <span className="text-sm font-semibold text-text-secondary">{title}</span>
      {/* 접미사 (카운터 등) — 편집 중이 아닐 때만 */}
      {!isEditing && suffix}
      {/* 구분선 */}
      <span className="flex-1 h-px bg-border-light" />

      {/* readOnly 모드에서는 편집 버튼 숨김 */}
      {!readOnly && (
        isEditing ? (
          // 편집 모드: 저장 + 취소 버튼
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={cancelSectionEdit}
              className="flex items-center gap-1 text-xs text-text-secondary border border-border rounded-md px-3 py-1.5 hover:bg-bg-tertiary hover:text-text-primary transition-colors"
            >
              <X className="size-3.5" />
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs text-white bg-primary-500 rounded-md px-3 py-1.5 hover:bg-primary-600 transition-colors"
            >
              <Save className="size-3.5" />
              저장
            </button>
          </div>
        ) : (
          // 읽기 모드: 편집 아이콘 버튼
          <button
            onClick={() => startSectionEdit(section, trip)}
            disabled={isOtherEditing}
            className={cn(
              'shrink-0 p-1.5 rounded-md transition-colors',
              isOtherEditing
                ? 'text-text-tertiary cursor-not-allowed'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
            )}
            aria-label={`${title} 편집`}
          >
            <PenLine className="size-3.5" />
          </button>
        )
      )}
    </div>
  );
}
