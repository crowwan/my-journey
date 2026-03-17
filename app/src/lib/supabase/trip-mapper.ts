// ============================================================
// Trip 변환 함수 (App ↔ DB)
// App의 Trip 객체와 Supabase DB 테이블 행 간 변환
// ============================================================

import type { Trip, TransportSection, TripOverview } from '@/types/trip';
import type {
  DbTrip,
  DbTripDay,
  DbRestaurant,
  DbBudgetItem,
  DbPackingCategory,
  DbPreTodo,
} from '@/types/supabase';
import { calculateBudgetTotal } from '@/domain/budget';

// tripToDb 반환 타입
interface TripDbRows {
  trip: Omit<DbTrip, 'id'> & { id: string };
  days: Omit<DbTripDay, 'id'>[];
  restaurants: Omit<DbRestaurant, 'id'>[];
  budgetItems: Omit<DbBudgetItem, 'id'>[];
  packingCategories: Omit<DbPackingCategory, 'id'>[];
  preTodos: Omit<DbPreTodo, 'id'>[];
}

/**
 * App Trip 객체를 DB 테이블별 행 객체로 분해한다
 * - overview에서 weather 제외 (실시간 API)
 * - packing items에서 checked 제외 (별도 테이블)
 * - budget total, range 제외 (조립 시 자동 계산)
 */
export function tripToDb(trip: Trip, userId: string): TripDbRows {
  // overview에서 weather 제외
  const { weather: _weather, ...overviewWithoutWeather } = trip.overview;

  const tripRow: TripDbRows['trip'] = {
    id: trip.id,
    user_id: userId,
    title: trip.title,
    destination: trip.destination,
    start_date: trip.startDate,
    end_date: trip.endDate,
    travelers: trip.travelers,
    tags: trip.tags,
    overview: overviewWithoutWeather as unknown as Record<string, unknown>,
    transport: trip.transport as unknown as Record<string, unknown>,
    budget_currency: trip.budget.currency,
    budget_exchange_rate: trip.budget.exchangeRate ?? null,
    budget_tips: trip.budget.tips,
    created_at: trip.createdAt,
    updated_at: trip.updatedAt,
  };

  // days -> trip_days 행 배열
  const days: TripDbRows['days'] = trip.days.map((day) => ({
    trip_id: trip.id,
    day_number: day.dayNumber,
    date: day.date,
    title: day.title,
    subtitle: day.subtitle,
    color: day.color,
    items: day.items as unknown as Record<string, unknown>[],
    map_spots: day.mapSpots as unknown as Record<string, unknown>[],
  }));

  // restaurants -> restaurants 행 배열
  const restaurants: TripDbRows['restaurants'] = trip.restaurants.map(
    (r, index) => ({
      trip_id: trip.id,
      day_number: r.dayNumber,
      category: r.category,
      name: r.name,
      rating: r.rating,
      review_count: r.reviewCount ?? null,
      description: r.description,
      price_range: r.priceRange,
      sort_order: index,
    }),
  );

  // budget.items -> budget_items 행 배열
  const budgetItems: TripDbRows['budgetItems'] = trip.budget.items.map(
    (item, index) => ({
      trip_id: trip.id,
      icon: item.icon,
      label: item.label,
      detail: item.detail,
      amount: item.amount,
      currency: item.currency,
      percentage: item.percentage,
      color: item.color,
      sort_order: index,
    }),
  );

  // packing -> packing_categories 행 배열 (checked 제외)
  const packingCategories: TripDbRows['packingCategories'] = trip.packing.map(
    (cat, index) => ({
      trip_id: trip.id,
      category: cat.category,
      category_icon: cat.categoryIcon,
      items: cat.items.map((item) => {
        const entry: Record<string, unknown> = { name: item.name };
        if (item.note) entry.note = item.note;
        return entry;
      }),
      sort_order: index,
    }),
  );

  // preTodos -> pre_todos 행 배열
  const preTodos: TripDbRows['preTodos'] = trip.preTodos.map((todo) => ({
    trip_id: trip.id,
    sort_order: todo.order,
    title: todo.title,
    description: todo.description,
  }));

  return { trip: tripRow, days, restaurants, budgetItems, packingCategories, preTodos };
}

