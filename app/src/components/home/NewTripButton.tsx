'use client';

import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';

export function NewTripButton() {
  const openAIDrawer = useUIStore((s) => s.openAIDrawer);

  return (
    <Button
      onClick={() => openAIDrawer('create')}
      size="sm"
      className="rounded-full bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md transition-all"
    >
      + 새 여행
    </Button>
  );
}
