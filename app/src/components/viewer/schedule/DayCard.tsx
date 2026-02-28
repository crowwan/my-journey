'use client';

import type { Day } from '@/types/trip';
import { TimelineItemComponent } from './TimelineItem';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

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
