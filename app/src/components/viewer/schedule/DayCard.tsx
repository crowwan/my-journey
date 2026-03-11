'use client';

import dynamic from 'next/dynamic';
import type { Day } from '@/types/trip';
import { TimelineItemComponent } from './TimelineItem';
import { openInMapsApp } from '@/lib/map-utils';
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
  const color = day.color ?? '#f97316';

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? `day-${day.dayNumber}` : undefined}
    >
      <AccordionItem
        value={`day-${day.dayNumber}`}
        className="bg-card border border-border rounded-[16px] mb-5 overflow-visible last:border-b"
      >
        <AccordionTrigger className="px-5 py-5 hover:no-underline hover:bg-glass gap-3.5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-white shrink-0"
              style={{ background: color }}
            >
              {day.dayNumber ?? '?'}
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-text">{day.title}</h3>
              <p className="text-sm text-text-secondary mt-0.5">
                {(day.date ?? '').replace(/-/g, '.')} · {day.subtitle}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          {day.mapSpots && day.mapSpots.length > 0 && (
            <div className="mb-4">
              <DayMap mapSpots={day.mapSpots} color={color} />
              <button
                onClick={() => openInMapsApp(day.mapSpots)}
                className="flex items-center gap-1.5 text-xs text-trip-blue border border-trip-blue/20 bg-trip-blue/5 rounded-full px-4 py-2 hover:bg-trip-blue/10 transition-colors mt-2 mx-auto"
              >
                <span>🗺️</span>
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
