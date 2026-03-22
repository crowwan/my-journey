'use client';
import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 1800);
    const finishTimer = setTimeout(() => onFinish(), 2200);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 gradient-accent-soft ${exiting ? 'animate-splash-exit' : ''}`}>
      <div className="animate-plane-slide text-5xl">✈️</div>
      <div className="text-center">
        <h1 className="animate-splash-text text-2xl font-black text-text tracking-tight">My Journey</h1>
        <p className="animate-splash-sub text-sm text-text-secondary mt-1">AI Travel Planner</p>
      </div>
    </div>
  );
}
