import type { Day } from '@/types/trip';
import { DayCard } from '../schedule/DayCard';

interface ScheduleTabProps {
  days: Day[];
}

export function ScheduleTab({ days }: ScheduleTabProps) {
  return (
    <div className="animate-fade-up">
      {days.map((day, index) => (
        <DayCard key={`day-${day.dayNumber ?? index}`} day={day} defaultOpen={index === 0} />
      ))}
    </div>
  );
}
