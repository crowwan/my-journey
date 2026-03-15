'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 bg-white border-t border-border px-4 py-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0 relative rounded-xl border border-border bg-surface overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
          {/* 높이 계산용 숨겨진 div — textarea와 동일한 스타일 */}
          <div
            aria-hidden
            className="invisible whitespace-pre-wrap break-words text-sm px-4 py-2 min-h-[40px] max-h-[120px]"
          >
            {text || 'ㅤ'}
          </div>
          {/* 실제 textarea — 숨겨진 div 위에 절대 배치 */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="여행 계획을 알려주세요..."
            disabled={disabled}
            rows={1}
            className="absolute inset-0 w-full h-full bg-transparent text-text-primary text-sm px-4 py-2 resize-none outline-none placeholder:text-text-tertiary disabled:opacity-50 scrollbar-hide"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="shrink-0 rounded-xl px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          전송
        </button>
      </div>
    </div>
  );
}
