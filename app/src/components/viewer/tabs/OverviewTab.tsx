'use client';

import type { Trip } from '@/types/trip';
import { downloadIcsFile } from '@/lib/ics-utils';
import { SectionTitle } from '../shared/SectionTitle';
import { InfoGrid } from '../shared/InfoGrid';
import { InfoCard } from '../shared/InfoCard';
import { Tip } from '../shared/Tip';

interface OverviewTabProps {
  trip: Trip;
}

export function OverviewTab({ trip }: OverviewTabProps) {
  const flights = trip.overview?.flights ?? [];
  const accommodation = trip.overview?.accommodation;
  const weather = trip.overview?.weather ?? [];
  const tips = trip.overview?.tips ?? [];
  const days = trip.days ?? [];

  return (
    <div className="animate-fade-up">
      {/* 항공편 정보 */}
      <SectionTitle icon="✈️" bgColor="#3b82f6">
        항공편
      </SectionTitle>
      {flights.length === 0 && (
        <div className="text-center py-8 text-text-tertiary">
          <p className="text-sm">항공편 정보가 아직 없습니다</p>
        </div>
      )}
      {flights.map((flight) => (
        <div
          key={flight.direction}
          className="bg-surface-elevated border border-border rounded-2xl p-5 mb-3 shadow-[var(--shadow-sm)]"
        >
          <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-3">
            {flight.direction === 'outbound' ? '가는 편' : '오는 편'}
          </div>
          <InfoGrid>
            <InfoCard label="출발" value={flight.departure} sub={`${flight.date} ${flight.departureTime}`} />
            <InfoCard label="도착" value={flight.arrival} sub={flight.arrivalTime} />
            <InfoCard label="소요시간" value={flight.duration} />
          </InfoGrid>
          {flight.note && (
            <div className="text-sm text-text-secondary mt-3">{flight.note}</div>
          )}
        </div>
      ))}

      {/* 숙소 정보 */}
      <SectionTitle icon="🏨" bgColor="#a78bfa">
        숙소
      </SectionTitle>
      {accommodation ? (
        <div className="bg-surface-elevated border border-border rounded-2xl p-5 mb-3 shadow-[var(--shadow-sm)]">
          <InfoGrid>
            <InfoCard label="숙소명" value={accommodation.name} />
            <InfoCard label="지역" value={accommodation.area} />
            <InfoCard label="주소" value={accommodation.address} />
          </InfoGrid>
          {(accommodation.nearbyStations ?? []).length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-bold mb-2">
                주변 역
              </div>
              <div className="flex flex-wrap gap-2">
                {(accommodation.nearbyStations ?? []).map((station) => (
                  <span
                    key={station}
                    className="text-sm bg-trip-blue/8 text-trip-blue px-3 py-1.5 rounded-xl border border-trip-blue/12 font-medium"
                  >
                    {station}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-text-tertiary">
          <p className="text-sm">숙소 정보가 아직 없습니다</p>
        </div>
      )}

      {/* 날씨 */}
      <SectionTitle icon="🌤️" bgColor="#22d3ee">
        날씨 예보
      </SectionTitle>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {weather.map((w) => (
          <div
            key={w.date}
            className="bg-surface-elevated border border-border rounded-2xl p-4 min-w-[110px] text-center shrink-0 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="text-xs text-text-tertiary font-bold">{w.dayOfWeek}</div>
            <div className="text-2xl my-2">{w.icon}</div>
            <div className="text-lg font-black text-text">{w.tempAvg}°</div>
            <div className="text-xs text-text-secondary font-medium">
              {w.tempLow}° ~ {w.tempHigh}°
            </div>
          </div>
        ))}
      </div>

      {/* 일별 요약 */}
      <SectionTitle icon="📅" bgColor="#f97316">
        일정 요약
      </SectionTitle>
      {days.length > 0 && (
        <button
          onClick={() => downloadIcsFile(trip)}
          className="flex items-center gap-2 text-xs font-semibold text-white gradient-accent rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all active:scale-[0.97] mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          캘린더에 추가
        </button>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {days.map((day, index) => (
          <div
            key={`day-${day.dayNumber ?? index}`}
            className="rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] shadow-[var(--shadow-sm)]"
            style={{ background: `${day.color}08`, borderColor: `${day.color}20` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white mb-2 shadow-sm"
              style={{ background: day.color }}
            >
              {day.dayNumber}
            </div>
            <div className="text-sm font-bold text-text">{day.title}</div>
            <div className="text-xs text-text-secondary mt-1">{day.subtitle}</div>
          </div>
        ))}
      </div>

      {/* 팁 */}
      {tips.length > 0 && (
        <>
          <SectionTitle icon="💡" bgColor="#f97316">
            여행 팁
          </SectionTitle>
          <div className="space-y-2">
            {tips.map((tip) => (
              <Tip key={tip}>{tip}</Tip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
