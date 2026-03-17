// ============================================================
// Supabase DB 테이블 행 타입 정의
// 001_initial_schema.sql 기반
// ============================================================

// trips 테이블 행
export interface DbTrip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  tags: string[];
  overview: Record<string, unknown>; // JSONB
  transport: Record<string, unknown>; // JSONB
  budget_currency: string;
  budget_exchange_rate: number | null;
  budget_tips: string[];
  created_at: string;
  updated_at: string;
}

// trip_days 테이블 행
export interface DbTripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string;
  subtitle: string;
  color: string;
  items: Record<string, unknown>[]; // JSONB
  map_spots: Record<string, unknown>[]; // JSONB
}

// restaurants 테이블 행
export interface DbRestaurant {
  id: string;
  trip_id: string;
  day_number: number;
  category: string;
  name: string;
  rating: number;
  review_count: string | null;
  description: string;
  price_range: string;
  sort_order: number;
}

// budget_items 테이블 행
export interface DbBudgetItem {
  id: string;
  trip_id: string;
  icon: string;
  label: string;
  detail: string;
  amount: number;
  currency: string;
  percentage: number;
  color: string;
  sort_order: number;
}

// packing_categories 테이블 행
export interface DbPackingCategory {
  id: string;
  trip_id: string;
  category: string;
  category_icon: string;
  items: Record<string, unknown>[]; // JSONB
  sort_order: number;
}

// pre_todos 테이블 행
export interface DbPreTodo {
  id: string;
  trip_id: string;
  sort_order: number;
  title: string;
  description: string;
}

// packing_checks 테이블 행
export interface DbPackingCheck {
  id: string;
  user_id: string;
  trip_id: string;
  category: string;
  checked_items: string[];
}

// trip_shares 테이블 행
export interface DbTripShare {
  id: string;
  trip_id: string;
  shared_with_user_id: string | null;
  share_token: string | null;
  permission: string;
  created_at: string;
  expires_at: string | null;
}
