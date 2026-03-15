'use client';

import { useState } from 'react';
import { Plane, Sparkles, ArrowRight } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';

// -- 인원 옵션 (1명 ~ 10명) ------------------------------------------------
const TRAVELER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  count: i + 1,
  label: `${i + 1}명`,
}));

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 날짜 차이 계산 (일 수)
function diffDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

// 날짜를 읽기 좋은 형식으로 (3월 15일)
function formatDateKR(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface QuickSetupFormProps {
  onSubmit: (prompt: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

// 빠른 여행 설정 폼 — 목적지/날짜/인원을 입력받아 프롬프트로 변환
export function QuickSetupForm({ onSubmit, onSkip, disabled = false }: QuickSetupFormProps) {
  const today = getTodayISO();
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  // 기간 표시 텍스트
  const durationText = startDate && endDate && endDate >= startDate
    ? (() => {
        const days = diffDays(startDate, endDate) + 1;
        const nights = days - 1;
        return nights > 0
          ? `${formatDateKR(startDate)} ~ ${formatDateKR(endDate)} (${nights}박 ${days}일)`
          : `${formatDateKR(startDate)} (당일치기)`;
      })()
    : null;

  // 폼 제출 시 프롬프트 텍스트 조립
  const handleSubmit = () => {
    const trimmed = destination.trim();
    if (!trimmed || !startDate || !endDate) return;

    const days = diffDays(startDate, endDate) + 1;
    const nights = days - 1;
    const durationStr = nights > 0 ? `${nights}박 ${days}일` : '당일치기';

    const prompt = `목적지: ${trimmed}, 기간: ${startDate} ~ ${endDate} (${durationStr}), 인원: ${travelers}명. 여행 계획을 생성해주세요.`;
    onSubmit(prompt);
  };

  const isValid = destination.trim().length > 0 && startDate && endDate && endDate >= startDate;

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      {/* 아이콘 */}
      <div className="mb-4 text-primary">
        <Plane size={48} />
      </div>

      {/* 제목 */}
      <h2 className="text-2xl font-bold text-text-primary mb-1">
        어디로 떠나볼까요?
      </h2>
      <p className="text-text-secondary text-sm mb-8 max-w-xs">
        기본 정보만 알려주시면 AI가 맞춤 일정을 만들어 드려요
      </p>

      {/* 폼 */}
      <div className="w-full max-w-sm space-y-4">
        {/* 목적지 입력 */}
        <div className="text-left">
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            목적지
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="예: 도쿄, 제주도, 파리"
            disabled={disabled}
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* 출발일 / 귀국일 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-left">
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              출발일
            </label>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => {
                setStartDate(e.target.value);
                // 귀국일이 출발일보다 이전이면 초기화
                if (endDate && e.target.value > endDate) {
                  setEndDate('');
                }
              }}
              disabled={disabled}
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            />
          </div>
          <div className="text-left">
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              귀국일
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={disabled || !startDate}
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        {/* 기간 요약 */}
        {durationText && (
          <p className="text-xs text-primary text-left">
            {durationText}
          </p>
        )}

        {/* 인원 드롭다운 */}
        <div className="text-left">
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            인원
          </label>
          <CustomSelect
            value={String(travelers)}
            onChange={(v) => setTravelers(Number(v))}
            disabled={disabled}
            options={TRAVELER_OPTIONS.map((opt) => ({
              value: String(opt.count),
              label: opt.label,
            }))}
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={disabled || !isValid}
            className="flex items-center justify-center gap-2 bg-primary-500 text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-primary-600 active:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Sparkles size={16} />
            일정 만들기
          </button>

          <button
            onClick={onSkip}
            disabled={disabled}
            className="flex items-center justify-center gap-1 text-text-secondary text-sm hover:text-text-primary transition-colors disabled:opacity-50"
          >
            건너뛰기
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
