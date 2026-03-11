import type { Trip, Day } from '@/types/trip';

// 날짜 문자열(YYYY-MM-DD)을 YYYYMMDD 형식으로 변환
function formatDateToIcs(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

// 종일 이벤트의 DTEND용: 날짜 +1일 계산 후 YYYYMMDD 반환
function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// iCalendar 텍스트 내 특수문자 이스케이프 (RFC 5545)
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Day 하나를 VEVENT 텍스트로 변환
function dayToVevent(tripId: string, day: Day): string {
  const dtstart = formatDateToIcs(day.date);
  const dtend = getNextDay(day.date);
  const summary = escapeIcsText(`Day ${day.dayNumber} - ${day.title}`);

  const description = escapeIcsText(day.subtitle ?? '');

  const uid = `${tripId}-day${day.dayNumber}@myjourney`;

  const lines = [
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `UID:${uid}`,
    'END:VEVENT',
  ];

  return lines.join('\r\n');
}

// Trip 전체를 iCalendar 텍스트로 변환
export function generateIcsText(trip: Trip): string {
  const days = trip.days ?? [];

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My Journey//Trip Calendar//KO',
    'CALSCALE:GREGORIAN',
  ].join('\r\n');

  const events = days.map((day) => dayToVevent(trip.id, day)).join('\r\n');

  const footer = 'END:VCALENDAR';

  return `${header}\r\n${events}\r\n${footer}\r\n`;
}

// .ics 파일 다운로드 트리거
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
