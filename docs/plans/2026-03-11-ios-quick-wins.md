# iOS Phase 1 Quick Wins 구현 계획

**작성일**: 2026-03-11

## 문제 정의

### AS-IS
- 여행 일정을 보기만 할 수 있고, 외부 앱과 연동하는 기능이 없음
- 일정을 캘린더 앱에 추가하려면 수동으로 하나씩 입력해야 함
- 지도에서 장소를 확인할 수 있지만, 네이티브 지도앱으로 바로 열 수 없음
- 여행 정보를 다른 사람에게 공유할 방법이 없음

### TO-BE
- "캘린더에 추가" 버튼으로 여행 일정을 .ics 파일로 내보내기
- 지도 마커에서 "지도 앱에서 열기" 버튼으로 Apple Maps/Google Maps 실행
- HeroSection에서 공유 버튼으로 여행 링크 공유 (iOS Share Sheet / Web Share API)

---

## 기능 1: .ics 캘린더 내보내기

### 접근 방법
- 외부 라이브러리 없이 iCalendar 텍스트를 직접 생성 (RFC 5545)
- Trip.days 배열에서 Day별 VEVENT 생성
- Blob URL로 .ics 파일 다운로드 트리거 -> iOS에서 캘린더 앱 자동 연결

### 영향 범위
| 파일 | 변경 | 역할 |
|------|------|------|
| `app/src/lib/ics-utils.ts` | **신규 생성** | iCalendar 텍스트 생성 유틸 |
| `app/src/components/viewer/tabs/OverviewTab.tsx` | 수정 | "캘린더에 추가" 버튼 추가 |

### 구현 단계

#### 1-1. `app/src/lib/ics-utils.ts` 신규 생성

```typescript
// 필요한 타입
import type { Trip, Day } from '@/types/trip';

// 공개 함수
export function generateIcsText(trip: Trip): string
export function downloadIcsFile(trip: Trip): void
```

**generateIcsText 로직**:
- VCALENDAR 헤더: `VERSION:2.0`, `PRODID:-//My Journey//Trip Calendar//KO`, `CALSCALE:GREGORIAN`
- Trip.days 배열 순회하며 Day별 VEVENT 생성:
  - `DTSTART;VALUE=DATE:{day.date}` (YYYYMMDD 형식, 하이픈 제거)
  - `DTEND;VALUE=DATE:{day.date + 1일}` (종일 이벤트)
  - `SUMMARY:Day {day.dayNumber} - {day.title}`
  - `DESCRIPTION:{day.subtitle} | {day.items.map(i => i.time + ' ' + i.title).join('\\n')}`
  - `UID:{trip.id}-day{day.dayNumber}@myjourney`
- 날짜 +1일 계산 헬퍼 함수 필요 (종일 이벤트는 DTEND가 다음날)
- 줄바꿈은 `\r\n` (RFC 5545 필수)
- 텍스트 내 콤마, 세미콜론은 백슬래시 이스케이프

**downloadIcsFile 로직**:
```typescript
export function downloadIcsFile(trip: Trip): void {
  const text = generateIcsText(trip);
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trip.destination}-${trip.startDate}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

#### 1-2. `app/src/components/viewer/tabs/OverviewTab.tsx` 수정

**변경 내용**: "일정 요약" 섹션 타이틀 옆에 "캘린더에 추가" 버튼 추가

- 파일 상단에 `'use client'` 디렉티브 추가 (현재 없음, 이벤트 핸들러 필요)
- `import { downloadIcsFile } from '@/lib/ics-utils'` 추가
- "일정 요약" SectionTitle 아래, days grid 위에 버튼 추가:

```tsx
<button
  onClick={() => downloadIcsFile(trip)}
  className="flex items-center gap-1.5 text-xs text-accent border border-accent/20 bg-accent-bg rounded-full px-4 py-2 hover:bg-accent-bg-hover transition-colors mb-4"
>
  <span>📅</span>
  캘린더에 추가
</button>
```

- 버튼 스타일은 HeroSection의 "AI로 수정하기" 버튼 패턴을 따름 (accent 색상, rounded-full, text-xs)

### 완료 조건
- [ ] generateIcsText가 RFC 5545 호환 텍스트 생성
- [ ] Day별 종일 이벤트가 정확한 날짜로 생성됨
- [ ] description에 타임라인 아이템 요약 포함
- [ ] 버튼 클릭 시 .ics 파일 다운로드
- [ ] iOS Safari/WKWebView에서 캘린더 앱 연결 확인
- [ ] 웹 브라우저에서도 파일 다운로드 동작

---

## 기능 2: 지도 앱에서 열기 딥링크

### 접근 방법
- 패키지 설치 없이 URL scheme으로 처리
- iOS 네이티브 -> Apple Maps (`maps://`), 웹 -> Google Maps URL
- `Capacitor.isNativePlatform()` 으로 플랫폼 분기
- DayMap.tsx가 아닌 **DayCard.tsx**에 버튼 추가 (DayMap은 Leaflet 전용, DayCard가 컨테이너)

