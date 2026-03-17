-- =====================================================
-- My Journey — 초기 DB 스키마
-- Supabase 대시보드 SQL Editor에서 실행
-- =====================================================

-- =====================================================
-- 1. profiles (Supabase Auth 확장)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 회원가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      '여행자'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. trips (핵심 엔티티)
-- =====================================================
CREATE TABLE trips (
  id TEXT PRIMARY KEY,                    -- 기존 'trip-{timestamp}' 형식 유지
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INT DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  -- 함께 로드되는 중첩 데이터 (JSONB)
  overview JSONB DEFAULT '{}',            -- { flights, accommodation, tips }
  transport JSONB DEFAULT '{}',           -- { homeToHotel, intercityRoutes, passes, passVerdict, tips }
  -- 예산 섹션 메타 (items는 별도 테이블)
  budget_currency TEXT DEFAULT 'KRW',
  budget_exchange_rate NUMERIC,
  budget_tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_start_date ON trips(start_date DESC);

-- =====================================================
-- 3. trip_days (일정 — 가장 큰 데이터)
-- =====================================================
CREATE TABLE trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  color TEXT DEFAULT '#f97316',
  items JSONB DEFAULT '[]',               -- TimelineItem[] (Day당 10~30개)
  map_spots JSONB DEFAULT '[]',           -- MapSpot[] (Day당 5~15개)
  UNIQUE(trip_id, day_number)
);

CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);

-- =====================================================
-- 4. restaurants (맛집 — 개별 레코드)
-- =====================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  category TEXT DEFAULT '',
  name TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  review_count TEXT,
  description TEXT DEFAULT '',
  price_range TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_restaurants_trip_id ON restaurants(trip_id);

-- =====================================================
-- 5. budget_items (예산 항목 — 개별 레코드)
-- =====================================================
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  icon TEXT DEFAULT '',
  label TEXT NOT NULL,
  detail TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'KRW',
  percentage NUMERIC DEFAULT 0,
  color TEXT DEFAULT '#f97316',
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_budget_items_trip_id ON budget_items(trip_id);

-- =====================================================
-- 6. packing_categories (준비물 카테고리 + items JSONB)
-- =====================================================
CREATE TABLE packing_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  category_icon TEXT DEFAULT '',
  items JSONB DEFAULT '[]',               -- PackingEntry[] ({ name, note })
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_packing_categories_trip_id ON packing_categories(trip_id);

-- =====================================================
-- 7. packing_checks (체크 상태 — 사용자별 분리)
-- =====================================================
CREATE TABLE packing_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  checked_items TEXT[] DEFAULT '{}',      -- 체크된 아이템 이름 배열
  UNIQUE(user_id, trip_id, category)
);

CREATE INDEX idx_packing_checks_trip ON packing_checks(trip_id, user_id);

-- =====================================================
-- 8. pre_todos (사전 준비)
-- =====================================================
CREATE TABLE pre_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT DEFAULT ''
);

CREATE INDEX idx_pre_todos_trip_id ON pre_todos(trip_id);

-- =====================================================
-- 9. trip_shares (공유 권한)
-- =====================================================
CREATE TABLE trip_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,                -- 링크 공유용 고유 토큰
  permission TEXT DEFAULT 'view',         -- 'view' | 'edit'
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ                  -- NULL이면 영구 공유
);

CREATE INDEX idx_trip_shares_token ON trip_shares(share_token);
CREATE INDEX idx_trip_shares_trip ON trip_shares(trip_id);

-- =====================================================
-- RLS (Row Level Security) 정책
-- =====================================================

-- profiles: 본인만 읽기/수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- trips: 소유자 전체 + share_token 읽기(API Route에서 service_role 처리)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_owner_all" ON trips
  FOR ALL USING (user_id = auth.uid());

-- trip_days: trip 소유자 기준
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_days_owner_all" ON trip_days
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- restaurants: trip 소유자 기준
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurants_owner_all" ON restaurants
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- budget_items: trip 소유자 기준
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_items_owner_all" ON budget_items
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- packing_categories: trip 소유자 기준
ALTER TABLE packing_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packing_categories_owner_all" ON packing_categories
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- packing_checks: 본인의 체크 상태만
ALTER TABLE packing_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packing_checks_own" ON packing_checks
  FOR ALL USING (user_id = auth.uid());

-- pre_todos: trip 소유자 기준
ALTER TABLE pre_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pre_todos_owner_all" ON pre_todos
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- trip_shares: trip 소유자만 관리
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_shares_owner_all" ON trip_shares
  FOR ALL USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );
