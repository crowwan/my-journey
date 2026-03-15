// ============================================================
// 예산 유틸리티 함수
// 구 데이터(문자열 금액) → 신 데이터(숫자 금액) 마이그레이션
// 통화 포맷, 환율 계산, 합계 계산
// ============================================================

import type { BudgetItem, BudgetTotal, BudgetSection, BudgetRange } from '@/types/trip';

// 통화 기호 → ISO 통화 코드 매핑
const CURRENCY_SYMBOLS: Record<string, string> = {
  '¥': 'JPY',
  '$': 'USD',
  '€': 'EUR',
  '₩': 'KRW',
  '฿': 'THB',
  '₫': 'VND',
};

// ISO 통화 코드 → 통화 기호 매핑
const CURRENCY_CODE_TO_SYMBOL: Record<string, string> = {
  JPY: '¥',
  USD: '$',
  EUR: '€',
  KRW: '₩',
  THB: '฿',
  VND: '₫',
  CNY: '¥',
  TWD: 'NT$',
};

/**
 * 통화 기호가 포함된 금액 문자열을 숫자와 통화 코드로 분리한다
 * 예: "¥3,000" → { amount: 3000, currency: "JPY" }
 */
export function parseAmountString(amountStr: string): { amount: number; currency: string } {
  if (!amountStr || amountStr.trim() === '') {
    return { amount: 0, currency: 'KRW' };
  }

  const trimmed = amountStr.trim();

  // 통화 기호 탐색
  let detectedCurrency = 'KRW';
  let numericPart = trimmed;

  for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
    if (trimmed.includes(symbol)) {
      detectedCurrency = code;
      numericPart = trimmed.replace(symbol, '');
      break;
    }
  }

  // 쉼표 제거 후 숫자 파싱
  const cleaned = numericPart.replace(/,/g, '').trim();
  const amount = parseFloat(cleaned);

  return {
    amount: isNaN(amount) ? 0 : amount,
    currency: detectedCurrency,
  };
}

/**
 * 구/신 데이터 호환 BudgetItem 마이그레이션
 * 문자열 amount → 숫자 amount + currency 분리
 */
export function migrateBudgetItem(
  item: Record<string, unknown>,
  defaultCurrency: string,
): BudgetItem {
  // 이미 숫자 amount를 가진 신 데이터
  if (typeof item.amount === 'number') {
    return {
      icon: (item.icon ?? '') as string,
      label: (item.label ?? '') as string,
      detail: (item.detail ?? '') as string,
      amount: item.amount,
      currency: (item.currency ?? defaultCurrency) as string,
      percentage: (item.percentage ?? 0) as number,
      color: (item.color ?? '#f97316') as string,
    };
  }

  // 구 데이터: 문자열 amount 파싱
  const parsed = parseAmountString((item.amount ?? '') as string);
  return {
    icon: (item.icon ?? '') as string,
    label: (item.label ?? '') as string,
    detail: (item.detail ?? '') as string,
    amount: parsed.amount,
    currency: parsed.currency !== 'KRW' ? parsed.currency : defaultCurrency,
    percentage: (item.percentage ?? 0) as number,
    color: (item.color ?? '#f97316') as string,
  };
}

/**
 * 아이템 합계와 원화 환산을 계산한다
 */
export function calculateBudgetTotal(
  items: BudgetItem[],
  currency: string,
  exchangeRate?: number,
): BudgetTotal {
  const amount = items.reduce((sum, item) => sum + item.amount, 0);
  return {
    amount,
    currency,
    amountKRW: exchangeRate ? amount * exchangeRate : undefined,
  };
}

/**
 * 구 BudgetSection을 신 구조로 마이그레이션한다
 */
export function migrateBudget(
  raw: Record<string, unknown>,
): BudgetSection {
  // 이미 신 데이터인지 확인 (currency 필드 존재 + items[0].amount가 숫자)
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const isNewFormat =
    typeof raw.currency === 'string' &&
    (rawItems.length === 0 || typeof rawItems[0]?.amount === 'number');

  if (isNewFormat) {
    const currency = (raw.currency ?? 'KRW') as string;
    const exchangeRate = typeof raw.exchangeRate === 'number' ? raw.exchangeRate : undefined;
    const items: BudgetItem[] = rawItems.map(
      (item: Record<string, unknown>) => migrateBudgetItem(item, currency),
    );

    // total이 신 형식이면 그대로 사용
    const rawTotal = raw.total as Record<string, unknown> | undefined;
    const total: BudgetTotal = rawTotal && typeof rawTotal.amount === 'number'
      ? { amount: rawTotal.amount as number, currency: rawTotal.currency as string, amountKRW: rawTotal.amountKRW as number | undefined }
      : calculateBudgetTotal(items, currency, exchangeRate);

    return {
      items,
      currency,
      exchangeRate,
      total,
      tips: Array.isArray(raw.tips) ? raw.tips as string[] : [],
    };
  }

  // 구 데이터 마이그레이션
  // 첫 번째 아이템에서 통화 추출
  let defaultCurrency = 'KRW';
  if (rawItems.length > 0 && typeof rawItems[0]?.amount === 'string') {
    const parsed = parseAmountString(rawItems[0].amount);
    if (parsed.currency !== 'KRW' || rawItems[0].amount.includes('₩')) {
      defaultCurrency = parsed.currency;
    }
  }

  const items: BudgetItem[] = rawItems.map(
    (item: Record<string, unknown>) => migrateBudgetItem(item, defaultCurrency),
  );

  const total = calculateBudgetTotal(items, defaultCurrency);

  // 구 total(BudgetRange)을 range로 보존
  const rawTotal = raw.total as Record<string, unknown> | undefined;
  const range: BudgetRange | undefined =
    rawTotal && typeof rawTotal.min === 'string'
      ? {
          min: (rawTotal.min ?? '') as string,
          max: (rawTotal.max ?? '') as string,
          minKRW: (rawTotal.minKRW ?? '') as string,
          maxKRW: (rawTotal.maxKRW ?? '') as string,
        }
      : undefined;

  return {
    items,
    currency: defaultCurrency,
    total,
    range,
    tips: Array.isArray(raw.tips) ? raw.tips as string[] : [],
  };
}

/**
 * 숫자 금액을 통화 기호 + 천 단위 쉼표로 포맷한다
 * 예: (3000, "JPY") → "¥3,000"
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_CODE_TO_SYMBOL[currency] ?? '';
  const formatted = amount.toLocaleString('en-US');
  return `${symbol}${formatted}`;
}

/**
 * 외화 금액을 환율로 원화 환산한다
 */
export function convertToKRW(amount: number, exchangeRate?: number): number | undefined {
  if (exchangeRate === undefined || exchangeRate === null) {
    return undefined;
  }
  return amount * exchangeRate;
}
