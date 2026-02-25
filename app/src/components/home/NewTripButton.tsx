'use client';

import { useRouter } from 'next/navigation';

export function NewTripButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/chat')}
      className="shrink-0 bg-accent text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-accent/90 transition-colors"
    >
      + 새 여행
    </button>
  );
}
