import { Capacitor } from '@capacitor/core';
import type { MapSpot } from '@/types/trip';

/**
 * 장소 목록으로 지도 앱을 여는 함수
 * - iOS 네이티브: Apple Maps (maps:// scheme)
 * - 웹: Google Maps URL (새 탭)
 * - spots 1개: 핀 표시, 2개 이상: 경로 표시
 */
export function openInMapsApp(spots: MapSpot[]): void {
  if (spots.length === 0) return;

  const isNative = Capacitor.isNativePlatform();

  if (spots.length === 1) {
    // 단일 장소: 핀 표시
    const spot = spots[0];
    const url = isNative
      ? `maps://?q=${encodeURIComponent(spot.name)}&ll=${spot.lat},${spot.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

    openUrl(url, isNative);
    return;
  }

  // 2개 이상: 전체 경유지를 포함한 경로 표시
  const first = spots[0];
  const rest = spots.slice(1);

  const url = isNative
    ? `maps://?saddr=${first.lat},${first.lng}&daddr=${rest.map((s) => `${s.lat},${s.lng}`).join('+to:')}`
    : `https://www.google.com/maps/dir/${spots.map((s) => `${s.lat},${s.lng}`).join('/')}`;

  openUrl(url, isNative);
}

/** iOS scheme은 location.href로, 웹 URL은 새 탭으로 열기 */
function openUrl(url: string, isNative: boolean): void {
  if (isNative) {
    // iOS maps:// scheme은 window.open 대신 location.href로 열어야 동작
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}
