'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatContainer } from '@/components/chat/ChatContainer';

function ChatPageInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'create';
  const tripId = searchParams.get('tripId') ?? undefined;

  return (
    <div className="h-dvh flex flex-col">
      <Header title={mode === 'edit' ? '여행 수정하기' : 'AI Travel Planner'} showBack />
      <div className="flex-1 min-h-0 pb-[var(--bottom-nav-h)]">
        <ChatContainer mode={mode} tripId={tripId} />
      </div>
      <BottomNav />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
