// ============================================================
// Supabase 데이터 접근 모듈
// Trip CRUD + 패킹 체크 상태 관리
// Supabase 클라이언트에 Database 제네릭이 없으므로,
// 응답 데이터는 런타임에 DB 스키마와 일치한다고 전제한다.
// ============================================================

import { createClient } from '@/lib/supabase/client';
import { tripToDb, dbToTrip } from './trip-mapper';
import type { Trip, TripSummary } from '@/types/trip';
import type {
  DbTrip,
  DbTripDay,
  DbRestaurant,
  DbBudgetItem,
  DbPackingCategory,
  DbPreTodo,
  DbPackingCheck,
} from '@/types/supabase';

// Supabase 쿼리 결과 타입 헬퍼
interface SupabaseResult<T> {
  data: T | null;
  error: { message: string } | null;
}

// Supabase 쿼리 결과에서 데이터를 추출하고, 에러 시 throw
function unwrap<T>(result: SupabaseResult<T>, errorPrefix: string): T {
  if (result.error) throw new Error(`${errorPrefix}: ${result.error.message}`);
  return result.data ?? ([] as unknown as T);
}

/**
 * 여행 목록 조회 (경량 — 메타 필드만)
 * RLS가 자동으로 현재 사용자 필터링
 */
export async function getTripSummaries(): Promise<TripSummary[]> {
  const supabase = createClient();

  const result = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  const trips = unwrap(result, '여행 목록 조회 실패') as DbTrip[];

  if (trips.length === 0) return [];

  // trip_days에서 day_count를 가져오기 위해 별도 쿼리
  const tripIds = trips.map((t) => t.id);

  const dayResult = await supabase
    .from('trip_days')
    .select('*')
    .in('trip_id', tripIds);

  const dayRows = unwrap(dayResult, '일정 수 조회 실패') as DbTripDay[];

  // trip_id별 day 수 집계
  const dayCountMap = new Map<string, number>();
  for (const row of dayRows) {
    dayCountMap.set(row.trip_id, (dayCountMap.get(row.trip_id) ?? 0) + 1);
  }

  return trips.map((row) => ({
    id: row.id,
    title: row.title,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    travelers: row.travelers,
    tags: row.tags,
    dayCount: dayCountMap.get(row.id) ?? 0,
  }));
}

/**
 * 전체 여행 목록 (Trip[] — 캘린더 등 전체 데이터 필요 시)
 */
export async function getAllTrips(): Promise<Trip[]> {
  const supabase = createClient();

  const tripResult = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  const trips = unwrap(tripResult, '전체 여행 조회 실패') as DbTrip[];
  if (trips.length === 0) return [];

  const tripIds = trips.map((t) => t.id);

  // 하위 테이블 병렬 쿼리
  const [daysRes, restaurantsRes, budgetRes, packingRes, todosRes] =
    await Promise.all([
      supabase.from('trip_days').select('*').in('trip_id', tripIds),
      supabase.from('restaurants').select('*').in('trip_id', tripIds),
      supabase.from('budget_items').select('*').in('trip_id', tripIds),
      supabase.from('packing_categories').select('*').in('trip_id', tripIds),
      supabase.from('pre_todos').select('*').in('trip_id', tripIds),
    ]);

  const days = unwrap(daysRes, '일정 조회 실패') as DbTripDay[];
  const restaurants = unwrap(restaurantsRes, '맛집 조회 실패') as DbRestaurant[];
  const budgetItems = unwrap(budgetRes, '예산 조회 실패') as DbBudgetItem[];
  const packingCategories = unwrap(packingRes, '준비물 조회 실패') as DbPackingCategory[];
  const preTodos = unwrap(todosRes, '할일 조회 실패') as DbPreTodo[];

  // trip_id별로 그룹핑
  const groupBy = <T extends { trip_id: string }>(rows: T[]) => {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      const existing = map.get(row.trip_id) ?? [];
      existing.push(row);
      map.set(row.trip_id, existing);
    }
    return map;
  };

  const daysMap = groupBy(days);
  const restaurantsMap = groupBy(restaurants);
  const budgetMap = groupBy(budgetItems);
  const packingMap = groupBy(packingCategories);
  const todosMap = groupBy(preTodos);

  return trips.map((dbTrip) =>
    dbToTrip(
      dbTrip,
      daysMap.get(dbTrip.id) ?? [],
      restaurantsMap.get(dbTrip.id) ?? [],
      budgetMap.get(dbTrip.id) ?? [],
      packingMap.get(dbTrip.id) ?? [],
      todosMap.get(dbTrip.id) ?? [],
    ),
  );
}

/**
 * 단일 여행 조회 (6개 테이블 병렬 쿼리)
 */
