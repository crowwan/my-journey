'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
  activeIcon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: '홈',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <rect x="9" y="12" width="6" height="10" fill="white" rx="1" />
      </svg>
    ),
  },
  {
    path: '/chat',
    label: '채팅',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong shadow-[var(--shadow-up)] pb-[env(safe-area-inset-bottom)]" style={{ minHeight: 'var(--bottom-nav-h)' }}>
      <div className="max-w-[1100px] mx-auto flex justify-around h-full items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-8 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-accent'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-[0.65rem] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
