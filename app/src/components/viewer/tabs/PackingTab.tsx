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

  if (!packing || packing.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-16 text-text-tertiary">
          <div className="text-4xl mb-3">🧳</div>
          <p className="text-sm font-medium">AI가 이 섹션을 아직 생성하지 않았습니다</p>
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
              <span className="text-sm font-medium text-text-tertiary ml-2">
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
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200',
                      isChecked
                        ? 'bg-trip-green/5 border border-trip-green/15'
                        : 'bg-surface-elevated border border-border hover:border-border-strong hover:shadow-[var(--shadow-sm)]'
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      className={cn(
                        'pointer-events-none',
                        isChecked && 'data-[state=checked]:bg-trip-green data-[state=checked]:border-trip-green'
                      )}
                      tabIndex={-1}
                    />
                    <div className="flex-1">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isChecked ? 'text-text-tertiary line-through' : 'text-text'
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
