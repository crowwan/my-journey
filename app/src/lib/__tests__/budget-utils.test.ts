import { describe, it, expect } from 'vitest';
import { parseAmountString, migrateBudgetItem, migrateBudget, calculateBudgetTotal, formatCurrency, convertToKRW } from '../budget-utils';

// ============================================================
// parseAmountString 테스트
// ============================================================
describe('parseAmountString', () => {
  it('엔화 문자열을 숫자와 통화 코드로 분리한다', () => {
    const result = parseAmountString('¥3,000');
    expect(result).toEqual({ amount: 3000, currency: 'JPY' });
  });

  it('달러 문자열을 숫자와 통화 코드로 분리한다', () => {
    const result = parseAmountString('$50');
    expect(result).toEqual({ amount: 50, currency: 'USD' });
  });

  it('유로 문자열을 숫자와 통화 코드로 분리한다', () => {
    const result = parseAmountString('€100');
    expect(result).toEqual({ amount: 100, currency: 'EUR' });
  });

  it('원화 문자열을 숫자와 통화 코드로 분리한다', () => {
    const result = parseAmountString('₩50,000');
    expect(result).toEqual({ amount: 50000, currency: 'KRW' });
  });

  it('통화 기호가 없는 숫자만 있는 문자열은 KRW로 처리한다', () => {
    const result = parseAmountString('3000');
    expect(result).toEqual({ amount: 3000, currency: 'KRW' });
  });

  it('빈 문자열은 0과 KRW를 반환한다', () => {
    const result = parseAmountString('');
    expect(result).toEqual({ amount: 0, currency: 'KRW' });
  });

  it('소수점이 포함된 금액도 처리한다', () => {
    const result = parseAmountString('$99.99');
    expect(result).toEqual({ amount: 99.99, currency: 'USD' });
  });
});

// ============================================================
// migrateBudgetItem 테스트
// ============================================================
describe('migrateBudgetItem', () => {
  it('문자열 amount를 가진 구 데이터를 숫자 amount로 변환한다', () => {
    const oldItem = {
      icon: '🚆',
      label: '교통',
      detail: '전철, 버스',
      amount: '¥3,000',
      percentage: 30,
      color: '#3b82f6',
    };
    const result = migrateBudgetItem(oldItem, 'JPY');
    expect(result.amount).toBe(3000);
    expect(result.currency).toBe('JPY');
  });

  it('이미 숫자 amount를 가진 신 데이터는 그대로 유지한다', () => {
    const newItem = {
      icon: '🚆',
      label: '교통',
      detail: '전철, 버스',
      amount: 3000,
      currency: 'JPY',
      percentage: 30,
      color: '#3b82f6',
    };
    const result = migrateBudgetItem(newItem, 'JPY');
    expect(result.amount).toBe(3000);
    expect(result.currency).toBe('JPY');
  });
});

// ============================================================
// migrateBudget 테스트
// ============================================================
describe('migrateBudget', () => {
  it('구 데이터 BudgetSection을 신 데이터 구조로 변환한다', () => {
    const oldBudget = {
      items: [
        { icon: '🚆', label: '교통', detail: '전철', amount: '¥3,000', percentage: 30, color: '#3b82f6' },
        { icon: '🍽️', label: '식비', detail: '식당', amount: '¥5,000', percentage: 50, color: '#f472b6' },
      ],
      total: { min: '¥50,000', max: '¥80,000', minKRW: '약 50만원', maxKRW: '약 80만원' },
      tips: ['팁1'],
    };
    const result = migrateBudget(oldBudget);
    expect(result.currency).toBe('JPY');
    expect(result.items[0].amount).toBe(3000);
    expect(result.items[0].currency).toBe('JPY');
    expect(result.items[1].amount).toBe(5000);
    // total은 자동 계산
    expect(result.total.amount).toBe(8000);
    expect(result.total.currency).toBe('JPY');
    // 구 데이터 호환: range 유지
    expect(result.range).toBeDefined();
    expect(result.range?.min).toBe('¥50,000');
    expect(result.tips).toEqual(['팁1']);
  });

  it('이미 신 데이터 구조인 경우 그대로 유지한다', () => {
    const newBudget = {
      items: [
        { icon: '🚆', label: '교통', detail: '전철', amount: 3000, currency: 'JPY', percentage: 100, color: '#3b82f6' },
      ],
      currency: 'JPY',
      exchangeRate: 10,
      total: { amount: 3000, currency: 'JPY', amountKRW: 30000 },
      tips: ['팁1'],
    };
    const result = migrateBudget(newBudget);
    expect(result.currency).toBe('JPY');
    expect(result.items[0].amount).toBe(3000);
    expect(result.total.amount).toBe(3000);
  });

  it('빈 budget 데이터를 안전하게 처리한다', () => {
    const result = migrateBudget({});
    expect(result.items).toEqual([]);
    expect(result.currency).toBe('KRW');
    expect(result.total.amount).toBe(0);
  });
});

// ============================================================
// calculateBudgetTotal 테스트
// ============================================================
describe('calculateBudgetTotal', () => {
  it('아이템 금액 합계를 계산한다', () => {
    const items = [
      { icon: '🚆', label: '교통', detail: '', amount: 3000, currency: 'JPY', percentage: 0, color: '' },
      { icon: '🍽️', label: '식비', detail: '', amount: 5000, currency: 'JPY', percentage: 0, color: '' },
    ];
    const total = calculateBudgetTotal(items, 'JPY', 10);
    expect(total.amount).toBe(8000);
    expect(total.currency).toBe('JPY');
    expect(total.amountKRW).toBe(80000);
  });

  it('아이템이 없으면 0을 반환한다', () => {
    const total = calculateBudgetTotal([], 'JPY', 10);
    expect(total.amount).toBe(0);
    expect(total.amountKRW).toBe(0);
  });

  it('환율이 없으면 원화 환산을 생략한다', () => {
    const items = [
      { icon: '🚆', label: '교통', detail: '', amount: 3000, currency: 'JPY', percentage: 0, color: '' },
    ];
    const total = calculateBudgetTotal(items, 'JPY');
    expect(total.amount).toBe(3000);
    expect(total.amountKRW).toBeUndefined();
  });
});

// ============================================================
// formatCurrency 테스트
// ============================================================
describe('formatCurrency', () => {
  it('엔화를 통화 기호와 천 단위 쉼표로 포맷한다', () => {
    expect(formatCurrency(3000, 'JPY')).toBe('¥3,000');
  });

  it('원화를 통화 기호와 천 단위 쉼표로 포맷한다', () => {
    expect(formatCurrency(50000, 'KRW')).toBe('₩50,000');
  });

  it('달러를 통화 기호와 천 단위 쉼표로 포맷한다', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100');
  });

  it('0은 통화 기호와 0으로 표시한다', () => {
    expect(formatCurrency(0, 'JPY')).toBe('¥0');
  });
});

// ============================================================
// convertToKRW 테스트
// ============================================================
describe('convertToKRW', () => {
  it('외화 금액을 환율로 원화 환산한다', () => {
    expect(convertToKRW(3000, 10)).toBe(30000);
  });

  it('환율이 없으면 undefined를 반환한다', () => {
    expect(convertToKRW(3000)).toBeUndefined();
  });

  it('KRW는 환율 없이 그대로 반환한다', () => {
    expect(convertToKRW(50000, undefined)).toBeUndefined();
  });
});
