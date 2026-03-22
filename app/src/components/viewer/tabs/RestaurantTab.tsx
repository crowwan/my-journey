import type { Restaurant } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';

interface RestaurantTabProps {
  restaurants: Restaurant[];
}

export function RestaurantTab({ restaurants }: RestaurantTabProps) {
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-16 text-text-tertiary">
          <div className="text-4xl mb-3">🍜</div>
          <p className="text-sm font-medium">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
      </div>
    );
  }

  const grouped = new Map<number, Restaurant[]>();
  restaurants.forEach((r) => {
    const list = grouped.get(r.dayNumber) ?? [];
    list.push(r);
    grouped.set(r.dayNumber, list);
  });

  const sortedDays = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="animate-fade-up">
      {sortedDays.map(([dayNumber, dayRestaurants]) => (
        <div key={dayNumber}>
          <SectionTitle icon="🍜" bgColor="#f472b6">
            Day {dayNumber}
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {dayRestaurants.map((restaurant) => (
              <div
                key={`${dayNumber}-${restaurant.name}`}
                className="bg-surface-elevated border border-border rounded-2xl p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:border-trip-pink/25 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
              >
                {/* 카테고리 + 평점 */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs bg-trip-pink/10 text-trip-pink px-2.5 py-1 rounded-lg font-bold border border-trip-pink/12">
                    {restaurant.category}
                  </span>
                  <span className="text-sm text-amber-500 font-bold">
                    {'★'.repeat(Math.round(restaurant.rating))}{' '}
                    <span className="text-text-secondary font-medium">{restaurant.rating}</span>
                    {restaurant.reviewCount && (
                      <span className="text-text-tertiary text-xs ml-1">
                        ({restaurant.reviewCount})
                      </span>
                    )}
                  </span>
                </div>
                <h4 className="text-[15px] font-bold text-text mb-1.5">{restaurant.name}</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed mb-2">
                  {restaurant.description}
                </p>
                <div className="text-xs text-text-tertiary font-bold">
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
