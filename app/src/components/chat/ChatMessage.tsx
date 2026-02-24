'use client';

import type { ChatMessage as ChatMessageType } from '@/types/trip';
import { TripPreviewCard } from './TripPreviewCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

// 타임스탬프를 HH:MM 형식으로 변환
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, timestamp, tripPreview } = message;

  // 시스템/에러 메시지
  if (role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-text-tertiary text-xs px-3 py-1 bg-card-secondary/50 rounded-full">
          {content}
        </span>
      </div>
    );
  }

  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        {/* 메시지 버블 */}
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-accent/20 text-white rounded-2xl rounded-br-md'
              : 'bg-card text-text rounded-2xl rounded-bl-md'
          }`}
        >
          {content}
        </div>

        {/* 여행 프리뷰 카드 */}
        {tripPreview && (
          <div className="mt-2">
            <TripPreviewCard trip={tripPreview} />
          </div>
        )}

        {/* 타임스탬프 */}
        <div className={`text-[0.65rem] text-text-tertiary mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}
