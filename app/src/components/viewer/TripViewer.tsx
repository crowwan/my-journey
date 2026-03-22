'use client';

import { useState } from 'react';
import type { Trip } from '@/types/trip';
import type { TabId } from '@/lib/constants';
import { storage } from '@/lib/storage';
import { getPackingProgress } from '@/lib/trip-utils';
import { HeroSection } from './HeroSection';
import { TabBar } from './TabBar';
import { OverviewTab } from './tabs/OverviewTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { RestaurantTab } from './tabs/RestaurantTab';
import { TransportTab } from './tabs/TransportTab';
import { BudgetTab } from './tabs/BudgetTab';
import { PackingTab } from './tabs/PackingTab';
import { PreTodoTab } from './tabs/PreTodoTab';

interface TripViewerProps {
  trip: Trip;
  onEdit?: () => void;
}

export function TripViewer({ trip, onEdit }: TripViewerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const checkedMap = storage.getPackingChecked(trip.id);
  const packingProgress = getPackingProgress(trip.packing, checkedMap);

  return (
    <div className="min-h-screen bg-bg">
      <HeroSection trip={trip} packingProgress={packingProgress} onEdit={onEdit} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="max-w-[1100px] mx-auto px-5 py-6">
        {activeTab === 'overview' && <OverviewTab trip={trip} />}
        {activeTab === 'schedule' && <ScheduleTab days={trip.days} />}
        {activeTab === 'restaurant' && <RestaurantTab restaurants={trip.restaurants} />}
        {activeTab === 'transport' && <TransportTab transport={trip.transport} />}
        {activeTab === 'budget' && <BudgetTab budget={trip.budget} />}
        {activeTab === 'packing' && <PackingTab tripId={trip.id} packing={trip.packing} />}
        {activeTab === 'pretodo' && <PreTodoTab preTodos={trip.preTodos} />}
      </div>
    </div>
  );
}
