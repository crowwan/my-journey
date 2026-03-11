'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = 'My Journey', showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-4 pt-[calc(0.75rem+var(--safe-area-top,0px))] flex items-center gap-3 shadow-none">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="text-text-secondary hover:text-accent transition-colors text-lg"
        >
          &larr;
        </button>
      )}
      <h1 className="font-sans text-lg font-bold text-text tracking-wide flex-1">
        {title}
      </h1>
      {/* 홈에서만 채팅 버튼 표시 */}
      {!showBack && (
        <button
          onClick={() => router.push('/chat')}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
          aria-label="AI 여행 플래너"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </header>
  );
}
