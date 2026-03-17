import { describe, it, expect } from 'vitest';
import { tripToDb, dbToTrip } from '../trip-mapper';
import type { Trip } from '@/types/trip';

// 테스트용 최소 Trip 객체
function createTestTrip(): Trip {
  return {
    id: 'trip-1710000000',
    title: '오사카 여행',
    destination: '오사카',
    startDate: '2026-04-01',
    endDate: '2026-04-03',
    travelers: 2,
    tags: ['맛집', '관광'],
    overview: {
      flights: [
        {
          direction: 'outbound',
          departure: '인천',
          arrival: '간사이',
          departureTime: '09:00',
          arrivalTime: '11:00',
          date: '2026-04-01',
          duration: '2시간',
        },
      ],
      accommodation: {
        name: '호텔 오사카',
        address: '오사카시 중앙구',
        area: '난바',
        nearbyStations: ['난바역'],
      },
      tips: ['여행 팁 1'],
    },
    days: [
      {
        dayNumber: 1,
        date: '2026-04-01',
        title: 'Day 1',
        subtitle: '도착일',
        color: '#f97316',
        items: [
          { time: '12:00', title: '점심', type: 'food' },
        ],
        mapSpots: [
          { lat: 34.6937, lng: 135.5023, name: '도톤보리', time: '14:00', icon: 'spot' },
        ],
      },
      {
        dayNumber: 2,
        date: '2026-04-02',
        title: 'Day 2',
        subtitle: '관광',
        color: '#6366f1',
        items: [],
        mapSpots: [],
      },
    ],
    restaurants: [
      {
        dayNumber: 1,
        category: '라멘',
        name: '이치란',
        rating: 4.5,
        reviewCount: '1000+',
        description: '유명 라멘집',
        priceRange: '¥800~1200',
      },
    ],
    transport: {
      homeToHotel: [
        { icon: '🚃', title: '난카이 라피트', subtitle: '간사이→난바' },
      ],
      intercityRoutes: [],
      passes: [],
      passVerdict: '',
      tips: ['교통 팁'],
    },
    budget: {
      items: [
        {
          icon: '🍜',
          label: '식비',
          detail: '하루 3끼',
          amount: 3000,
          currency: 'JPY',
          percentage: 60,
          color: '#f97316',
        },
        {
          icon: '🎫',
          label: '교통',
          detail: '교통 패스',
          amount: 2000,
          currency: 'JPY',
          percentage: 40,
          color: '#3b82f6',
        },
      ],
      currency: 'JPY',
      exchangeRate: 10,
      total: { amount: 5000, currency: 'JPY', amountKRW: 50000 },
      tips: ['예산 팁'],
    },
    packing: [
      {
        category: '의류',
        categoryIcon: '👕',
        items: [
          { name: '반팔', note: '2벌', checked: false },
          { name: '긴팔', checked: true },
        ],
      },
    ],
    preTodos: [
      { order: 1, title: '여권 확인', description: '유효기간 체크' },
    ],
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  };
}

const TEST_USER_ID = 'user-uuid-123';