### 영향 범위
| 파일 | 변경 | 역할 |
|------|------|------|
| `app/src/lib/map-utils.ts` | **신규 생성** | 지도 앱 URL 생성 유틸 |
| `app/src/components/viewer/schedule/DayCard.tsx` | 수정 | "지도 앱에서 열기" 버튼 추가 |

### 구현 단계

#### 2-1. `app/src/lib/map-utils.ts` 신규 생성

```typescript
import { Capacitor } from '@capacitor/core';
import type { MapSpot } from '@/types/trip';

/**
 * 장소 목록의 중심점으로 지도 앱을 여는 URL 생성
 * - iOS 네이티브: Apple Maps (maps:// scheme)
 * - 웹: Google Maps URL
 */
export function openInMapsApp(spots: MapSpot[]): void
```

**로직**:
- spots가 1개인 경우: 해당 좌표로 pin 표시
  - iOS: `maps://?q=${name}&ll=${lat},${lng}`
  - 웹: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
- spots가 2개 이상인 경우: 첫 번째를 출발지, 마지막을 목적지로 경로 표시
  - iOS: `maps://?saddr=${firstLat},${firstLng}&daddr=${lastLat},${lastLng}`
  - 웹: `https://www.google.com/maps/dir/${firstLat},${firstLng}/${lastLat},${lastLng}`
- `window.open(url, '_blank')` 또는 `window.location.href = url` (iOS scheme)

**플랫폼 분기**:
```typescript
const isNative = Capacitor.isNativePlatform();
// isNative면 maps:// scheme, 아니면 Google Maps URL
```

#### 2-2. `app/src/components/viewer/schedule/DayCard.tsx` 수정

**변경 내용**: DayMap 아래에 "지도 앱에서 열기" 버튼 추가

- `import { openInMapsApp } from '@/lib/map-utils'` 추가
- DayMap 컴포넌트 바로 아래 (mb-4 div 안)에 버튼 추가:

```tsx
{day.mapSpots && day.mapSpots.length > 0 && (
  <div className="mb-4">
    <DayMap mapSpots={day.mapSpots} color={color} />
    <button
      onClick={() => openInMapsApp(day.mapSpots)}
      className="flex items-center gap-1.5 text-xs text-trip-blue border border-trip-blue/20 bg-trip-blue/5 rounded-full px-4 py-2 hover:bg-trip-blue/10 transition-colors mt-2 mx-auto"
    >
      <span>🗺️</span>
      지도 앱에서 열기
    </button>
  </div>
)}
```

- 버튼 색상은 교통/이동 컬러인 trip-blue (`#3b82f6`) 계열 사용
- mx-auto로 가운데 정렬

### 완료 조건
- [ ] iOS 네이티브 앱에서 Apple Maps 열림
- [ ] 웹 브라우저에서 Google Maps 열림 (새 탭)
- [ ] spots 1개일 때 핀 표시, 2개 이상일 때 경로 표시
- [ ] mapSpots가 없는 Day에는 버튼 미노출
- [ ] 버튼 스타일이 기존 UI 패턴과 일관성 유지

---

## 기능 3: 공유 기능

### 접근 방법

**선택한 방법: Web Share API 우선, 폴백으로 클립보드 복사**

`@capacitor/share` 패키지 설치 대신 Web Share API를 우선 사용한다.
- 이유: iOS WKWebView에서 `navigator.share()`가 정상 동작하고, Capacitor 서버 모드에서도 잘 작동함
- 추가 패키지 없이 구현 가능하여 번들 크기 절약
- Web Share API 미지원 브라우저 폴백: 클립보드 복사 + 토스트 메시지

만약 iOS WKWebView에서 `navigator.share()`가 동작하지 않는 경우에만 `@capacitor/share`로 전환한다.

### 영향 범위
| 파일 | 변경 | 역할 |
|------|------|------|
| `app/src/lib/share-utils.ts` | **신규 생성** | 공유 유틸 (Web Share API + 클립보드 폴백) |
| `app/src/components/viewer/HeroSection.tsx` | 수정 | 공유 버튼 추가 |

