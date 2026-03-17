'use client';

import type { ChatMessage as ChatMessageType } from '@/types/trip';
import { useUIStore } from '@/stores/useUIStore';
import { TripPreviewCard } from './TripPreviewCard';
import { formatTime } from '@/lib/date-utils';

interface ChatMessageProps {
  message: ChatMessageType;
  // tripPreview가 있는 메시지 중 마지막(최신)인지 여부
  isLatestPreview?: boolean;
}

// 인라인 마크다운 파싱: **bold**, *italic*
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // 매치 전 일반 텍스트
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{match[3]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  // 나머지 텍스트
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// 경량 마크다운 파싱: 줄 단위 처리 + 인라인 마크다운
function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');

  return lines.map((line, i) => {
    const isLast = i === lines.length - 1;

    // 리스트 아이템: - 또는 • 로 시작
    const listMatch = line.match(/^[-•]\s+(.+)/);
    if (listMatch) {
      return (
        <span key={i} className="flex gap-1.5">
          <span className="text-primary shrink-0">•</span>
          <span>{parseInline(listMatch[1])}</span>
          {!isLast && '\n'}
        </span>
      );
    }

    return <span key={i}>{parseInline(line)}{!isLast && '\n'}</span>;
  });
}

export function ChatMessage({ message, isLatestPreview = true }: ChatMessageProps) {
  const { role, content, timestamp, tripPreview } = message;
  // Split View 모드에서는 TripPreviewCard 숨김 (좌측 뷰어가 역할 대체)
  const aiViewMode = useUIStore((s) => s.aiViewMode);

  // 시스템/에러 메시지
  if (role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-text-tertiary text-xs px-3 py-1 bg-bg-tertiary/50 rounded-full">
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
              ? 'bg-primary text-white rounded-2xl rounded-br-md'
              : 'bg-white text-text-primary rounded-2xl rounded-bl-md border border-border/60 shadow-sm'
          }`}
        >
          {parseMarkdown(content)}
        </div>

        {/* 여행 프리뷰 카드 — Split View에서는 숨김 (좌측 뷰어가 대체) */}
        {tripPreview && aiViewMode !== 'split' && (
          <div className="mt-2">
            <TripPreviewCard trip={tripPreview} isLatest={isLatestPreview} />
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
