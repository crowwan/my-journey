import type { MapSpot } from '@/types/trip';

/**
 * 장소 목록으로 Google Maps를 여는 함수
 * - spots 1개: 핀 표시, 2개 이상: 경로 표시
 */
export function openInMapsApp(spots: MapSpot[]): void {
  if (spots.length === 0) return;

  if (spots.length === 1) {
    const spot = spots[0];
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`,
      '_blank',
    );
    return;
  }

  // 2개 이상: 전체 경유지를 포함한 경로 표시
  window.open(
    `https://www.google.com/maps/dir/${spots.map((s) => `${s.lat},${s.lng}`).join('/')}`,
    '_blank',
  );
}
