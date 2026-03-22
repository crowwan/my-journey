import type { TimelineItem } from '@/types/trip';

interface TimelineItemProps {
  item: TimelineItem;
}

export function TimelineItemComponent({ item }: TimelineItemProps) {
  const typeClass = item.type === 'default' ? '' : item.type;

  const timeColor = {
    spot: 'text-trip-green',
    food: 'text-trip-pink',
    move: 'text-trip-blue',
    default: 'text-accent',
  }[item.type];

  const badgeStyle = {
    food: 'bg-trip-pink/10 text-trip-pink border-trip-pink/15',
    move: 'bg-trip-blue/10 text-trip-blue border-trip-blue/15',
    spot: 'bg-trip-green/10 text-trip-green border-trip-green/15',
    default: 'bg-accent/10 text-accent border-accent/15',
  }[item.type];

  return (
    <div className={`tl-item ${typeClass}`}>
      <div className={`text-xs font-bold mb-1 ${timeColor}`}>{item.time}</div>
      <div className="text-sm font-bold text-text">
        {item.title}
        {item.badge && (
          <span className={`inline-block text-[0.65rem] px-2 py-0.5 rounded-lg font-semibold ml-1.5 align-middle border ${badgeStyle}`}>
            {item.badge}
          </span>
        )}
      </div>
      {item.description && (
        <div className="text-[13px] text-text-secondary mt-1 leading-relaxed">{item.description}</div>
      )}
    </div>
  );
}
