import type { TimelineItem } from '@/types/trip';

interface TimelineItemProps {
  item: TimelineItem;
}

export function TimelineItemComponent({ item }: TimelineItemProps) {
  // 타임라인 CSS 클래스 (food, move, spot은 globals.css에서 스타일링)
  const typeClass = item.type === 'default' ? '' : item.type;

  const timeColor = {
    spot: 'text-cat-sightseeing',
    food: 'text-cat-food',
    move: 'text-cat-transport',
    default: 'text-primary',
  }[item.type];

  return (
    <div className={`tl-item ${typeClass}`}>
      <div className={`text-xs font-semibold mb-0.5 ${timeColor}`}>{item.time}</div>
      <div className="text-sm font-semibold text-text-primary">
        {item.title}
        {item.badge && (
          <span
            className={`inline-block text-[0.66rem] px-1.5 py-0.5 rounded-md font-semibold ml-1 align-middle ${
              item.type === 'food'
                ? 'bg-cat-food/15 text-cat-food'
                : item.type === 'move'
                  ? 'bg-cat-transport/15 text-cat-transport'
                  : 'bg-primary/15 text-primary'
            }`}
          >
            {item.badge}
          </span>
        )}
      </div>
      {item.description && (
        <div className="text-sm text-text-secondary mt-0.5">{item.description}</div>
      )}
    </div>
  );
}
