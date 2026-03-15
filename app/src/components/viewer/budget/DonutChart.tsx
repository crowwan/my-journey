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
 * SVG 도넛 차트 컴포넌트
 * stroke-dasharray로 각 항목의 비율을 표현
 */
export function DonutChart({ items, totalAmount, totalAmountKRW, currency }: DonutChartProps) {
  // 원의 반지름과 둘레
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 24;
  const size = 200;
  const center = size / 2;

  // 각 항목의 dash 계산을 사전에 수행 (reduce로 누적)
  const segments = useMemo(() => {
    const result: Array<DonutChartItem & { dashLength: number; gapLength: number; offset: number }> = [];
    items.reduce((accumulated, item) => {
      const dashLength = (item.percentage / 100) * circumference;
      const gapLength = circumference - dashLength;
      const offset = (accumulated / 100) * circumference;
      result.push({ ...item, dashLength, gapLength, offset });
      return accumulated + item.percentage;
    }, 0);
    return result;
  }, [items, circumference]);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8 sm:justify-center">
      {/* SVG 도넛 */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* 배경 원 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth={strokeWidth}
          />
          {/* 각 항목 세그먼트 */}
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color || '#f97316'}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashLength} ${seg.gapLength}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {/* 중앙 합계 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-text-tertiary font-medium">합계</span>
          <span className="text-lg font-black text-text-primary">
            {formatCurrency(totalAmount, currency)}
          </span>
          {totalAmountKRW !== undefined && totalAmountKRW > 0 && currency !== 'KRW' && (
            <span className="text-xs text-cat-sightseeing font-semibold">
              {formatCurrency(totalAmountKRW, 'KRW')}
            </span>
          )}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="size-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color || '#f97316' }}
            />
            <span className="text-sm text-text-primary font-medium">{item.label}</span>
            <span className="text-xs text-text-tertiary ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
