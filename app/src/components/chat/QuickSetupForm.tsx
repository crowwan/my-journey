'use client';

import { useState } from 'react';
import { Plane, Sparkles, ArrowRight } from 'lucide-react';

// -- 기간 옵션 (1박2일 ~ 7박8일) ------------------------------------------
const DURATION_OPTIONS = Array.from({ length: 7 }, (_, i) => ({
  nights: i + 1,
  label: `${i + 1}박 ${i + 2}일`,
}));

// -- 인원 옵션 (1명 ~ 10명) ------------------------------------------------
const TRAVELER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  count: i + 1,
  label: `${i + 1}명`,
}));

interface QuickSetupFormProps {
  onSubmit: (prompt: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

// 빠른 여행 설정 폼 — 목적지/기간/인원을 입력받아 프롬프트로 변환
export function QuickSetupForm({ onSubmit, onSkip, disabled = false }: QuickSetupFormProps) {
  const [destination, setDestination] = useState('');
  const [nights, setNights] = useState(2);
  const [travelers, setTravelers] = useState(1);

  // 폼 제출 시 프롬프트 텍스트 조립
  const handleSubmit = () => {
    const trimmed = destination.trim();
    if (!trimmed) return;

    const days = nights + 1;
    const prompt = `목적지: ${trimmed}, 기간: ${nights}박 ${days}일, 인원: ${travelers}명. 여행 계획을 생성해주세요.`;
    onSubmit(prompt);
  };

  const isValid = destination.trim().length > 0;

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
            placeholder="예: 도쿄, 방콕, 파리"
            disabled={disabled}
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid) handleSubmit();
            }}
          />
        </div>

        {/* 기간 드롭다운 */}
        <div className="text-left">
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            기간
          </label>
          <select
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50 appearance-none"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.nights} value={opt.nights}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 인원 드롭다운 */}
        <div className="text-left">
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            인원
          </label>
          <select
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50 appearance-none"
          >
            {TRAVELER_OPTIONS.map((opt) => (
              <option key={opt.count} value={opt.count}>
                {opt.label}
              </option>
            ))}
          </select>
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
