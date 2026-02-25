'use client';

import { TAB_CONFIG, type TabId } from '@/lib/constants';

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="sticky top-0 z-[100] bg-white/95 backdrop-blur-sm border-b border-border px-3">
      <div className="flex gap-0.5 max-w-[1100px] mx-auto overflow-x-auto scrollbar-hide">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-3 text-[0.82rem] font-medium cursor-pointer border-b-2 whitespace-nowrap transition-all duration-300 select-none ${
              activeTab === tab.id
                ? 'text-accent border-accent font-semibold'
                : 'text-text-tertiary border-transparent hover:text-text-secondary'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