/**
 * DB 행들을 조립하여 App Trip 객체를 생성한다
 * - days를 dayNumber 기준 정렬
 * - restaurants를 sort_order 기준 정렬
 * - budget total은 calculateBudgetTotal로 자동 계산
 * - packing items에 checked: false 기본값 추가
 */
export function dbToTrip(
  dbTrip: DbTrip | TripDbRows['trip'],
  dbDays: Array<DbTripDay | TripDbRows['days'][number]>,
  dbRestaurants: Array<DbRestaurant | TripDbRows['restaurants'][number]>,
  dbBudgetItems: Array<DbBudgetItem | TripDbRows['budgetItems'][number]>,
  dbPackingCategories: Array<DbPackingCategory | TripDbRows['packingCategories'][number]>,
  dbPreTodos: Array<DbPreTodo | TripDbRows['preTodos'][number]>,
): Trip {
  const overview = dbTrip.overview as unknown as TripOverview;
  const transport = dbTrip.transport as unknown as TransportSection;

  // budget items를 sort_order로 정렬
  const sortedBudgetItems = [...dbBudgetItems].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const budgetItems = sortedBudgetItems.map((item) => ({
    icon: item.icon,
    label: item.label,
    detail: item.detail,
    amount: item.amount,
    currency: item.currency,
    percentage: item.percentage,
    color: item.color,
  }));

  const exchangeRate = dbTrip.budget_exchange_rate ?? undefined;
  const total = calculateBudgetTotal(
    budgetItems,
    dbTrip.budget_currency,
    exchangeRate,
  );

  // days를 dayNumber 기준 정렬
  const sortedDays = [...dbDays].sort((a, b) => a.day_number - b.day_number);

  // restaurants를 sort_order 기준 정렬
  const sortedRestaurants = [...dbRestaurants].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  // packing categories를 sort_order 기준 정렬
  const sortedPacking = [...dbPackingCategories].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  // preTodos를 sort_order 기준 정렬
  const sortedPreTodos = [...dbPreTodos].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    id: dbTrip.id,
    title: dbTrip.title,
    destination: dbTrip.destination,
    startDate: dbTrip.start_date,
    endDate: dbTrip.end_date,
    travelers: dbTrip.travelers,
    tags: dbTrip.tags,
    overview,
    days: sortedDays.map((day) => ({
      dayNumber: day.day_number,
      date: day.date,
      title: day.title,
      subtitle: day.subtitle,
      color: day.color,
      items: day.items as unknown as Trip['days'][number]['items'],
      mapSpots: day.map_spots as unknown as Trip['days'][number]['mapSpots'],
    })),
    restaurants: sortedRestaurants.map((r) => ({
      dayNumber: r.day_number,
      category: r.category,
      name: r.name,
      rating: r.rating,
      reviewCount: r.review_count ?? undefined,
      description: r.description,
      priceRange: r.price_range,
    })),
    transport,
    budget: {
      items: budgetItems,
      currency: dbTrip.budget_currency,
      exchangeRate,
      total,
      tips: dbTrip.budget_tips,
    },
    packing: sortedPacking.map((cat) => ({
      category: cat.category,
      categoryIcon: cat.category_icon,
      items: (cat.items as Array<{ name: string; note?: string }>).map(
        (item) => ({
          name: item.name,
          note: item.note,
          checked: false, // DB에서 조립 시 기본값
        }),
      ),
    })),
    preTodos: sortedPreTodos.map((todo) => ({
      order: todo.sort_order,
      title: todo.title,
      description: todo.description,
    })),
    createdAt: dbTrip.created_at,
    updatedAt: dbTrip.updated_at,
  };
}
