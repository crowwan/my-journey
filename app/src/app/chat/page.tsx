import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function ChatPage() {
  return (
    <div className="min-h-screen pb-20">
      <Header title="AI Travel Planner" showBack />
      <main className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-4xl mb-4">💬</div>
        <h2 className="text-xl font-bold text-white mb-2">AI 여행 플래너</h2>
        <p className="text-text-secondary text-sm text-center">
          AI와 대화하며 여행 계획을 세워보세요<br/>
          (Phase 3에서 구현 예정)
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
