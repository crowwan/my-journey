'use client';

import {
  Wallet, Calculator, Plus, Trash2
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';
import type { Trip, BudgetSection, BudgetItem } from '@/types/trip';
import { useEditStore } from '@/stores/useEditStore';
import { EmojiIcon } from '@/lib/emoji-to-icon';
import { SectionEditHeader } from '../SectionEditHeader';
import { SectionTitle } from '../shared/SectionTitle';
import { TipsAccordion } from '../shared/TipsAccordion';
import { cn } from '@/lib/utils';

interface BudgetTabProps {
  trip: Trip;
}

// 예산 아이콘 허용 목록 (Gemini 프롬프트와 동일)
const BUDGET_EMOJI_OPTIONS = [
  { emoji: '🚆', label: '교통' },
  { emoji: '🍽️', label: '식비' },
  { emoji: '🎫', label: '입장료' },
  { emoji: '☕', label: '간식/카페' },
  { emoji: '🛍️', label: '쇼핑' },
  { emoji: '💰', label: '예비비' },
];

// 이모지 선택 드롭다운 — CustomSelect 기반, 이모지만 크게 표시
function EmojiPicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (emoji: string) => void;
  options: { emoji: string; label: string }[];
}) {
  // 현재 값이 옵션에 없으면 기본 옵션으로 추가
  const selectOptions = [
    ...(!options.some((o) => o.emoji === value)
      ? [{ value, label: value, icon: value }]
      : []),
    ...options.map((o) => ({
      value: o.emoji,
      label: o.label,
      icon: o.emoji,
    })),
  ];

  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={selectOptions}
      emojiMode
    />
  );
}

// 편집 모드용 인라인 input
function InlineInput({
  value,
  onChange,
  className,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  type?: 'text' | 'number';
}) {
  return (
    <input
      type={type}
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
// 예산 항목 편집 카드
// ============================================================
function BudgetEditCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: BudgetItem;
  onUpdate: (field: keyof BudgetItem, value: string | number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-5 mb-3 hover:border-primary/30 transition-all">
      {/* 아이콘 + 라벨 */}
      <div className="grid grid-cols-[60px_1fr] gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">아이콘</label>
          <EmojiPicker
            value={item.icon}
            onChange={(v) => onUpdate('icon', v)}
            options={BUDGET_EMOJI_OPTIONS}
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">항목명</label>
          <InlineInput
            value={item.label}
            onChange={(v) => onUpdate('label', v)}
            className="text-sm font-bold text-text-primary w-full"
            placeholder="교통비"
          />
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">상세</label>
        <InlineInput
          value={item.detail}
          onChange={(v) => onUpdate('detail', v)}
          className="text-sm text-text-secondary w-full"
          placeholder="세부 내역"
        />
      </div>

      {/* 금액 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">금액</label>
        <InlineInput
          value={item.amount}
          onChange={(v) => onUpdate('amount', v)}
          className="text-sm text-primary font-bold w-full"
          placeholder="¥3,000"
        />
        <span className="text-[10px] text-text-tertiary mt-0.5 block">비율 {item.percentage}% (자동 계산)</span>
      </div>

      {/* 삭제 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-error hover:bg-error/10 rounded-md px-2 py-1 transition-colors"
          aria-label="예산 항목 삭제"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 예산 편집 섹션
// ============================================================
function BudgetEditSection({
  budget,
  onItemUpdate,
  onItemDelete,
  onItemAdd,
  onTotalUpdate,
}: {
  budget: BudgetSection;
  onItemUpdate: (index: number, field: keyof BudgetItem, value: string | number) => void;
  onItemDelete: (index: number) => void;
  onItemAdd: () => void;
  onTotalUpdate: (field: string, value: string) => void;
}) {
  const items = budget?.items ?? [];
  const total = budget?.total ?? { min: '', max: '', minKRW: '', maxKRW: '' };

  return (
    <div>
      <SectionTitle icon={<Wallet className="size-4" />}>
        예산 항목
      </SectionTitle>

      {/* 예산 아이템 편집 */}
      {items.map((item, idx) => (
        <BudgetEditCard
          key={`budget-edit-${idx}`}
          item={item}
          onUpdate={(field, value) => onItemUpdate(idx, field, value)}
          onDelete={() => onItemDelete(idx)}
        />
      ))}
      <button
        onClick={onItemAdd}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors mb-6"
      >
        <Plus className="size-4" />
        항목 추가
      </button>

      {/* 총합 편집 */}
      <SectionTitle icon={<Calculator className="size-4" />}>
        예상 총 비용
      </SectionTitle>
      <div className="bg-surface border border-dashed border-border rounded-xl p-5 mb-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-text-tertiary block mb-1">최소 (외화)</label>
            <InlineInput
              value={total.min}
              onChange={(v) => onTotalUpdate('min', v)}
              className="text-sm font-bold text-text-primary w-full"
              placeholder="¥50,000"
            />
          </div>
          <div>
            <label className="text-xs text-text-tertiary block mb-1">최대 (외화)</label>
            <InlineInput
              value={total.max}
              onChange={(v) => onTotalUpdate('max', v)}
              className="text-sm font-bold text-text-primary w-full"
              placeholder="¥80,000"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-tertiary block mb-1">최소 (원화)</label>
            <InlineInput
              value={total.minKRW}
              onChange={(v) => onTotalUpdate('minKRW', v)}
              className="text-sm font-semibold text-cat-sightseeing w-full"
              placeholder="약 50만원"
            />
          </div>
          <div>
            <label className="text-xs text-text-tertiary block mb-1">최대 (원화)</label>
            <InlineInput
              value={total.maxKRW}
              onChange={(v) => onTotalUpdate('maxKRW', v)}
              className="text-sm font-semibold text-cat-sightseeing w-full"
              placeholder="약 80만원"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 예산 읽기 모드 섹션
// ============================================================
function BudgetReadSection({ budget }: { budget: BudgetSection }) {
  const items = budget?.items ?? [];
  const tips = budget?.tips ?? [];
  const total = budget?.total ?? { min: '', max: '', minKRW: '', maxKRW: '' };

  if (items.length === 0 && !total.min && !total.max) {
    return (
      <div className="text-center py-8 text-text-tertiary">
        <p className="text-sm">예산 정보가 아직 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle icon={<Wallet className="size-4" />}>
        예산 항목
      </SectionTitle>

      {/* 예산 아이템 리스트 */}
      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-surface border border-border-light rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <EmojiIcon emoji={item.icon} size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">{item.label}</span>
                  <span className="text-sm font-bold text-primary">{item.amount}</span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5">{item.detail}</div>
              </div>
            </div>
            {/* 비율 바 — 아이템별 색상 */}
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color || '#f97316' }}
              />
            </div>
            <div className="text-right text-xs text-text-tertiary mt-1">{item.percentage}%</div>
          </div>
        ))}
      </div>

      {/* 총합 카드 */}
      <SectionTitle icon={<Calculator className="size-4" />}>
        예상 총 비용
      </SectionTitle>
      <div className="bg-surface border border-cat-sightseeing/30 rounded-xl p-7 mb-8 shadow-sm">
        <div className="text-center">
          <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">
            예상 범위
          </div>
          <div className="text-2xl font-black text-text-primary mb-1">
            {total.min} ~ {total.max}
          </div>
          <div className="text-base text-cat-sightseeing font-semibold">
            {total.minKRW} ~ {total.maxKRW}
          </div>
        </div>
      </div>

      {/* 예산 팁 */}
      <TipsAccordion tips={tips} title="예산 팁" />
    </div>
  );
}

