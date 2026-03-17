'use client';

// ============================================================
// 환율 계산기 위젯
// 위치: BudgetTab 도넛 차트 아래, 예산 항목 리스트 위
// 두 입력 필드 (KRW / 현지 통화), 스왑 버튼, 환율 + 업데이트 시각 표시
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/lib/useCurrency';
import { formatNumber, getTimeAgo } from '@/domain/budget';

interface CurrencyConverterProps {
  currency: string; // 현지 통화 코드 (예: 'JPY')
}

// 통화 코드 -> 기호 매핑 (환율 계산기 전용, budget-utils보다 넓은 범위)
const CURRENCY_SYMBOLS: Record<string, string> = {
  KRW: '₩',
  JPY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
  THB: '฿',
  VND: '₫',
  CNY: '¥',
  TWD: 'NT$',
  SGD: 'S$',
  MYR: 'RM',
  IDR: 'Rp',
  PHP: '₱',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  HKD: 'HK$',
  CZK: 'Kč',
  TRY: '₺',
  MOP: 'MOP$',
};

export function CurrencyConverter({ currency }: CurrencyConverterProps) {
  // 좌/우 통화 상태 (스왑 가능)
  const [leftCurrency, setLeftCurrency] = useState('KRW');
  const [rightCurrency, setRightCurrency] = useState(currency);

  // 입력값 상태
  const [leftValue, setLeftValue] = useState('10000');
  const [rightValue, setRightValue] = useState('');

  // 어느 쪽이 마지막 입력인지 추적
  const [activeField, setActiveField] = useState<'left' | 'right'>('left');

  // 환율 조회 (항상 KRW → 현지 통화 방향)
  const { rate, loading, error, lastUpdated } = useCurrency('KRW', currency);

  // 환율 계산 함수
  const calculateConversion = useCallback(
    (value: string, from: 'left' | 'right') => {
      if (!rate) return;

      const numValue = parseFloat(value.replace(/,/g, '')) || 0;

      if (from === 'left') {
        // 왼쪽 → 오른쪽 변환
        let result: number;
        if (leftCurrency === 'KRW') {
          // KRW → 현지 통화
          result = numValue * rate;
        } else {
          // 현지 통화 → KRW
          result = numValue / rate;
        }
        setRightValue(numValue === 0 ? '' : formatNumber(result));
      } else {
        // 오른쪽 → 왼쪽 변환
        let result: number;
        if (rightCurrency === 'KRW') {
          // KRW → 현지 통화
          result = numValue * rate;
        } else {
          // 현지 통화 → KRW
          result = numValue / rate;
        }
        setLeftValue(numValue === 0 ? '' : formatNumber(result));
      }
    },
    [rate, leftCurrency, rightCurrency],
  );

  // 왼쪽 입력 변경
  const handleLeftChange = (value: string) => {
    // 숫자와 소수점만 허용
    const cleaned = value.replace(/[^0-9.]/g, '');
    setLeftValue(cleaned);
    setActiveField('left');
    calculateConversion(cleaned, 'left');
  };

  // 오른쪽 입력 변경
  const handleRightChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    setRightValue(cleaned);
    setActiveField('right');
    calculateConversion(cleaned, 'right');
  };

  // 스왑 버튼
  const handleSwap = () => {
    setLeftCurrency(rightCurrency);
    setRightCurrency(leftCurrency);
    setLeftValue(rightValue);
    setRightValue(leftValue);
    setActiveField(activeField === 'left' ? 'right' : 'left');
  };

  // 환율 표시 텍스트
  const rateDisplay = rate
    ? leftCurrency === 'KRW'
      ? `1 ${rightCurrency} = ${formatNumber(1 / rate)} KRW`
      : `1 ${leftCurrency} = ${formatNumber(1 / rate)} KRW`
    : '';

  // 환율 로드 후 초기 변환 계산
  useEffect(() => {
    if (!rate || !leftValue) return;
    if (activeField !== 'left') return;

    const numValue = parseFloat(leftValue.replace(/,/g, '')) || 0;
    if (numValue > 0) {
      const result = leftCurrency === 'KRW' ? numValue * rate : numValue / rate;
      setRightValue(formatNumber(result));
    }
  }, [rate, leftCurrency, leftValue, activeField]);

  // 로딩 스켈레톤
  if (loading) {
    return (
      <div className="bg-surface border border-border-light rounded-xl p-5 shadow-sm mb-8">
        <div className="animate-shimmer">
          <div className="h-4 bg-bg-tertiary rounded w-24 mb-4" />
          <div className="flex items-center gap-3">
            <div className="h-10 bg-bg-tertiary rounded-md flex-1" />
            <div className="size-8 bg-bg-tertiary rounded-full" />
            <div className="h-10 bg-bg-tertiary rounded-md flex-1" />
          </div>
          <div className="h-3 bg-bg-tertiary rounded w-40 mt-3" />
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-surface border border-border-light rounded-xl p-5 shadow-sm mb-8">
        <div className="flex items-center gap-2 text-text-tertiary">
          <AlertCircle className="size-4" />
          <span className="text-sm">환율 정보를 불러올 수 없습니다</span>
        </div>
      </div>
    );
  }

  const leftSymbol = CURRENCY_SYMBOLS[leftCurrency] ?? leftCurrency;
  const rightSymbol = CURRENCY_SYMBOLS[rightCurrency] ?? rightCurrency;

  return (
    <div className="bg-surface border border-border-light rounded-xl p-5 shadow-sm mb-8">
      {/* 제목 */}
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="size-4 text-primary" />
        <span className="text-sm font-bold text-text-primary">환율 계산기</span>
      </div>

      {/* 입력 필드 + 스왑 버튼 */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 왼쪽 입력 */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={leftValue}
              onChange={(e) => handleLeftChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 pr-14 text-sm font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-right"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary">
              {leftSymbol} {leftCurrency}
            </span>
          </div>
        </div>

        {/* 스왑 버튼 */}
        <button
          onClick={handleSwap}
          className="shrink-0 size-9 flex items-center justify-center rounded-full bg-primary-50 text-primary hover:bg-primary-100 active:scale-95 transition-all"
          aria-label="통화 교환"
        >
          <ArrowLeftRight className="size-4" />
        </button>

        {/* 오른쪽 입력 */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={rightValue}
              onChange={(e) => handleRightChange(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 pr-14 text-sm font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-right"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary">
              {rightSymbol} {rightCurrency}
            </span>
          </div>
        </div>
      </div>

      {/* 환율 + 업데이트 시각 */}
      <div className="flex items-center justify-between mt-3 text-xs text-text-tertiary">
        <span>{rateDisplay}</span>
        {lastUpdated && (
          <span>{getTimeAgo(lastUpdated)} 기준</span>
        )}
      </div>
    </div>
  );
}
