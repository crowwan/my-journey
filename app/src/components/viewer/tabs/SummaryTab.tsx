'use client';

import { Plane, Hotel, CloudSun, CalendarDays, Lightbulb, CalendarPlus } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { downloadIcsFile } from '@/lib/ics-utils';
import { SectionTitle } from '../shared/SectionTitle';
import { InfoGrid } from '../shared/InfoGrid';
import { InfoCard } from '../shared/InfoCard';
import { Tip } from '../shared/Tip';

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
      <SectionTitle icon={<Plane className="size-4 text-white" />} bgColor="bg-cat-transport">
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
      <SectionTitle icon={<Hotel className="size-4 text-white" />} bgColor="bg-cat-accommodation">
        숙소
      </SectionTitle>
      {accommodation ? (
        <div className="bg-surface border border-border-light rounded-xl p-5 mb-3 shadow-sm">
          <InfoGrid>
            <InfoCard label="숙소명" value={accommodation.name} />
            <InfoCard label="지역" value={accommodation.area} />
            <InfoCard label="주소" value={accommodation.address} />
          </InfoGrid>
          {(accommodation.nearbyStations ?? []).length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">
                주변 역
              </div>
              <div className="flex flex-wrap gap-2">
                {(accommodation.nearbyStations ?? []).map((station) => (
                  <span
                    key={station}
                    className="text-sm bg-cat-transport/10 text-cat-transport px-2.5 py-1 rounded-full"
                  >
                    {station}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-text-tertiary mb-3">
          <p className="text-sm">숙소 정보가 아직 없습니다</p>
        </div>
      )}

      {/* 날씨 */}
      <SectionTitle icon={<CloudSun className="size-4 text-white" />} bgColor="bg-cat-activity">
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
      <SectionTitle icon={<CalendarDays className="size-4 text-white" />} bgColor="bg-primary-500">
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
      {tips.length > 0 && (
        <>
          <SectionTitle icon={<Lightbulb className="size-4 text-white" />} bgColor="bg-primary-500">
            여행 팁
          </SectionTitle>
          {tips.map((tip) => (
            <Tip key={tip}>{tip}</Tip>
          ))}
        </>
      )}
    </div>
  );
}
