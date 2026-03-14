'use client';

import type { PackingItem } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { SectionTitle } from '../shared/SectionTitle';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface PackingTabProps {
  tripId: string;
  packing: PackingItem[];
}

export function PackingTab({ tripId, packing }: PackingTabProps) {
  const togglePackingItem = useTripStore((state) => state.togglePackingItem);
  const checked = storage.getPackingChecked(tripId);

  // 빈 상태 처리
  if (!packing || packing.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-3xl mb-2">🧳</div>
          <p className="text-sm">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {packing.map((category) => {
        const checkedItems = checked[category.category] ?? [];
        const totalItems = category.items.length;
        const checkedCount = category.items.filter((item) =>
          checkedItems.includes(item.name)
        ).length;

        return (
          <div key={category.category}>
            <SectionTitle icon={category.categoryIcon} bgColor="#a78bfa">
              {category.category}
              <span className="text-sm font-normal text-text-secondary ml-2">
                ({checkedCount}/{totalItems})
              </span>
            </SectionTitle>
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
                    {/* 이름 + 참고사항 */}
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
  );
}
