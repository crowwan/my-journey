import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/** iOS 기기별 safe area top 높이 (px) */
function getIOSSafeAreaTop(): number {
  const h = Math.max(window.screen.height, window.screen.width);
  if (h >= 852) return 59; // Dynamic Island (iPhone 14 Pro, 15, 16 등)
  if (h >= 812) return 47; // Notch (iPhone X ~ 14)
  return 20; // Classic (iPhone SE, 8 등)
}

/** Capacitor 네이티브 플랫폼 초기화 (웹에서는 무시) */
export async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return;

  // iOS safe area를 CSS 변수로 주입 (env() 미작동 대응)
  if (Capacitor.getPlatform() === 'ios') {
    const safeTop = getIOSSafeAreaTop();
    document.documentElement.style.setProperty('--safe-area-top', `${safeTop}px`);
  }

  await StatusBar.setStyle({ style: Style.Light });
  await SplashScreen.hide();
}
