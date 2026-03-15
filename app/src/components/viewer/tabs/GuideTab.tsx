'use client';

import {
  UtensilsCrossed, Train, Wallet, Plane as PlaneIcon,
  CreditCard, Calculator, ExternalLink, Plus, Trash2
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';
import type {
  Trip, Restaurant, TransportSection, TransportPass, TransportStep,
  TransportRoute, BudgetSection, BudgetItem
} from '@/types/trip';
import { useEditStore } from '@/stores/useEditStore';
import { EmojiIcon } from '@/lib/emoji-to-icon';
import { SectionEditHeader } from '../SectionEditHeader';
import { SectionTitle } from '../shared/SectionTitle';
import { Tip } from '../shared/Tip';
import { TipsAccordion } from '../shared/TipsAccordion';
import { cn } from '@/lib/utils';

interface GuideTabProps {
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

// 교통 아이콘 허용 목록
const TRANSPORT_EMOJI_OPTIONS = [
  { emoji: '✈️', label: '비행기' },
  { emoji: '🚆', label: '기차' },
  { emoji: '🚌', label: '버스' },
  { emoji: '🚗', label: '자동차' },
  { emoji: '🚇', label: '지하철' },
  { emoji: '🚊', label: '트램' },
  { emoji: '🚶', label: '도보' },
  { emoji: '🚢', label: '배' },
  { emoji: '🛫', label: '출발' },
  { emoji: '🛬', label: '도착' },
  { emoji: '🏨', label: '호텔' },
  { emoji: '🏠', label: '집' },
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

// ============================================================
// 편집 모드용 인라인 input (SummaryTab과 동일 패턴)
// ============================================================
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
// 맛집 편집 카드
// ============================================================
function RestaurantEditCard({
  restaurant,
  dayCount,
  onUpdate,
  onDelete,
}: {
  restaurant: Restaurant;
  dayCount: number;
  onUpdate: (field: keyof Restaurant, value: string | number) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-5 mb-3 hover:border-primary/30 transition-all">
      {/* 이름 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">이름</label>
        <InlineInput
          value={restaurant.name}
          onChange={(v) => onUpdate('name', v)}
          className="text-sm font-bold text-text-primary w-full"
          placeholder="맛집 이름"
        />
      </div>

      {/* 카테고리 + Day 번호 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">카테고리</label>
          <InlineInput
            value={restaurant.category}
            onChange={(v) => onUpdate('category', v)}
            className="text-sm text-text-primary w-full"
            placeholder="라멘, 스시 등"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">Day</label>
          <CustomSelect
            value={String(restaurant.dayNumber)}
            onChange={(v) => onUpdate('dayNumber', Number(v))}
            size="sm"
            options={Array.from({ length: dayCount }, (_, i) => ({
              value: String(i + 1),
              label: `Day ${i + 1}`,
            }))}
            className="w-full"
          />
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">설명</label>
        <InlineInput
          value={restaurant.description}
          onChange={(v) => onUpdate('description', v)}
          className="text-sm text-text-secondary w-full"
          placeholder="맛집 설명"
        />
      </div>

      {/* 평점 + 가격대 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">평점 (0~5)</label>
          <InlineInput
            value={String(restaurant.rating)}
            onChange={(v) => {
              const num = parseFloat(v);
              if (!isNaN(num) && num >= 0 && num <= 5) {
                onUpdate('rating', num);
              } else if (v === '') {
                onUpdate('rating', 0);
              }
            }}
            type="number"
            className="text-sm text-text-primary w-full"
            placeholder="4.5"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">가격대</label>
          <InlineInput
            value={restaurant.priceRange}
            onChange={(v) => onUpdate('priceRange', v)}
            className="text-sm text-text-primary w-full"
            placeholder="~1,000엔"
          />
        </div>
      </div>

      {/* 삭제 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-error hover:bg-error/10 rounded-md px-2 py-1 transition-colors"
          aria-label="맛집 삭제"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
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
// 교통 단계(homeToHotel) 편집 카드
// ============================================================
function TransportStepEditCard({
  step,
  onUpdate,
  onDelete,
}: {
  step: TransportStep;
  onUpdate: (field: keyof TransportStep, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-4 mb-3 hover:border-primary/30 transition-all">
      <div className="grid grid-cols-[60px_1fr] gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">아이콘</label>
          <EmojiPicker
            value={step.icon}
            onChange={(v) => onUpdate('icon', v)}
            options={TRANSPORT_EMOJI_OPTIONS}
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">제목</label>
          <InlineInput
            value={step.title}
            onChange={(v) => onUpdate('title', v)}
            className="text-sm font-bold text-text-primary w-full"
            placeholder="난바역"
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">부제목</label>
        <InlineInput
          value={step.subtitle}
          onChange={(v) => onUpdate('subtitle', v)}
          className="text-sm text-text-secondary w-full"
          placeholder="난카이선 40분"
        />
      </div>
      {/* 삭제 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-error hover:bg-error/10 rounded-md px-2 py-1 transition-colors"
          aria-label="교통 단계 삭제"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 도시간 노선 편집 카드
// ============================================================
function RouteEditCard({
  route,
  onUpdate,
  onDelete,
}: {
  route: TransportRoute;
  onUpdate: (field: keyof TransportRoute, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-4 mb-3 hover:border-primary/30 transition-all">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">출발</label>
          <InlineInput
            value={route.from}
            onChange={(v) => onUpdate('from', v)}
            className="text-sm text-text-primary w-full"
            placeholder="오사카"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">도착</label>
          <InlineInput
            value={route.to}
            onChange={(v) => onUpdate('to', v)}
            className="text-sm text-text-primary w-full"
            placeholder="교토"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">교통편</label>
          <InlineInput
            value={route.method}
            onChange={(v) => onUpdate('method', v)}
            className="text-sm text-cat-transport w-full"
            placeholder="JR 신쾌속"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">소요</label>
          <InlineInput
            value={route.duration}
            onChange={(v) => onUpdate('duration', v)}
            className="text-sm text-text-secondary w-full"
            placeholder="30분"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">요금</label>
          <InlineInput
            value={route.cost}
            onChange={(v) => onUpdate('cost', v)}
            className="text-sm text-primary font-semibold w-full"
            placeholder="¥570"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-error hover:bg-error/10 rounded-md px-2 py-1 transition-colors"
          aria-label="노선 삭제"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 패스 편집 카드
// ============================================================
function PassEditCard({
  pass,
  onUpdate,
  onDelete,
}: {
  pass: TransportPass;
  onUpdate: (field: keyof TransportPass, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-4 mb-3 hover:border-primary/30 transition-all">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">이름</label>
          <InlineInput
            value={pass.name}
            onChange={(v) => onUpdate('name', v)}
            className="text-sm font-bold text-text-primary w-full"
            placeholder="간사이 패스"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">가격</label>
          <InlineInput
            value={pass.price}
            onChange={(v) => onUpdate('price', v)}
            className="text-sm text-text-primary w-full"
            placeholder="¥2,800"
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">추천도</label>
        <CustomSelect
          value={pass.recommendation}
          onChange={(v) => onUpdate('recommendation', v)}
          size="sm"
          options={[
            { value: 'recommended', label: '추천' },
            { value: 'neutral', label: '보통' },
            { value: 'not-recommended', label: '비추천' },
          ]}
          className="w-full"
        />
      </div>
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">이유</label>
        <InlineInput
          value={pass.reason}
          onChange={(v) => onUpdate('reason', v)}
          className="text-sm text-text-secondary w-full"
          placeholder="추천 이유"
        />
      </div>
      <div className="flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-error hover:bg-error/10 rounded-md px-2 py-1 transition-colors"
          aria-label="패스 삭제"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
  );
}

// 패스 추천 상태별 색상 매핑
function getPassColor(recommendation: TransportPass['recommendation']) {
  switch (recommendation) {
    case 'recommended':
      return { border: 'border-cat-sightseeing/40', bg: 'bg-cat-sightseeing/10', text: 'text-cat-sightseeing', badge: 'bg-cat-sightseeing/20 text-cat-sightseeing' };
    case 'neutral':
      return { border: 'border-border-light', bg: 'bg-surface', text: 'text-text-secondary', badge: 'bg-bg-secondary text-text-secondary' };
    case 'not-recommended':
      return { border: 'border-border-light', bg: 'bg-surface', text: 'text-text-tertiary', badge: 'bg-bg-secondary text-text-tertiary' };
  }
}

export function GuideTab({ trip }: GuideTabProps) {
  const restaurants = trip.restaurants ?? [];
  const transport = trip.transport;
  const budget = trip.budget;

  const editingSection = useEditStore((s) => s.editingSection);
  const updateEditingTrip = useEditStore((s) => s.updateEditingTrip);

  const restaurantCount = restaurants.length;
  const budgetTotal = budget?.total;
  const routeCount = (transport?.intercityRoutes?.length ?? 0) + (transport?.homeToHotel?.length ?? 0);

  const isRestaurantsEdit = editingSection === 'restaurants';
  const isBudgetEdit = editingSection === 'budget';
  const isTransportEdit = editingSection === 'transport';
  const dayCount = trip.days?.length ?? 1;

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

  // ---- 교통 핸들러 ----
  const handleStepUpdate = (index: number, field: keyof TransportStep, value: string) => {
    updateEditingTrip((t) => {
      const newSteps = (t.transport?.homeToHotel ?? []).map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      );
      return { ...t, transport: { ...t.transport, homeToHotel: newSteps } };
    });
  };

  const handleStepDelete = (index: number) => {
    updateEditingTrip((t) => ({
      ...t,
      transport: { ...t.transport, homeToHotel: (t.transport?.homeToHotel ?? []).filter((_, i) => i !== index) },
    }));
  };

  const handleStepAdd = () => {
    updateEditingTrip((t) => {
      const newStep: TransportStep = { icon: '🚃', title: '', subtitle: '' };
      return { ...t, transport: { ...t.transport, homeToHotel: [...(t.transport?.homeToHotel ?? []), newStep] } };
    });
  };

  const handleRouteUpdate = (index: number, field: keyof TransportRoute, value: string) => {
    updateEditingTrip((t) => {
      const newRoutes = (t.transport?.intercityRoutes ?? []).map((r, i) =>
        i === index ? { ...r, [field]: value } : r,
      );
      return { ...t, transport: { ...t.transport, intercityRoutes: newRoutes } };
    });
  };

  const handleRouteDelete = (index: number) => {
    updateEditingTrip((t) => ({
      ...t,
      transport: { ...t.transport, intercityRoutes: (t.transport?.intercityRoutes ?? []).filter((_, i) => i !== index) },
    }));
  };

  const handleRouteAdd = () => {
    updateEditingTrip((t) => {
      const newRoute: TransportRoute = { from: '', to: '', method: '', duration: '', cost: '' };
      return { ...t, transport: { ...t.transport, intercityRoutes: [...(t.transport?.intercityRoutes ?? []), newRoute] } };
    });
  };

  const handlePassUpdate = (index: number, field: keyof TransportPass, value: string) => {
    updateEditingTrip((t) => {
      const newPasses = (t.transport?.passes ?? []).map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      );
      return { ...t, transport: { ...t.transport, passes: newPasses } };
    });
  };

  const handlePassDelete = (index: number) => {
    updateEditingTrip((t) => ({
      ...t,
      transport: { ...t.transport, passes: (t.transport?.passes ?? []).filter((_, i) => i !== index) },
    }));
  };

  const handlePassAdd = () => {
    updateEditingTrip((t) => {
      const newPass: TransportPass = { name: '', price: '', recommendation: 'neutral', reason: '' };
      return { ...t, transport: { ...t.transport, passes: [...(t.transport?.passes ?? []), newPass] } };
    });
  };


  // 맛집 필드 업데이트
  const handleRestaurantUpdate = (index: number, field: keyof Restaurant, value: string | number) => {
    updateEditingTrip((t) => {
      const newRestaurants = (t.restaurants ?? []).map((r, i) =>
        i === index ? { ...r, [field]: value } : r,
      );
      return { ...t, restaurants: newRestaurants };
    });
  };

  // 맛집 삭제
  const handleRestaurantDelete = (index: number) => {
    updateEditingTrip((t) => {
      const newRestaurants = (t.restaurants ?? []).filter((_, i) => i !== index);
      return { ...t, restaurants: newRestaurants };
    });
  };

  // 맛집 추가
  const handleRestaurantAdd = () => {
    updateEditingTrip((t) => {
      const newRestaurant: Restaurant = {
        dayNumber: 1,
        category: '',
        name: '',
        rating: 0,
        description: '',
        priceRange: '',
      };
      return { ...t, restaurants: [...(t.restaurants ?? []), newRestaurant] };
    });
  };

  return (
    <div className="animate-fade-up">
      {/* 맛집 섹션 — 편집 가능 */}
      <SectionEditHeader
        title="맛집"
        icon={<UtensilsCrossed className="size-4" />}
        section="restaurants"
        trip={trip}
        suffix={
          restaurantCount > 0 ? (
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({restaurantCount}곳)
            </span>
          ) : undefined
        }
      />

      {isRestaurantsEdit ? (
        // 편집 모드: 맛집 편집 카드
        <>
          {restaurants.map((restaurant, index) => (
            <RestaurantEditCard
              key={`restaurant-edit-${index}`}
              restaurant={restaurant}
              dayCount={dayCount}
              onUpdate={(field, value) => handleRestaurantUpdate(index, field, value)}
              onDelete={() => handleRestaurantDelete(index)}
            />
          ))}
          {/* 맛집 추가 버튼 */}
          <button
            onClick={handleRestaurantAdd}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors mb-3"
          >
            <Plus className="size-4" />
            맛집 추가
          </button>
        </>
      ) : (
        // 읽기 모드: 기존 맛집 표시
        <RestaurantSection restaurants={restaurants} />
      )}

      {/* 교통 섹션 — 편집 가능 */}
      <SectionEditHeader
        title="교통"
        icon={<Train className="size-4" />}
        section="transport"
        trip={trip}
        suffix={
          routeCount > 0 ? (
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({routeCount}개 노선)
            </span>
          ) : undefined
        }
      />

      {isTransportEdit ? (
        <TransportEditSection
          transport={transport}
          onStepUpdate={handleStepUpdate}
          onStepDelete={handleStepDelete}
          onStepAdd={handleStepAdd}
          onRouteUpdate={handleRouteUpdate}
          onRouteDelete={handleRouteDelete}
          onRouteAdd={handleRouteAdd}
          onPassUpdate={handlePassUpdate}
          onPassDelete={handlePassDelete}
          onPassAdd={handlePassAdd}
        />
      ) : (
        <TransportSection_ transport={transport} />
      )}

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
        <BudgetSection_ budget={budget} />
      )}
    </div>
  );
}

// --- 맛집 서브 섹션 (읽기 모드) ---
function RestaurantSection({ restaurants }: { restaurants: Restaurant[] }) {
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary">
        <p className="text-sm">맛집 정보가 아직 없습니다</p>
      </div>
    );
  }

  // dayNumber별 그룹핑
  const grouped = new Map<number, Restaurant[]>();
  restaurants.forEach((r) => {
    const list = grouped.get(r.dayNumber) ?? [];
    list.push(r);
    grouped.set(r.dayNumber, list);
  });

  const sortedDays = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="space-y-6">
      {sortedDays.map(([dayNumber, dayRestaurants]) => (
        <div key={dayNumber}>
          <SectionTitle icon={<UtensilsCrossed className="size-4" />}>
            Day {dayNumber}
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {dayRestaurants.map((restaurant) => (
              <a
                key={`${dayNumber}-${restaurant.name}`}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface border border-border-light rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 group flex flex-col"
              >
                {/* 카테고리 + 평점 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-cat-food/10 text-cat-food px-2.5 py-0.5 rounded-full font-medium">
                    {restaurant.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-amber-500 font-semibold">
                      {'★'.repeat(Math.round(restaurant.rating))}{' '}
                      <span className="text-text-secondary">{restaurant.rating}</span>
                      {restaurant.reviewCount && (
                        <span className="text-text-tertiary text-xs ml-1">
                          ({restaurant.reviewCount})
                        </span>
                      )}
                    </span>
                    <ExternalLink className="size-3.5 text-text-tertiary group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </div>
                {/* 가게명 */}
                <h4 className="text-base font-bold text-text-primary mb-1">{restaurant.name}</h4>
                {/* 설명 */}
                <p className="text-sm text-text-secondary leading-relaxed flex-1">
                  {restaurant.description}
                </p>
                {/* 가격대 */}
                <div className="mt-3">
                  <span className="text-xs text-text-tertiary font-medium bg-bg-secondary px-2.5 py-1 rounded-full">
                    {restaurant.priceRange}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 교통 서브 섹션 ---
function TransportSection_({ transport }: { transport: TransportSection }) {
  const homeToHotel = transport?.homeToHotel ?? [];
  const intercityRoutes = transport?.intercityRoutes ?? [];
  const passes = transport?.passes ?? [];
  const tips = transport?.tips ?? [];

  if (homeToHotel.length === 0 && intercityRoutes.length === 0 && passes.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary">
        <p className="text-sm">교통 정보가 아직 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* 집 -> 호텔 경로 */}
      {homeToHotel.length > 0 && (
        <>
          <SectionTitle icon={<PlaneIcon className="size-4" />}>
            집 → 호텔 경로
          </SectionTitle>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {homeToHotel.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                <div className="bg-surface border border-border-light rounded-xl px-4 py-3 text-center min-w-[100px] shadow-sm">
                  <div className="text-lg mb-0.5"><EmojiIcon emoji={step.icon} size={20} className="inline-block text-cat-transport" /></div>
                  <div className="text-sm font-semibold text-text-primary">{step.title}</div>
                  <div className="text-xs text-text-secondary">{step.subtitle}</div>
                </div>
                {idx < homeToHotel.length - 1 && (
                  <span className="text-cat-transport text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 도시간 노선 */}
      {intercityRoutes.length > 0 && (
        <>
          <SectionTitle icon={<Train className="size-4" />}>
            도시간 노선
          </SectionTitle>
          <div className="bg-surface border border-border-light rounded-xl overflow-hidden mb-3 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light text-text-tertiary text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">출발</th>
                  <th className="text-left px-4 py-3 font-semibold">도착</th>
                  <th className="text-left px-4 py-3 font-semibold">교통편</th>
                  <th className="text-left px-4 py-3 font-semibold">소요</th>
                  <th className="text-right px-4 py-3 font-semibold">요금</th>
                </tr>
              </thead>
              <tbody>
                {intercityRoutes.map((route, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border-light last:border-b-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">{route.from}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{route.to}</td>
                    <td className="px-4 py-3 text-cat-transport">{route.method}</td>
                    <td className="px-4 py-3 text-text-secondary">{route.duration}</td>
                    <td className="px-4 py-3 text-primary text-right font-semibold">{route.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 패스 비교 */}
      {passes.length > 0 && (
        <>
          <SectionTitle icon={<CreditCard className="size-4" />}>
            패스 비교
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 mb-4">
            {passes.map((pass) => {
              const color = getPassColor(pass.recommendation);
              return (
                <div
                  key={pass.name}
                  className={`${color.bg} border ${color.border} rounded-xl p-5`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-base font-bold text-text-primary">{pass.name}</h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${color.badge}`}>
                      {pass.recommendation === 'recommended'
                        ? '추천'
                        : pass.recommendation === 'neutral'
                          ? '보통'
                          : '비추천'}
                    </span>
                  </div>
                  <div className={`text-sm font-semibold mb-1 ${color.text}`}>{pass.price}</div>
                  <p className="text-sm text-text-secondary">{pass.reason}</p>
                </div>
              );
            })}
          </div>
          {transport.passVerdict && (
            <Tip>{transport.passVerdict}</Tip>
          )}
        </>
      )}

      {/* 교통 팁 */}
      <TipsAccordion tips={tips} title="교통 팁" />
    </div>
  );
}

// --- 교통 편집 섹션 ---
function TransportEditSection({
  transport,
  onStepUpdate,
  onStepDelete,
  onStepAdd,
  onRouteUpdate,
  onRouteDelete,
  onRouteAdd,
  onPassUpdate,
  onPassDelete,
  onPassAdd,
}: {
  transport: TransportSection;
  onStepUpdate: (index: number, field: keyof TransportStep, value: string) => void;
  onStepDelete: (index: number) => void;
  onStepAdd: () => void;
  onRouteUpdate: (index: number, field: keyof TransportRoute, value: string) => void;
  onRouteDelete: (index: number) => void;
  onRouteAdd: () => void;
  onPassUpdate: (index: number, field: keyof TransportPass, value: string) => void;
  onPassDelete: (index: number) => void;
  onPassAdd: () => void;
}) {
  const homeToHotel = transport?.homeToHotel ?? [];
  const intercityRoutes = transport?.intercityRoutes ?? [];
  const passes = transport?.passes ?? [];

  return (
    <div>
      {/* 집 → 호텔 경로 편집 */}
      <SectionTitle icon={<PlaneIcon className="size-4" />}>
        집 → 호텔 경로
      </SectionTitle>
      {homeToHotel.map((step, idx) => (
        <TransportStepEditCard
          key={`step-edit-${idx}`}
          step={step}
          onUpdate={(field, value) => onStepUpdate(idx, field, value)}
          onDelete={() => onStepDelete(idx)}
        />
      ))}
      <button
        onClick={onStepAdd}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors mb-4"
      >
        <Plus className="size-4" />
        단계 추가
      </button>

      {/* 도시간 노선 편집 */}
      <SectionTitle icon={<Train className="size-4" />}>
        도시간 노선
      </SectionTitle>
      {intercityRoutes.map((route, idx) => (
        <RouteEditCard
          key={`route-edit-${idx}`}
          route={route}
          onUpdate={(field, value) => onRouteUpdate(idx, field, value)}
          onDelete={() => onRouteDelete(idx)}
        />
      ))}
      <button
        onClick={onRouteAdd}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors mb-4"
      >
        <Plus className="size-4" />
        노선 추가
      </button>

      {/* 패스 비교 편집 */}
      <SectionTitle icon={<CreditCard className="size-4" />}>
        패스 비교
      </SectionTitle>
      {passes.map((pass, idx) => (
        <PassEditCard
          key={`pass-edit-${idx}`}
          pass={pass}
          onUpdate={(field, value) => onPassUpdate(idx, field, value)}
          onDelete={() => onPassDelete(idx)}
        />
      ))}
      <button
        onClick={onPassAdd}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors mb-4"
      >
        <Plus className="size-4" />
        패스 추가
      </button>

    </div>
  );
}

// --- 예산 편집 섹션 ---
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

// --- 예산 서브 섹션 ---
function BudgetSection_({ budget }: { budget: BudgetSection }) {
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
