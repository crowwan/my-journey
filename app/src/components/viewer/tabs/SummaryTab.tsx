'use client';

import { Plane, Hotel, CloudSun, CalendarDays, CalendarPlus, ExternalLink } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { downloadIcsFile } from '@/lib/ics-utils';
import { SectionTitle } from '../shared/SectionTitle';
import { TipsAccordion } from '../shared/TipsAccordion';

interface SummaryTabProps {
  trip: Trip;
}

export function SummaryTab({ trip }: SummaryTabProps) {
  const flights = trip.overview?.flights ?? [];
  const accommodation = trip.overview?.accommodation;
  const weather = trip.overview?.weather ?? [];
  const tips = trip.overview?.tips ?? [];
  const days = trip.days ?? [];

  return (
    <div className="animate-fade-up">
      {/* 항공편 정보 */}
      <SectionTitle icon={<Plane className="size-4" />}>
        항공편
      </SectionTitle>
      {flights.length === 0 && (
        <div className="text-center py-6 text-text-tertiary mb-3">
          <p className="text-sm">항공편 정보가 아직 없습니다</p>
        </div>
      )}
      {flights.map((flight) => (
        <div
          key={flight.direction}
          className="bg-surface border border-border-light rounded-xl p-5 mb-3 shadow-sm"
        >
          <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-3">
            {flight.direction === 'outbound' ? '가는 편' : '오는 편'}
          </div>

          {/* 출발 → 도착 시각적 경로 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-text-primary">{flight.departureTime}</div>
              <div className="text-sm text-text-secondary">{flight.departure}</div>
              <div className="text-xs text-text-tertiary">{flight.date}</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 px-2">
              <div className="w-8 h-px bg-border" />
              <Plane className="size-4 text-cat-transport" />
              <div className="w-8 h-px bg-border" />
            </div>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-text-primary">{flight.arrivalTime}</div>
              <div className="text-sm text-text-secondary">{flight.arrival}</div>
              {flight.duration && (
                <div className="text-xs text-text-tertiary">{flight.duration}</div>
              )}
            </div>
          </div>

          {flight.note && (
            <div className="text-sm text-text-secondary mt-2 bg-bg-secondary rounded-lg px-3 py-2">{flight.note}</div>
          )}
        </div>
      ))}

      {/* 숙소 정보 */}
      <SectionTitle icon={<Hotel className="size-4" />}>
        숙소
      </SectionTitle>
      {accommodation ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name + (accommodation.address ? ' ' + accommodation.address : ''))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-surface border border-border-light rounded-xl p-5 mb-3 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-base font-bold text-text-primary">{accommodation.name}</div>
            <ExternalLink className="size-3.5 text-text-tertiary group-hover:text-primary transition-colors shrink-0" />
          </div>
          {accommodation.area && (
            <div className="text-sm text-text-secondary mt-1">{accommodation.area}</div>
          )}
          {accommodation.address && (
            <div className="text-xs text-text-tertiary mt-1">{accommodation.address}</div>
          )}
          {(accommodation.nearbyStations ?? []).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-text-tertiary">주변 역</span>
              {(accommodation.nearbyStations ?? []).map((station) => (
                <span
                  key={station}
                  className="text-xs bg-cat-transport/10 text-cat-transport px-2.5 py-1 rounded-full"
                >
                  {station}
                </span>
              ))}
            </div>
          )}
        </a>
      ) : (
        <div className="text-center py-6 text-text-tertiary mb-3">
          <p className="text-sm">숙소 정보가 아직 없습니다</p>
        </div>
      )}

      {/* 날씨 */}
      <SectionTitle icon={<CloudSun className="size-4" />}>
        날씨 예보
      </SectionTitle>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {weather.map((w) => (
          <div
            key={w.date}
            className="bg-surface border border-border-light rounded-xl p-4 min-w-[120px] text-center shrink-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-xs text-text-tertiary font-semibold">{w.dayOfWeek}</div>
            <div className="text-2xl my-1.5">{w.icon}</div>
            <div className="text-base font-bold text-text-primary">{w.tempAvg}°</div>
            <div className="text-xs text-text-secondary">
              {w.tempLow}° ~ {w.tempHigh}°
            </div>
          </div>
        ))}
      </div>

      {/* 일별 요약 */}
      <SectionTitle icon={<CalendarDays className="size-4" />}>
        일정 요약
      </SectionTitle>
      {days.length > 0 && (
        <button
          onClick={() => downloadIcsFile(trip)}
          className="flex items-center gap-1.5 text-xs text-primary border border-primary/20 bg-primary-50 rounded-full px-4 py-2 hover:bg-primary-100 transition-colors mb-4"
        >
          <CalendarPlus className="size-3.5" />
          캘린더에 추가
        </button>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {days.map((day, index) => (
          <div
            key={`day-${day.dayNumber ?? index}`}
            className="rounded-xl p-5 border border-border-light shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: `${day.color}08`, borderColor: `${day.color}25` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white mb-2"
              style={{ background: day.color }}
            >
              {day.dayNumber}
            </div>
            <div className="text-sm font-bold text-text-primary">{day.title}</div>
            <div className="text-xs text-text-secondary mt-0.5">{day.subtitle}</div>
          </div>
        ))}
      </div>

      {/* 팁 */}
      <TipsAccordion tips={tips} title="여행 팁" />
    </div>
  );
}
