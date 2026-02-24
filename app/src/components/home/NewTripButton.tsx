'use client';

import { useRouter } from 'next/navigation';

export function NewTripButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/chat')}
      className="w-full py-4 rounded-[14px] border-2 border-dashed border-border text-text-tertiary hover:border-accent/40 hover:text-accent transition-all text-sm font-medium"
    >
      + 새 여행 만들기
    </button>
  );
}
