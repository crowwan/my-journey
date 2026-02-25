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

  // 예산 데이터가 전혀 없으면 빈 상태 표시
  if (items.length === 0 && !total.min && !total.max) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-sm">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionTitle icon="💰" bgColor="#f97316">
        예산 항목
      </SectionTitle>

      {/* 예산 아이템 리스트 */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-card border border-border rounded-[14px] p-4 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text">{item.label}</span>
                  <span className="text-sm font-bold text-accent">{item.amount}</span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5">{item.detail}</div>
              </div>
            </div>
            {/* 비율 바 */}
            <div className="h-1.5 bg-glass rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.percentage}%`, background: item.color }}
              />
            </div>
            <div className="text-right text-xs text-text-tertiary mt-1">{item.percentage}%</div>
          </div>
        ))}
      </div>

      {/* 총합 카드 */}
      <SectionTitle icon="🧮" bgColor="#10b981">
        예상 총 비용
      </SectionTitle>
      <div className="bg-card border border-trip-green/30 rounded-[14px] p-6 mb-6">
        <div className="text-center">
          <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">
            예상 범위
          </div>
          <div className="text-2xl font-black text-text mb-1">
            {total.min} ~ {total.max}
          </div>
          <div className="text-base text-trip-green font-semibold">
            {total.minKRW} ~ {total.maxKRW}
          </div>
        </div>
      </div>

      {/* 예산 팁 */}
      {tips.length > 0 && (
        <>
          <SectionTitle icon="💡" bgColor="#f97316">
            예산 팁
          </SectionTitle>
          {tips.map((tip) => (
            <div key={tip} className="mb-2">
              <Tip>{tip}</Tip>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
