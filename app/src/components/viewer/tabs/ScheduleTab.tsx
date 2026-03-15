'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Trip, TimelineItem, TimelineItemType } from '@/types/trip';
import { useEditStore } from '@/stores/useEditStore';
import { SectionEditHeader } from '../SectionEditHeader';
import { DayCard } from '../schedule/DayCard';
import { cn } from '@/lib/utils';

interface ScheduleTabProps {
  trip: Trip;
}

// ============================================================
// 편집 모드용 인라인 input 컴포넌트 (SummaryTab과 동일 패턴)
// ============================================================
function InlineInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'bg-transparent border-b border-dashed border-primary/40 outline-none focus:border-primary transition-colors',
        className,
      )}
      placeholder={placeholder}
    />
  );
}

// ============================================================
// 타임라인 아이템 타입 선택 드롭다운
// ============================================================
const TIMELINE_TYPE_OPTIONS: { value: TimelineItemType; label: string }[] = [
  { value: 'spot', label: '관광지' },
  { value: 'food', label: '식사' },
  { value: 'move', label: '이동' },
  { value: 'default', label: '기타' },
];

// ============================================================
// 타임라인 아이템 편집 행
// ============================================================
function TimelineEditRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: TimelineItem;
  onUpdate: (field: keyof TimelineItem, value: string) => void;
  onDelete: () => void;
}) {
  // 타입별 왼쪽 보더 색상
  const borderColor = {
    spot: 'border-l-cat-sightseeing',
    food: 'border-l-cat-food',
    move: 'border-l-cat-transport',
    default: 'border-l-primary',
  }[item.type];

  return (
    <div
      className={cn(
        'bg-surface border border-dashed border-border rounded-lg p-4 mb-2 hover:border-primary/30 transition-all border-l-4',
        borderColor,
      )}
    >
      <div className="flex items-start gap-3">
        {/* 시간 */}
        <InlineInput
          value={item.time}
          onChange={(v) => onUpdate('time', v)}
          className="text-xs font-semibold text-primary w-16 shrink-0"
          placeholder="09:00"
        />

        {/* 제목 + 설명 */}
        <div className="flex-1 min-w-0">
          <InlineInput
            value={item.title}
            onChange={(v) => onUpdate('title', v)}
            className="text-sm font-semibold text-text-primary w-full mb-1"
            placeholder="제목"
          />
          <InlineInput
            value={item.description ?? ''}
            onChange={(v) => onUpdate('description', v)}
            className="text-sm text-text-secondary w-full"
            placeholder="설명 (선택사항)"
          />
        </div>

        {/* 타입 드롭다운 */}
        <select
          value={item.type}
          onChange={(e) => onUpdate('type', e.target.value)}
          className="text-xs bg-bg-secondary border border-border rounded-md px-2 py-1 text-text-primary outline-none focus:border-primary shrink-0"
        >
          {TIMELINE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 삭제 버튼 */}
        <button
          onClick={onDelete}
          className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors shrink-0"
          aria-label="아이템 삭제"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* 뱃지 + 비용 (선택적) */}
      <div className="flex items-center gap-3 mt-2 ml-[4.75rem]">
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-tertiary">뱃지:</span>
          <InlineInput
            value={item.badge ?? ''}
            onChange={(v) => onUpdate('badge', v)}
            className="text-xs text-text-secondary w-24"
            placeholder="없음"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-tertiary">비용:</span>
          <InlineInput
            value={item.cost !== undefined ? String(item.cost) : ''}
            onChange={(v) => onUpdate('cost', v)}
            className="text-xs text-text-secondary w-20"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

export function ScheduleTab({ trip }: ScheduleTabProps) {
  const days = trip.days ?? [];
  const editingSection = useEditStore((s) => s.editingSection);
  const updateEditingTrip = useEditStore((s) => s.updateEditingTrip);

  // Day별 아이템 업데이트
  const handleItemUpdate = (dayIndex: number, itemIndex: number, field: keyof TimelineItem, value: string) => {
    updateEditingTrip((t) => {
      const newDays = t.days.map((day, di) => {
        if (di !== dayIndex) return day;
        const newItems = day.items.map((item, ii) => {
          if (ii !== itemIndex) return item;
          // cost는 숫자로 변환
          if (field === 'cost') {
            const numVal = value === '' ? undefined : Number(value);
            return { ...item, cost: numVal };
          }
          return { ...item, [field]: value };
        });
        return { ...day, items: newItems };
      });
      return { ...t, days: newDays };
    });
  };

  // Day별 아이템 삭제
  const handleItemDelete = (dayIndex: number, itemIndex: number) => {
    updateEditingTrip((t) => {
      const newDays = t.days.map((day, di) => {
        if (di !== dayIndex) return day;
        return { ...day, items: day.items.filter((_, ii) => ii !== itemIndex) };
      });
      return { ...t, days: newDays };
    });
  };

  // Day별 아이템 추가
  const handleItemAdd = (dayIndex: number) => {
    updateEditingTrip((t) => {
      const newItem: TimelineItem = {
        time: '',
        title: '',
        type: 'default',
      };
      const newDays = t.days.map((day, di) => {
        if (di !== dayIndex) return day;
        return { ...day, items: [...day.items, newItem] };
      });
      return { ...t, days: newDays };
    });
  };

  return (
    <div className="animate-fade-up">
      {days.map((day, dayIndex) => {
        const sectionId = `schedule-day-${day.dayNumber}`;
        const isEditing = editingSection === sectionId;

        return (
          <div key={`day-${day.dayNumber ?? dayIndex}`} className="mb-5">
            <SectionEditHeader
              title={`Day ${day.dayNumber}: ${day.title}`}
              section={sectionId}
              trip={trip}
              suffix={
                <span className="text-xs text-text-tertiary font-normal">
                  {day.items.length}개 아이템
                </span>
              }
            />

            {isEditing ? (
              // 편집 모드: 인라인 편집 UI
              <div className="bg-bg-secondary/50 border border-border-light rounded-xl p-4">
                {day.items.map((item, itemIndex) => (
                  <TimelineEditRow
                    key={`edit-item-${itemIndex}`}
                    item={item}
                    onUpdate={(field, value) => handleItemUpdate(dayIndex, itemIndex, field, value)}
                    onDelete={() => handleItemDelete(dayIndex, itemIndex)}
                  />
                ))}
                {/* 아이템 추가 버튼 */}
                <button
                  onClick={() => handleItemAdd(dayIndex)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors"
                >
                  <Plus className="size-4" />
                  아이템 추가
                </button>
              </div>
            ) : (
              // 읽기 모드: 기존 DayCard 그대로
              <DayCard day={day} defaultOpen={dayIndex === 0} />
            )}
          </div>
        );
      })}
    </div>
  );
}