export async function getTrip(tripId: string): Promise<Trip | null> {
  const supabase = createClient();

  // 6개 테이블 병렬 쿼리
  const [tripRes, daysRes, restaurantsRes, budgetRes, packingRes, todosRes] =
    await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).single(),
      supabase.from('trip_days').select('*').eq('trip_id', tripId),
      supabase.from('restaurants').select('*').eq('trip_id', tripId),
      supabase.from('budget_items').select('*').eq('trip_id', tripId),
      supabase.from('packing_categories').select('*').eq('trip_id', tripId),
      supabase.from('pre_todos').select('*').eq('trip_id', tripId),
    ]);

  // trips가 없으면 null 반환
  if (tripRes.error || !tripRes.data) return null;

  const dbTrip = tripRes.data as unknown as DbTrip;
  const dbDays = (daysRes.data ?? []) as unknown as DbTripDay[];
  const dbRestaurants = (restaurantsRes.data ?? []) as unknown as DbRestaurant[];
  const dbBudgetItems = (budgetRes.data ?? []) as unknown as DbBudgetItem[];
  const dbPackingCategories = (packingRes.data ?? []) as unknown as DbPackingCategory[];
  const dbPreTodos = (todosRes.data ?? []) as unknown as DbPreTodo[];

  return dbToTrip(dbTrip, dbDays, dbRestaurants, dbBudgetItems, dbPackingCategories, dbPreTodos);
}

/**
 * 여행 저장 (생성 + 수정)
 * trips upsert -> 하위 테이블: 기존 삭제 후 insert (replace 전략)
 */
export async function saveTrip(trip: Trip, userId: string): Promise<void> {
  const supabase = createClient();
  const db = tripToDb(trip, userId);

  // 1. trips upsert (FK 참조 대상이므로 먼저)
  const { error: tripError } = await supabase
    .from('trips')
    .upsert(db.trip as Record<string, unknown>);

  if (tripError) throw new Error(`여행 저장 실패: ${tripError.message}`);

  // 2. 하위 테이블: 기존 삭제 후 insert (AI가 전체 교체하므로 replace 전략)
  const tripId = trip.id;

  // 기존 하위 데이터 삭제 (병렬)
  const deleteResults = await Promise.all([
    supabase.from('trip_days').delete().eq('trip_id', tripId),
    supabase.from('restaurants').delete().eq('trip_id', tripId),
    supabase.from('budget_items').delete().eq('trip_id', tripId),
    supabase.from('packing_categories').delete().eq('trip_id', tripId),
    supabase.from('pre_todos').delete().eq('trip_id', tripId),
  ]);

  for (const result of deleteResults) {
    if (result.error) {
      throw new Error(`하위 데이터 삭제 실패: ${result.error.message}`);
    }
  }

  // 새 데이터 insert (빈 배열이면 skip)
  const insertPromises: Promise<SupabaseResult<unknown>>[] = [];

  if (db.days.length > 0) {
    insertPromises.push(
      supabase.from('trip_days').insert(db.days as Record<string, unknown>[]),
    );
  }
  if (db.restaurants.length > 0) {
    insertPromises.push(
      supabase.from('restaurants').insert(db.restaurants as Record<string, unknown>[]),
    );
  }
  if (db.budgetItems.length > 0) {
    insertPromises.push(
      supabase.from('budget_items').insert(db.budgetItems as Record<string, unknown>[]),
    );
  }
  if (db.packingCategories.length > 0) {
    insertPromises.push(
      supabase.from('packing_categories').insert(db.packingCategories as Record<string, unknown>[]),
    );
  }
  if (db.preTodos.length > 0) {
    insertPromises.push(
      supabase.from('pre_todos').insert(db.preTodos as Record<string, unknown>[]),
    );
  }

  const insertResults = await Promise.all(insertPromises);

  for (const result of insertResults) {
    if (result.error) {
      throw new Error(`하위 데이터 저장 실패: ${result.error.message}`);
    }
  }
}

/**
 * 여행 삭제 (CASCADE로 하위 자동 삭제)
 */
export async function deleteTrip(tripId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('trips').delete().eq('id', tripId);

  if (error) throw new Error(`여행 삭제 실패: ${error.message}`);
}

/**
 * 패킹 체크 상태 조회
 * Record<category, checkedItemNames[]> 형태로 반환
 */
export async function getPackingChecks(
  tripId: string,
): Promise<Record<string, string[]>> {
  const supabase = createClient();

  const result = await supabase
    .from('packing_checks')
    .select('*')
    .eq('trip_id', tripId);

  const rows = unwrap(result, '패킹 체크 조회 실패') as DbPackingCheck[];

  const checks: Record<string, string[]> = {};
  for (const row of rows) {
    checks[row.category] = row.checked_items;
  }
  return checks;
}

/**
 * 패킹 체크 상태 저장 (upsert)
 */
export async function setPackingCheck(
  tripId: string,
  userId: string,
  category: string,
  checkedItems: string[],
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('packing_checks')
    .upsert(
      {
        user_id: userId,
        trip_id: tripId,
        category,
        checked_items: checkedItems,
      } as Record<string, unknown>,
      { onConflict: 'user_id,trip_id,category' },
    );

  if (error) throw new Error(`패킹 체크 저장 실패: ${error.message}`);
}
