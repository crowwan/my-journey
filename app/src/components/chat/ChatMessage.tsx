'use client';

import type { ChatMessage as ChatMessageType } from '@/types/trip';
import { TripPreviewCard } from './TripPreviewCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={key++} className="font-bold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function parseMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');

  return lines.map((line, i) => {
    const isLast = i === lines.length - 1;

    const listMatch = line.match(/^[-•]\s+(.+)/);
    if (listMatch) {
      return (
        <span key={i} className="flex gap-2">
          <span className="text-accent shrink-0 font-bold">•</span>
          <span>{parseInline(listMatch[1])}</span>
          {!isLast && '\n'}
        </span>
      );
    }

    return <span key={i}>{parseInline(line)}{!isLast && '\n'}</span>;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, timestamp, tripPreview } = message;

  if (role === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-text-tertiary text-xs px-3.5 py-1.5 bg-surface-sunken rounded-full font-medium">
          {content}
        </span>
      </div>
    );
  }

  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[85%]">
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'gradient-accent text-white rounded-2xl rounded-br-md shadow-sm'
              : 'bg-surface-elevated text-text rounded-2xl rounded-bl-md border border-border shadow-[var(--shadow-card)]'
          }`}
        >
          {parseMarkdown(content)}
        </div>

        {tripPreview && (
          <div className="mt-2">
            <TripPreviewCard trip={tripPreview} />
          </div>
        )}

        <div className={`text-[0.65rem] text-text-tertiary mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}
