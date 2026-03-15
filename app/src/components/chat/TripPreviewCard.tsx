'use client';

import { useRouter } from 'next/navigation';
import type { Trip } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { useUIStore } from '@/stores/useUIStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TripPreviewCardProps {
  trip: Trip;
  // 여러 개의 TripPreviewCard가 있을 때, 마지막(최신) 것만 저장 가능
  isLatest?: boolean;
}

// 날짜 범위를 읽기 좋은 형식으로 변환
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function TripPreviewCard({ trip, isLatest = true }: TripPreviewCardProps) {
  const router = useRouter();
  const saveTrip = useTripStore((s) => s.saveTrip);
  const closeAIDrawer = useUIStore((s) => s.closeAIDrawer);

  // 여행 저장 후 드로어 닫기 + 상세 페이지로 이동
  const handleSave = () => {
    saveTrip(trip);
    closeAIDrawer();
    router.push(`/trips/${trip.id}`);
  };

  return (
    <Card className="rounded-xl py-0 gap-0 shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* 제목 + 목적지 */}
        <div>
          <h3 className="text-text-primary font-bold text-sm">{trip.title}</h3>
          <p className="text-text-secondary text-xs mt-0.5">
            {trip.destination} &middot; {formatDateRange(trip.startDate, trip.endDate)} &middot; {trip.days.length}일
          </p>
        </div>

        {/* 태그 */}
        {trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trip.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[0.65rem] px-2 py-0.5 bg-primary/10 text-primary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 저장 버튼 — 최신 프리뷰에서만 활성화 */}
        {isLatest ? (
          <Button
            onClick={handleSave}
            className="w-full rounded-xl bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md"
          >
            여행 저장하기
          </Button>
        ) : (
          <Button
            disabled
            className="w-full rounded-xl opacity-50 cursor-not-allowed"
          >
            이전 버전
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
