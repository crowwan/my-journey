'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, ChevronLeft, Pencil } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/domain/trip';
import { useUIStore } from '@/stores/useUIStore';
import { useChatStore } from '@/stores/useChatStore';
import { useEditStore } from '@/stores/useEditStore';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShareModal } from './ShareModal';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  trip: Trip;
  packingProgress?: { checked: number; total: number; percentage: number };
  // 읽기 전용 모드 — AI 수정, 공유 버튼 숨김
  readOnly?: boolean;
}

export function HeroSection({ trip, packingProgress, readOnly = false }: HeroSectionProps) {
  const router = useRouter();
  const openAISplitView = useUIStore((s) => s.openAISplitView);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const addSystemMessage = useChatStore((s) => s.addSystemMessage);
  const editingSection = useEditStore((s) => s.editingSection);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  // 섹션 편집 중이면 AI 수정 비활성화
  const isSectionEditing = editingSection !== null;

  // 공유 모달 상태
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // 공유 버튼 핸들러 — 모달 열기
  const handleShare = () => {
    setShareModalOpen(true);
  };

  // AI로 수정 버튼 핸들러
  const handleAIEdit = () => {
    // 기존 대화 초기화 후 edit 모드 시작
    clearMessages();
    openAISplitView('edit', trip.id);
    // 시스템 메시지로 수정 대상 안내
    addSystemMessage(`'${trip.title}' 여행을 수정합니다. 어떤 부분을 변경할까요?`);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-5 pt-4 pb-4">
      {/* 홈으로 돌아가기 */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-0.5 -ml-1 mb-3 text-sm text-text-secondary hover:text-primary transition-colors"
        aria-label="홈으로"
      >
        <ChevronLeft className="size-4" />
        <span>홈</span>
      </button>

      {/* 1행: 제목 + D-day + 액션 버튼 (데스크탑) */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* 제목 */}
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            {trip.title}
          </h1>
          {/* D-day 칩 */}
          <Badge className={cn('text-xs font-medium px-3 py-1 rounded-full shadow-xs w-fit', badgeStyle)}>
            {dday}
          </Badge>
        </div>
        {/* 액션 버튼 -- 데스크탑에서만 (readOnly에서는 숨김) */}
        {!readOnly && (
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={handleAIEdit}
              disabled={isSectionEditing}
              className={cn(
                'flex items-center justify-center size-9 rounded-md transition-colors shrink-0',
                isSectionEditing
                  ? 'text-text-tertiary cursor-not-allowed'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              )}
              aria-label="AI로 수정"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center size-9 rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors shrink-0"
              aria-label="공유하기"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2행: 날짜 + 인원 + 태그 */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-2 text-sm text-text-secondary">
        <span>
          {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
        </span>
        <span className="text-text-tertiary">·</span>
        <span>{trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`}</span>
        {trip.tags.length > 0 && (
          <>
            <span className="text-text-tertiary">·</span>
            {trip.tags.map((tag) => (
              <span key={tag} className="text-text-tertiary">{tag}</span>
            ))}
          </>
        )}
      </div>

      {/* 3행: 준비물 진행률 -- 있을 때만 */}
      {packingProgress && packingProgress.total > 0 && (
        <div className="flex items-center gap-2 mt-3">
          <Progress value={packingProgress.percentage} className="flex-1 h-1 bg-bg-tertiary" />
          <span className="text-[11px] text-text-tertiary shrink-0">
            {packingProgress.checked}/{packingProgress.total}
          </span>
        </div>
      )}

      {/* 액션 버튼 -- 모바일에서만 텍스트 버튼 (readOnly에서는 숨김) */}
      {!readOnly && (
        <div className="sm:hidden flex items-center gap-2 mt-3">
          <button
            onClick={handleAIEdit}
            disabled={isSectionEditing}
            className={cn(
              'flex items-center gap-1.5 text-xs border rounded-full px-4 py-2 transition-colors',
              isSectionEditing
                ? 'text-text-tertiary border-border-light cursor-not-allowed'
                : 'text-text-secondary border-border hover:bg-bg-secondary hover:text-text-primary'
            )}
          >
            <Pencil className="size-3.5" />
            AI로 수정
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-text-secondary border border-border rounded-full px-4 py-2 hover:bg-bg-secondary hover:text-text-primary transition-colors"
          >
            <Share2 className="size-3.5" />
            공유하기
          </button>
        </div>
      )}

      {/* 공유 모달 (readOnly에서는 불필요) */}
      {!readOnly && (
        <ShareModal
          trip={trip}
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}
