import { create } from 'zustand';
import type { Trip, TripSummary } from '@/types/trip';
import { storage } from '@/lib/storage';

interface TripState {
  trips: Map<string, Trip>;
  currentTripId: string | null;
  isLoaded: boolean;

  // Actions
  loadTrips: () => void;

  saveTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (tripId: string | null) => void;
  getTripSummaries: () => TripSummary[];

  // 준비물 체크 (로컬 상태)
  togglePackingItem: (tripId: string, category: string, itemName: string) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: new Map(),
  currentTripId: null,
  isLoaded: false,

  loadTrips: () => {
    const allTrips = storage.getAllTrips();
    const tripsMap = new Map<string, Trip>();
    allTrips.forEach((trip) => tripsMap.set(trip.id, trip));
    set({ trips: tripsMap, isLoaded: true });
  },


  saveTrip: (trip) => {
    storage.saveTrip(trip);
    set((state) => {
      const newTrips = new Map(state.trips);
      newTrips.set(trip.id, trip);
      return { trips: newTrips };
    });
  },

  deleteTrip: (tripId) => {
    storage.deleteTrip(tripId);
    set((state) => {
      const newTrips = new Map(state.trips);
      newTrips.delete(tripId);
      return {
        trips: newTrips,
        currentTripId: state.currentTripId === tripId ? null : state.currentTripId,
      };
    });
  },

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  getTripSummaries: () => {
    const { trips } = get();
    return Array.from(trips.values()).map((trip) => ({
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

  togglePackingItem: (tripId, category, itemName) => {
    const checked = storage.getPackingChecked(tripId);
    const categoryItems = checked[category] || [];
    if (categoryItems.includes(itemName)) {
      checked[category] = categoryItems.filter((name) => name !== itemName);
    } else {
      checked[category] = [...categoryItems, itemName];
    }
    storage.setPackingChecked(tripId, checked);
    // 리렌더링 트리거를 위해 trips Map 새로 생성
    set((state) => ({ trips: new Map(state.trips) }));
  },
}));
