import type { Trip } from '@/types/trip';

/** 공유 결과 타입 */
interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'none';
}

/**
 * 여행 정보를 공유한다.
 * Web Share API 우선 사용, 미지원 시 클립보드 복사 폴백.
 */
export async function shareTrip(trip: Trip): Promise<ShareResult> {
  const url = `https://my-journey-app.vercel.app/trips/${trip.id}`;
  const title = trip.title;
  const text = `${trip.title} (${trip.startDate} ~ ${trip.endDate})`;

  // 1차: Web Share API (iOS WKWebView에서 Share Sheet 표시)
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'share' };
    } catch (e: unknown) {
      // 사용자가 공유를 취소한 경우 (AbortError)
      if (e instanceof Error && e.name === 'AbortError') {
        return { success: false, method: 'none' };
      }
    }
  }

  // 2차: 클립보드 복사 폴백 (Web Share API 미지원 브라우저)
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none' };
  }
}
