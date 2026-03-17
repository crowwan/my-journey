// 공유 토큰으로 Trip 데이터를 조회하는 API Route
// 비로그인 접근을 위해 service_role 키로 RLS 우회

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dbToTrip } from '@/lib/supabase/trip-mapper';
import type {
  DbTrip,
  DbTripDay,
  DbRestaurant,
  DbBudgetItem,
  DbPackingCategory,
  DbPreTodo,
} from '@/types/supabase';

// service_role 클라이언트 (RLS 우회)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json(
      { success: false, error: '유효하지 않은 공유 링크입니다.' },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // 1. share_token으로 trip_id 조회
  const shareResult = await supabase
    .from('trip_shares')
    .select('trip_id')
    .eq('share_token', token)
    .maybeSingle();

  if (shareResult.error || !shareResult.data) {
    return NextResponse.json(
      { success: false, error: '공유 링크가 만료되었거나 존재하지 않습니다.' },
      { status: 404 },
    );
  }

  const tripId = shareResult.data.trip_id as string;

  // 2. Trip 전체 데이터 조립 (6개 테이블 병렬 쿼리)
  const [tripRes, daysRes, restaurantsRes, budgetRes, packingRes, todosRes] =
    await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).single(),
      supabase.from('trip_days').select('*').eq('trip_id', tripId),
      supabase.from('restaurants').select('*').eq('trip_id', tripId),
      supabase.from('budget_items').select('*').eq('trip_id', tripId),
      supabase.from('packing_categories').select('*').eq('trip_id', tripId),
      supabase.from('pre_todos').select('*').eq('trip_id', tripId),
    ]);

  if (tripRes.error || !tripRes.data) {
    return NextResponse.json(
      { success: false, error: '여행 데이터를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  const trip = dbToTrip(
    tripRes.data as unknown as DbTrip,
    (daysRes.data ?? []) as unknown as DbTripDay[],
    (restaurantsRes.data ?? []) as unknown as DbRestaurant[],
    (budgetRes.data ?? []) as unknown as DbBudgetItem[],
    (packingRes.data ?? []) as unknown as DbPackingCategory[],
    (todosRes.data ?? []) as unknown as DbPreTodo[],
  );

  return NextResponse.json({ success: true, trip });
}
