'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useTripStore } from '@/stores/useTripStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickSetupForm } from './QuickSetupForm';
import { Pencil, Map, RotateCcw } from 'lucide-react';

interface ChatContainerProps {
  mode?: 'create' | 'edit';
  tripId?: string;
}

// 편집 모드용 예시 질문
const EDIT_PROMPTS = [
  '일정 순서 변경해줘',
  '맛집 추가해줘',
  '예산 수정해줘',
];

// 자유 채팅 모드 예시 질문 (건너뛰기 후 표시)
const EXAMPLE_PROMPTS = [
  '도쿄 3박 4일 여행 계획 세워줘',
  '방콕 가족여행 5일 일정',
  '파리 허니문 코스 추천',
];

export function ChatContainer({ mode = 'create', tripId }: ChatContainerProps) {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const generatedTrip = useChatStore((s) => s.generatedTrip);
  const quickSetupSkipped = useChatStore((s) => s.quickSetupSkipped);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setQuickSetupSkipped = useChatStore((s) => s.setQuickSetupSkipped);
  const { trips, isLoaded, loadTrips } = useTripStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // sessionStorage에서 채팅 세션 복원 (SSR 하이드레이션 이후)
  useEffect(() => {
    useChatStore.persist.rehydrate();
  }, []);

  // 편집 모드일 때 trip 데이터 로드
  useEffect(() => {
    if (!isLoaded) loadTrips();
  }, [isLoaded, loadTrips]);

  const tripContext = tripId ? trips.get(tripId) : undefined;

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  // 메시지 전송 (편집 모드일 때 tripContext 포함)
  const handleSend = (text: string) => {
    if (mode === 'edit' && tripContext) {
      sendMessage(text, 'edit', tripContext);
    } else {
      sendMessage(text, mode === 'edit' ? 'edit' : 'chat');
    }
  };

  // Quick Setup 폼 제출 — 프롬프트 조립 후 바로 create 모드로 전송
  const handleQuickSetupSubmit = (prompt: string) => {
    sendMessage(prompt, 'create');
  };

  // 건너뛰기 — 자유 채팅 모드 진입
  const handleSkip = () => {
    setQuickSetupSkipped(true);
  };

  // 새 대화 시작 — 모든 상태 초기화
  const handleNewChat = () => {
    clearMessages();
  };

  // "여행 계획 생성하기" 버튼 클릭 시에만 create 모드로 전환
  const handleCreateTrip = () => {
    sendMessage('여행 계획을 생성해줘', 'create');
  };

  const isEmpty = messages.length === 0;
  const hasMessages = messages.length > 0;
  // 메시지가 2개 이상이고, 아직 생성된 Trip이 없을 때 생성 버튼 표시
  const showCreateButton = messages.length >= 2 && !generatedTrip && mode !== 'edit';

  // 빈 상태에서 보여줄 UI 결정
  // create 모드 + 건너뛰기 안 함 → Quick Setup 폼
  // create 모드 + 건너뛰기 → 자유 채팅 (예시 칩)
  // edit 모드 → 편집용 빈 상태
  const showQuickSetup = isEmpty && mode === 'create' && !quickSetupSkipped;
  const showFreeChatEmpty = isEmpty && mode === 'create' && quickSetupSkipped;
  const showEditEmpty = isEmpty && mode === 'edit';

  return (
    <div className="flex flex-col h-full">
      {/* 새 대화 버튼 — 메시지가 있을 때만 표시 */}
      {hasMessages && (
        <div className="shrink-0 flex justify-end px-4 py-2 border-b border-border-light">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-md hover:bg-bg-tertiary"
          >
            <RotateCcw size={14} />
            새 대화
          </button>
        </div>
      )}

      {/* 메시지 목록 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {showQuickSetup ? (
          // create 모드 초기 화면 — Quick Setup 폼
          <QuickSetupForm
            onSubmit={handleQuickSetupSubmit}
            onSkip={handleSkip}
            disabled={isLoading}
          />
        ) : showEditEmpty ? (
          // edit 모드 빈 상태
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
            <div className="mb-4 text-primary">
              <Pencil size={48} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              여행을 수정해볼까요?
            </h2>
            <p className="text-text-secondary text-sm mb-8 max-w-xs">
              수정하고 싶은 부분을 알려주세요
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-md">
              {EDIT_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-xs bg-primary-50 text-primary border border-primary/20 rounded-full px-4 py-2.5 hover:bg-primary-100 hover:border-primary/40 transition-all duration-200 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : showFreeChatEmpty ? (
          // 자유 채팅 빈 상태 (건너뛰기 후)
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
            <div className="mb-4 text-primary">
              <Map size={48} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              어디로 떠나볼까요?
            </h2>
            <p className="text-text-secondary text-sm mb-8 max-w-xs">
              여행지와 기간을 알려주시면 AI가 맞춤 일정을 만들어 드려요
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-md">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-xs bg-primary-50 text-primary border border-primary/20 rounded-full px-4 py-2.5 hover:bg-primary-100 hover:border-primary/40 transition-all duration-200 disabled:opacity-50"
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
            className="flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Map size={18} />
            여행 계획 생성하기
          </button>
        </div>
      )}

      {/* 입력 영역 */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
