'use client';

import { useState } from 'react';
import type { Trip } from '@/types/trip';
import type { TabId } from '@/lib/constants';
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
}

export function TripViewer({ trip }: TripViewerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div>
      <HeroSection trip={trip} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      <div className="max-w-[1100px] mx-auto px-4 py-7">
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
