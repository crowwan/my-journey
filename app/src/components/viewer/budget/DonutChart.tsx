'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/budget-utils';

interface DonutChartItem {
  label: string;
  percentage: number;
  color: string;
  amount: number;
}

interface DonutChartProps {
  items: DonutChartItem[];
  totalAmount: number;
  totalAmountKRW?: number;
  currency: string;
}

/**
 * SVG 도넛 차트 — arc path 방식으로 항목 간 gap 표현
 */
export function DonutChart({ items, totalAmount, totalAmountKRW, currency }: DonutChartProps) {
  const size = 200;
  const center = size / 2;
  const outerRadius = 88;
  const innerRadius = 62;
  const gapAngle = items.length > 1 ? 3 : 0; // 항목 간 간격 (도)

  // 각 항목의 arc path 계산
  const arcs = useMemo(() => {
    const totalGap = gapAngle * items.length;
    const availableAngle = 360 - totalGap;

    let currentAngle = -90; // 12시 방향 시작

    return items.map((item) => {
      const sweepAngle = (item.percentage / 100) * availableAngle;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sweepAngle;
      currentAngle = endAngle + gapAngle;

      // 각도 → 좌표 변환
      const toXY = (angle: number, r: number) => ({
        x: center + r * Math.cos((angle * Math.PI) / 180),
        y: center + r * Math.sin((angle * Math.PI) / 180),
      });

      const outerStart = toXY(startAngle, outerRadius);
      const outerEnd = toXY(endAngle, outerRadius);
      const innerStart = toXY(endAngle, innerRadius);
      const innerEnd = toXY(startAngle, innerRadius);

      const largeArc = sweepAngle > 180 ? 1 : 0;

      // 도넛 세그먼트 path (외곽 arc → 내곽 arc)
      const d = [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
        'Z',
      ].join(' ');

      return { ...item, d };
    });
  }, [items, center, gapAngle]);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8 sm:justify-center">
      {/* SVG 도넛 */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 배경 원 */}
          <circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth={outerRadius - innerRadius}
            opacity={0.3}
          />
          {/* 세그먼트 */}
          {arcs.map((arc) => (
            <path
              key={arc.label}
              d={arc.d}
              fill={arc.color || '#f97316'}
              className="transition-opacity duration-200 hover:opacity-80"
            />
          ))}
        </svg>
        {/* 중앙 합계 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-text-tertiary font-medium tracking-wider uppercase">합계</span>
          <span className="text-lg font-black text-text-primary leading-tight">
            {formatCurrency(totalAmount, currency)}
          </span>
          {totalAmountKRW !== undefined && totalAmountKRW > 0 && currency !== 'KRW' && (
            <span className="text-xs text-cat-sightseeing font-semibold">
              ≈ {formatCurrency(totalAmountKRW, 'KRW')}
            </span>
          )}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color || '#f97316' }}
            />
            <span className="text-sm text-text-primary">{item.label}</span>
            <span className="text-xs text-text-tertiary ml-auto tabular-nums">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
