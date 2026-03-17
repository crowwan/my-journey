'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/domain/trip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface TripCardProps {
  trip: TripSummary;
  index?: number;
  onDelete?: (tripId: string) => void;
}

// 세로 스크롤용 풀 너비 카드
export function TripCard({ trip, index = 0, onDelete }: TripCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
  const firstGrapheme = segmenter.segment(trip.title)[Symbol.iterator]().next().value?.segment ?? '';
  const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(firstGrapheme);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  // 다가오는/진행 중 여행에만 강조 스타일 적용
  const isActive = status === 'upcoming' || status === 'ongoing';
  const activeClass = isActive ? 'border-l-4 border-l-primary' : '';

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className={cn(
        'rounded-xl shadow-sm bg-surface border border-border-light p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] animate-stagger-reveal',
        activeClass
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3">
        {/* 이니셜 아이콘 */}
        <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary/10 flex items-center justify-center flex-shrink-0">
          <span className={isEmoji ? 'text-2xl' : 'font-bold text-lg text-primary/80'}>
            {firstGrapheme}
          </span>
        </div>

        {/* 가운데: 제목, 날짜, 태그 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {trip.title}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
          </p>
          {trip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {trip.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-text-tertiary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: D-day 뱃지 + 삭제 버튼 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={cn('text-[10px] font-medium', badgeStyle)}>
            {dday}
          </Badge>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="p-1.5 rounded-md cursor-pointer text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="여행 삭제"
        description={`"${trip.title}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="danger"
        onConfirm={() => {
          onDelete?.(trip.id);
          setShowDeleteDialog(false);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
