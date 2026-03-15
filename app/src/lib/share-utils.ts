import type { Trip } from '@/types/trip';
import { generateTripHtml } from './trip-to-html';

// 공유 결과 타입
export interface ShareResult {
  success: boolean;
  method: 'download' | 'share' | 'clipboard' | 'none';
}

/**
 * 파일명에서 특수문자를 제거하고 안전한 문자열로 변환한다.
 */
export function sanitizeFilename(title: string): string {
  return title
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // 파일 시스템에서 금지된 문자 제거
    .replace(/\s+/g, ' ')                   // 연속 공백 정리
    .trim()
    || 'my-journey';                         // 빈 문자열 방지
}

/**
 * Trip 객체로부터 HTML Blob을 생성한다.
 */
function createHtmlBlob(trip: Trip): Blob {
  const html = generateTripHtml(trip);
  return new Blob([html], { type: 'text/html;charset=utf-8' });
}

/**
 * Trip 객체로부터 HTML File 객체를 생성한다.
 */
function createHtmlFile(trip: Trip): File {
  const blob = createHtmlBlob(trip);
  const filename = `${sanitizeFilename(trip.title)}.html`;
  return new File([blob], filename, { type: 'text/html' });
}

/**
 * HTML 파일을 다운로드한다.
 * Blob URL을 생성하고 <a download> 트릭으로 다운로드를 트리거한다.
 */
export function downloadTripHtml(trip: Trip): ShareResult {
  try {
    const blob = createHtmlBlob(trip);
    const url = URL.createObjectURL(blob);
    const filename = `${sanitizeFilename(trip.title)}.html`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, method: 'download' };
  } catch {
    return { success: false, method: 'none' };
  }
}

/**
 * Web Share API(File)로 HTML 파일을 공유한다.
 * 모바일에서 카카오톡, 에어드롭 등으로 직접 공유 가능.
 */
export async function shareTripHtml(trip: Trip): Promise<ShareResult> {
  try {
    const file = createHtmlFile(trip);

    // File 공유 지원 여부 확인
    if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
      return { success: false, method: 'none' };
    }

    await navigator.share({
      title: trip.title,
      text: `${trip.title} (${trip.startDate} ~ ${trip.endDate})`,
      files: [file],
    });

    return { success: true, method: 'share' };
  } catch (e: unknown) {
    // 사용자가 공유를 취소한 경우 (AbortError)
    if (e instanceof Error && e.name === 'AbortError') {
      return { success: false, method: 'none' };
    }
    return { success: false, method: 'none' };
  }
}

/**
 * 여행 URL을 클립보드에 복사한다 (보조 옵션).
 */
export async function copyShareUrl(trip: Trip): Promise<ShareResult> {
  const url = `https://my-journey-planner.vercel.app/trips/${trip.id}`;
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none' };
  }
}

/**
 * Web Share API File 공유를 지원하는지 확인한다.
 */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.canShare) return false;

  try {
    // 더미 파일로 지원 여부 확인
    const testFile = new File(['test'], 'test.html', { type: 'text/html' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}
