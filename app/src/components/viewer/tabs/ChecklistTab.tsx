'use client';

import type { PackingItem, PreTodoItem } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { SectionTitle } from '../shared/SectionTitle';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChecklistTabProps {
  tripId: string;
  packing: PackingItem[];
  preTodos: PreTodoItem[];
}

export function ChecklistTab({ tripId, packing, preTodos }: ChecklistTabProps) {
  const togglePackingItem = useTripStore((state) => state.togglePackingItem);
  const checked = storage.getPackingChecked(tripId);

  // 전체 진행률 계산 (준비물 체크 항목)
  const packingTotal = (packing ?? []).reduce((sum, cat) => sum + cat.items.length, 0);
  const packingChecked = (packing ?? []).reduce((sum, cat) => {
    const categoryChecked = checked[cat.category] ?? [];
    return sum + cat.items.filter((item) => categoryChecked.includes(item.name)).length;
  }, 0);

  const totalItems = packingTotal;
  const totalChecked = packingChecked;
  const percentage = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  const hasPacking = packing && packing.length > 0;
  const hasPreTodos = preTodos && preTodos.length > 0;

  // 둘 다 빈 상태
  if (!hasPacking && !hasPreTodos) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-sm">체크리스트 정보가 아직 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* 전체 진행률 바 */}
      {totalItems > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">준비 진행률</span>
            <span className="text-sm font-bold text-primary">{totalChecked}/{totalItems} ({percentage}%)</span>
          </div>
          <div className="h-3 bg-overlay-light rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-cat-sightseeing transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* 준비물 섹션 */}
      {hasPacking && (
        <div className="mb-8">
          <SectionTitle icon="🧳" bgColor="#a78bfa">
            준비물
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({packingChecked}/{packingTotal})
            </span>
          </SectionTitle>

          {packing.map((category) => {
            const checkedItems = checked[category.category] ?? [];
            const catTotal = category.items.length;
            const catChecked = category.items.filter((item) =>
              checkedItems.includes(item.name)
            ).length;

            return (
              <div key={category.category} className="mb-4">
                {/* 카테고리 헤더 */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span>{category.categoryIcon}</span>
                  <span className="text-sm font-semibold text-text-primary">{category.category}</span>
                  <span className="text-xs text-text-tertiary">({catChecked}/{catTotal})</span>
                </div>
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const isChecked = checkedItems.includes(item.name);
                    return (
                      <div
                        key={item.name}
                        onClick={() => togglePackingItem(tripId, category.category, item.name)}
                        className={cn(
                          'flex items-center gap-3 px-5 py-3.5 rounded-xl cursor-pointer transition-all',
                          isChecked
                            ? 'bg-cat-sightseeing/10 border border-cat-sightseeing/20'
                            : 'bg-surface border border-border hover:border-border'
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          className={cn(
                            'pointer-events-none',
                            isChecked && 'data-[state=checked]:bg-cat-sightseeing data-[state=checked]:border-cat-sightseeing'
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 사전 할 일 섹션 */}
      {hasPreTodos && (
        <div>
          <SectionTitle icon="✅" bgColor="#10b981">
            출발 전 할 일
          </SectionTitle>
          <div className="space-y-4">
            {preTodos.map((todo) => (
              <Card
                key={todo.order}
                className="rounded-xl py-0 gap-0 hover:border-cat-sightseeing/30 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    {/* 번호 뱃지 */}
                    <Badge
                      variant="secondary"
                      className="w-8 h-8 rounded-lg bg-cat-sightseeing/20 text-sm font-black text-cat-sightseeing shrink-0 p-0"
                    >
                      {todo.order}
                    </Badge>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary mb-1">{todo.title}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {todo.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
