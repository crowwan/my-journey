'use client';

import type { PackingItem } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { SectionTitle } from '../shared/SectionTitle';

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
            <div className="space-y-1.5">
              {category.items.map((item) => {
                const isChecked = checkedItems.includes(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => togglePackingItem(tripId, category.category, item.name)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-trip-green/10 border border-trip-green/20'
                        : 'bg-card border border-border hover:border-border'
                    }`}
                  >
                    {/* 체크박스 */}
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-trip-green border-trip-green'
                          : 'border-text-tertiary'
                      }`}
                    >
                      {isChecked && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    {/* 이름 + 참고사항 */}
                    <div className="flex-1">
                      <span
                        className={`text-sm font-medium ${
                          isChecked ? 'text-text-secondary line-through' : 'text-text'
                        }`}
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
