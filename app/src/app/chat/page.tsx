'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ChatContainer } from '@/components/chat/ChatContainer';

function ChatPageInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'create';
  const tripId = searchParams.get('tripId') ?? undefined;

  return (
    <div className="h-dvh flex flex-col">
      <Header title={mode === 'edit' ? '여행 수정하기' : 'AI Travel Planner'} showBack />
      <div className="flex-1 min-h-0">
        <ChatContainer mode={mode} tripId={tripId} />
      </div>
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
