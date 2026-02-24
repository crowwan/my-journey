import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function ChatPage() {
  return (
    <div className="h-dvh flex flex-col">
      <Header title="AI Travel Planner" showBack />
      <div className="flex-1 min-h-0 pb-[var(--bottom-nav-h)]">
        <ChatContainer mode="create" />
      </div>
      <BottomNav />
    </div>
  );
}
