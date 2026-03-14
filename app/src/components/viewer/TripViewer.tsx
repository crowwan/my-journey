'use client';

import { useState } from 'react';
import type { Trip } from '@/types/trip';
import type { TabId } from '@/lib/constants';
import { storage } from '@/lib/storage';
import { getPackingProgress } from '@/lib/trip-utils';
import { HeroSection } from './HeroSection';
import { TabBar } from './TabBar';
import { SummaryTab } from './tabs/SummaryTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { GuideTab } from './tabs/GuideTab';
import { ChecklistTab } from './tabs/ChecklistTab';

interface TripViewerProps {
  trip: Trip;
}

export function TripViewer({ trip }: TripViewerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const checkedMap = storage.getPackingChecked(trip.id);
  const packingProgress = getPackingProgress(trip.packing, checkedMap);

  return (
    <div>
      <HeroSection trip={trip} packingProgress={packingProgress} />
      <TabBar activeTab={activeTab} onChange={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0 });
      }} />
      <div className="max-w-[1100px] mx-auto px-5 py-8">
        {activeTab === 'summary' && <SummaryTab trip={trip} />}
        {activeTab === 'schedule' && <ScheduleTab days={trip.days} />}
        {activeTab === 'guide' && <GuideTab restaurants={trip.restaurants} transport={trip.transport} budget={trip.budget} />}
        {activeTab === 'checklist' && <ChecklistTab tripId={trip.id} packing={trip.packing} preTodos={trip.preTodos} />}
      </div>
    </div>
  );
}
