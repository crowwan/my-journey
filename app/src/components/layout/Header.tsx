'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, CalendarDays } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCalendar?: boolean;
}

export function Header({ title = 'My Journey', showBack = false, showCalendar = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border-light px-5 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <h1 className="font-display text-lg font-bold text-text-primary tracking-wide flex-1">
        {title}
      </h1>
      {showCalendar && (
        <button
          onClick={() => router.push('/calendar')}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          aria-label="캘린더"
        >
          <CalendarDays className="size-5" />
        </button>
      )}
    </header>
  );
}