// ============================================================
// BudgetTab 메인 컴포넌트
// ============================================================
export function BudgetTab({ trip }: BudgetTabProps) {
  const budget = trip.budget;

  const editingSection = useEditStore((s) => s.editingSection);
  const updateEditingTrip = useEditStore((s) => s.updateEditingTrip);

  const budgetTotal = budget?.total;
  const isBudgetEdit = editingSection === 'budget';

  // ---- 예산 핸들러 ----
  const handleBudgetItemUpdate = (index: number, field: keyof BudgetItem, value: string | number) => {
    updateEditingTrip((t) => {
      const newItems = (t.budget?.items ?? []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      return { ...t, budget: { ...t.budget, items: newItems } };
    });
  };

  const handleBudgetItemDelete = (index: number) => {
    updateEditingTrip((t) => {
      const newItems = (t.budget?.items ?? []).filter((_, i) => i !== index);
      return { ...t, budget: { ...t.budget, items: newItems } };
    });
  };

  const handleBudgetItemAdd = () => {
    updateEditingTrip((t) => {
      const newItem: BudgetItem = {
        icon: '💰',
        label: '',
        detail: '',
        amount: '',
        percentage: 0,
        color: '#f97316',
      };
      return { ...t, budget: { ...t.budget, items: [...(t.budget?.items ?? []), newItem] } };
    });
  };

  const handleBudgetTotalUpdate = (field: string, value: string) => {
    updateEditingTrip((t) => ({
      ...t,
      budget: {
        ...t.budget,
        total: { ...(t.budget?.total ?? { min: '', max: '', minKRW: '', maxKRW: '' }), [field]: value },
      },
    }));
  };

  return (
    <div className="animate-fade-up">
      {/* 예산 섹션 — 편집 가능 */}
      <SectionEditHeader
        title="예산"
        icon={<Wallet className="size-4" />}
        section="budget"
        trip={trip}
        suffix={
          budgetTotal && budgetTotal.minKRW ? (
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({budgetTotal.minKRW} ~ {budgetTotal.maxKRW})
            </span>
          ) : undefined
        }
      />

      {isBudgetEdit ? (
        <BudgetEditSection
          budget={budget}
          onItemUpdate={handleBudgetItemUpdate}
          onItemDelete={handleBudgetItemDelete}
          onItemAdd={handleBudgetItemAdd}
          onTotalUpdate={handleBudgetTotalUpdate}
        />
      ) : (
        <BudgetReadSection budget={budget} />
      )}
    </div>
  );
}
