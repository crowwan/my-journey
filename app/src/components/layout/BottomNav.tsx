'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: '홈',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/chat',
    label: '채팅',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // 뷰어/에디트 페이지에서는 숨김
  if (pathname.startsWith('/trips/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[var(--bottom-nav-h)] bg-white/90 backdrop-blur-sm border-t border-border shadow-none">
      <div className="max-w-[1100px] mx-auto flex justify-around h-full items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 px-6 py-1.5 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'text-accent font-semibold'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[0.65rem] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
