'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = 'My Journey', showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border px-4 pb-4 flex items-center gap-3 shadow-none safe-top">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="text-text-secondary hover:text-accent transition-colors text-lg"
        >
          &larr;
        </button>
      )}
      <h1 className="font-sans text-lg font-bold text-text tracking-wide">
        {title}
      </h1>
    </header>
  );
}
