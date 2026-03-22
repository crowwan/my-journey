'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { RotateCcw } from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';
import { useTrip, useSaveTrip } from '@/queries/useTrips';
import { useUIStore } from '@/stores/useUIStore';
import { TripViewer } from '@/components/viewer/TripViewer';
import { ChatContainer } from '@/components/chat/ChatContainer';

interface AISplitViewProps {
  mode: 'create' | 'edit';
  tripId?: string;
}

// 데스크탑 Split View: 좌측 TripViewer + 우측 ChatContainer
export function AISplitView({ mode, tripId }: AISplitViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const generatedTrip = useChatStore((s) => s.generatedTrip);
  const messages = useChatStore((s) => s.messages);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const saveTripMutation = useSaveTrip();
  const closeAIDrawer = useUIStore((s) => s.closeAIDrawer);
  const { data: existingTripData } = useTrip(tripId);

  // edit 모드일 때 기존 여행 데이터를 초기값으로 사용
  const existingTrip = existingTripData ?? undefined;
  // generatedTrip이 있으면 그것을, 없으면 기존 여행 사용
  const displayTrip: Trip | undefined = generatedTrip ?? existingTrip;

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAIDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeAIDrawer]);

  // body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    const tripToSave = generatedTrip ?? existingTrip;
    if (!tripToSave) return;

    saveTripMutation.mutate(tripToSave);
    closeAIDrawer();
    router.push(`/trips/${tripToSave.id}`);
  }, [generatedTrip, existingTrip, saveTripMutation, closeAIDrawer, router]);

  // 닫기 핸들러
  const handleClose = useCallback(() => {
    closeAIDrawer();
  }, [closeAIDrawer]);

  return (
    <div className="fixed inset-0 z-50 flex bg-bg">
      {/* 좌측: 여행 뷰어 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 헤더: 닫기 + 저장 */}
        <div className="shrink-0 flex items-center justify-between px-4 h-[49px] border-b border-border-light bg-surface">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            aria-label="닫기"
          >
            <X size={18} />
            <span>닫기</span>
          </button>

          {/* 저장 버튼 — generatedTrip이 있을 때만 활성 */}
          <button
            onClick={handleSave}
            disabled={!generatedTrip && mode !== 'edit'}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary rounded-md px-4 py-2 hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{mode === 'edit' ? '수정 저장하기' : '여행 저장하기'}</span>
          </button>
        </div>

        {/* 뷰어 영역 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {displayTrip ? (
            <TripViewer trip={displayTrip} scrollContainerRef={scrollRef} readOnly />
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <p className="text-sm">AI가 여행 계획을 생성하면 여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 우측: 채팅 */}
      <div className="w-[400px] border-l border-border-light flex flex-col bg-bg shrink-0">
        {/* 채팅 헤더 — 좌측과 동일 높이 */}
        <div className="shrink-0 flex items-center justify-between px-4 h-[49px] border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary">
            {mode === 'edit' ? '여행 수정하기' : 'AI Travel Planner'}
          </h2>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-md hover:bg-bg-tertiary"
            >
              <RotateCcw size={14} />
              새 대화
            </button>
          )}
        </div>

        {/* 채팅 컨테이너 */}
        <div className="flex-1 min-h-0">
          <ChatContainer mode={mode} tripId={tripId} />
        </div>
      </div>
    </div>
  );
}
