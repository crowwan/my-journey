'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatContainerProps {
  mode?: 'create' | 'edit';
  tripId?: string;
}

// 빈 상태에서 보여줄 예시 질문
const EXAMPLE_PROMPTS = [
  '도쿄 3박 4일 여행 계획 세워줘',
  '방콕 가족여행 5일 일정',
  '파리 허니문 코스 추천',
];

export function ChatContainer({ mode = 'create' }: ChatContainerProps) {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const generatedTrip = useChatStore((s) => s.generatedTrip);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  // 일반 채팅은 항상 chat 모드로 전송
  const handleSend = (text: string) => {
    sendMessage(text, mode === 'edit' ? 'edit' : 'chat');
  };

  // "여행 계획 생성하기" 버튼 클릭 시에만 create 모드로 전환
  const handleCreateTrip = () => {
    sendMessage('여행 계획을 생성해줘', 'create');
  };

  const isEmpty = messages.length === 0;
  // 메시지가 2개 이상이고, 아직 생성된 Trip이 없을 때 생성 버튼 표시
  const showCreateButton = messages.length >= 2 && !generatedTrip && mode !== 'edit';

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 목록 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          // 빈 상태 안내
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="text-5xl mb-4">🌏</div>
            <h2 className="text-xl font-bold text-white mb-2">AI 여행 플래너</h2>
            <p className="text-text-secondary text-sm mb-8">어디로 여행을 떠나고 싶으세요?</p>

            {/* 예시 질문 칩 */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-xs bg-card-secondary text-text-secondary border border-border rounded-full px-4 py-2 hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // 메시지 목록
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
            className="flex items-center gap-2 bg-accent/20 text-accent border border-accent/40 rounded-full px-5 py-2.5 text-sm font-medium hover:bg-accent/30 transition-colors disabled:opacity-50"
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
