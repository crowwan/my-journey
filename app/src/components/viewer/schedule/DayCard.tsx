'use client';

import dynamic from 'next/dynamic';
import { Map } from 'lucide-react';
import type { Day } from '@/types/trip';
import { TimelineItemComponent } from './TimelineItem';
import { openInMapsApp } from '@/lib/map-utils';
import { isToday } from '@/lib/date-utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const DayMap = dynamic(() => import('./DayMap'), { ssr: false });

interface DayCardProps {
  day: Day;
  defaultOpen?: boolean;
}

export function DayCard({ day, defaultOpen = false }: DayCardProps) {
  // 오늘 날짜와 day.date를 로컬 시간 기준으로 비교
  const isTodayDate = isToday(day.date);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen || isTodayDate ? `day-${day.dayNumber}` : undefined}
    >
      <AccordionItem
        value={`day-${day.dayNumber}`}
        className="bg-surface border border-border-light rounded-xl mb-5 overflow-visible last:border-b shadow-sm"
      >
        <AccordionTrigger className="px-5 py-5 hover:no-underline hover:bg-surface-hover gap-3.5 rounded-xl">
          <div className="flex items-center gap-3.5">
            <div className="text-2xl font-black shrink-0 text-primary">
              {day.dayNumber ?? '?'}
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">{day.title}</h3>
                {isTodayDate && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                {(day.date ?? '').replace(/-/g, '.')} · {day.subtitle}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          {day.mapSpots && day.mapSpots.length > 0 && (
            <div className="mb-4">
              <DayMap mapSpots={day.mapSpots} color="#f97316" />
              <button
                onClick={() => openInMapsApp(day.mapSpots)}
                className="flex items-center gap-1.5 text-xs text-cat-transport border border-cat-transport/20 bg-cat-transport/5 rounded-full px-4 py-2 hover:bg-cat-transport/10 transition-colors mt-2 mx-auto"
              >
                <Map className="size-3.5" />
                지도 앱에서 열기
              </button>
            </div>
          )}
          <div className="timeline animate-fade-up">
            {day.items.map((item, idx) => (
              <TimelineItemComponent key={idx} item={item} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
