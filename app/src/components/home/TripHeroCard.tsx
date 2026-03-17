'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/domain/trip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface TripHeroCardProps {
  trip: TripSummary;
  packingProgress?: { checked: number; total: number; percentage: number };
  onDelete?: (tripId: string) => void;
}

// 다가오는/진행 중 여행을 강조하는 히어로 카드
export function TripHeroCard({ trip, packingProgress, onDelete }: TripHeroCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] bg-surface border border-border-light border-l-4 border-l-primary animate-stagger-reveal"
    >
      {/* 삭제 버튼 */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteDialog(true);
          }}
          className="absolute top-4 right-4 p-2 rounded-md cursor-pointer text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* 여행 제목 + D-day 뱃지 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2 pr-10">
        <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-text-primary truncate">
          {trip.title}
        </h2>
        <span className={cn(
          'text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 w-fit',
          badgeStyle
        )}>
          {dday}
        </span>
      </div>

      {/* 날짜 + 인원 */}
      <p className="text-text-secondary text-sm mb-1">
        {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
        {' · '}
        {trip.travelers > 1 ? `${trip.travelers}명` : '혼자 여행'}
        {' · '}{trip.dayCount}일
      </p>

      {/* 태그 */}
      {trip.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-text-tertiary text-xs px-2.5 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 준비물 진행률 */}
      {packingProgress && packingProgress.total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-tertiary">준비물</span>
            <span className="text-xs font-medium text-text-secondary">
              {packingProgress.checked}/{packingProgress.total}
            </span>
          </div>
          <Progress
            value={packingProgress.percentage}
            className="h-1.5 bg-gray-200 [&>div]:bg-primary"
          />
        </div>
      )}

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
