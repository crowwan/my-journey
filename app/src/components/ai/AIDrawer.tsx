'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useChatStore } from '@/stores/useChatStore';

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  tripId?: string;
}

// 오른쪽 슬라이드 드로어 — 모바일 풀스크린, 데스크탑 사이드 패널
export function AIDrawer({ isOpen, onClose, mode = 'create', tripId }: AIDrawerProps) {
  const clearMessages = useChatStore((s) => s.clearMessages);

  // 드로어 닫을 때 채팅 초기화
  const handleClose = useCallback(() => {
    onClose();
    clearMessages();
  }, [onClose, clearMessages]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // 드로어 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 z-50 bg-overlay-dark transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 드로어 패널 */}
      <div
        className={`fixed top-0 right-0 z-50 h-full bg-bg shadow-xl transition-transform duration-300 ease-out flex flex-col w-full sm:w-[400px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary">
            {mode === 'edit' ? '여행 수정하기' : 'AI Travel Planner'}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary transition-colors"
            aria-label="드로어 닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 채팅 컨테이너 */}
        <div className="flex-1 min-h-0">
          <ChatContainer
            mode={mode}
            tripId={tripId}
          />
        </div>
      </div>
    </>
  );
}
