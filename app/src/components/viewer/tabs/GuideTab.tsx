'use client';

import {
  UtensilsCrossed, Train, Wallet, Plane as PlaneIcon,
  CreditCard, Calculator, ExternalLink
} from 'lucide-react';
import type { Restaurant, TransportSection, TransportPass, BudgetSection } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { Tip } from '../shared/Tip';
import { TipsAccordion } from '../shared/TipsAccordion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface GuideTabProps {
  restaurants: Restaurant[];
  transport: TransportSection;
  budget: BudgetSection;
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

export function GuideTab({ restaurants, transport, budget }: GuideTabProps) {
  const restaurantCount = restaurants?.length ?? 0;
  const budgetItems = budget?.items ?? [];
  const budgetTotal = budget?.total;
  const routeCount = (transport?.intercityRoutes?.length ?? 0) + (transport?.homeToHotel?.length ?? 0);

  return (
    <div className="animate-fade-up">
      <Accordion type="multiple" defaultValue={['restaurants', 'transport', 'budget']}>
        {/* 맛집 섹션 */}
        <AccordionItem value="restaurants" className="border-b-0 mb-2">
          <AccordionTrigger className="hover:no-underline px-1 py-3">
            <div className="flex items-center gap-2.5">
              <UtensilsCrossed className="size-4 text-text-secondary" />
              <span className="text-lg font-semibold text-text-primary">맛집</span>
              <span className="text-sm text-text-tertiary font-normal">
                ({restaurantCount}곳)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <RestaurantSection restaurants={restaurants} />
          </AccordionContent>
        </AccordionItem>

        {/* 교통 섹션 */}
        <AccordionItem value="transport" className="border-b-0 mb-2">
          <AccordionTrigger className="hover:no-underline px-1 py-3">
            <div className="flex items-center gap-2.5">
              <Train className="size-4 text-text-secondary" />
              <span className="text-lg font-semibold text-text-primary">교통</span>
              {routeCount > 0 && (
                <span className="text-sm text-text-tertiary font-normal">
                  ({routeCount}개 노선)
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <TransportSection_ transport={transport} />
          </AccordionContent>
        </AccordionItem>

        {/* 예산 섹션 */}
        <AccordionItem value="budget" className="border-b-0 mb-2">
          <AccordionTrigger className="hover:no-underline px-1 py-3">
            <div className="flex items-center gap-2.5">
              <Wallet className="size-4 text-text-secondary" />
              <span className="text-lg font-semibold text-text-primary">예산</span>
              {budgetTotal && budgetTotal.minKRW && (
                <span className="text-sm text-text-tertiary font-normal">
                  ({budgetTotal.minKRW} ~ {budgetTotal.maxKRW})
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <BudgetSection_ budget={budget} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// --- 맛집 서브 섹션 ---
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
  const icocaGuide = transport?.icocaGuide ?? [];
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
                  <div className="text-lg mb-0.5">{step.icon}</div>
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

      {/* ICOCA 가이드 */}
      {icocaGuide.length > 0 && (
        <>
          <SectionTitle icon={<CreditCard className="size-4" />}>
            ICOCA 가이드
          </SectionTitle>
          <div className="bg-surface border border-border-light rounded-xl p-5 mb-3 shadow-sm">
            <ul className="space-y-2">
              {icocaGuide.map((guide, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-cat-activity/15 text-cat-activity text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-text-secondary">{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* 교통 팁 */}
      <TipsAccordion tips={tips} title="교통 팁" />
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
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">{item.label}</span>
                  <span className="text-sm font-bold text-primary">{item.amount}</span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5">{item.detail}</div>
              </div>
            </div>
            {/* 비율 바 — primary 그라데이션 */}
            <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${item.percentage}%` }}
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