### 구현 단계

#### 3-1. `app/src/lib/share-utils.ts` 신규 생성

```typescript
import type { Trip } from '@/types/trip';

interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'none';
}

export async function shareTrip(trip: Trip): Promise<ShareResult>
```

**로직**:
```typescript
export async function shareTrip(trip: Trip): Promise<ShareResult> {
  const url = `https://my-journey-app.vercel.app/trips/${trip.id}`;
  const title = trip.title;
  const text = `${trip.title} (${trip.startDate} ~ ${trip.endDate})`;

  // 1차: Web Share API
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'share' };
    } catch (e) {
      // 사용자가 취소한 경우 (AbortError)
      if (e instanceof Error && e.name === 'AbortError') {
        return { success: false, method: 'none' };
      }
    }
  }

  // 2차: 클립보드 복사 폴백
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none' };
  }
}
```

#### 3-2. `app/src/components/viewer/HeroSection.tsx` 수정

**변경 내용**: 태그 뱃지 아래, 준비물 진행률 위에 공유 버튼 추가

- 파일 상단에 `'use client'` 디렉티브 추가 (이벤트 핸들러 필요)
- `useState` import 추가 (토스트 메시지 상태)
- `import { shareTrip } from '@/lib/share-utils'` 추가
- 공유 버튼 + 토스트 메시지 UI 추가:

```tsx
// 상태 추가
const [toastMessage, setToastMessage] = useState<string | null>(null);

// 공유 핸들러
const handleShare = async () => {
  const result = await shareTrip(trip);
  if (result.method === 'clipboard') {
    setToastMessage('링크가 복사되었습니다');
    setTimeout(() => setToastMessage(null), 2000);
  }
};
```

**버튼 위치**: "AI로 수정하기" 버튼과 나란히 (flex row)

```tsx
{/* 액션 버튼 그룹 */}
<div className="flex items-center gap-2 justify-center mt-4">
  <button
    onClick={handleShare}
    className="flex items-center gap-1.5 text-xs text-accent border border-accent/20 bg-accent-bg rounded-full px-4 py-2 hover:bg-accent-bg-hover transition-colors"
  >
    <span>🔗</span>
    공유하기
  </button>
  {onEdit && (
    <button
      onClick={onEdit}
      className="flex items-center gap-1.5 text-xs text-accent border border-accent/20 bg-accent-bg rounded-full px-4 py-2 hover:bg-accent-bg-hover transition-colors"
    >
      <span>✏️</span>
      AI로 수정하기
    </button>
  )}
</div>
```

**토스트 메시지** (HeroSection 하단):
```tsx
{toastMessage && (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-up z-50">
    {toastMessage}
  </div>
)}
```

- 기존 `{onEdit && ...}` 버튼은 액션 버튼 그룹 안으로 이동 (독립 렌더링 -> 그룹)
- 공유 버튼은 `onEdit` 유무와 관계없이 항상 노출

### 완료 조건
- [ ] iOS 네이티브 앱에서 Share Sheet 열림
- [ ] 웹 브라우저에서 Web Share API 동작 (지원 시)
- [ ] Web Share API 미지원 시 클립보드 복사 + 토스트 표시
- [ ] 사용자가 공유 취소해도 에러 없음
- [ ] 공유 URL이 `https://my-journey-app.vercel.app/trips/{id}` 형식
- [ ] 기존 "AI로 수정하기" 버튼 레이아웃 깨지지 않음

---

## 구현 순서 (의존성 기준)

```
1. ics-utils.ts 생성 -> OverviewTab.tsx 수정     (독립)
2. map-utils.ts 생성 -> DayCard.tsx 수정           (독립)
3. share-utils.ts 생성 -> HeroSection.tsx 수정     (독립)
```

3개 기능 모두 독립적이므로 순서 무관하나, 난이도와 검증 용이성 기준으로 위 순서 권장.

## 전체 완료 조건 (DoD)

- [ ] 3개 유틸 파일 생성 (`ics-utils.ts`, `map-utils.ts`, `share-utils.ts`)
- [ ] 3개 컴포넌트 수정 (`OverviewTab.tsx`, `DayCard.tsx`, `HeroSection.tsx`)
- [ ] 새 패키지 설치 없음 (Web Share API로 충분)
- [ ] TypeScript 타입 에러 없음 (`npx tsc --noEmit`)
- [ ] 린트 에러 없음 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] iOS 시뮬레이터에서 3개 기능 동작 확인
- [ ] 웹 브라우저에서 3개 기능 동작 확인 (폴백 포함)
