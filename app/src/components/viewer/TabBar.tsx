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
    <div className="sticky top-0 z-[100] bg-white/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-[1100px] mx-auto px-3">
        {/* 홈 뒤로가기 — 탭 위 별도 행 */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 px-1 pt-2 pb-1 text-sm text-text-secondary hover:text-primary transition-colors"
          aria-label="홈으로"
        >
          <span className="text-base">←</span>
          <span>홈</span>
        </button>
        {/* 탭 스크롤 영역 */}
        <Tabs value={activeTab} onValueChange={(v) => onChange(v as TabId)}>
          <TabsList variant="line" className="w-full justify-start overflow-x-auto scrollbar-hide gap-0">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-3 text-[0.82rem] whitespace-nowrap data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:after:bg-primary"
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
