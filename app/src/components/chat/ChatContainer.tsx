'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useTripStore } from '@/stores/useTripStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatContainerProps {
  mode?: 'create' | 'edit';
  tripId?: string;
}

const EXAMPLE_PROMPTS = [
  '도쿄 3박 4일 여행 계획 세워줘',
  '방콕 가족여행 5일 일정',
  '파리 허니문 코스 추천',
];

const EDIT_PROMPTS = [
  '일정 순서 변경해줘',
  '맛집 추가해줘',
  '예산 수정해줘',
];

export function ChatContainer({ mode = 'create', tripId }: ChatContainerProps) {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const generatedTrip = useChatStore((s) => s.generatedTrip);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const { trips, isLoaded, loadTrips } = useTripStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) loadTrips();
  }, [isLoaded, loadTrips]);

  const tripContext = tripId ? trips.get(tripId) : undefined;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text: string) => {
    if (mode === 'edit' && tripContext) {
      sendMessage(text, 'edit', tripContext);
    } else {
      sendMessage(text, mode === 'edit' ? 'edit' : 'chat');
    }
  };

  const handleCreateTrip = () => {
    sendMessage('여행 계획을 생성해줘', 'create');
  };

  const isEmpty = messages.length === 0;
  const showCreateButton = messages.length >= 2 && !generatedTrip && mode !== 'edit';

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* 메시지 목록 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-20 h-20 rounded-3xl gradient-accent-soft flex items-center justify-center mb-5 shadow-[var(--shadow-card)]">
              <span className="text-4xl">{mode === 'edit' ? '✏️' : '✈️'}</span>
            </div>
            <h2 className="text-2xl font-black text-text mb-1.5">
              {mode === 'edit' ? '여행을 수정해볼까요?' : '어디로 떠나볼까요?'}
            </h2>
            <p className="text-text-secondary text-sm mb-8 max-w-xs leading-relaxed">
              {mode === 'edit'
                ? '수정하고 싶은 부분을 알려주세요'
                : 'AI가 맞춤 여행 일정을 만들어 드려요'}
            </p>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-md">
              {(mode === 'edit' ? EDIT_PROMPTS : EXAMPLE_PROMPTS).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-xs font-semibold bg-surface-elevated text-text-secondary border border-border rounded-xl px-4 py-2.5 shadow-[var(--shadow-sm)] hover:border-accent/30 hover:text-accent hover:shadow-[var(--shadow-card)] transition-all duration-200 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[1100px] mx-auto space-y-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* 여행 계획 생성 버튼 */}
      {showCreateButton && (
        <div className="px-4 pb-2 flex justify-center">
          <button
            onClick={handleCreateTrip}
            disabled={isLoading}
            className="flex items-center gap-2 gradient-accent text-white rounded-xl px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.97] disabled:opacity-50"
          >
            <span>🗺️</span>
            여행 계획 생성하기
          </button>
        </div>
      )}

      {/* 입력 영역 */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
