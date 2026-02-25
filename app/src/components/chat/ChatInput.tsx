'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

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
    // 1줄 약 20px, 최대 4줄 = 80px + padding
    const maxHeight = 96;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    // 높이 리셋
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter로 전송, Shift+Enter로 줄바꿈
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
          className="flex-1 bg-card text-text text-sm rounded-xl px-4 py-2.5 resize-none outline-none placeholder:text-text-tertiary disabled:opacity-50 border border-border focus:border-accent transition-all duration-200"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="bg-accent text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-accent/90 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          전송
        </button>
      </div>
    </div>
  );
}
