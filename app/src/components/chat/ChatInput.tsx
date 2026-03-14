'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // textarea 높이 자동 조절 (최대 4줄)
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = 96;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 bg-white border-t border-border px-4 py-3">
      <div className="max-w-[1100px] mx-auto flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="여행 계획을 알려주세요..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-surface text-text-primary text-sm rounded-xl px-4 py-3 resize-none outline-none placeholder:text-text-tertiary disabled:opacity-50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="rounded-xl px-5 py-3 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md shrink-0"
        >
          전송
        </Button>
      </div>
    </div>
  );
}
