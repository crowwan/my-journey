'use client';

import { useState, useEffect } from 'react';
import { Plane, Hotel, CloudSun, CalendarDays, ExternalLink, Plus, Trash2, X, Droplets, RefreshCw } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';
import type { Trip, Flight, Accommodation } from '@/types/trip';
import { useEditStore } from '@/stores/useEditStore';

import { EmojiIcon } from '@/lib/emoji-to-icon';
import { useWeather } from '@/queries/useWeather';
import { getTodayISO } from '@/lib/date-utils';
import { SectionEditHeader } from '../SectionEditHeader';
import { SectionTitle } from '../shared/SectionTitle';
import { TipsAccordion } from '../shared/TipsAccordion';
import { cn } from '@/lib/utils';

interface SummaryTabProps {
  trip: Trip;
}

// ============================================================
// 편집 모드용 인라인 input 컴포넌트
// ============================================================
function InlineInput({
  value,
  onChange,
  className,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  type?: 'text' | 'date';
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'bg-transparent border-b border-dashed border-primary/40 outline-none focus:border-primary transition-colors',
        className,
      )}
      placeholder={placeholder}
    />
  );
}

// ============================================================
// 항공편 편집 카드
// ============================================================
function FlightEditCard({
  flight,
  index,
  onUpdate,
  onDelete,
}: {
  flight: Flight;
  index: number;
  onUpdate: (index: number, field: keyof Flight, value: string) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-5 mb-3 hover:border-primary/30 transition-all">
      {/* 방향 선택 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-text-tertiary font-semibold">방향</span>
        <CustomSelect
          value={flight.direction}
          onChange={(v) => onUpdate(index, 'direction', v)}
          size="sm"
          options={[
            { value: 'outbound', label: '가는 편' },
            { value: 'inbound', label: '오는 편' },
          ]}
        />
      </div>

      {/* 출발지 → 도착지 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">출발</label>
          <InlineInput
            value={flight.departure}
            onChange={(v) => onUpdate(index, 'departure', v)}
            className="text-sm font-medium text-text-primary w-full"
            placeholder="출발지"
          />
        </div>
        <Plane className="size-4 text-cat-transport mt-4" />
        <div>
          <label className="text-xs text-text-tertiary block mb-1">도착</label>
          <InlineInput
            value={flight.arrival}
            onChange={(v) => onUpdate(index, 'arrival', v)}
            className="text-sm font-medium text-text-primary w-full"
            placeholder="도착지"
          />
        </div>
      </div>

      {/* 날짜 + 시간 + 소요시간 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">날짜</label>
          <InlineInput
            value={flight.date}
            onChange={(v) => onUpdate(index, 'date', v)}
            className="text-sm text-text-primary w-full"
            placeholder="2026-04-01"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">소요시간</label>
          <InlineInput
            value={flight.duration}
            onChange={(v) => onUpdate(index, 'duration', v)}
            className="text-sm text-text-primary w-full"
            placeholder="2h 30m"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-text-tertiary block mb-1">출발 시간</label>
          <InlineInput
            value={flight.departureTime}
            onChange={(v) => onUpdate(index, 'departureTime', v)}
            className="text-sm text-text-primary w-full"
            placeholder="09:00"
          />
        </div>
        <div>
          <label className="text-xs text-text-tertiary block mb-1">도착 시간</label>
          <InlineInput
            value={flight.arrivalTime}
            onChange={(v) => onUpdate(index, 'arrivalTime', v)}
            className="text-sm text-text-primary w-full"
            placeholder="11:30"
          />
        </div>
      </div>

      {/* 비고 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">비고</label>
        <InlineInput
          value={flight.note ?? ''}
          onChange={(v) => onUpdate(index, 'note', v)}
          className="text-sm text-text-secondary w-full"
          placeholder="메모 (선택사항)"
        />
      </div>

      {/* 삭제 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => onDelete(index)}
          className="flex items-center gap-1 text-xs text-error hover:bg-error/10 rounded-md px-2 py-1 transition-colors"
          aria-label="항공편 삭제"
        >
          <Trash2 className="size-3.5" />
          삭제
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 숙소 편집 카드
// ============================================================
function AccommodationEditCard({
  accommodation,
  onUpdate,
  onStationUpdate,
  onStationAdd,
  onStationDelete,
}: {
  accommodation: Accommodation;
  onUpdate: (field: keyof Accommodation, value: string) => void;
  onStationUpdate: (index: number, value: string) => void;
  onStationAdd: () => void;
  onStationDelete: (index: number) => void;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-5 mb-3 hover:border-primary/30 transition-all">
      {/* 이름 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">이름</label>
        <InlineInput
          value={accommodation.name}
          onChange={(v) => onUpdate('name', v)}
          className="text-sm font-bold text-text-primary w-full"
          placeholder="호텔 이름"
        />
      </div>

      {/* 주소 */}
      <div className="mb-3">
        <label className="text-xs text-text-tertiary block mb-1">주소</label>
        <InlineInput
          value={accommodation.address}
          onChange={(v) => onUpdate('address', v)}
          className="text-sm text-text-primary w-full"
          placeholder="호텔 주소"
        />
      </div>

      {/* 지역 */}
      <div className="mb-4">
        <label className="text-xs text-text-tertiary block mb-1">지역</label>
        <InlineInput
          value={accommodation.area}
          onChange={(v) => onUpdate('area', v)}
          className="text-sm text-text-primary w-full"
          placeholder="지역명"
        />
      </div>

      {/* 지도 링크 */}
      <div className="mb-4">
        <label className="text-xs text-text-tertiary block mb-1">지도 링크 (선택)</label>
        <InlineInput
          value={accommodation.mapUrl ?? ''}
          onChange={(v) => onUpdate('mapUrl', v)}
          className="text-xs text-primary w-full"
          placeholder="https://maps.google.com/... (비워두면 이름으로 검색)"
        />
      </div>

      {/* 근처 역 */}
      <div>
        <label className="text-xs text-text-tertiary block mb-2">근처 역</label>
        <div className="flex flex-wrap items-center gap-2">
          {(accommodation.nearbyStations ?? []).map((station, i) => (
            <div
              key={`station-${i}`}
              className="flex items-center gap-1 bg-cat-transport/10 rounded-full pl-2.5 pr-1 py-1"
            >
              <InlineInput
                value={station}
                onChange={(v) => onStationUpdate(i, v)}
                className="text-xs text-cat-transport bg-transparent border-none w-auto min-w-[3rem] max-w-[8rem]"
                placeholder="역 이름"
              />
              <button
                onClick={() => onStationDelete(i)}
                className="p-0.5 text-cat-transport/60 hover:text-error rounded-full transition-colors"
                aria-label="역 삭제"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <button
            onClick={onStationAdd}
            className="flex items-center gap-1 text-xs text-primary bg-primary-50/50 hover:bg-primary-50 rounded-full px-2.5 py-1 transition-colors"
          >
            <Plus className="size-3" />
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// 마지막 업데이트 시각 표시 (순수 렌더 위반 방지를 위해 별도 컴포넌트)
function WeatherUpdatedAt({ lastUpdated }: { lastUpdated: Date }) {
  const [label, setLabel] = useState('방금 업데이트');

  useEffect(() => {
    function update() {
      const diffMin = Math.round((Date.now() - lastUpdated.getTime()) / 60000);
      setLabel(diffMin < 1 ? '방금 업데이트' : `${diffMin}분 전 업데이트`);
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-1.5 mb-2 text-xs text-text-tertiary">
      <RefreshCw className="size-3" />
      <span>{label}</span>
    </div>
  );
}

export function SummaryTab({ trip }: SummaryTabProps) {
  const flights = trip.overview?.flights ?? [];
  const accommodation = trip.overview?.accommodation;
  const tips = trip.overview?.tips ?? [];
  const days = trip.days ?? [];

  // 실시간 날씨 데이터 (mapSpots 좌표를 폴백으로 사용)
  const firstValidSpot = days
    .flatMap((day) => day.mapSpots ?? [])
    .find((spot) => Number.isFinite(spot?.lat) && Number.isFinite(spot?.lng));
  const fallbackCoords = firstValidSpot ? { lat: firstValidSpot.lat, lng: firstValidSpot.lng } : undefined;
  const { data: weatherData, loading: weatherLoading, error: weatherError, lastUpdated } = useWeather(
    trip.destination,
    trip.startDate,
    trip.endDate,
    fallbackCoords,
  );

  const editingSection = useEditStore((s) => s.editingSection);
  const updateEditingTrip = useEditStore((s) => s.updateEditingTrip);

  // 섹션별 편집 상태 확인
  const isFlightsEdit = editingSection === 'flights';
  const isAccommodationEdit = editingSection === 'accommodation';

  // 오늘 날짜 문자열 (로컬 시간 기준)
  const todayStr = getTodayISO();

  // ============================================================
  // 항공편 편집 헬퍼
  // ============================================================

  // 항공편 필드 업데이트
  const handleFlightUpdate = (index: number, field: keyof Flight, value: string) => {
    updateEditingTrip((t) => {
      const newFlights = (t.overview?.flights ?? []).map((f, i) =>
        i === index ? { ...f, [field]: value } : f,
      );
      return { ...t, overview: { ...t.overview, flights: newFlights } };
    });
  };

  // 항공편 추가
  const handleFlightAdd = () => {
    updateEditingTrip((t) => {
      const newFlight: Flight = {
        direction: 'outbound',
        departure: '',
        arrival: '',
        departureTime: '',
        arrivalTime: '',
        date: '',
        duration: '',
      };
      const currentFlights = t.overview?.flights ?? [];
      return {
        ...t,
        overview: { ...t.overview, flights: [...currentFlights, newFlight] },
      };
    });
  };

  // 항공편 삭제
  const handleFlightDelete = (index: number) => {
    updateEditingTrip((t) => {
      const newFlights = (t.overview?.flights ?? []).filter((_, i) => i !== index);
      return { ...t, overview: { ...t.overview, flights: newFlights } };
    });
  };

  // ============================================================
  // 숙소 편집 헬퍼
  // ============================================================

  // 숙소 필드 업데이트
  const handleAccommodationUpdate = (field: keyof Accommodation, value: string) => {
    updateEditingTrip((t) => {
      const current = t.overview?.accommodation ?? { name: '', address: '', area: '', nearbyStations: [] };
      return {
        ...t,
        overview: { ...t.overview, accommodation: { ...current, [field]: value } },
      };
    });
  };

  // 근처 역 업데이트
  const handleStationUpdate = (index: number, value: string) => {
    updateEditingTrip((t) => {
      const current = t.overview?.accommodation;
      if (!current) return t;
      const newStations = [...(current.nearbyStations ?? [])];
      newStations[index] = value;
      return {
        ...t,
        overview: { ...t.overview, accommodation: { ...current, nearbyStations: newStations } },
      };
    });
  };

  // 근처 역 추가
  const handleStationAdd = () => {
    updateEditingTrip((t) => {
      const current = t.overview?.accommodation;
      if (!current) return t;
      return {
        ...t,
        overview: {
          ...t.overview,
          accommodation: {
            ...current,
            nearbyStations: [...(current.nearbyStations ?? []), ''],
          },
        },
      };
    });
  };

  // 근처 역 삭제
  const handleStationDelete = (index: number) => {
    updateEditingTrip((t) => {
      const current = t.overview?.accommodation;
      if (!current) return t;
      const newStations = (current.nearbyStations ?? []).filter((_, i) => i !== index);
      return {
        ...t,
        overview: { ...t.overview, accommodation: { ...current, nearbyStations: newStations } },
      };
    });
  };

  return (
    <div className="animate-fade-up">
      {/* 항공편 정보 */}
      <SectionEditHeader
        title="항공편"
        icon={<Plane className="size-4" />}
        section="flights"
        trip={trip}
        suffix={
          flights.length > 0 ? (
            <span className="text-sm font-normal text-text-secondary ml-2">
              ({flights.length})
            </span>
          ) : undefined
        }
      />

      {isFlightsEdit ? (
        // 편집 모드: 항공편 편집 카드
        <>
          {flights.map((flight, index) => (
            <FlightEditCard
              key={`flight-edit-${index}`}
              flight={flight}
              index={index}
              onUpdate={handleFlightUpdate}
              onDelete={handleFlightDelete}
            />
          ))}
          {/* 항공편 추가 버튼 */}
          <button
            onClick={handleFlightAdd}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-dashed border-primary/30 bg-primary-50/30 text-sm text-primary hover:bg-primary-50 transition-colors mb-3"
          >
            <Plus className="size-4" />
            항공편 추가
          </button>
        </>
      ) : (
        // 읽기 모드: 기존 항공편 표시
        <>
          {flights.length === 0 && (
            <div className="text-center py-6 text-text-tertiary mb-3">
              <p className="text-sm">항공편 정보가 아직 없습니다</p>
            </div>
          )}
          {flights.map((flight, index) => (
            <div
              key={`flight-${index}`}
              className="bg-surface border border-border-light rounded-xl p-5 mb-3 shadow-sm"
            >
              <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-3">
                {flight.direction === 'outbound' ? '가는 편' : '오는 편'}
              </div>

              {/* 출발 -> 도착 시각적 경로 */}
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
        </>
      )}

      {/* 숙소 정보 */}
      <SectionEditHeader
        title="숙소"
        icon={<Hotel className="size-4" />}
        section="accommodation"
        trip={trip}
      />

      {isAccommodationEdit ? (
        // 편집 모드: 숙소 편집 카드
        <AccommodationEditCard
          accommodation={accommodation ?? { name: '', address: '', area: '', nearbyStations: [] }}
          onUpdate={handleAccommodationUpdate}
          onStationUpdate={handleStationUpdate}
          onStationAdd={handleStationAdd}
          onStationDelete={handleStationDelete}
        />
      ) : (
        // 읽기 모드: 기존 숙소 표시
        <>
          {accommodation ? (
            <a
              href={accommodation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation.name)}`}
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
        </>
      )}

      {/* 실시간 날씨 */}
      <SectionTitle icon={<CloudSun className="size-4" />}>
        날씨 예보
      </SectionTitle>

      {/* 마지막 업데이트 시각 */}
      {lastUpdated && (
        <WeatherUpdatedAt lastUpdated={lastUpdated} />
      )}

      {/* 로딩 스켈레톤 */}
      {weatherLoading && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-surface border border-border-light rounded-xl p-4 min-w-[120px] text-center shrink-0 shadow-sm"
            >
              <div className="h-3 w-8 mx-auto bg-bg-tertiary rounded animate-shimmer mb-2" />
              <div className="h-7 w-7 mx-auto bg-bg-tertiary rounded-full animate-shimmer my-1.5" />
              <div className="h-5 w-10 mx-auto bg-bg-tertiary rounded animate-shimmer mb-1" />
              <div className="h-3 w-16 mx-auto bg-bg-tertiary rounded animate-shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* 에러 메시지 */}
      {!weatherLoading && weatherError && (
        <div className="text-center py-6 text-text-tertiary mb-3">
          <CloudSun className="size-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">{weatherError}</p>
        </div>
      )}

      {/* 날씨 데이터 없음 (에러도 아님) */}
      {!weatherLoading && !weatherError && (!weatherData || weatherData.length === 0) && (
        <div className="text-center py-6 text-text-tertiary mb-3">
          <CloudSun className="size-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">예보 범위 밖이거나 날씨 데이터가 없습니다</p>
        </div>
      )}

      {/* 실시간 날씨 카드 */}
      {!weatherLoading && !weatherError && weatherData && weatherData.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {weatherData.map((w) => {
            const isToday = w.date === todayStr;
            return (
              <div
                key={w.date}
                className={cn(
                  'bg-surface border rounded-xl p-4 min-w-[120px] text-center shrink-0 shadow-sm hover:shadow-md transition-shadow',
                  isToday ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border-light',
                )}
              >
                <div className="text-xs text-text-tertiary font-semibold">
                  {w.dayOfWeek}
                  {isToday && (
                    <span className="ml-1 text-[10px] text-primary font-bold">TODAY</span>
                  )}
                </div>
                <div className="text-2xl my-1.5">
                  <EmojiIcon emoji={w.icon} size={24} className="inline-block" />
                </div>
                <div className="text-base font-bold text-text-primary">{w.tempAvg}°</div>
                <div className="text-xs text-text-secondary">
                  {w.tempLow}° ~ {w.tempHigh}°
                </div>
                {/* 강수 확률 */}
                {w.precipitationProbability > 0 && (
                  <div className="flex items-center justify-center gap-0.5 mt-1.5 text-xs text-info">
                    <Droplets className="size-3" />
                    <span>{w.precipitationProbability}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 일별 요약 */}
      <SectionTitle icon={<CalendarDays className="size-4" />}>
        일정 요약
      </SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {days.map((day, index) => {
          const isToday = day.date === todayStr;
          return (
          <div
            key={`day-${day.dayNumber ?? index}`}
            className="rounded-xl p-5 border border-border-light shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black text-primary">{day.dayNumber}</span>
              {isToday && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-text-primary">{day.title}</div>
            <div className="text-xs text-text-secondary mt-0.5">{day.subtitle}</div>
          </div>
          );
        })}
      </div>

      {/* 팁 */}
      <TipsAccordion tips={tips} title="여행 팁" />
    </div>
  );
}
