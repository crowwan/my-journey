// ============================================================
// Chat Store
// 채팅 메시지 관리, API 호출, 에러 처리
// sessionStorage로 세션 영속화 (탭 닫으면 초기화)
// ============================================================
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage, Trip, TripAction } from '@/types/trip';

// -- API 응답 타입 -----------------------------------------------
interface ChatApiResponse {
  success: boolean;
  message?: string;
  trip?: Trip;
  action?: TripAction;
  error?: string;
}

// -- Store 타입 --------------------------------------------------
interface ChatState {
  // 영속화 대상
  messages: ChatMessage[];
  generatedTrip: Trip | null;
  quickSetupSkipped: boolean;

  // 비영속 (런타임 전용)
  isLoading: boolean;
  error: string | null;

  // 액션
  sendMessage: (
    text: string,
    mode?: 'chat' | 'create' | 'edit',
    tripContext?: Trip,
  ) => Promise<void>;
  clearMessages: () => void;
  clearGeneratedTrip: () => void;
  addSystemMessage: (content: string) => void;
  setQuickSetupSkipped: (skipped: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,
      generatedTrip: null,
      quickSetupSkipped: false,

      sendMessage: async (text, mode = 'chat', tripContext) => {
        const { messages } = get();

        // 유저 메시지 추가
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: Date.now(),
        };

        set({ messages: [...messages, userMessage], isLoading: true, error: null });

        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, userMessage],
              mode,
              tripContext,
            }),
          });

          const data: ChatApiResponse = await res.json();

          if (!data.success) {
            throw new Error(data.error ?? 'AI 응답 실패');
          }

          const assistantMessage: ChatMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: data.message ?? '',
            timestamp: Date.now(),
            tripPreview: data.trip,
            tripAction: data.action,
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
            generatedTrip: data.trip ?? state.generatedTrip,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
          set((state) => ({
            isLoading: false,
            error: errorMessage,
            messages: [
              ...state.messages,
              {
                id: `msg-${Date.now()}-err`,
                role: 'system' as const,
                content: `오류: ${errorMessage}`,
                timestamp: Date.now(),
              },
            ],
          }));
        }
      },

      clearMessages: () => set({
        messages: [],
        error: null,
        generatedTrip: null,
        quickSetupSkipped: false,
      }),
      clearGeneratedTrip: () => set({ generatedTrip: null }),

      addSystemMessage: (content) => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: `msg-${Date.now()}-sys`,
              role: 'system' as const,
              content,
              timestamp: Date.now(),
            },
          ],
        }));
      },

      setQuickSetupSkipped: (skipped) => set({ quickSetupSkipped: skipped }),
    }),
    {
      name: 'chat-session',
      storage: createJSONStorage(() => sessionStorage),
      // SSR 하이드레이션 불일치 방지: 클라이언트 마운트 후 수동 rehydrate
      skipHydration: true,
      partialize: (state) => ({
        messages: state.messages,
        generatedTrip: state.generatedTrip,
        quickSetupSkipped: state.quickSetupSkipped,
      }),
    },
  ),
);
