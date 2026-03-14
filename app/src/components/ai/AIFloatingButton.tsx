'use client';

import { MessageCircle, X } from 'lucide-react';

interface AIFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

// 우하단 플로팅 액션 버튼 (FAB) — AI 드로어 토글
export function AIFloatingButton({ isOpen, onClick }: AIFloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 text-white shadow-[var(--shadow-float,0_8px_30px_rgba(0,0,0,0.15))] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      aria-label={isOpen ? 'AI 드로어 닫기' : 'AI 드로어 열기'}
    >
      {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </button>
  );
}
