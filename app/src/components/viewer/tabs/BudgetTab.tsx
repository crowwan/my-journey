import type { BudgetSection } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { Tip } from '../shared/Tip';

interface BudgetTabProps {
  budget: BudgetSection;
}

export function BudgetTab({ budget }: BudgetTabProps) {
  const items = budget.items ?? [];
  const tips = budget.tips ?? [];
  const total = budget.total ?? { min: '', max: '', minKRW: '', maxKRW: '' };

  if (items.length === 0 && !total.min && !total.max) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-16 text-text-tertiary">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-sm font-medium">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle icon="💰" bgColor="#f97316">
        예산 항목
      </SectionTitle>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-surface-elevated border border-border rounded-2xl p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)] transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text">{item.label}</span>
                  <span className="text-sm font-black text-accent">{item.amount}</span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5">{item.detail}</div>
              </div>
            </div>
            <div className="h-2 bg-surface-sunken rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%`, background: item.color }}
              />
            </div>
            <div className="text-right text-xs text-text-tertiary font-semibold mt-1">{item.percentage}%</div>
          </div>
        ))}
      </div>

      {/* 총합 카드 */}
      <SectionTitle icon="🧮" bgColor="#10b981">
        예상 총 비용
      </SectionTitle>
      <div className="bg-surface-elevated border border-trip-green/20 rounded-2xl p-7 mb-8 shadow-[var(--shadow-card)] text-center">
        <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
          예상 범위
        </div>
        <div className="text-2xl font-black text-text mb-1">
          {total.min} ~ {total.max}
        </div>
        <div className="text-base text-trip-green font-bold">
          {total.minKRW} ~ {total.maxKRW}
        </div>
      </div>

      {/* 예산 팁 */}
      {tips.length > 0 && (
        <>
          <SectionTitle icon="💡" bgColor="#f97316">
            예산 팁
          </SectionTitle>
          <div className="space-y-2">
            {tips.map((tip) => (
              <Tip key={tip}>{tip}</Tip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
