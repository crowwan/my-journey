'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Plane, Calendar, Compass, CheckSquare } from 'lucide-react';
import { TAB_CONFIG, type TabId } from '@/lib/constants';
import { cn } from '@/lib/utils';

// 탭 아이콘 매핑
const TAB_ICONS = {
  Plane,
  Calendar,
  Compass,
  CheckSquare,
} as const;

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border-light">
      <div className="max-w-[1100px] mx-auto px-3">
        {/* 홈 뒤로가기 — 탭 위 별도 행 */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-0.5 px-1 pt-2 pb-1 text-sm text-text-secondary hover:text-primary transition-colors"
          aria-label="홈으로"
        >
          <ChevronLeft className="size-4" />
          <span>홈</span>
        </button>

        {/* 4탭 균등 분배 */}
        <div className="flex justify-around">
          {TAB_CONFIG.map((tab) => {
            const Icon = TAB_ICONS[tab.icon];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative',
                  isActive
                    ? 'text-primary-500'
                    : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
                {/* 활성 탭 하단 인디케이터 */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
