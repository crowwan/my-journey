import type { Trip } from '@/types/trip';
import { SectionTitle } from '../shared/SectionTitle';
import { InfoGrid } from '../shared/InfoGrid';
import { InfoCard } from '../shared/InfoCard';
import { Tip } from '../shared/Tip';

interface OverviewTabProps {
  trip: Trip;
}

export function OverviewTab({ trip }: OverviewTabProps) {
  const { flights, accommodation, weather, tips } = trip.overview;

  return (
    <div className="animate-fade-up">
      {/* 항공편 정보 */}
      <SectionTitle icon="✈️" bgColor="#3b82f6">
        항공편
      </SectionTitle>
      {flights.map((flight) => (
        <div
          key={flight.direction}
          className="bg-card border border-border rounded-[14px] p-5 mb-3"
        >
          <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">
            {flight.direction === 'outbound' ? '가는 편' : '오는 편'}
          </div>
          <InfoGrid>
            <InfoCard label="출발" value={flight.departure} sub={`${flight.date} ${flight.departureTime}`} />
            <InfoCard label="도착" value={flight.arrival} sub={flight.arrivalTime} />
            <InfoCard label="소요시간" value={flight.duration} />
          </InfoGrid>
          {flight.note && (
            <div className="text-sm text-text-secondary mt-2">{flight.note}</div>
          )}
        </div>
      ))}

      {/* 숙소 정보 */}
      <SectionTitle icon="🏨" bgColor="#a78bfa">
        숙소
      </SectionTitle>
      <div className="bg-card border border-border rounded-[14px] p-5 mb-3">
        <InfoGrid>
          <InfoCard label="숙소명" value={accommodation.name} />
          <InfoCard label="지역" value={accommodation.area} />
          <InfoCard label="주소" value={accommodation.address} />
        </InfoGrid>
        {accommodation.nearbyStations.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">
              주변 역
            </div>
            <div className="flex flex-wrap gap-2">
              {accommodation.nearbyStations.map((station) => (
                <span
                  key={station}
                  className="text-sm bg-trip-blue/10 text-trip-blue px-2.5 py-1 rounded-lg"
                >
                  {station}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 날씨 */}
      <SectionTitle icon="🌤️" bgColor="#22d3ee">
        날씨 예보
      </SectionTitle>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {weather.map((w) => (
          <div
            key={w.date}
            className="bg-card border border-border rounded-[14px] p-4 min-w-[110px] text-center shrink-0 hover:border-trip-cyan/30 transition-colors"
          >
            <div className="text-xs text-text-tertiary font-semibold">{w.dayOfWeek}</div>
            <div className="text-2xl my-1.5">{w.icon}</div>
            <div className="text-base font-bold text-white">{w.tempAvg}°</div>
            <div className="text-xs text-text-secondary">
              {w.tempLow}° ~ {w.tempHigh}°
            </div>
          </div>
        ))}
      </div>

      {/* 일별 요약 */}
      <SectionTitle icon="📅" bgColor="#f97316">
        일정 요약
      </SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
        {trip.days.map((day) => (
          <div
            key={day.dayNumber}
            className="rounded-[14px] p-4 border border-border transition-all hover:-translate-y-0.5"
            style={{ background: `${day.color}10`, borderColor: `${day.color}30` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white mb-2"
              style={{ background: day.color }}
            >
              {day.dayNumber}
            </div>
            <div className="text-sm font-bold text-white">{day.title}</div>
            <div className="text-xs text-text-secondary mt-0.5">{day.subtitle}</div>
          </div>
        ))}
      </div>

      {/* 팁 */}
      {tips.length > 0 && (
        <>
          <SectionTitle icon="💡" bgColor="#f97316">
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
