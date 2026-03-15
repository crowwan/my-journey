'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { useUIStore } from '@/stores/useUIStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TripViewer } from '@/components/viewer/TripViewer';

interface TripPreviewCardProps {
  trip: Trip;
  isLatest?: boolean;
}

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
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    saveTrip(trip);
    closeAIDrawer();
    router.push(`/trips/${trip.id}`);
  };

  return (
    <>
      <Card className="rounded-xl py-0 gap-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-text-primary font-bold text-sm">{trip.title}</h3>
            <p className="text-text-secondary text-xs mt-0.5">
              {trip.destination} &middot; {formatDateRange(trip.startDate, trip.endDate)} &middot; {trip.days.length}일
            </p>
          </div>

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

          {isLatest ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <Eye size={16} />
                초안 보기
              </button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md"
              >
                여행 저장하기
              </Button>
            </div>
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

      {/* 초안 보기 풀스크린 모달 */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] bg-bg flex flex-col">
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border-light bg-surface">
            <h2 className="text-base font-bold text-text-primary">초안 미리보기</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary transition-colors"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TripViewer trip={trip} />
          </div>
        </div>
      )}
    </>
  );
}
