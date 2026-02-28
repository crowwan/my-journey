import type { Restaurant } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';

interface RestaurantTabProps {
  restaurants: Restaurant[];
}

export function RestaurantTab({ restaurants }: RestaurantTabProps) {
  // 빈 상태 처리
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="animate-fade-up">
        <div className="text-center py-12 text-text-tertiary">
          <div className="text-3xl mb-2">🍜</div>
          <p className="text-sm">AI가 이 섹션을 아직 생성하지 않았습니다</p>
        </div>
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

  // dayNumber 순서대로 정렬
  const sortedDays = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="animate-fade-up">
      {sortedDays.map(([dayNumber, dayRestaurants]) => (
        <div key={dayNumber}>
          <SectionTitle icon="🍜" bgColor="#f472b6">
            Day {dayNumber}
          </SectionTitle>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {dayRestaurants.map((restaurant) => (
              <div
                key={`${dayNumber}-${restaurant.name}`}
                className="bg-white border border-border rounded-[16px] p-5 transition-all hover:border-trip-pink/30 hover:-translate-y-0.5"
              >
                {/* 카테고리 + 평점 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-trip-pink/15 text-trip-pink px-2 py-0.5 rounded-md font-semibold">
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
                <h4 className="text-base font-bold text-text mb-1">{restaurant.name}</h4>
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
