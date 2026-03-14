'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function NewTripButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push('/chat')}
      size="sm"
      className="rounded-full bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md transition-all"
    >
      + 새 여행
    </Button>
  );
}
