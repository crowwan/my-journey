'use client';

import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/chat', label: '채팅', icon: '💬' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // 뷰어/에디트 페이지에서는 숨김
  if (pathname.startsWith('/trips/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[var(--bottom-nav-h)] bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="max-w-[1100px] mx-auto flex justify-around h-full items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[0.68rem] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
