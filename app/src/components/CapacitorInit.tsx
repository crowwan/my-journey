'use client';

import { useEffect } from 'react';
import { initCapacitor } from '@/lib/capacitor';

/** Capacitor 네이티브 초기화 (StatusBar, SplashScreen) */
export function CapacitorInit() {
  useEffect(() => {
    initCapacitor();
  }, []);

  return null;
}
