'use client';

import { useState, type RefObject } from 'react';
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
  // Split View에서 내부 스크롤 컨테이너를 사용하기 위한 ref
  // 없으면 window.scrollTo 사용 (기존 동작 호환)
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function TripViewer({ trip, scrollContainerRef }: TripViewerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const checkedMap = storage.getPackingChecked(trip.id);
  const packingProgress = getPackingProgress(trip.packing, checkedMap);

  // 탭 변경 시 스크롤 처리: scrollContainerRef가 있으면 내부 스크롤, 없으면 window
  const scrollToTop = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <div>
      <HeroSection trip={trip} packingProgress={packingProgress} />
      <TabBar activeTab={activeTab} onChange={(tab) => {
        setActiveTab(tab);
        scrollToTop();
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
