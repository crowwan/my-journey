// 공유 뷰어 페이지 — 비로그인도 접근 가능, 읽기 전용
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plane } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { TripViewer } from '@/components/viewer/TripViewer';

export default function SharedTripPage() {
  const params = useParams();
  const token = typeof params.token === 'string' ? params.token : '';

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSharedTrip = useCallback(async () => {
    if (!token) {
      setError('유효하지 않은 공유 링크입니다.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/shared/${token}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? '공유 링크가 만료되었거나 존재하지 않습니다.');
        return;
      }

      setTrip(data.trip);
    } catch {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSharedTrip();
  }, [fetchSharedTrip]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Plane className="size-8 text-primary-500 animate-pulse" />
          <span className="text-text-secondary text-sm">여행 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <Plane className="size-12 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            여행을 찾을 수 없습니다
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            {error ?? '공유 링크가 만료되었거나 존재하지 않습니다.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-primary-500 rounded-md px-6 py-2.5 hover:bg-primary-600 transition-colors"
          >
            My Journey 시작하기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* 읽기 전용 TripViewer */}
      <TripViewer trip={trip} readOnly />

      {/* 하단 워터마크 */}
      <div className="max-w-[1100px] mx-auto px-5 pb-12 pt-4">
        <div className="flex items-center justify-center gap-2 py-4 border-t border-border-light">
          <Plane className="size-4 text-primary-500" />
          <span className="text-xs text-text-tertiary">
            <a
              href="/"
              className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              My Journey
            </a>
            에서 만들었어요
          </span>
        </div>
      </div>
    </div>
  );
}
