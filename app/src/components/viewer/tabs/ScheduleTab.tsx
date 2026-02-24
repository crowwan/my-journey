import type { Day } from '@/types/trip';
import { DayCard } from '../schedule/DayCard';

interface ScheduleTabProps {
  days: Day[];
}

export function ScheduleTab({ days }: ScheduleTabProps) {
  return (
    <div className="animate-fade-up">
      {days.map((day) => (
        <DayCard key={day.dayNumber} day={day} defaultOpen={day.dayNumber === 1} />
      ))}
    </div>
  );
}
