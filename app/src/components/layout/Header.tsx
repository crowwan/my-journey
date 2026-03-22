'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
}

export function Header({ title = 'My Journey', showBack = false, transparent = false }: HeaderProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const isTransparent = transparent && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 px-5 py-3.5 pt-[calc(0.875rem+var(--safe-area-top,0px))] flex items-center gap-3 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent shadow-none border-b border-transparent'
          : 'glass-strong border-b border-border shadow-[var(--shadow-sm)]'
      }`}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <h1 className={`text-lg font-bold tracking-tight flex-1 transition-colors ${isTransparent ? 'text-text' : 'text-text'}`}>
        {title}
      </h1>
      {/* 홈에서만 채팅 버튼 표시 */}
      {!showBack && (
        <button
          onClick={() => router.push('/chat')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
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
