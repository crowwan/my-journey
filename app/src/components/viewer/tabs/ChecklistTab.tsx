'use client';

import { useState } from 'react';
import { Luggage, CheckCircle, Plus, Minus, Trash2 } from 'lucide-react';
import type { Trip, PackingEntry, PreTodoItem } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { useEditStore } from '@/stores/useEditStore';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { EmojiIcon } from '@/lib/emoji-to-icon';
import { calculatePackingProgress } from '@/domain/trip';
import { SectionEditHeader } from '../SectionEditHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChecklistTabProps {
  trip: Trip;
}

// ============================================================
// 편집 모드용 인라인 input 컴포넌트
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
// 새 항목 추가 input (Enter로 확정)
// ============================================================
function AddItemInput({
  onAdd,
  placeholder,
}: {
  onAdd: (value: string) => void;
  placeholder: string;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
    }
  };

  return (
    <div className="flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-primary/30 bg-primary-50/30">
      <Plus className="size-4 text-primary shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit();
        }}
        onBlur={handleSubmit}
        className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
        placeholder={placeholder}
      />
    </div>
  );
}

export function ChecklistTab({ trip }: ChecklistTabProps) {
  const { packing, preTodos, id: tripId } = trip;
  const { data: user } = useAuth();
  const togglePackingItem = useTripStore((state) => state.togglePackingItem);
  // packingVersion 구독으로 체크 토글 시 리렌더링 트리거
  useTripStore((state) => state.packingVersion);
  const editingSection = useEditStore((s) => s.editingSection);
  const updateEditingTrip = useEditStore((s) => s.updateEditingTrip);
  const checked = storage.getPackingChecked(tripId);

  // 섹션별 편집 상태 확인
  const isPackingEdit = editingSection === 'packing';
  const isPreTodosEdit = editingSection === 'preTodos';

  // 전체 진행률 계산 (준비물 체크 항목)
  const { total: totalItems, checked: totalChecked, percentage } = calculatePackingProgress(packing, checked);

  const hasPacking = packing && packing.length > 0;
  const hasPreTodos = preTodos && preTodos.length > 0;

  // ============================================================
  // 편집 헬퍼: 체크리스트 항목
  // ============================================================

  // 체크리스트 항목 이름 수정
  const handlePackingItemRename = (categoryIndex: number, itemIndex: number, newName: string) => {
    updateEditingTrip((t) => {
      const newPacking = t.packing.map((cat, ci) => {
        if (ci !== categoryIndex) return cat;
        return {
          ...cat,
          items: cat.items.map((item, ii) =>
            ii === itemIndex ? { ...item, name: newName } : item,
          ),
        };
      });
      return { ...t, packing: newPacking };
    });
  };

  // 체크리스트 항목 추가
  const handlePackingItemAdd = (categoryIndex: number, name: string) => {
    updateEditingTrip((t) => {
      const newPacking = t.packing.map((cat, ci) => {
        if (ci !== categoryIndex) return cat;
        const newEntry: PackingEntry = { name, checked: false };
        return { ...cat, items: [...cat.items, newEntry] };
      });
      return { ...t, packing: newPacking };
    });
  };

  // 체크리스트 항목 삭제
  const handlePackingItemDelete = (categoryIndex: number, itemIndex: number) => {
    updateEditingTrip((t) => {
      const newPacking = t.packing.map((cat, ci) => {
        if (ci !== categoryIndex) return cat;
        return {
          ...cat,
          items: cat.items.filter((_, ii) => ii !== itemIndex),
        };
      });
      return { ...t, packing: newPacking };
    });
  };

  // ============================================================
  // 편집 헬퍼: 사전 준비 항목
  // ============================================================

  // 사전 준비 항목 수정 (title 또는 description)
  const handlePreTodoUpdate = (index: number, field: 'title' | 'description', value: string) => {
    updateEditingTrip((t) => {
      const newPreTodos = t.preTodos.map((todo, i) =>
        i === index ? { ...todo, [field]: value } : todo,
      );
      return { ...t, preTodos: newPreTodos };
    });
  };

  // 사전 준비 항목 추가
  const handlePreTodoAdd = () => {
    updateEditingTrip((t) => {
      const nextOrder = t.preTodos.length > 0
        ? Math.max(...t.preTodos.map((td) => td.order)) + 1
        : 1;
      const newTodo: PreTodoItem = {
        order: nextOrder,
        title: '새 항목',
        description: '',
      };
      return { ...t, preTodos: [...t.preTodos, newTodo] };
    });
  };

  // 사전 준비 항목 삭제
  const handlePreTodoDelete = (index: number) => {
    updateEditingTrip((t) => {
      const newPreTodos = t.preTodos
        .filter((_, i) => i !== index)
        // order 재정렬
        .map((todo, i) => ({ ...todo, order: i + 1 }));
      return { ...t, preTodos: newPreTodos };
    });
  };

  // 아무 데이터도 없고 편집 모드도 아닌 경우 빈 상태
  if (!hasPacking && !hasPreTodos && !isPackingEdit && !isPreTodosEdit) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <CheckCircle className="size-8 mx-auto mb-2 text-text-tertiary" />
          <p className="text-sm">체크리스트 정보가 아직 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* 전체 진행률 바 -- 편집 모드에서는 숨김 */}
      {!isPackingEdit && totalItems > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">준비 진행률</span>
            <span className="text-sm font-bold text-primary">{totalChecked}/{totalItems} ({percentage}%)</span>
          </div>
          <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* 준비물 섹션 */}
      {(hasPacking || isPackingEdit) && (
        <div className="mb-8">
          <SectionEditHeader
            title="준비물"
            icon={<Luggage className="size-4" />}
            section="packing"
            trip={trip}
            suffix={
              <span className="text-sm font-normal text-text-secondary ml-2">
                ({totalChecked}/{totalItems})
              </span>
            }
          />

          {packing.map((category, categoryIndex) => {
            const checkedItems = checked[category.category] ?? [];
            const catTotal = category.items.length;
            const catChecked = category.items.filter((item) =>
              checkedItems.includes(item.name)
            ).length;

            return (
              <div key={category.category} className="mb-4">
                {/* 카테고리 헤더 */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <EmojiIcon emoji={category.categoryIcon} size={16} className="text-text-secondary" />
                  <span className="text-sm font-semibold text-text-primary">{category.category}</span>
                  {!isPackingEdit && (
                    <span className="text-xs text-text-tertiary">({catChecked}/{catTotal})</span>
                  )}
                </div>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => {
                    const isChecked = checkedItems.includes(item.name);

                    // 편집 모드: 인라인 수정 + 삭제 버튼
                    if (isPackingEdit) {
                      return (
                        <div
                          key={`${category.category}-${itemIndex}`}
                          className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-surface border border-dashed border-border hover:border-primary/30 transition-all"
                        >
                          <div className="flex-1">
                            <InlineInput
                              value={item.name}
                              onChange={(val) => handlePackingItemRename(categoryIndex, itemIndex, val)}
                              className="text-sm font-medium text-text-primary w-full"
                              placeholder="항목 이름"
                            />
                          </div>
                          <button
                            onClick={() => handlePackingItemDelete(categoryIndex, itemIndex)}
                            className="shrink-0 p-1 text-error hover:bg-error/10 rounded transition-colors"
                            aria-label="항목 삭제"
                          >
                            <Minus className="size-4" />
                          </button>
                        </div>
                      );
                    }

                    // 읽기 모드: 기존 체크리스트 동작
                    return (
                      <div
                        key={item.name}
                        onClick={() => togglePackingItem(tripId, category.category, item.name, user?.id)}
                        className={cn(
                          'flex items-center gap-3 px-5 py-3.5 rounded-xl cursor-pointer transition-all',
                          isChecked
                            ? 'bg-primary-50 border border-primary/20'
                            : 'bg-surface border border-border-light hover:border-border shadow-sm'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          className={cn(
                            'pointer-events-none',
                            isChecked && 'data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                          )}
                          tabIndex={-1}
                        />
                        <div className="flex-1">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              isChecked ? 'text-text-secondary line-through' : 'text-text-primary'
                            )}
                          >
                            {item.name}
                          </span>
                          {item.note && (
                            <span className="text-xs text-text-tertiary ml-2">{item.note}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 편집 모드: 항목 추가 input */}
                  {isPackingEdit && (
                    <AddItemInput
                      onAdd={(name) => handlePackingItemAdd(categoryIndex, name)}
                      placeholder="항목 추가 (Enter로 확정)"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 사전 할 일 섹션 */}
      {(hasPreTodos || isPreTodosEdit) && (
        <div>
          <SectionEditHeader
            title="출발 전 할 일"
            icon={<CheckCircle className="size-4" />}
            section="preTodos"
            trip={trip}
          />
          <div className="space-y-3">
            {preTodos.map((todo, index) => (
              <Card
                key={`pretodo-${index}`}
                className={cn(
                  'rounded-xl py-0 gap-0 shadow-sm transition-shadow',
                  isPreTodosEdit
                    ? 'border-dashed border-border hover:border-primary/30'
                    : 'border-border-light hover:shadow-md'
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {/* 번호 뱃지 */}
                    <Badge
                      variant="secondary"
                      className="w-8 h-8 rounded-lg bg-primary-50 text-sm font-bold text-primary shrink-0 p-0"
                    >
                      {todo.order}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      {isPreTodosEdit ? (
                        <>
                          <InlineInput
                            value={todo.title}
                            onChange={(val) => handlePreTodoUpdate(index, 'title', val)}
                            className="text-sm font-bold text-text-primary w-full mb-1"
                            placeholder="제목"
                          />
                          <InlineInput
                            value={todo.description}
                            onChange={(val) => handlePreTodoUpdate(index, 'description', val)}
                            className="text-sm text-text-secondary w-full leading-relaxed"
                            placeholder="설명"
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="text-sm font-bold text-text-primary mb-1">{todo.title}</h4>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {todo.description}
                          </p>
                        </>
                      )}
                    </div>
                    {/* 편집 모드: 삭제 버튼 */}
                    {isPreTodosEdit && (
                      <button
                        onClick={() => handlePreTodoDelete(index)}
                        className="shrink-0 p-1 text-error hover:bg-error/10 rounded transition-colors"
                        aria-label="항목 삭제"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 편집 모드: 사전 준비 항목 추가 버튼 */}
            {isPreTodosEdit && (
              <button
                onClick={handlePreTodoAdd}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors"
              >
                <Plus className="size-4" />
                항목 추가
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
