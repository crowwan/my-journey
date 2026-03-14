'use client';

import type { Restaurant, TransportSection, TransportPass, BudgetSection } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { Tip } from '../shared/Tip';
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
      return { border: 'border-primary/40', bg: 'bg-primary/10', text: 'text-primary', badge: 'bg-primary/20 text-primary' };
    case 'not-recommended':
      return { border: 'border-text-tertiary/40', bg: 'bg-overlay-light', text: 'text-text-tertiary', badge: 'bg-overlay-light text-text-tertiary' };
  }
}

export function GuideTab({ restaurants, transport, budget }: GuideTabProps) {
  // 각 섹션의 요약 정보 계산
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
            <div className="flex items-center gap-2">
              <span className="text-lg">🍜</span>
              <span className="text-base font-bold text-text-primary">맛집</span>
              <span className="text-sm text-text-tertiary font-normal">
                ({restaurantCount}곳)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <RestaurantSection restaurants={restaurants} />
          </AccordionContent>
        </AccordionItem>

        {/* 교통 섹션 */}
        <AccordionItem value="transport" className="border-b-0 mb-2">
          <AccordionTrigger className="hover:no-underline px-1 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚃</span>
              <span className="text-base font-bold text-text-primary">교통</span>
              {routeCount > 0 && (
                <span className="text-sm text-text-tertiary font-normal">
                  ({routeCount}개 노선)
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <TransportSection_ transport={transport} />
          </AccordionContent>
        </AccordionItem>

        {/* 예산 섹션 */}
        <AccordionItem value="budget" className="border-b-0 mb-2">
          <AccordionTrigger className="hover:no-underline px-1 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="text-base font-bold text-text-primary">예산</span>
              {budgetTotal && budgetTotal.minKRW && (
                <span className="text-sm text-text-tertiary font-normal">
                  ({budgetTotal.minKRW} ~ {budgetTotal.maxKRW})
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
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
    <div>
      {sortedDays.map(([dayNumber, dayRestaurants]) => (
        <div key={dayNumber}>
          <SectionTitle icon="🍜" bgColor="#f472b6">
            Day {dayNumber}
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {dayRestaurants.map((restaurant) => (
              <div
                key={`${dayNumber}-${restaurant.name}`}
                className="bg-white border border-border rounded-xl p-5 transition-all hover:border-cat-food/30 hover:-translate-y-0.5"
              >
                {/* 카테고리 + 평점 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-cat-food/15 text-cat-food px-2 py-0.5 rounded-md font-semibold">
                    {restaurant.category}
                  </span>
                  <span className="text-sm text-amber-500 font-semibold">
                    {'★'.repeat(Math.round(restaurant.rating))}{' '}
                    <span className="text-text-secondary">{restaurant.rating}</span>
                    {restaurant.reviewCount && (
                      <span className="text-text-tertiary text-xs ml-1">
                        ({restaurant.reviewCount})
                      </span>
                    )}
                  </span>
                </div>
                {/* 가게명 */}
                <h4 className="text-base font-bold text-text-primary mb-1">{restaurant.name}</h4>
                {/* 설명 */}
                <p className="text-sm text-text-secondary leading-relaxed mb-2">
                  {restaurant.description}
                </p>
                {/* 가격대 */}
                <div className="text-xs text-text-tertiary font-semibold">
                  {restaurant.priceRange}
                </div>
              </div>
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
          <SectionTitle icon="🛫" bgColor="#3b82f6">
            집 → 호텔 경로
          </SectionTitle>
          <div className="bg-surface border border-border rounded-xl p-5 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {homeToHotel.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="bg-bg-tertiary rounded-xl px-4 py-3 text-center min-w-[90px]">
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
          </div>
        </>
      )}

      {/* 도시간 노선 */}
      {intercityRoutes.length > 0 && (
        <>
          <SectionTitle icon="🚃" bgColor="#3b82f6">
            도시간 노선
          </SectionTitle>
          <div className="bg-surface border border-border rounded-xl overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-tertiary text-xs uppercase tracking-wider">
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
                    className="border-b border-border last:border-b-0 hover:bg-primary-50/50 transition-colors"
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
          <SectionTitle icon="🎫" bgColor="#a78bfa">
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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-text-primary">{pass.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${color.badge}`}>
                      {pass.recommendation === 'recommended'
                        ? '추천'
                        : pass.recommendation === 'neutral'
                          ? '보통'
                          : '비추천'}
                    </span>
                  </div>
                  <div className={`text-lg font-bold mb-1 ${color.text}`}>{pass.price}</div>
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
          <SectionTitle icon="💳" bgColor="#22d3ee">
            ICOCA 가이드
          </SectionTitle>
          <div className="bg-surface border border-border rounded-xl p-5 mb-3">
            <ul className="space-y-2">
              {icocaGuide.map((guide, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-cat-activity font-bold shrink-0">{idx + 1}.</span>
                  <span className="text-text-secondary">{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* 교통 팁 */}
      {tips.length > 0 && (
        <>
          <SectionTitle icon="💡" bgColor="#f97316">
            교통 팁
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
      <SectionTitle icon="💰" bgColor="#f97316">
        예산 항목
      </SectionTitle>

      {/* 예산 아이템 리스트 */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-surface border border-border rounded-xl p-4 hover:border-border transition-colors"
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
            {/* 비율 바 */}
            <div className="h-1.5 bg-overlay-light rounded-full overflow-hidden">
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
      <div className="bg-surface border border-cat-sightseeing/30 rounded-xl p-7 mb-8">
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
