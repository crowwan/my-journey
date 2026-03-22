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
        className="bg-surface-elevated border border-border rounded-2xl mb-4 overflow-visible last:border-b shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-card)]"
      >
        <AccordionTrigger className="px-5 py-4 hover:no-underline gap-3.5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0 shadow-sm"
              style={{ background: color }}
            >
              {day.dayNumber ?? '?'}
            </div>
            <div className="text-left">
              <h3 className="text-[15px] font-bold text-text">{day.title}</h3>
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
                className="flex items-center gap-1.5 text-xs font-semibold text-info bg-info-bg border border-info/15 rounded-xl px-4 py-2.5 hover:bg-info/10 transition-all mt-3 mx-auto"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
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
