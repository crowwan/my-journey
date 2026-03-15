// ============================================================
// Root Entity
// ============================================================
export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string; // ISO "2026-03-02"
  endDate: string;
  travelers: number;
  tags: string[];
  overview: TripOverview;
  days: Day[];
  restaurants: Restaurant[];
  transport: TransportSection;
  budget: BudgetSection;
  packing: PackingItem[];
  preTodos: PreTodoItem[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Overview
// ============================================================
export interface TripOverview {
  flights: Flight[];
  accommodation: Accommodation;
  // 레거시: AI 생성 데이터. 실시간 날씨는 /api/weather에서 조회
  weather?: WeatherDay[];
  tips: string[];
}

export interface Flight {
  direction: 'outbound' | 'inbound';
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  duration: string;
  note?: string;
}

export interface Accommodation {
  name: string;
  address: string;
  area: string;
  nearbyStations: string[];
  mapUrl?: string;
}

export interface WeatherDay {
  date: string;
  dayOfWeek: string;
  icon: string;
  tempHigh: number;
  tempLow: number;
  tempAvg: number;
}

// ============================================================
// Day / Timeline
// ============================================================
export interface Day {
  dayNumber: number;
  date: string;
  title: string;
  subtitle: string;
  color: string;
  items: TimelineItem[];
  mapSpots: MapSpot[];
}

export type TimelineItemType = 'spot' | 'food' | 'move' | 'default';

export interface TimelineItem {
  time: string;
  title: string;
  description?: string;
  type: TimelineItemType;
  cost?: number;
  currency?: string;
  badge?: string;
}

export interface MapSpot {
  lat: number;
  lng: number;
  name: string;
  time: string;
  icon: string;
}

// ============================================================
// Restaurants
// ============================================================
export interface Restaurant {
  dayNumber: number;
  category: string;
  name: string;
  rating: number;
  reviewCount?: string;
  description: string;
  priceRange: string;
}

// ============================================================
// Transport
// ============================================================
export interface TransportSection {
  homeToHotel: TransportStep[];
  intercityRoutes: TransportRoute[];
  passes: TransportPass[];
  passVerdict: string;
  icocaGuide?: string[];
  tips: string[];
}

export interface TransportStep {
  icon: string;
  title: string;
  subtitle: string;
}

export interface TransportRoute {
  from: string;
  to: string;
  method: string;
  duration: string;
  cost: string;
}

export interface TransportPass {
  name: string;
  price: string;
  recommendation: 'recommended' | 'neutral' | 'not-recommended';
  reason: string;
}

// ============================================================
// Budget
// ============================================================
export interface BudgetSection {
  items: BudgetItem[];
  currency: string;        // 기본 통화 코드 (JPY, KRW, USD 등)
  exchangeRate?: number;   // 1 외화 = ? KRW (예: JPY면 10)
  total: BudgetTotal;      // 자동 계산 기반 합계
  range?: BudgetRange;     // 구 데이터 호환용 (optional)
  tips: string[];
}

export interface BudgetItem {
  icon: string;
  label: string;
  detail: string;
  amount: number;          // 숫자 금액 (3000)
  currency: string;        // 통화 코드 (JPY)
  percentage: number;
  color: string;
}

// 자동 계산 기반 합계
export interface BudgetTotal {
  amount: number;          // items 합계
  currency: string;        // 기본 통화
  amountKRW?: number;      // 환율 적용 원화
}

// 구 데이터 호환용 (하위 호환)
export interface BudgetRange {
  min: string;
  max: string;
  minKRW: string;
  maxKRW: string;
}

// ============================================================
// Packing & Pre-Todos
// ============================================================
export interface PackingItem {
  category: string;
  categoryIcon: string;
  items: PackingEntry[];
}

export interface PackingEntry {
  name: string;
  note?: string;
  checked: boolean;
}

export interface PreTodoItem {
  order: number;
  title: string;
  description: string;
}

// ============================================================
// Trip Summary (홈 목록용)
// ============================================================
export interface TripSummary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  tags: string[];
  dayCount: number;
}

// ============================================================
// Chat Types
// ============================================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tripAction?: TripAction;
  tripPreview?: Trip;
}

export type TripActionType =
  | 'create_trip'
  | 'update_day'
  | 'update_item'
  | 'add_item'
  | 'remove_item'
  | 'update_restaurant'
  | 'update_budget'
  | 'update_overview'
  | 'update_transport'
  | 'update_packing'
  | 'update_pretodos'
  | 'replace_trip';

export interface TripAction {
  action: TripActionType;
  message: string;
  dayNumber?: number;
  itemIndex?: number;
  data?: unknown;
}