describe('Trip 변환 함수 (trip-mapper)', () => {
  describe('tripToDb', () => {
    it('Trip을 DB 테이블별 행 객체로 분해한다', () => {
      const trip = createTestTrip();
      const result = tripToDb(trip, TEST_USER_ID);

      // trips 행
      expect(result.trip.id).toBe('trip-1710000000');
      expect(result.trip.user_id).toBe(TEST_USER_ID);
      expect(result.trip.title).toBe('오사카 여행');
      expect(result.trip.destination).toBe('오사카');
      expect(result.trip.start_date).toBe('2026-04-01');
      expect(result.trip.end_date).toBe('2026-04-03');
      expect(result.trip.travelers).toBe(2);
      expect(result.trip.tags).toEqual(['맛집', '관광']);
      expect(result.trip.budget_currency).toBe('JPY');
      expect(result.trip.budget_exchange_rate).toBe(10);
      expect(result.trip.budget_tips).toEqual(['예산 팁']);
    });

    it('overview에서 weather를 제외한다', () => {
      const trip = createTestTrip();
      trip.overview.weather = [
        { date: '2026-04-01', dayOfWeek: '수', icon: '☀️', tempHigh: 20, tempLow: 10, tempAvg: 15 },
      ];
      const result = tripToDb(trip, TEST_USER_ID);
      const overview = result.trip.overview as Record<string, unknown>;
      expect(overview).not.toHaveProperty('weather');
      expect(overview).toHaveProperty('flights');
      expect(overview).toHaveProperty('accommodation');
      expect(overview).toHaveProperty('tips');
    });

    it('days를 trip_days 행 배열로 변환한다', () => {
      const trip = createTestTrip();
      const result = tripToDb(trip, TEST_USER_ID);

      expect(result.days).toHaveLength(2);
      expect(result.days[0].trip_id).toBe('trip-1710000000');
      expect(result.days[0].day_number).toBe(1);
      expect(result.days[0].date).toBe('2026-04-01');
      expect(result.days[0].title).toBe('Day 1');
      expect(result.days[0].items).toEqual([
        { time: '12:00', title: '점심', type: 'food' },
      ]);
      expect(result.days[0].map_spots).toEqual([
        { lat: 34.6937, lng: 135.5023, name: '도톤보리', time: '14:00', icon: 'spot' },
      ]);
    });

    it('restaurants를 sort_order 포함 행 배열로 변환한다', () => {
      const trip = createTestTrip();
      const result = tripToDb(trip, TEST_USER_ID);

      expect(result.restaurants).toHaveLength(1);
      expect(result.restaurants[0].trip_id).toBe('trip-1710000000');
      expect(result.restaurants[0].name).toBe('이치란');
      expect(result.restaurants[0].sort_order).toBe(0);
    });

    it('budget_items를 sort_order 포함 행 배열로 변환한다', () => {
      const trip = createTestTrip();
      const result = tripToDb(trip, TEST_USER_ID);

      expect(result.budgetItems).toHaveLength(2);
      expect(result.budgetItems[0].label).toBe('식비');
      expect(result.budgetItems[0].amount).toBe(3000);
      expect(result.budgetItems[0].sort_order).toBe(0);
      expect(result.budgetItems[1].sort_order).toBe(1);
    });

    it('packing을 packing_categories 행 배열로 변환한다 (checked 제외)', () => {
      const trip = createTestTrip();
      const result = tripToDb(trip, TEST_USER_ID);

      expect(result.packingCategories).toHaveLength(1);
      expect(result.packingCategories[0].category).toBe('의류');
      expect(result.packingCategories[0].category_icon).toBe('👕');
      // items에서 checked 필드가 제거되어야 함
      const items = result.packingCategories[0].items as Array<{ name: string; note?: string }>;
      expect(items[0]).toEqual({ name: '반팔', note: '2벌' });
      expect(items[1]).toEqual({ name: '긴팔' });
      expect(items[0]).not.toHaveProperty('checked');
    });

    it('preTodos를 sort_order 포함 행 배열로 변환한다', () => {
      const trip = createTestTrip();
      const result = tripToDb(trip, TEST_USER_ID);

      expect(result.preTodos).toHaveLength(1);
      expect(result.preTodos[0].title).toBe('여권 확인');
      expect(result.preTodos[0].sort_order).toBe(1);
    });
  });

  describe('dbToTrip', () => {
    it('DB 행들을 조립하여 App Trip 객체를 생성한다', () => {
      const trip = createTestTrip();
      const db = tripToDb(trip, TEST_USER_ID);

      const assembled = dbToTrip(
        db.trip,
        db.days,
        db.restaurants,
        db.budgetItems,
        db.packingCategories,
        db.preTodos,
      );

      expect(assembled.id).toBe(trip.id);
      expect(assembled.title).toBe(trip.title);
      expect(assembled.destination).toBe(trip.destination);
      expect(assembled.startDate).toBe(trip.startDate);
      expect(assembled.endDate).toBe(trip.endDate);
      expect(assembled.travelers).toBe(trip.travelers);
      expect(assembled.tags).toEqual(trip.tags);
    });

    it('days를 dayNumber 기준으로 정렬한다', () => {
      const trip = createTestTrip();
      const db = tripToDb(trip, TEST_USER_ID);
      // 역순으로 전달
      const reversedDays = [...db.days].reverse();

      const assembled = dbToTrip(
        db.trip,
        reversedDays,
        db.restaurants,
        db.budgetItems,
        db.packingCategories,
        db.preTodos,
      );

      expect(assembled.days[0].dayNumber).toBe(1);
      expect(assembled.days[1].dayNumber).toBe(2);
    });

    it('restaurants를 sort_order 기준으로 정렬한다', () => {
      const trip = createTestTrip();
      trip.restaurants.push({
        dayNumber: 2,
        category: '스시',
        name: '스시집',
        rating: 4.0,
        description: '신선한 스시',
        priceRange: '¥2000~3000',
      });
      const db = tripToDb(trip, TEST_USER_ID);
      // 역순으로 전달
      const reversedRestaurants = [...db.restaurants].reverse();

      const assembled = dbToTrip(
        db.trip,
        db.days,
        reversedRestaurants,
        db.budgetItems,
        db.packingCategories,
        db.preTodos,
      );

      expect(assembled.restaurants[0].name).toBe('이치란');
      expect(assembled.restaurants[1].name).toBe('스시집');
    });

    it('budget total을 calculateBudgetTotal로 자동 계산한다', () => {
      const trip = createTestTrip();
      const db = tripToDb(trip, TEST_USER_ID);

      const assembled = dbToTrip(
        db.trip,
        db.days,
        db.restaurants,
        db.budgetItems,
        db.packingCategories,
        db.preTodos,
      );

      expect(assembled.budget.total.amount).toBe(5000);
      expect(assembled.budget.total.currency).toBe('JPY');
      expect(assembled.budget.total.amountKRW).toBe(50000);
    });

    it('packing items에 checked: false를 기본값으로 추가한다', () => {
      const trip = createTestTrip();
      const db = tripToDb(trip, TEST_USER_ID);

      const assembled = dbToTrip(
        db.trip,
        db.days,
        db.restaurants,
        db.budgetItems,
        db.packingCategories,
        db.preTodos,
      );

      expect(assembled.packing[0].items[0].checked).toBe(false);
      expect(assembled.packing[0].items[1].checked).toBe(false);
    });

    it('왕복 변환(Trip -> DB -> Trip)이 핵심 데이터를 보존한다', () => {
      const original = createTestTrip();
      const db = tripToDb(original, TEST_USER_ID);
      const roundTripped = dbToTrip(
        db.trip,
        db.days,
        db.restaurants,
        db.budgetItems,
        db.packingCategories,
        db.preTodos,
      );

      // 메타 정보 일치
      expect(roundTripped.id).toBe(original.id);
      expect(roundTripped.title).toBe(original.title);
      expect(roundTripped.destination).toBe(original.destination);

      // days 구조 일치 (dayNumber, date, items 수)
      expect(roundTripped.days).toHaveLength(original.days.length);
      expect(roundTripped.days[0].items).toHaveLength(original.days[0].items.length);

      // restaurants 수 일치
      expect(roundTripped.restaurants).toHaveLength(original.restaurants.length);

      // budget items 일치
      expect(roundTripped.budget.items).toHaveLength(original.budget.items.length);
      expect(roundTripped.budget.currency).toBe(original.budget.currency);

      // transport 구조 보존
      expect(roundTripped.transport.homeToHotel).toHaveLength(original.transport.homeToHotel.length);

      // preTodos 수 일치
      expect(roundTripped.preTodos).toHaveLength(original.preTodos.length);
    });
  });
});
