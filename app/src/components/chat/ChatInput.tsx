'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="shrink-0 glass-strong border-t border-border px-4 py-3 shadow-[var(--shadow-up)]">
      <div className="max-w-[1100px] mx-auto flex items-end gap-2.5">
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
          className="flex-1 bg-surface-elevated text-text text-sm rounded-xl px-4 py-3 resize-none outline-none placeholder:text-text-tertiary disabled:opacity-50 border border-border focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-200 shadow-[var(--shadow-sm)]"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="gradient-accent text-white rounded-xl px-5 py-3 text-sm font-bold shadow-sm hover:shadow-md transition-all shrink-0 disabled:opacity-40 active:scale-[0.97]"
        >
          전송
        </button>
      </div>
    </div>
  );
}
