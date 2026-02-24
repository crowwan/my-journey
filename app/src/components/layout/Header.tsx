'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = 'My Journey', showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="text-text-secondary hover:text-white transition-colors text-lg"
        >
          &larr;
        </button>
      )}
      <h1 className="text-lg font-bold text-white">{title}</h1>
    </header>
  );
}
