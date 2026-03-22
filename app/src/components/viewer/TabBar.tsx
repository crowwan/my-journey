'use client';

import { useRouter } from 'next/navigation';
import { TAB_CONFIG, type TabId } from '@/lib/constants';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-[100] glass-strong border-b border-border shadow-[var(--shadow-sm)] pt-[var(--safe-area-top,0px)]">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* 홈 뒤로가기 */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-1 pt-2 pb-1 text-sm text-text-secondary hover:text-accent transition-colors"
          aria-label="홈으로"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="font-medium">홈</span>
        </button>
        {/* 탭 스크롤 영역 */}
        <Tabs value={activeTab} onValueChange={(v) => onChange(v as TabId)}>
          <TabsList variant="line" className="w-full justify-start overflow-x-auto scrollbar-hide gap-0">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-3.5 py-3 text-[0.82rem] whitespace-nowrap"
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
