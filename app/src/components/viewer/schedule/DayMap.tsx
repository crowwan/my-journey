'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import type { MapSpot } from '@/types/trip';

interface DayMapProps {
  mapSpots: MapSpot[];
  color: string;
}

/** 순서 번호가 표시되는 커스텀 마커 아이콘 생성 */
function createNumberIcon(index: number, color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${color};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 800;
        border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      ">${index + 1}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function DayMapInner({ mapSpots, color }: DayMapProps) {
  // 모든 스팟 좌표로 bounds 계산
  const positions: [number, number][] = mapSpots.map((s) => [s.lat, s.lng]);
  const bounds = L.latLngBounds(positions);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [30, 30] }}
      scrollWheelZoom={false}
      className="h-[250px] rounded-xl overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* 번호 마커 */}
      {mapSpots.map((spot, idx) => (
        <Marker
          key={`${spot.lat}-${spot.lng}-${idx}`}
          position={[spot.lat, spot.lng]}
          icon={createNumberIcon(idx, color)}
        />
      ))}

      {/* 대시선 경로 */}
      {positions.length >= 2 && (
        <Polyline
          positions={positions}
          pathOptions={{
            color,
            weight: 3,
            dashArray: '8, 8',
            opacity: 0.7,
          }}
        />
      )}
    </MapContainer>
  );
}

export default DayMapInner;
