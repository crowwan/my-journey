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
      <div className="max-w-[1100px] mx-auto px-3 flex items-center">
        {/* 홈 뒤로가기 — 스크롤 영역 밖 고정 */}
        <button
          onClick={() => router.push('/')}
          className="px-3 py-3.5 text-text-secondary hover:text-accent transition-colors shrink-0"
          aria-label="홈으로"
        >
          ←
        </button>
        {/* 탭 스크롤 영역 */}
        <Tabs value={activeTab} onValueChange={(v) => onChange(v as TabId)} className="flex-1 min-w-0">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto scrollbar-hide gap-0">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-3.5 text-[0.82rem] whitespace-nowrap data-[state=active]:text-accent data-[state=active]:font-semibold data-[state=active]:after:bg-accent"
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
