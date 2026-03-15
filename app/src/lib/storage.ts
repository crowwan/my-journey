import type { Trip, TripSummary } from '@/types/trip';
import { migrateBudget } from '@/lib/budget-utils';

const TRIP_PREFIX = 'trip:';
const TRIP_LIST_KEY = 'trip:list';
const PACKING_PREFIX = 'packing:checked:';

export const storage = {
  // Trip CRUD (로드 시 구 데이터 자동 마이그레이션)
  getTrip(tripId: string): Trip | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`${TRIP_PREFIX}${tripId}`);
    if (!raw) return null;
    const trip = JSON.parse(raw) as Trip;
    // 예산 구 데이터 마이그레이션 (amount가 string인 경우)
    if (trip.budget) {
      trip.budget = migrateBudget(trip.budget as unknown as Record<string, unknown>);
    }
    return trip;
  },

  saveTrip(trip: Trip): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${TRIP_PREFIX}${trip.id}`, JSON.stringify(trip));
    // 여행 목록 업데이트
    const list = this.getTripIds();
    if (!list.includes(trip.id)) {
      list.unshift(trip.id);
    }
    localStorage.setItem(TRIP_LIST_KEY, JSON.stringify(list));
  },

  deleteTrip(tripId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${TRIP_PREFIX}${tripId}`);
    localStorage.removeItem(`${PACKING_PREFIX}${tripId}`);
    const list = this.getTripIds().filter((id) => id !== tripId);
    localStorage.setItem(TRIP_LIST_KEY, JSON.stringify(list));
  },

  getTripIds(): string[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(TRIP_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  getAllTrips(): Trip[] {
    return this.getTripIds()
      .map((id) => this.getTrip(id))
      .filter((t): t is Trip => t !== null);
  },

  getTripSummaries(): TripSummary[] {
    return this.getAllTrips().map((trip) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelers: trip.travelers,
      tags: trip.tags,
      dayCount: trip.days.length,
    }));
  },

  // 준비물 체크 상태 (여행 데이터와 분리 관리)
  getPackingChecked(tripId: string): Record<string, string[]> {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(`${PACKING_PREFIX}${tripId}`);
    return raw ? JSON.parse(raw) : {};
  },

  setPackingChecked(tripId: string, checked: Record<string, string[]>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      `${PACKING_PREFIX}${tripId}`,
      JSON.stringify(checked)
    );
  },
};
